import { useMemo, useState } from 'react'
import {
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Play,
  Radar,
  Search,
} from 'lucide-react'
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { MiniBarList } from '@/components/shared/MiniBarList'
import { DataTable, type ColunaDataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { cn } from '@/lib/cn'
import { colors, toneSoftClass } from '@/lib/colors'
import { formatMoedaCompacta, formatNumero, formatPercent } from '@/lib/format'
import { useDestaque } from '@/lib/useDestaque'
import { useAppStore } from '@/store'
import {
  PRONTIDAO_DECISAO_SCORE,
  alertas,
  alertasFiltrados,
  conteudoCopilot,
  fluxoDecisao,
  impactoAlertas24h,
  kpisAlertas,
  matrizPrioridadeUrgencia,
  cenarioPorId,
  produtoPorId,
  prontidaoDecisao,
  proximasAprovacoes,
  ordemPorId,
  topRiscosCategorias,
  type Alerta,
  type EtapaFluxoDecisao,
  type StatusAlerta,
} from '@/data'

const iconeDaEtapa: Record<EtapaFluxoDecisao['id'], typeof Radar> = {
  detectado: Radar,
  analisando: Search,
  recomendado: Lightbulb,
  aprovado: CheckCircle2,
  executando: Play,
  resolvido: CheckCheck,
}

type StatusExibido = StatusAlerta | 'Aprovado' | 'Rejeitado'

export function AlertasPage() {
  const addToast = useAppStore((s) => s.addToast)
  const pendencias = useAppStore((s) => s.pendencias)
  const aprovados = useAppStore((s) => s.aprovados)
  const rejeitados = useAppStore((s) => s.rejeitados)
  const aprovarAlerta = useAppStore((s) => s.aprovarAlerta)
  const rejeitarAlerta = useAppStore((s) => s.rejeitarAlerta)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const cenarioAtivo = useAppStore((s) => s.cenarioAtivo)

  const [alertaAberto, setAlertaAberto] = useState<Alerta | null>(null)
  const [rejeitandoId, setRejeitandoId] = useState<string | null>(null)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')

  const filtros = useAppStore((s) => s.filtros)
  const resetFiltros = useAppStore((s) => s.resetFiltros)
  const destaque = useDestaque()
  const alertasRecorte = useMemo(() => alertasFiltrados(filtros), [filtros])
  const [modalTodos, setModalTodos] = useState(false)

  const statusDe = useMemo(() => {
    return (alerta: Alerta): StatusExibido => {
      if (aprovados.includes(alerta.id)) return 'Aprovado'
      if (rejeitados.some((rejeicao) => rejeicao.id === alerta.id)) return 'Rejeitado'
      return alerta.status
    }
  }, [aprovados, rejeitados])

  // Decisões da sessão sobre os alertas movem o funil: aprovado sai de
  // Recomendado → Aprovado; rejeitado volta para Analisando.
  const funil = useMemo(() => {
    const aprovadosAqui = aprovados.filter((id) => id.startsWith('AL-')).length
    const rejeitadosAqui = rejeitados.filter((rejeicao) => rejeicao.id.startsWith('AL-')).length
    return fluxoDecisao.map((etapa) => {
      if (etapa.id === 'recomendado') return { ...etapa, valor: Math.max(0, etapa.valor - aprovadosAqui - rejeitadosAqui) }
      if (etapa.id === 'aprovado') return { ...etapa, valor: etapa.valor + aprovadosAqui }
      if (etapa.id === 'analisando') return { ...etapa, valor: etapa.valor + rejeitadosAqui }
      return etapa
    })
  }, [aprovados, rejeitados])

  const colunas: ColunaDataTable<Alerta>[] = useMemo(
    () => [
      {
        id: 'severidade',
        titulo: 'Severidade',
        render: (alerta) => <StatusPill status={alerta.severidade} pulsar={alerta.severidade === 'Crítica'} />,
        valor: (alerta) => ({ Crítica: 0, Alta: 1, Média: 2, Baixa: 3 })[alerta.severidade],
      },
      {
        id: 'alerta',
        titulo: 'Alerta',
        render: (alerta) => (
          <span className="block max-w-[230px] truncate font-medium text-ink" title={alerta.titulo}>
            {alerta.titulo}
          </span>
        ),
        valor: (alerta) => alerta.titulo,
      },
      {
        id: 'area',
        titulo: 'Área / Linha',
        render: (alerta) => alerta.linhaId ?? 'Fábrica',
        valor: (alerta) => alerta.linhaId ?? '',
      },
      { id: 'categoria', titulo: 'Categoria', render: (alerta) => alerta.area, valor: (alerta) => alerta.area },
      {
        id: 'impacto',
        titulo: 'Impacto',
        alinhar: 'direita',
        render: (alerta) => (
          <span className={cn('font-semibold tabular-nums', alerta.severidade === 'Crítica' ? 'text-danger' : 'text-ink')}>
            {formatMoedaCompacta(alerta.impactoEstimado)}
          </span>
        ),
        valor: (alerta) => alerta.impactoEstimado,
      },
      {
        id: 'prazo',
        titulo: 'Prazo',
        alinhar: 'direita',
        render: (alerta) => `${formatNumero(alerta.slaHoras)} h`,
        valor: (alerta) => alerta.slaHoras,
      },
      { id: 'responsavel', titulo: 'Responsável', render: (alerta) => alerta.responsavel, valor: (alerta) => alerta.responsavel },
      {
        id: 'status',
        titulo: 'Status',
        render: (alerta) => {
          const status = statusDe(alerta)
          return <StatusPill status={status} pulsar={status === 'Escalado'} />
        },
        valor: (alerta) => statusDe(alerta),
      },
    ],
    [statusDe],
  )

  // Evento do simulador mais próximo do contexto do alerta.
  const eventoDoAlerta = (alerta: Alerta): string | undefined => {
    if (alerta.materialId === 'MAT-API-001') return 'EV-002'
    if (alerta.linhaId === 'L12') return 'EV-001'
    if (alerta.materialId === 'MAT-EMB-021') return 'EV-005'
    return undefined
  }

  const aoAcaoContextual = (alerta: Alerta) => {
    if (alerta.acaoRecomendada === 'Simular recuperação') {
      abrirSimulador(eventoDoAlerta(alerta))
      return
    }
    addToast({
      titulo: alerta.acaoRecomendada,
      descricao: `Ação encaminhada — ${alerta.responsavel} notificado.`,
      tone: 'info',
    })
  }

  const aprovar = (id: string) => {
    aprovarAlerta(id)
    setAlertaAberto(null)
  }

  const confirmarRejeicao = () => {
    if (!rejeitandoId || !motivoRejeicao.trim()) return
    rejeitarAlerta(rejeitandoId, motivoRejeicao.trim())
    setRejeitandoId(null)
    setMotivoRejeicao('')
    setAlertaAberto(null)
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular impacto') abrirSimulador()
    else if (rotulo === 'Convocar war room') {
      addToast({ titulo: 'War room convocada', descricao: 'Convite enviado a 6 participantes — sala Torre 2, 15:00.', tone: 'info' })
    } else if (rotulo === 'Aprovar plano') {
      addToast({ titulo: 'Plano aprovado', descricao: 'Ações distribuídas aos responsáveis pelo Agente de Execução.', tone: 'success' })
    }
  }

  // Cenário aprovado no simulador entra na agenda de aprovações.
  const aprovacoesAgenda = useMemo(() => {
    if (cenarioAtivo === 'cenario-base') return proximasAprovacoes
    const cenario = cenarioPorId(cenarioAtivo)
    return [
      {
        id: 'AP-CENARIO',
        decisao: `${cenario?.nome ?? cenarioAtivo} — plano da semana 20 – 26/mai`,
        responsavel: 'Alçada: PCP',
        prazoRotulo: 'Hoje 11:00',
      },
      ...proximasAprovacoes,
    ]
  }, [cenarioAtivo])

  const statusDoAberto = alertaAberto ? statusDe(alertaAberto) : null
  const decidido = statusDoAberto === 'Aprovado' || statusDoAberto === 'Rejeitado'

  return (
    <>
      <PageHeader
        titulo="Alertas e Decisões"
        descricao="Centralize eventos críticos, priorize ações e acelere decisões operacionais em tempo real."
      />

      <FilterBar />

      <KpiRow kpis={kpisAlertas(pendencias)} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 min-w-0">
          <SectionCard
            titulo="Central de Alertas"
            contagem={{ visiveis: alertasRecorte.length, total: alertas.length }}
            info="Clique em um alerta para abrir o detalhe com recomendação, alternativas e decisão."
            acao={{ rotulo: 'Ver todos (14)', onClick: () => setModalTodos(true) }}
            corpoSemPadding
          >
            {alertasRecorte.length > 0 ? (
              <DataTable
                rotulo="Central de alertas ativos"
                colunas={colunas}
                linhas={alertasRecorte}
                chave={(alerta) => alerta.id}
                onLinhaClick={setAlertaAberto}
                linhaSelecionada={alertaAberto?.id}
                linhaDestacada={destaque}
                acao={{ rotulo: (alerta) => alerta.acaoRecomendada, onClick: aoAcaoContextual }}
                ordenacaoInicial={{ coluna: 'severidade', direcao: 'asc' }}
              />
            ) : (
              <EmptyState
                titulo="Nenhum alerta no recorte atual"
                descricao="Os alertas ativos do dia estão nas linhas de Anápolis — ajuste fábrica ou área."
                acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
              />
            )}
          </SectionCard>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/alertas']} onAcao={aoAcaoCopilot} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <SectionCard
          titulo="Fluxo de Decisão"
          info="Funil de decisão da central — aprovar ou rejeitar um alerta move o item de etapa."
          className="col-span-2"
        >
          <ol className="flex items-stretch gap-1">
            {funil.map((etapa, indice) => {
              const Icone = iconeDaEtapa[etapa.id]
              return (
                <li key={etapa.id} className="flex min-w-0 flex-1 items-center gap-1">
                  <div className="min-w-0 flex-1 rounded-xl border border-line bg-app/50 px-3 py-2.5">
                    <span
                      className={cn(
                        'mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg',
                        etapa.id === 'resolvido' || etapa.id === 'aprovado'
                          ? 'bg-success-soft text-success-strong'
                          : etapa.id === 'detectado'
                            ? 'bg-danger-soft text-danger'
                            : 'bg-primary-soft text-primary',
                      )}
                    >
                      <Icone size={14} aria-hidden="true" />
                    </span>
                    <p className="text-[20px] font-bold leading-6 tabular-nums text-ink">{formatNumero(etapa.valor)}</p>
                    <p className="truncate text-caption text-muted" title={etapa.rotulo}>
                      {etapa.rotulo}
                    </p>
                    <TrendDelta delta={etapa.deltaHora} deltaGoodWhen={etapa.deltaGoodWhen} className="mt-0.5" />
                  </div>
                  {indice < funil.length - 1 ? (
                    <ChevronRight size={14} className="shrink-0 text-muted" aria-hidden="true" />
                  ) : null}
                </li>
              )
            })}
          </ol>
          <p className="mt-2 text-caption text-muted">Variação vs 1 h atrás · funil reage às decisões desta sessão</p>
        </SectionCard>

        <SectionCard titulo="Top Riscos por Categoria" info="Impacto financeiro em risco por categoria, na rede (24 h).">
          <MiniBarList
            itens={topRiscosCategorias.map((risco) => ({
              id: risco.id,
              label: risco.categoria,
              valor: formatMoedaCompacta(risco.valor),
              percent: risco.percent,
            }))}
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <SectionCard titulo="Impacto Financeiro dos Alertas" info="Impacto acumulado em risco nas últimas 24 horas.">
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impactoAlertas24h} margin={{ top: 18, right: 58, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="grad-impacto-alertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.danger} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={colors.danger} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: colors.muted }}
                  tickLine={false}
                  axisLine={{ stroke: colors.line }}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis hide domain={['dataMin - 120', 'dataMax + 80']} />
                <ChartTooltip
                  cursor={{ stroke: colors.line }}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                  formatter={(valor: number) => [formatMoedaCompacta(valor * 1000), 'Em risco']}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke={colors.danger}
                  strokeWidth={2}
                  fill="url(#grad-impacto-alertas)"
                  dot={false}
                  isAnimationActive={false}
                />
                <ReferenceDot
                  x={impactoAlertas24h[impactoAlertas24h.length - 1].label}
                  y={impactoAlertas24h[impactoAlertas24h.length - 1].valor}
                  r={4}
                  fill={colors.danger}
                  stroke={colors.card}
                  strokeWidth={2}
                  label={{
                    value: 'R$ 1,82 mi',
                    position: 'left',
                    fill: colors.danger,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-caption text-muted">Últimas 24 h · rede</p>
        </SectionCard>

        <SectionCard titulo="Matriz Prioridade × Urgência" info="Distribuição dos 32 alertas monitorados na rede.">
          <div className="grid grid-cols-2 gap-1.5">
            {matrizPrioridadeUrgencia.map((quadrante) => (
              <div
                key={quadrante.id}
                className={cn('rounded-xl px-3 py-3 text-center', toneSoftClass[quadrante.tone])}
              >
                <p className="text-[22px] font-bold leading-7 tabular-nums">{formatNumero(quadrante.quantidade)}</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight">{quadrante.rotulo}</p>
              </div>
            ))}
          </div>
          <p className="mt-2.5 flex items-center justify-between text-caption text-muted">
            <span>Urgência →</span>
            <span>
              {formatNumero(matrizPrioridadeUrgencia.reduce((soma, quadrante) => soma + quadrante.quantidade, 0))}{' '}
              alertas monitorados
            </span>
          </p>
        </SectionCard>

        <SectionCard titulo="Prontidão para Decisão" info="Qualidade dos insumos necessários para decidir com segurança.">
          <div className="flex items-start gap-4">
            <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
              {prontidaoDecisao.map((item) => (
                <li key={item.item}>
                  <p className="mb-0.5 flex items-center justify-between text-caption">
                    <span className="text-muted">{item.item}</span>
                    <span className="font-semibold tabular-nums text-ink">{formatPercent(item.percent, 0)}</span>
                  </p>
                  <ProgressBar
                    valor={item.percent}
                    tone={item.percent >= 90 ? 'success' : item.percent >= 85 ? 'info' : 'warning'}
                    mostrarRotulo={false}
                  />
                </li>
              ))}
            </ul>
            <ScoreDonut valor={PRONTIDAO_DECISAO_SCORE} tamanho={96} />
          </div>
        </SectionCard>

        <SectionCard titulo="Próximas Aprovações" info="Decisões agendadas para as próximas 24 horas.">
          <ul className="flex flex-col gap-2.5">
            {aprovacoesAgenda.map((aprovacao) => (
              <li key={aprovacao.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium text-ink" title={aprovacao.decisao}>
                    {aprovacao.decisao}
                  </p>
                  <p className="text-caption text-muted">{aprovacao.responsavel}</p>
                </div>
                <Badge tone={aprovacao.prazoRotulo.startsWith('Hoje') ? 'warning' : 'neutral'} className="shrink-0">
                  {aprovacao.prazoRotulo}
                </Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Drawer de detalhe do alerta */}
      <Drawer
        aberto={alertaAberto !== null}
        onFechar={() => setAlertaAberto(null)}
        titulo={alertaAberto?.titulo ?? ''}
        descricao={
          alertaAberto
            ? `${alertaAberto.id} · ${alertaAberto.area} · ${alertaAberto.linhaId ?? 'Fábrica'} · responsável ${alertaAberto.responsavel}`
            : undefined
        }
        rodape={
          alertaAberto ? (
            <>
              <Button
                variante="outline"
                tamanho="sm"
                onClick={() => {
                  abrirSimulador(eventoDoAlerta(alertaAberto))
                  setAlertaAberto(null)
                }}
              >
                Simular
              </Button>
              <Button
                variante="outline"
                tamanho="sm"
                disabled={decidido}
                onClick={() => setRejeitandoId(alertaAberto.id)}
              >
                Rejeitar
              </Button>
              <Button tamanho="sm" disabled={decidido} onClick={() => aprovar(alertaAberto.id)}>
                Aprovar
              </Button>
            </>
          ) : undefined
        }
      >
        {alertaAberto ? (
          <div className="flex flex-col gap-4 text-body-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={alertaAberto.severidade} pulsar={alertaAberto.severidade === 'Crítica'} />
              <StatusPill status={statusDoAberto ?? alertaAberto.status} />
              <Badge tone="neutral">SLA {formatNumero(alertaAberto.slaHoras)} h</Badge>
            </div>

            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.06em] text-muted">Descrição</p>
              <p className="mt-1 leading-snug text-ink">{alertaAberto.descricao}</p>
            </div>

            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.06em] text-muted">Causa provável</p>
              <p className="mt-1 leading-snug text-ink">{alertaAberto.causaProvavel}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line px-3 py-2.5">
                <p className="text-caption text-muted">Impacto financeiro</p>
                <p className={cn('text-[17px] font-bold', alertaAberto.severidade === 'Crítica' ? 'text-danger' : 'text-ink')}>
                  {formatMoedaCompacta(alertaAberto.impactoEstimado)}
                </p>
              </div>
              <div className="rounded-xl border border-line px-3 py-2.5">
                <p className="text-caption text-muted">Ordens afetadas</p>
                <p className="text-[15px] font-semibold text-ink">
                  {alertaAberto.ordemId
                    ? `${alertaAberto.ordemId} — ${produtoPorId(ordemPorId(alertaAberto.ordemId)?.produtoId ?? '')?.nome ?? ''}`
                    : 'Nenhuma ordem direta'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.06em] text-muted">Impacto operacional</p>
              <p className="mt-1 leading-snug text-ink">{alertaAberto.impactoOperacional}</p>
            </div>

            <div className="rounded-xl bg-success-soft px-3 py-2.5">
              <p className="text-caption font-semibold uppercase tracking-[0.06em] text-success-strong">Recomendação</p>
              <p className="mt-1 leading-snug text-success-strong">{alertaAberto.acaoRecomendada}</p>
            </div>

            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.06em] text-muted">Alternativas</p>
              <ul className="mt-1 flex flex-col gap-1.5">
                {alertaAberto.alternativas.map((alternativa) => (
                  <li key={alternativa} className="flex gap-2 leading-snug text-ink">
                    <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted" />
                    {alternativa}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Modal de rejeição com motivo obrigatório */}
      <Modal
        aberto={rejeitandoId !== null}
        onFechar={() => {
          setRejeitandoId(null)
          setMotivoRejeicao('')
        }}
        titulo={`Rejeitar ${rejeitandoId ?? ''}`}
        descricao="Informe o motivo — ele fica registrado na trilha de auditoria."
        rodape={
          <>
            <Button
              variante="outline"
              tamanho="sm"
              onClick={() => {
                setRejeitandoId(null)
                setMotivoRejeicao('')
              }}
            >
              Cancelar
            </Button>
            <Button variante="danger" tamanho="sm" disabled={!motivoRejeicao.trim()} onClick={confirmarRejeicao}>
              Rejeitar
            </Button>
          </>
        }
      >
        <label htmlFor="motivo-rejeicao" className="text-body-sm font-medium text-ink">
          Motivo da rejeição
        </label>
        <textarea
          id="motivo-rejeicao"
          value={motivoRejeicao}
          onChange={(evento) => setMotivoRejeicao(evento.target.value)}
          rows={4}
          placeholder="Ex.: risco aceito pelo comercial — entrega renegociada para 23/mai."
          className={cn(
            'mt-1.5 w-full rounded-lg border border-line bg-app px-3 py-2 text-body-sm text-ink',
            'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        />
      </Modal>

      <Modal
        aberto={modalTodos}
        onFechar={() => setModalTodos(false)}
        titulo="Todos os alertas do dia"
        descricao="Exibindo os 7 alertas modelados de um universo de 14 detectados hoje na rede."
        largura="lg"
      >
        <DataTable
          rotulo="Todos os alertas modelados"
          colunas={colunas}
          linhas={alertas}
          chave={(alerta) => alerta.id}
          onLinhaClick={(alerta) => {
            setModalTodos(false)
            setAlertaAberto(alerta)
          }}
          ordenacaoInicial={{ coluna: 'severidade', direcao: 'asc' }}
        />
      </Modal>

      <PageFooter />
    </>
  )
}
