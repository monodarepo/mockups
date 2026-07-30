import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarClock, Download, Eye, FileSpreadsheet, FileText, Plus, RefreshCw, Search, Send } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { DataTable, type ColunaDataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { colors } from '@/lib/colors'
import { formatDiaMes, formatHora, formatNumero } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  RELATORIOS_GOVERNANCA_SCORE,
  agendamentos,
  catalogoAnalitico,
  consumoRelatorios,
  conteudoCopilot,
  governancaRelatorios,
  kpisPorTela,
  leiturasSemana,
  producaoVsPlano,
  relatorioPorId,
  relatorios,
  resumoExecutivoKpis,
  type AgendamentoRelatorio,
  type Relatorio,
} from '@/data'

const ABAS_CATEGORIA = [
  { id: 'Todos', rotulo: 'Todos' },
  { id: 'Executivo', rotulo: 'Executivo' },
  { id: 'Operacional', rotulo: 'Operacional' },
  { id: 'Qualidade', rotulo: 'Qualidade' },
  { id: 'Manutenção', rotulo: 'Manutenção' },
  { id: 'Custos', rotulo: 'Custos' },
  { id: 'Customizado', rotulo: 'Customizados' },
]

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function BadgeFormato({ formato }: { formato: Relatorio['formato'] }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-app px-1.5 py-0.5 text-[11px] font-semibold text-muted">
      {formato === 'PDF' ? (
        <FileText size={11} aria-hidden="true" />
      ) : (
        <FileSpreadsheet size={11} aria-hidden="true" />
      )}
      {formato}
    </span>
  )
}

export function RelatoriosPage() {
  const addToast = useAppStore((s) => s.addToast)

  const [abaCategoria, setAbaCategoria] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [modalResumo, setModalResumo] = useState(false)
  /** Progresso da geração do resumo executivo (null = ocioso). */
  const [progressoGeracao, setProgressoGeracao] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const [parametrosBusca, setParametrosBusca] = useSearchParams()

  // ?acao=gerar-resumo (ação rápida da busca global) dispara o fluxo real.
  useEffect(() => {
    if (parametrosBusca.get('acao') !== 'gerar-resumo') return
    setProgressoGeracao((atual) => atual ?? 6)
    setParametrosBusca(
      (params) => {
        params.delete('acao')
        return params
      },
      { replace: true },
    )
  }, [parametrosBusca, setParametrosBusca])

  // Barra de progresso de ~2 s antes de abrir o preview do resumo executivo.
  useEffect(() => {
    if (progressoGeracao === null) return
    if (progressoGeracao >= 100) {
      setProgressoGeracao(null)
      setModalResumo(true)
      return
    }
    timerRef.current = window.setTimeout(() => setProgressoGeracao((atual) => (atual ?? 0) + 6), 110)
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [progressoGeracao])

  const relatoriosFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim())
    return relatorios.filter((relatorio) => {
      if (abaCategoria !== 'Todos' && relatorio.categoria !== abaCategoria) return false
      if (termo && !normalizar(`${relatorio.nome} ${relatorio.responsavel}`).includes(termo)) return false
      return true
    })
  }, [abaCategoria, busca])

  const visualizar = (relatorio: Relatorio) => {
    if (relatorio.id === 'REL-001') setModalResumo(true)
    else addToast({ titulo: relatorio.nome, descricao: 'Pré-visualização disponível na demo completa.', tone: 'info' })
  }

  const enviar = (relatorio: Relatorio) => {
    addToast({ titulo: 'Relatório enviado', descricao: `${relatorio.nome} enviado aos destinatários da lista.`, tone: 'success' })
  }

  const gerarAgora = (relatorio: Relatorio) => {
    addToast({ titulo: 'Geração iniciada', descricao: `${relatorio.nome} fica pronto em ~2,4 min.`, tone: 'info' })
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Gerar resumo executivo') {
      if (progressoGeracao === null) setProgressoGeracao(6)
    } else if (rotulo === 'Montar board pack') {
      addToast({ titulo: 'Board pack montado', descricao: '5 relatórios consolidados para a reunião de diretoria.', tone: 'success' })
    } else if (rotulo === 'Enviar relatório') {
      addToast({ titulo: 'Relatório enviado', descricao: 'Resumo Executivo da Produção enviado para a diretoria.', tone: 'success' })
    }
  }

  const colunasBiblioteca: ColunaDataTable<Relatorio>[] = useMemo(
    () => [
      {
        id: 'nome',
        titulo: 'Relatório',
        render: (item) => (
          <span className="leading-tight">
            <span className="block max-w-[190px] truncate font-medium text-ink" title={item.nome}>
              {item.nome}
            </span>
            <span className="block max-w-[190px] truncate text-caption text-muted" title={item.descricao}>
              {item.descricao}
            </span>
          </span>
        ),
        valor: (item) => item.nome,
      },
      {
        id: 'categoria',
        titulo: 'Categoria',
        render: (item) => <span className="text-muted">{item.categoria}</span>,
        valor: (item) => item.categoria,
      },
      {
        id: 'periodicidade',
        titulo: 'Período',
        render: (item) => item.periodicidade,
        valor: (item) => item.periodicidade,
      },
      {
        id: 'geracao',
        titulo: 'Última geração',
        render: (item) => (
          <span className="tabular-nums text-ink">
            {formatDiaMes(item.ultimaGeracao)} {formatHora(item.ultimaGeracao)}
          </span>
        ),
        valor: (item) => item.ultimaGeracao,
      },
      {
        id: 'formato',
        titulo: 'Formato',
        render: (item) => <BadgeFormato formato={item.formato} />,
      },
      {
        id: 'responsavel',
        titulo: 'Responsável',
        render: (item) => item.responsavel,
        valor: (item) => item.responsavel,
      },
      {
        id: 'situacao',
        titulo: 'Situação',
        render: (item) => <StatusPill status={item.situacao} />,
      },
      {
        id: 'acoes',
        titulo: 'Ações',
        render: (item) => (
          <span className="flex items-center gap-0.5">
            {(
              [
                ['Visualizar', Eye, () => visualizar(item)],
                ['Enviar', Send, () => enviar(item)],
                ['Gerar agora', RefreshCw, () => gerarAgora(item)],
              ] as const
            ).map(([rotulo, Icone, onClick]) => (
              <Tooltip key={rotulo} conteudo={rotulo}>
                <button
                  type="button"
                  aria-label={`${rotulo} — ${item.nome}`}
                  onClick={(evento) => {
                    evento.stopPropagation()
                    onClick()
                  }}
                  className="rounded-lg p-1 text-muted transition-colors duration-150 hover:bg-app hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icone size={15} aria-hidden="true" />
                </button>
              </Tooltip>
            ))}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const colunasAgendamentos: ColunaDataTable<AgendamentoRelatorio>[] = useMemo(
    () => [
      {
        id: 'relatorio',
        titulo: 'Relatório',
        render: (item) => <span className="font-medium text-ink">{relatorioPorId(item.relatorioId)?.nome ?? '—'}</span>,
        valor: (item) => relatorioPorId(item.relatorioId)?.nome ?? '',
      },
      {
        id: 'destinatarios',
        titulo: 'Destinatários',
        render: (item) => <span className="text-muted">{item.destinatarios}</span>,
        valor: (item) => item.destinatarios,
      },
      {
        id: 'envio',
        titulo: 'Próximo envio',
        render: (item) => (
          <span className="tabular-nums text-ink">
            {formatDiaMes(item.proximoEnvio)} {formatHora(item.proximoEnvio)}
          </span>
        ),
        valor: (item) => item.proximoEnvio,
      },
      {
        id: 'canal',
        titulo: 'Canal',
        render: (item) => <Badge tone={item.canal === 'E-mail' ? 'info' : 'clean'}>{item.canal}</Badge>,
        valor: (item) => item.canal,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => <StatusPill status={item.status} />,
        valor: (item) => item.status,
      },
    ],
    [],
  )

  const recentes = useMemo(
    () => [...relatorios].sort((a, b) => b.ultimaGeracao.getTime() - a.ultimaGeracao.getTime()).slice(0, 5),
    [],
  )

  const copiloto = conteudoCopilot['/relatorios']

  return (
    <>
      <PageHeader
        titulo="Relatórios"
        descricao="Acompanhe, analise e distribua relatórios operacionais, táticos e executivos em tempo real."
        acoes={
          <>
            <Button
              tamanho="sm"
              onClick={() => addToast({ titulo: 'Criar relatório', descricao: 'Editor disponível na demo completa.', tone: 'info' })}
            >
              <Plus size={14} aria-hidden="true" />
              Criar relatório
            </Button>
            <Button
              variante="outline"
              tamanho="sm"
              onClick={() => addToast({ titulo: 'Agendar envio', descricao: 'Agendador disponível na demo completa.', tone: 'info' })}
            >
              <CalendarClock size={14} aria-hidden="true" />
              Agendar envio
            </Button>
            <Button
              variante="outline"
              tamanho="sm"
              onClick={() => addToast({ titulo: 'Exportação iniciada', descricao: 'Biblioteca exportada em XLSX.', tone: 'success' })}
            >
              <Download size={14} aria-hidden="true" />
              Exportar
            </Button>
          </>
        }
      />

      <KpiRow kpis={kpisPorTela['/relatorios']} />

      <SectionCard
        titulo={`Biblioteca de Relatórios (${relatoriosFiltrados.length})`}
        info="Catálogo por categoria — Visualizar abre o preview do Resumo Executivo."
        corpoSemPadding
        direita={
          <label className="flex items-center gap-2 rounded-lg border border-line bg-app px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-primary">
            <Search size={14} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar relatório…"
              aria-label="Buscar relatório por nome ou responsável"
              className="w-44 bg-transparent text-body-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
        }
      >
        <Tabs abas={ABAS_CATEGORIA} ativa={abaCategoria} onChange={setAbaCategoria} className="px-5" />
        {relatoriosFiltrados.length > 0 ? (
          <DataTable
            rotulo="Biblioteca de relatórios"
            colunas={colunasBiblioteca}
            linhas={relatoriosFiltrados}
            chave={(item) => item.id}
            ordenacaoInicial={{ coluna: 'geracao', direcao: 'desc' }}
          />
        ) : (
          <p className="px-5 py-6 text-body-sm text-muted">
            Nenhum relatório corresponde a “{busca}”. Limpe a busca ou troque de categoria para ver o catálogo.
          </p>
        )}
      </SectionCard>

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Distribuição e Consumo"
            info="Leituras dos últimos 7 dias e indicadores de consumo da biblioteca."
          >
            <p className="mb-1 flex items-center justify-between gap-3 text-caption text-muted">
              <span className="font-semibold text-ink">Leituras por dia</span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
                13 – 19/mai
              </span>
            </p>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leiturasSemana} margin={{ top: 6, right: 14, bottom: 0, left: 14 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: colors.muted }}
                    tickLine={false}
                    axisLine={{ stroke: colors.line }}
                  />
                  <YAxis hide domain={[0, 'dataMax + 60']} />
                  <ChartTooltip
                    cursor={{ stroke: colors.line }}
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                    formatter={(valor: number) => [`${formatNumero(valor)} leituras`, 'Leituras']}
                  />
                  <Line type="monotone" dataKey="valor" stroke={colors.primary} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3 border-t border-line pt-3">
              {consumoRelatorios.map((indicador) => (
                <div key={indicador.id} className="min-w-0">
                  <p className="truncate text-caption text-muted" title={indicador.label}>
                    {indicador.label}
                  </p>
                  <p className="text-[17px] font-bold leading-6 text-ink">{indicador.valor}</p>
                  <TrendDelta delta={indicador.delta} deltaGoodWhen={indicador.deltaGoodWhen} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            titulo={`Agendamentos (${agendamentos.length})`}
            info="Envios programados por e-mail e Teams."
            corpoSemPadding
            acao={{
              rotulo: 'Gerenciar agendamentos',
              onClick: () => addToast({ titulo: 'Agendamentos', descricao: 'Gestão completa disponível na demo completa.', tone: 'info' }),
            }}
          >
            <DataTable
              rotulo="Envios programados"
              colunas={colunasAgendamentos}
              linhas={agendamentos}
              chave={(item) => item.id}
            />
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <CopilotPanel conteudo={copiloto} onAcao={aoAcaoCopilot} />

          <SectionCard titulo="Relatórios Recentes" info="Últimas gerações da biblioteca, mais novas primeiro.">
            <ul className="flex flex-col gap-2.5">
              {recentes.map((relatorio) => (
                <li key={relatorio.id} className="flex items-center justify-between gap-2 border-b border-line pb-2.5 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-medium text-ink" title={relatorio.nome}>
                      {relatorio.nome}
                    </p>
                    <p className="flex items-center gap-1.5 text-caption text-muted">
                      <span className="tabular-nums">
                        {formatDiaMes(relatorio.ultimaGeracao)} {formatHora(relatorio.ultimaGeracao)}
                      </span>
                      <BadgeFormato formato={relatorio.formato} />
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => visualizar(relatorio)}
                      aria-label={`Visualizar ${relatorio.nome}`}
                      className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-app hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <FileText size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => enviar(relatorio)}
                      aria-label={`Enviar ${relatorio.nome}`}
                      className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-app hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Send size={15} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard
          className="col-span-2"
          titulo="Catálogo Analítico"
          info="Relatórios disponíveis por área na rede Hypera."
          acao={{
            rotulo: 'Explorar catálogo completo',
            onClick: () => addToast({ titulo: 'Catálogo completo', descricao: '104 relatórios disponíveis na demo completa.', tone: 'info' }),
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {catalogoAnalitico.map((categoria) => (
              <div key={categoria.area} className="rounded-xl border border-line bg-app/40 px-3.5 py-3">
                <p className="text-body-sm font-medium text-ink">{categoria.area}</p>
                <p className="mt-1 text-[22px] font-bold leading-none tabular-nums text-primary">
                  {formatNumero(categoria.quantidade)}
                </p>
                <p className="mt-1 text-caption text-muted">relatórios</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard titulo="Governança e Confiabilidade" info="Saúde do pipeline de dados e distribuição.">
          <div className="flex justify-center border-b border-line pb-4">
            <ScoreDonut valor={RELATORIOS_GOVERNANCA_SCORE} rotulo="Confiabilidade da biblioteca" />
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {governancaRelatorios.map((item) => (
              <li key={item.item} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-body-sm text-ink" title={item.item}>
                  {item.item}
                </span>
                {item.valorRotulo ? (
                  <>
                    <ProgressBar valor={item.percent} mostrarRotulo={false} />
                    <span className="w-10 shrink-0 text-right text-caption font-semibold tabular-nums text-ink">
                      {item.valorRotulo}
                    </span>
                  </>
                ) : (
                  <ProgressBar valor={item.percent} />
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Progresso da geração do resumo executivo (~2 s) */}
      {progressoGeracao !== null ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 w-80 animate-toast-in rounded-card border border-line bg-card p-4 shadow-pop motion-reduce:animate-none"
        >
          <p className="flex items-center gap-2 text-body-sm font-semibold text-ink">
            <FileText size={15} className="text-primary" aria-hidden="true" />
            Gerando resumo executivo…
          </p>
          <ProgressBar valor={progressoGeracao} className="mt-2.5" />
          <p className="mt-1.5 text-caption text-muted">Consolidando KPIs, produção vs plano e riscos da semana.</p>
        </div>
      ) : null}

      <Modal
        aberto={modalResumo}
        onFechar={() => setModalResumo(false)}
        titulo="Resumo Executivo da Produção"
        descricao="HPO — Hypera Production Optimizer · 19/mai/2025 · Turno A"
        largura="lg"
        rodape={
          <>
            <Button variante="outline" tamanho="sm" onClick={() => setModalResumo(false)}>
              Fechar
            </Button>
            <Button
              tamanho="sm"
              onClick={() => addToast({ titulo: 'Enviado para 8 destinatários', descricao: 'Diretoria Industrial · por e-mail.', tone: 'success' })}
            >
              <Send size={14} aria-hidden="true" />
              Enviar para diretoria
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {resumoExecutivoKpis.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-line bg-app/50 px-3 py-2.5">
                <p className="truncate text-caption text-muted" title={kpi.label}>
                  {kpi.label}
                </p>
                <p className="mt-0.5 text-[20px] font-bold leading-7 text-ink">{kpi.valor}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-1 flex items-center justify-between gap-3 text-caption text-muted">
              <span className="font-semibold text-ink">Produção vs Plano · últimos 7 dias · mil un</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
                  Real
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0 w-4 border-t-2 border-dashed border-neutral" aria-hidden="true" />
                  Plano
                </span>
              </span>
            </p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={producaoVsPlano} margin={{ top: 6, right: 14, bottom: 0, left: 14 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: colors.muted }}
                    tickLine={false}
                    axisLine={{ stroke: colors.line }}
                  />
                  <YAxis hide domain={['dataMin - 120', 'dataMax + 80']} />
                  <ChartTooltip
                    cursor={{ stroke: colors.line }}
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                    formatter={(valor: number, nome: string) => [`${formatNumero(valor)} mil un`, nome === 'real' ? 'Real' : 'Plano']}
                  />
                  <Line type="monotone" dataKey="plano" stroke="#94A3B8" strokeWidth={1.6} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="real" stroke={colors.primary} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-danger">Riscos da semana</p>
              <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-body-sm text-ink">
                {conteudoCopilot['/'].riscos.map((risco) => (
                  <li key={risco}>{risco}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-success">Recomendações</p>
              <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-body-sm text-ink">
                {conteudoCopilot['/'].acoes.map((acao) => (
                  <li key={acao}>{acao}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="border-t border-line pt-2.5 text-caption text-muted">
            Gerado pelo Copiloto Gemini às 10:18 · fontes: MES, SAP PP e LIMS · distribuição controlada.
          </p>
        </div>
      </Modal>

      <PageFooter />
    </>
  )
}
