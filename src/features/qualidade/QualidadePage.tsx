import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { colors, toneSoftClass, toneTextClass, type Tone } from '@/lib/colors'
import { formatDiaMes, formatDuracao, formatHora, formatNumero, formatPercent } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  PRONTIDAO_QUALIDADE_SCORE,
  conteudoCopilot,
  desviosRanking,
  kpisPorTela,
  linhaPorId,
  lotePorId,
  lotes,
  mapaQualidadeAreas,
  ordemPorId,
  produtoPorId,
  prontidaoQualidade,
  statusDaAreaQualidade,
  tendenciaQualidade24h,
  type Lote,
  type StatusLote,
} from '@/data'

const toneDoStatusLote: Record<StatusLote, Tone> = {
  'Em análise': 'info',
  'Aguardando documentação': 'warning',
  'Em investigação': 'warning',
  Liberado: 'success',
  Bloqueado: 'neutral',
}

const toneDaArea: Record<'Normal' | 'Atenção' | 'Crítico', Tone> = {
  Normal: 'success',
  Atenção: 'warning',
  Crítico: 'danger',
}

/** Pictograma SVG de comprimido — vinheta do lote em análise. */
function PictogramaComprimido() {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <circle cx="13" cy="13" r="9.5" fill={colors.primary} fillOpacity="0.25" />
        <circle cx="13" cy="13" r="9.5" stroke={colors.primary} strokeWidth="1.4" />
        <path d="M4.5 13h17" stroke={colors.primary} strokeWidth="1.4" />
        <path d="M13 6.5c2.6 0 4.8 1 6 2.6" stroke={colors.primary} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      </svg>
    </span>
  )
}

export function QualidadePage() {
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)

  // Ordem da fila vive em estado local — "Priorizar lote" move o lote ao topo.
  const [ordemFila, setOrdemFila] = useState<string[]>(() => lotes.map((lote) => lote.id))
  const [loteSelecionadoId, setLoteSelecionadoId] = useState('2456789A')

  const filaLotes = useMemo(
    () => ordemFila.map((id) => lotePorId(id)).filter((lote): lote is Lote => lote !== undefined),
    [ordemFila],
  )

  const lote = lotePorId(loteSelecionadoId) ?? lotes[0]
  const ordemDoLote = lote.ordemId ? ordemPorId(lote.ordemId) : undefined
  const produtoDoLote = produtoPorId(lote.produtoId)

  const priorizarLote = (id: string) => {
    setOrdemFila((atual) => [id, ...atual.filter((item) => item !== id)])
    setLoteSelecionadoId(id)
    addToast({ titulo: `Lote ${id} priorizado na fila de análise`, tone: 'success' })
  }

  const colunasFila: ColunaDataTable<Lote>[] = useMemo(
    () => [
      {
        id: 'lote',
        titulo: 'Lote',
        render: (item) => <IdLink id={item.id} onClick={() => setLoteSelecionadoId(item.id)} />,
        valor: (item) => item.id,
      },
      {
        id: 'produto',
        titulo: 'Produto',
        render: (item) => {
          const produto = produtoPorId(item.produtoId)
          return (
            <span className="leading-tight">
              <span className="block font-medium text-ink">{produto?.nome ?? '—'}</span>
              <span className="block text-caption text-muted">{produto?.apresentacao}</span>
            </span>
          )
        },
        valor: (item) => produtoPorId(item.produtoId)?.nome ?? '',
      },
      {
        id: 'linha',
        titulo: 'Linha',
        render: (item) => (
          <span title={linhaPorId(item.linhaId)?.nome ?? item.linhaId} className="font-medium text-ink">
            {item.linhaId}
          </span>
        ),
        valor: (item) => item.linhaId,
      },
      {
        id: 'status',
        titulo: 'Status QA',
        render: (item) => (
          <StatusPill status={item.status} tone={toneDoStatusLote[item.status]} pulsar={item.status === 'Em investigação'} />
        ),
        valor: (item) => item.status,
      },
      {
        id: 'prioridade',
        titulo: 'Prioridade',
        render: (item) => <StatusPill status={item.prioridade} />,
        valor: (item) => item.prioridade,
      },
      {
        id: 'espera',
        titulo: 'Tempo na fila',
        alinhar: 'direita',
        render: (item) =>
          item.esperaMinutos !== undefined ? (
            <span className={item.esperaMinutos >= 180 ? 'font-semibold text-danger' : 'text-ink'}>
              {formatDuracao(item.esperaMinutos)}
            </span>
          ) : (
            <span className="text-muted">—</span>
          ),
        valor: (item) => item.esperaMinutos ?? 0,
      },
      {
        id: 'resultado',
        titulo: 'Resultado',
        render: (item) =>
          item.resultado ? <StatusPill status={item.resultado} /> : <span className="text-muted">Em andamento</span>,
        valor: (item) => item.resultado ?? 'Em andamento',
      },
      {
        id: 'proximaAcao',
        titulo: 'Próxima ação',
        render: (item) => (
          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation()
              addToast({ titulo: item.proximaAcao, descricao: `Lote ${item.id} — encaminhado ao time ${item.analista}.`, tone: 'info' })
            }}
            className="rounded font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {item.proximaAcao}
          </button>
        ),
        valor: (item) => item.proximaAcao,
      },
    ],
    [addToast],
  )

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular Impacto') abrirSimulador('EV-005')
    else if (rotulo === 'Priorizar Lotes') priorizarLote(loteSelecionadoId)
    else if (rotulo === 'Acionar Qualidade') {
      addToast({
        titulo: 'Qualidade acionada',
        descricao: 'Time de investigação alocado à fila — desvio do 2456791C assumido.',
        tone: 'success',
      })
    }
  }

  return (
    <>
      <PageHeader
        titulo="Qualidade"
        descricao="Monitore desvios, liberação de lotes e desempenho da qualidade em tempo real."
      />

      <FilterBar />

      <KpiRow kpis={kpisPorTela['/qualidade']} />

      <SectionCard
        titulo="Fila de Liberação de Lotes (18)"
        info="18 lotes na rede — exibindo os 6 de Anápolis. Clique em uma linha para abrir o detalhe abaixo."
        corpoSemPadding
      >
        <DataTable
          rotulo="Fila de liberação de lotes de Anápolis"
          colunas={colunasFila}
          linhas={filaLotes}
          chave={(item) => item.id}
          acao={{ rotulo: 'Priorizar lote', onClick: (item) => priorizarLote(item.id) }}
          onLinhaClick={(item) => setLoteSelecionadoId(item.id)}
          linhaSelecionada={loteSelecionadoId}
        />
      </SectionCard>

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Mapa da Qualidade por Área"
            info="Índice de qualidade por área — Normal ≥ 90 · Atenção 80–89 · Crítico < 80."
          >
            <div className="grid grid-cols-3 gap-3">
              {mapaQualidadeAreas.map((area) => {
                const situacao = statusDaAreaQualidade(area.percent)
                const tone = toneDaArea[situacao]
                return (
                  <div
                    key={area.area}
                    className={cn('rounded-xl border border-line px-3.5 py-3', toneSoftClass[tone])}
                  >
                    <p className="flex items-center justify-between gap-2">
                      <span className="truncate text-body-sm font-medium text-ink" title={area.area}>
                        {area.area}
                      </span>
                      <StatusPill status={situacao} tone={tone} pulsar={situacao === 'Crítico'} />
                    </p>
                    <p className={cn('mt-1.5 text-[22px] font-bold leading-none tabular-nums', toneTextClass[tone])}>
                      {formatNumero(area.percent)}
                    </p>
                    <p className="mt-1 text-caption text-muted">índice de qualidade</p>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 items-start gap-5">
        <SectionCard
          titulo="Desvios e Não Conformidades"
          info="Ranking dos últimos 7 dias, por quantidade de ocorrências."
        >
          <ol className="flex flex-col gap-3">
            {desviosRanking.map((desvio, indice) => (
              <li key={desvio.id}>
                <p className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app text-caption font-semibold text-muted">
                    {indice + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-ink" title={desvio.desvio}>
                    {desvio.desvio}
                  </span>
                  <StatusPill status={desvio.severidade} />
                </p>
                <div className="mt-1.5 flex items-center gap-2 pl-7">
                  <ProgressBar
                    valor={desvio.percent}
                    mostrarRotulo={false}
                    tone={desvio.severidade === 'Alta' ? 'danger' : desvio.severidade === 'Média' ? 'warning' : 'neutral'}
                  />
                  <span className="shrink-0 text-caption tabular-nums text-muted">
                    <strong className="text-ink">{formatNumero(desvio.quantidade)}</strong> · {formatPercent(desvio.percent, 0)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          titulo="Tendência da Qualidade (últimas 24h)"
          info="Taxa de aprovação, desvios abertos e lotes liberados por hora."
        >
          <p className="mb-1 flex flex-wrap items-center gap-3 text-caption text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-success" aria-hidden="true" />
              Aprovação (%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-danger" aria-hidden="true" />
              Desvios
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
              Lotes liberados
            </span>
          </p>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tendenciaQualidade24h} margin={{ top: 6, right: 14, bottom: 0, left: 14 }}>
                <XAxis
                  dataKey="label"
                  interval={5}
                  tick={{ fontSize: 10, fill: colors.muted }}
                  tickLine={false}
                  axisLine={{ stroke: colors.line }}
                />
                <YAxis yAxisId="percent" hide domain={[90, 100]} />
                <YAxis yAxisId="contagem" hide orientation="right" domain={[0, 8]} />
                <ChartTooltip
                  cursor={{ stroke: colors.line }}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                  formatter={(valor: number, nome: string) => {
                    if (nome === 'aprovacao') return [formatPercent(valor), 'Aprovação']
                    return [formatNumero(valor), nome === 'desvios' ? 'Desvios' : 'Lotes liberados']
                  }}
                />
                <Line yAxisId="percent" type="monotone" dataKey="aprovacao" stroke={colors.success} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="contagem" type="monotone" dataKey="desvios" stroke={colors.danger} strokeWidth={1.6} dot={false} isAnimationActive={false} />
                <Line yAxisId="contagem" type="monotone" dataKey="liberados" stroke={colors.primary} strokeWidth={1.6} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
          </div>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/qualidade']} onAcao={aoAcaoCopilot} />
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
      <SectionCard
        className="col-span-2"
        titulo="Detalhe do Lote Selecionado"
        info="Selecione outro lote na fila para trocar este card."
        direita={
          <div className="flex items-center gap-2">
            <Button variante="outline" tamanho="sm" onClick={() => priorizarLote(lote.id)}>
              Priorizar lote
            </Button>
            <button
              type="button"
              onClick={() => addToast({ titulo: 'Histórico do lote', descricao: 'Disponível na demo completa.', tone: 'info' })}
              className="whitespace-nowrap rounded text-body-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ver histórico do lote →
            </button>
          </div>
        }
      >
        {/* key força remontagem com fade suave ao trocar o lote */}
        <div key={lote.id} className="animate-toast-in motion-reduce:animate-none">
          <div className="flex flex-wrap items-center gap-3">
            <PictogramaComprimido />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-card-title font-semibold text-ink">Lote {lote.id}</span>
                <span className="text-body-sm text-muted">
                  {produtoDoLote?.nome} · {produtoDoLote?.apresentacao}
                </span>
                <StatusPill status={lote.status} tone={toneDoStatusLote[lote.status]} pulsar={lote.status === 'Em investigação'} />
                <StatusPill status={lote.prioridade} />
              </p>
              <p className="mt-0.5 text-caption text-muted">
                {linhaPorId(lote.linhaId)?.nome ?? lote.linhaId}
                {lote.ordemId ? (
                  <>
                    {' · ordem '}
                    <IdLink id={lote.ordemId} />
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3 text-body-sm">
            <div>
              <dt className="text-caption text-muted">Linha</dt>
              <dd className="font-semibold text-ink">{linhaPorId(lote.linhaId)?.nome ?? lote.linhaId}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Operação</dt>
              <dd className="font-semibold text-ink">{ordemDoLote?.operador ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Time QA</dt>
              <dd className="font-semibold text-ink">{lote.analista}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Início da produção</dt>
              <dd className="font-semibold text-ink">
                {lote.inicio ? `${formatDiaMes(lote.inicio)} ${formatHora(lote.inicio)}` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Tempo na fila</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {lote.esperaMinutos !== undefined ? formatDuracao(lote.esperaMinutos) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Próxima ação</dt>
              <dd className="font-semibold text-ink">{lote.proximaAcao}</dd>
            </div>
          </dl>

          <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-muted">Parâmetros Críticos</p>
          {lote.parametros ? (
            <div className="mt-2 grid grid-cols-2 gap-3">
              {lote.parametros.map((parametro) => (
                <div key={parametro.nome} className="rounded-xl border border-line bg-app/50 px-3 py-2.5">
                  <p className="flex items-center justify-between gap-2">
                    <span className="truncate text-caption text-muted" title={parametro.nome}>
                      {parametro.nome}
                    </span>
                    <StatusPill
                      status={parametro.situacao}
                      tone={parametro.situacao === 'Dentro da faixa' ? 'success' : 'danger'}
                    />
                  </p>
                  <p className="mt-1 text-[17px] font-bold leading-6 text-ink">{parametro.valor}</p>
                  <p className="text-caption text-muted">Faixa: {parametro.faixa}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-xl border border-line bg-app/50 px-3 py-2.5 text-body-sm text-muted">
              Parâmetros críticos em coleta no LIMS — atualização automática a cada 15 min.
              {lote.observacao ? <span className="mt-1 block text-ink">{lote.observacao}</span> : null}
            </p>
          )}

          <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-muted">Documentação</p>
          {lote.documentos ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {lote.documentos.map((documento) => (
                <span
                  key={documento.nome}
                  className="flex items-center gap-2 rounded-pill border border-line bg-app/50 px-3 py-1.5 text-body-sm text-ink"
                >
                  <FileText size={14} className="text-muted" aria-hidden="true" />
                  {documento.nome}
                  <StatusPill status={documento.status} tone={documento.status === 'Recebido' ? 'success' : 'warning'} />
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-xl border border-line bg-app/50 px-3 py-2.5 text-body-sm text-muted">
              Checklist documental é anexado pelo LIMS na fase de liberação — nenhum documento exigido nesta etapa.
            </p>
          )}
        </div>
      </SectionCard>

        <SectionCard titulo="Prontidão de Qualidade" info="Score consolidado da prontidão de QA da fábrica.">
          <div className="flex flex-col items-center gap-1 border-b border-line pb-4">
            <ScoreDonut valor={PRONTIDAO_QUALIDADE_SCORE} rotulo="Prontidão geral de qualidade" />
            <TrendDelta delta="+3,0 p.p." deltaGoodWhen="up" />
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {prontidaoQualidade.map((item) => (
              <li key={item.item} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-body-sm text-ink" title={item.item}>
                  {item.item}
                </span>
                <ProgressBar valor={item.percent} tone={item.percent >= 90 ? 'primary' : 'warning'} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <PageFooter />
    </>
  )
}
