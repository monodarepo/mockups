import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronDown, LayoutDashboard, Zap } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { KpiRow } from '@/components/shared/KpiCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { MiniBarList } from '@/components/shared/MiniBarList'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { colors, type Tone } from '@/lib/colors'
import {
  formatDuracao,
  formatHora,
  formatHorasMinSeg,
  formatNumero,
  formatPercent,
  formatPontosPercentuais,
} from '@/lib/format'
import { useDestaque } from '@/lib/useDestaque'
import { useAppStore } from '@/store'
import {
  TOTAL_PARADAS_MIN,
  TURNO_A_FIM,
  TURNO_A_INICIO,
  TURNO_DECORRIDO_INICIAL_SEG,
  TURNO_DURACAO_SEG,
  alertas,
  alertasFiltrados,
  conteudoCopilot,
  detalhesExecucao,
  kpisPorTela,
  linhaPorId,
  linhasExecucao,
  linhasFiltradas,
  motivosParada,
  ordemPorId,
  produtoPorId,
  prontidaoOperacional,
  type ExecucaoLinha,
  type SeveridadeAlerta,
  type StatusExecucaoLinha,
} from '@/data'

const toneDoStatusExecucao: Record<StatusExecucaoLinha, Tone> = {
  Normal: 'success',
  Atenção: 'warning',
  Microparadas: 'warning',
  Parada: 'neutral',
}

const prioridadeDaSeveridade: Record<SeveridadeAlerta, 'Alta' | 'Média' | 'Baixa'> = {
  Crítica: 'Alta',
  Alta: 'Alta',
  Média: 'Média',
  Baixa: 'Baixa',
}

const pesoSeveridade: Record<SeveridadeAlerta, number> = { Crítica: 0, Alta: 1, Média: 2, Baixa: 3 }

/** Pictograma SVG do produto: blíster para sólidos, frasco para líquidos. */
function PictogramaProduto({ forma }: { forma: string }) {
  const liquido = /solução|xarope|gotas|spray/i.test(forma)
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
      {liquido ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="9" y="2" width="6" height="3" rx="1" fill={colors.primary} />
          <path d="M8 7h8v12a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V7Z" fill={colors.primary} fillOpacity="0.35" />
          <path d="M8 12h8v7a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-7Z" fill={colors.primary} />
        </svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <rect x="2.5" y="5" width="21" height="16" rx="2.5" fill={colors.primary} fillOpacity="0.25" />
          <rect x="2.5" y="5" width="21" height="16" rx="2.5" stroke={colors.primary} strokeWidth="1.4" />
          {[7.5, 13, 18.5].map((x) =>
            [9.5, 16.5].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.1" fill={colors.primary} />),
          )}
        </svg>
      )}
    </span>
  )
}

function MiniKpi({
  label,
  valor,
  delta,
  deltaGoodWhen,
  sublabel,
}: {
  label: string
  valor: string
  delta?: string
  deltaGoodWhen?: 'up' | 'down'
  sublabel?: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-app/50 px-3 py-2.5">
      <p className="truncate text-caption text-muted" title={label}>
        {label}
      </p>
      <p className="mt-0.5 text-[17px] font-bold leading-6 text-ink">{valor}</p>
      <p className="flex items-baseline gap-1.5">
        {delta ? <TrendDelta delta={delta} deltaGoodWhen={deltaGoodWhen} /> : null}
        {sublabel ? (
          <span className="truncate text-caption text-muted" title={sublabel}>
            {sublabel}
          </span>
        ) : null}
      </p>
    </div>
  )
}

/** Menu suspenso decorativo do PageHeader. */
function MenuHeader({ rotulo, icone, itens }: { rotulo: string; icone: React.ReactNode; itens: string[] }) {
  const [aberto, setAberto] = useState(false)
  const addToast = useAppStore((s) => s.addToast)

  return (
    <div className="relative">
      <Button variante="outline" tamanho="sm" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
        {icone}
        {rotulo}
        <ChevronDown size={14} aria-hidden="true" className={cn('transition-transform duration-150', aberto && 'rotate-180')} />
      </Button>
      {aberto ? (
        <>
          <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-20 cursor-default" onClick={() => setAberto(false)} />
          <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-xl border border-line bg-card p-1 shadow-pop">
            {itens.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setAberto(false)
                  addToast({ titulo: item, descricao: 'Disponível na demo completa.', tone: 'info' })
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-body-sm text-ink transition-colors duration-150 hover:bg-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {item}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export function ExecucaoPage() {
  const navigate = useNavigate()
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const filtros = useAppStore((s) => s.filtros)
  const resetFiltros = useAppStore((s) => s.resetFiltros)
  const destaque = useDestaque()

  const [ordemSelecionada, setOrdemSelecionada] = useState('OF-045678')
  const [modoGrafico, setModoGrafico] = useState<'hora' | 'acumulado'>('hora')
  const [acoesAceitas, setAcoesAceitas] = useState<string[]>([])
  const [modalTurno, setModalTurno] = useState(false)
  const [decorrido, setDecorrido] = useState(TURNO_DECORRIDO_INICIAL_SEG)
  const timerRef = useRef<number | null>(null)

  // Contador vivo do turno — parte de 04:27:18 a cada carga (determinístico).
  useEffect(() => {
    timerRef.current = window.setInterval(() => setDecorrido((s) => Math.min(s + 1, TURNO_DURACAO_SEG)), 1_000)
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [])

  // Recorte global aplicado às linhas em execução.
  const linhasExecRecorte = useMemo(() => {
    const idsLinhas = new Set(linhasFiltradas(filtros).map((linha) => linha.id))
    return linhasExecucao.filter((item) => idsLinhas.has(item.linhaId))
  }, [filtros])

  // Mantém o acompanhamento apontando para uma ordem visível no recorte.
  useEffect(() => {
    if (linhasExecRecorte.length === 0) return
    if (!linhasExecRecorte.some((item) => item.ordemId === ordemSelecionada)) {
      setOrdemSelecionada(linhasExecRecorte[0].ordemId)
    }
  }, [linhasExecRecorte, ordemSelecionada])

  const detalhe = detalhesExecucao[ordemSelecionada] as (typeof detalhesExecucao)[string] | undefined
  const ordem = ordemPorId(ordemSelecionada)
  const produto = ordem ? produtoPorId(ordem.produtoId) : undefined

  const alertasRecorte = useMemo(() => alertasFiltrados(filtros), [filtros])
  const alertasTurno = useMemo(
    () =>
      [...alertasRecorte]
        .sort((a, b) => pesoSeveridade[a.severidade] - pesoSeveridade[b.severidade] || b.impactoEstimado - a.impactoEstimado)
        .slice(0, 5),
    [alertasRecorte],
  )

  const dadosGrafico = useMemo(() => {
    if (!detalhe) return []
    if (modoGrafico === 'hora') return detalhe.producaoPorHora
    let realAcumulado = 0
    let metaAcumulada = 0
    return detalhe.producaoPorHora.map((ponto) => {
      metaAcumulada += ponto.meta
      if (ponto.real !== null) realAcumulado += ponto.real
      return { label: ponto.label, real: ponto.real !== null ? realAcumulado : null, meta: metaAcumulada }
    })
  }, [detalhe, modoGrafico])

  const colunasLinhas: ColunaDataTable<ExecucaoLinha>[] = useMemo(
    () => [
      {
        id: 'linha',
        titulo: 'Linha',
        render: (item) => <span className="font-semibold text-ink">{linhaPorId(item.linhaId)?.nome ?? item.linhaId}</span>,
        valor: (item) => item.linhaId,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => (
          <StatusPill
            status={item.statusExecucao}
            tone={toneDoStatusExecucao[item.statusExecucao]}
            pulsar={item.statusExecucao === 'Microparadas'}
          />
        ),
        valor: (item) => item.statusExecucao,
      },
      {
        id: 'oee',
        titulo: 'OEE',
        alinhar: 'direita',
        render: (item) => formatPercent(item.oeeTurno, 1),
        valor: (item) => item.oeeTurno,
      },
      {
        id: 'produto',
        titulo: 'Produto atual',
        render: (item) => {
          const ordemLinha = ordemPorId(item.ordemId)
          const produtoLinha = ordemLinha ? produtoPorId(ordemLinha.produtoId) : undefined
          return (
            <span className="leading-tight">
              <span className="block font-medium text-ink">{produtoLinha?.nome ?? '—'}</span>
              <span className="block text-caption text-muted">{produtoLinha?.apresentacao}</span>
            </span>
          )
        },
        valor: (item) => produtoPorId(ordemPorId(item.ordemId)?.produtoId ?? '')?.nome ?? '',
      },
      {
        id: 'ordem',
        titulo: 'Ordem',
        render: (item) => <IdLink id={item.ordemId} onClick={() => setOrdemSelecionada(item.ordemId)} />,
        valor: (item) => item.ordemId,
      },
      {
        id: 'progresso',
        titulo: 'Progresso',
        largura: 'w-36',
        render: (item) => {
          const ordemLinha = ordemPorId(item.ordemId)
          return (
            <ProgressBar
              valor={ordemLinha?.progresso ?? 0}
              tone={item.statusExecucao === 'Parada' ? 'neutral' : item.statusExecucao === 'Normal' ? 'primary' : 'warning'}
            />
          )
        },
        valor: (item) => ordemPorId(item.ordemId)?.progresso ?? 0,
      },
      {
        id: 'termino',
        titulo: 'Término previsto',
        render: (item) => formatHora(item.terminoPrevisto),
        valor: (item) => item.terminoPrevisto,
      },
      {
        id: 'operador',
        titulo: 'Responsável',
        render: (item) => {
          const ordemLinha = ordemPorId(item.ordemId)
          return <span className="text-ink">{ordemLinha?.operador ?? '—'}</span>
        },
        valor: (item) => ordemPorId(item.ordemId)?.operador ?? '',
      },
    ],
    [],
  )

  const aceitarAcao = (acao: string) => {
    if (acoesAceitas.includes(acao)) return
    setAcoesAceitas((atual) => [...atual, acao])
    addToast({ titulo: 'Recomendação aceita', descricao: 'Registrada na trilha de auditoria.', tone: 'success' })
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular Recuperação') abrirSimulador('EV-001')
    else if (rotulo === 'Acionar Manutenção') {
      addToast({ titulo: 'Manutenção acionada', descricao: 'OT-245683 priorizada — equipe notificada.', tone: 'success' })
      navigate('/manutencao')
    } else if (rotulo === 'Ajustar Prioridade') {
      addToast({ titulo: 'Prioridade ajustada', descricao: 'OF-045679 promovida para prioridade Alta no turno.', tone: 'success' })
    }
  }

  const restante = Math.max(0, TURNO_DURACAO_SEG - decorrido)

  return (
    <>
      <PageHeader
        titulo="Execução da Produção"
        descricao="Monitore a operação em tempo real, resolva desvios e assegure aderência ao plano."
        acoes={
          <>
            <MenuHeader
              rotulo="Painéis salvos"
              icone={<LayoutDashboard size={14} aria-hidden="true" />}
              itens={['Visão do turno', 'Somente linhas críticas', 'Painel do PCP']}
            />
            <MenuHeader
              rotulo="Ações rápidas"
              icone={<Zap size={14} aria-hidden="true" />}
              itens={['Registrar parada', 'Registrar desvio', 'Exportar resumo do turno']}
            />
          </>
        }
      />

      <FilterBar />

      <KpiRow kpis={kpisPorTela['/execucao']} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Linhas em Execução"
            contagem={{ visiveis: linhasExecRecorte.length, total: linhasExecucao.length }}
            info="Clique em uma linha para acompanhar a ordem no card abaixo."
            corpoSemPadding
          >
            {linhasExecRecorte.length > 0 ? (
              <DataTable
                rotulo="Linhas em execução no Turno A"
                colunas={colunasLinhas}
                linhas={linhasExecRecorte}
                chave={(item) => item.ordemId}
                onLinhaClick={(item) => setOrdemSelecionada(item.ordemId)}
                linhaSelecionada={ordemSelecionada}
                linhaDestacada={destaque}
              />
            ) : (
              <EmptyState
                titulo="Nenhuma linha em execução neste recorte"
                descricao={`O acompanhamento de piso desta demo cobre as linhas de Anápolis — ajuste fábrica ou área para voltar a vê-las.`}
                acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
              />
            )}
          </SectionCard>

          <SectionCard
            titulo="Acompanhamento da Ordem Atual"
            info="Detalhe operacional da ordem selecionada na tabela acima."
            direita={
              <div className="flex rounded-lg border border-line bg-app p-0.5" role="group" aria-label="Modo do gráfico">
                {(
                  [
                    ['hora', 'Por Hora'],
                    ['acumulado', 'Acumulado'],
                  ] as const
                ).map(([modo, rotulo]) => (
                  <button
                    key={modo}
                    type="button"
                    aria-pressed={modoGrafico === modo}
                    onClick={() => setModoGrafico(modo)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-body-sm font-medium transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      modoGrafico === modo ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink',
                    )}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
            }
          >
            {linhasExecRecorte.length === 0 || !detalhe ? (
              <EmptyState
                titulo="Sem ordem para acompanhar neste recorte"
                descricao="Selecione uma linha em execução para ver o detalhe operacional da ordem."
                acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
              />
            ) : (
            // key força remontagem com fade suave ao trocar a ordem acompanhada
            <div key={ordemSelecionada} className="animate-toast-in motion-reduce:animate-none">
              <div className="flex flex-wrap items-center gap-3">
                <PictogramaProduto forma={produto?.formaFarmaceutica ?? ''} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-card-title font-semibold text-ink">{produto?.nome}</span>
                    <span className="text-body-sm text-muted">{produto?.apresentacao}</span>
                    <StatusPill status={ordem?.status ?? ''} pulsar={ordem?.situacao === 'Em risco'} />
                  </p>
                  <p className="mt-0.5 text-caption text-muted">
                    {ordemSelecionada} · {linhaPorId(ordem?.linhaId ?? '')?.nome}
                    {detalhe.loteId ? (
                      <>
                        {' · lote '}
                        <IdLink id={detalhe.loteId} />
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-5 gap-3 border-y border-line py-3 text-body-sm">
                <div>
                  <dt className="text-caption text-muted">Início</dt>
                  <dd className="font-semibold text-ink">{formatHora(detalhe.inicio)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Término previsto</dt>
                  <dd className="font-semibold text-ink">{formatHora(detalhe.terminoPrevisto)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Qtd. planejada</dt>
                  <dd className="font-semibold tabular-nums text-ink">{formatNumero(ordem?.quantidade ?? 0)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Qtd. produzida</dt>
                  <dd className="font-semibold tabular-nums text-ink">{formatNumero(ordem?.produzido ?? 0)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Progresso</dt>
                  <dd className="pt-1">
                    <ProgressBar valor={ordem?.progresso ?? 0} tone={ordem?.situacao === 'Em risco' ? 'danger' : 'primary'} />
                  </dd>
                </div>
              </dl>

              <div className="mt-3 grid grid-cols-5 gap-3">
                <MiniKpi
                  label="Eficiência"
                  valor={formatPercent(detalhe.eficienciaPercent)}
                  delta={formatPontosPercentuais(detalhe.eficienciaDeltaPP)}
                  deltaGoodWhen="up"
                />
                <MiniKpi
                  label="Setup"
                  valor={formatDuracao(detalhe.setupMinutos)}
                  delta={`${detalhe.setupDeltaMinutos > 0 ? '+' : '-'}${formatNumero(Math.abs(detalhe.setupDeltaMinutos))} min`}
                  deltaGoodWhen="down"
                  sublabel="vs plano"
                />
                <MiniKpi
                  label="Velocidade real"
                  valor={`${formatNumero(detalhe.velocidadeRealHora)} un/h`}
                  sublabel={`meta ${formatNumero(detalhe.velocidadeMetaHora)}`}
                />
                <MiniKpi
                  label="Rendimento (Yield)"
                  valor={formatPercent(detalhe.yieldPercent)}
                  delta={detalhe.yieldDeltaPP !== 0 ? formatPontosPercentuais(detalhe.yieldDeltaPP) : undefined}
                  deltaGoodWhen="up"
                />
                <MiniKpi
                  label="Refugo"
                  valor={formatPercent(detalhe.refugoPercent, 2)}
                  delta={detalhe.refugoDeltaPP !== 0 ? formatPontosPercentuais(detalhe.refugoDeltaPP, 2) : undefined}
                  deltaGoodWhen="down"
                  sublabel="vs plano"
                />
              </div>

              <div className="mt-4">
                <p className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-caption text-muted">
                  <span className="font-semibold text-ink">
                    Produção por Hora ({modoGrafico === 'hora' ? 'unidades' : 'acumulado'}) · mil un
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
                      Real
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-0 w-4 border-t-2 border-dashed border-neutral" aria-hidden="true" />
                      Meta
                    </span>
                  </span>
                </p>
                <div className="h-[170px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosGrafico} margin={{ top: 6, right: 12, bottom: 0, left: 12 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: colors.muted }}
                        tickLine={false}
                        axisLine={{ stroke: colors.line }}
                      />
                      <YAxis hide domain={[0, 'dataMax + 40']} />
                      <ChartTooltip
                        cursor={{ stroke: colors.line }}
                        contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                        formatter={(valor: number, nome: string) => [
                          `${formatNumero(valor)} mil un`,
                          nome === 'real' ? 'Real' : 'Meta',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="meta"
                        stroke="#94A3B8"
                        strokeWidth={1.6}
                        strokeDasharray="5 4"
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="real"
                        stroke={colors.primary}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            )}
          </SectionCard>
        </div>

        <CopilotPanel
          conteudo={conteudoCopilot['/execucao']}
          onAcao={aoAcaoCopilot}
          onAceitarAcao={aceitarAcao}
          acoesAceitas={acoesAceitas}
        />
      </div>

      <div className="grid grid-cols-4 gap-5">
        <SectionCard
          titulo="Alertas e Decisões"
          contagem={{ visiveis: alertasTurno.length, total: alertas.length }}
          info="Alertas ativos que afetam o turno, por severidade, no recorte atual."
          acao={{ rotulo: 'Ver central', onClick: () => navigate('/alertas') }}
        >
          {alertasTurno.length === 0 ? (
            <EmptyState
              titulo="Sem alertas neste recorte"
              descricao="Os alertas ativos do dia estão nas linhas de Anápolis."
              acao={{ rotulo: 'Ver central de alertas', onClick: () => navigate('/alertas') }}
              alturaMin={160}
            />
          ) : (
          <ul className="flex flex-col gap-2.5">
            {alertasTurno.map((alerta) => (
              <li key={alerta.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium text-ink" title={alerta.titulo}>
                    {alerta.titulo}
                  </p>
                  <p className="text-caption text-muted">{alerta.linhaId ?? 'Fábrica'} · SLA {formatNumero(alerta.slaHoras)} h</p>
                </div>
                <StatusPill status={prioridadeDaSeveridade[alerta.severidade]} pulsar={alerta.severidade === 'Crítica'} />
              </li>
            ))}
          </ul>
          )}
        </SectionCard>

        <SectionCard titulo="Motivos de Parada" info="Pareto das paradas não planejadas das últimas 8 horas.">
          <MiniBarList
            itens={motivosParada.map((motivo) => ({
              id: motivo.motivo,
              label: motivo.motivo,
              valor: `${formatNumero(motivo.minutos)} min`,
              percent: motivo.percent,
            }))}
          />
          <p className="mt-3 border-t border-line pt-2.5 text-caption text-muted">
            Total de paradas não planejadas: <strong className="text-ink">{formatNumero(TOTAL_PARADAS_MIN)} min</strong>
          </p>
        </SectionCard>

        <SectionCard titulo="Prontidão Operacional" info="Checklist de prontidão do turno corrente.">
          <ul className="flex flex-col gap-3">
            {prontidaoOperacional.map((item) => (
              <li key={item.item} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-body-sm text-ink">
                  <CheckCircle2 size={15} className="shrink-0 text-success" aria-hidden="true" />
                  <span className="truncate" title={item.item}>
                    {item.item}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Badge tone="success">{item.situacao}</Badge>
                  <span className="w-10 text-right text-body-sm font-semibold tabular-nums text-ink">
                    {formatPercent(item.percent, 0)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard titulo="Turno A em andamento" info="Janela e cronômetro do turno corrente.">
          <dl className="grid grid-cols-2 gap-3 text-body-sm">
            <div>
              <dt className="text-caption text-muted">Início</dt>
              <dd className="font-semibold text-ink">{formatHora(TURNO_A_INICIO)}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Fim</dt>
              <dd className="font-semibold text-ink">{formatHora(TURNO_A_FIM)}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Tempo decorrido</dt>
              <dd className="text-[20px] font-bold tabular-nums text-ink">{formatHorasMinSeg(decorrido)}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Tempo restante</dt>
              <dd className="text-[20px] font-bold tabular-nums text-primary">{formatHorasMinSeg(restante)}</dd>
            </div>
          </dl>
          <ProgressBar valor={(decorrido / TURNO_DURACAO_SEG) * 100} className="mt-3" />
          <Button variante="outline" tamanho="sm" className="mt-4 w-full" onClick={() => setModalTurno(true)}>
            Encerrar turno
          </Button>
        </SectionCard>
      </div>

      <Modal
        aberto={modalTurno}
        onFechar={() => setModalTurno(false)}
        titulo="Encerrar turno"
        descricao="Turno A · 06:00 – 14:00 · Anápolis"
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setModalTurno(false)}>
              Cancelar
            </Button>
            <Button
              tamanho="sm"
              onClick={() => {
                setModalTurno(false)
                addToast({ titulo: 'Turno encerrado', descricao: 'Passagem de turno registrada e enviada ao Turno B.', tone: 'success' })
              }}
            >
              Encerrar turno
            </Button>
          </>
        }
      >
        <p className="text-body text-ink">
          Encerrar o Turno A agora registra a passagem de turno com produção de{' '}
          <strong>{formatNumero(1_256_840)}</strong> unidades, OEE de <strong>{formatPercent(78.4)}</strong> e{' '}
          <strong>36 min</strong> de paradas não planejadas. As ordens em execução seguem para o Turno B.
        </p>
      </Modal>


      <PageFooter />
    </>
  )
}
