import { useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DOT_HOVER, EIXO, GRID, TooltipHpo } from '@/components/charts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { MiniBarList } from '@/components/shared/MiniBarList'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/cn'
import { colors, toneForStatus, toneTextClass, type Tone } from '@/lib/colors'
import { formatMoeda, formatMoedaCompacta, formatPercent, formatPontosPercentuais } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  PRONTIDAO_FINANCEIRA_DELTA_PP,
  PRONTIDAO_FINANCEIRA_SCORE,
  composicaoCustos,
  conteudoCopilot,
  driversCusto,
  kpisPorTela,
  linhaPorId,
  linhasFiltradas,
  ordemPorId,
  ordensFiltradas,
  ordensImpactoFinanceiro,
  performancePorLinha,
  produtoPorId,
  prontidaoFinanceira,
  visaoFinanceiraTurno,
  type OrdemImpactoFinanceiro,
  type PerformanceLinha,
} from '@/data'

const toneDaSituacaoLinha: Record<PerformanceLinha['situacao'], Tone> = {
  Crítico: 'danger',
  Atenção: 'warning',
  Normal: 'success',
}

/** Impacto financeiro assinado: verde quando positivo, vermelho quando negativo. */
function ImpactoFinanceiro({ valor }: { valor: number }) {
  const positivo = valor >= 0
  return (
    <span className={cn('font-semibold tabular-nums', positivo ? 'text-success' : 'text-danger')}>
      {positivo ? '+' : '−'}
      {formatMoedaCompacta(Math.abs(valor))}
    </span>
  )
}

function StatRodape({ label, valor, destaque }: { label: string; valor: string; destaque?: 'success' | 'danger' }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-caption text-muted" title={label}>
        {label}
      </p>
      <p className={cn('text-body-sm font-bold tabular-nums', destaque ? toneTextClass[destaque] : 'text-ink')}>{valor}</p>
    </div>
  )
}

export function CustosPage() {
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const filtros = useAppStore((s) => s.filtros)
  const resetFiltros = useAppStore((s) => s.resetFiltros)

  const [modoGrafico, setModoGrafico] = useState<'hora' | 'acumulado'>('hora')
  const ordensRef = useRef<HTMLDivElement | null>(null)

  // Recorte global sobre as tabelas por linha e por ordem.
  const performanceRecorte = useMemo(() => {
    const idsLinhas = new Set(linhasFiltradas(filtros).map((linha) => linha.id))
    return performancePorLinha.filter((item) => idsLinhas.has(item.linhaId))
  }, [filtros])
  const ordensImpactoRecorte = useMemo(() => {
    const idsOrdens = new Set(ordensFiltradas(filtros).map((ordem) => ordem.id))
    return ordensImpactoFinanceiro.filter((item) => idsOrdens.has(item.ordemId))
  }, [filtros])

  // Acumulados do turno — derivados da própria série horária.
  const totais = useMemo(() => {
    const real = visaoFinanceiraTurno.reduce((soma, ponto) => soma + ponto.custoReal, 0)
    const orcado = visaoFinanceiraTurno.reduce((soma, ponto) => soma + ponto.custoOrcado, 0)
    const margem = visaoFinanceiraTurno.reduce((soma, ponto) => soma + ponto.margem, 0)
    return {
      real: real * 1000,
      orcado: orcado * 1000,
      diferenca: (real - orcado) * 1000,
      margem: margem * 1000,
      margemPercent: (margem / real) * 100,
    }
  }, [])

  const dadosGrafico = useMemo(() => {
    if (modoGrafico === 'hora') return visaoFinanceiraTurno
    let real = 0
    let orcado = 0
    let margem = 0
    return visaoFinanceiraTurno.map((ponto) => {
      real += ponto.custoReal
      orcado += ponto.custoOrcado
      margem += ponto.margem
      return { label: ponto.label, custoReal: real, custoOrcado: orcado, margem }
    })
  }, [modoGrafico])

  const colunasLinhas: ColunaDataTable<PerformanceLinha>[] = useMemo(
    () => [
      {
        id: 'linha',
        titulo: 'Linha',
        render: (item) => (
          <span className="font-semibold text-ink">{linhaPorId(item.linhaId)?.nome ?? item.linhaId}</span>
        ),
        valor: (item) => item.linhaId,
      },
      {
        id: 'custo',
        titulo: 'Custo/Unid.',
        alinhar: 'direita',
        render: (item) => formatMoeda(item.custoUnidade),
        valor: (item) => item.custoUnidade,
      },
      {
        id: 'oee',
        titulo: 'OEE',
        alinhar: 'direita',
        render: (item) => formatPercent(item.oee),
        valor: (item) => item.oee,
      },
      {
        id: 'yield',
        titulo: 'Yield',
        alinhar: 'direita',
        render: (item) => formatPercent(item.yieldPercent),
        valor: (item) => item.yieldPercent,
      },
      {
        id: 'refugo',
        titulo: 'Refugo',
        alinhar: 'direita',
        render: (item) => (
          <span className={item.refugoPercent > 1.5 ? 'font-semibold text-danger' : undefined}>
            {formatPercent(item.refugoPercent, 2)}
          </span>
        ),
        valor: (item) => item.refugoPercent,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => (
          <StatusPill status={item.situacao} tone={toneDaSituacaoLinha[item.situacao]} pulsar={item.situacao === 'Crítico'} />
        ),
        valor: (item) => item.situacao,
      },
      {
        id: 'impacto',
        titulo: 'Impacto Financeiro',
        alinhar: 'direita',
        render: (item) => <ImpactoFinanceiro valor={item.impactoFinanceiro} />,
        valor: (item) => item.impactoFinanceiro,
      },
    ],
    [],
  )

  const colunasOrdens: ColunaDataTable<OrdemImpactoFinanceiro>[] = useMemo(
    () => [
      {
        id: 'ordem',
        titulo: 'Ordem',
        render: (item) => {
          const ordem = ordemPorId(item.ordemId)
          const produto = ordem ? produtoPorId(ordem.produtoId) : undefined
          return (
            <span className="leading-tight">
              <IdLink id={item.ordemId} />
              <span className="block max-w-[130px] truncate text-caption text-muted" title={`${produto?.nome} · ${ordem?.linhaId}`}>
                {produto?.nome}
              </span>
            </span>
          )
        },
        valor: (item) => item.ordemId,
      },
      {
        id: 'real',
        titulo: 'Real',
        alinhar: 'direita',
        render: (item) => formatMoedaCompacta(item.custoReal),
        valor: (item) => item.custoReal,
      },
      {
        id: 'orcado',
        titulo: 'Orçado',
        alinhar: 'direita',
        render: (item) => <span className="text-muted">{formatMoedaCompacta(item.custoOrcado)}</span>,
        valor: (item) => item.custoOrcado,
      },
      {
        id: 'margem',
        titulo: 'Margem',
        alinhar: 'direita',
        render: (item) => formatPercent(item.margemPercent),
        valor: (item) => item.margemPercent,
      },
      {
        id: 'impacto',
        titulo: 'Impacto',
        alinhar: 'direita',
        render: (item) => <ImpactoFinanceiro valor={item.impactoFinanceiro} />,
        valor: (item) => item.impactoFinanceiro,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => {
          const ordem = ordemPorId(item.ordemId)
          return ordem ? (
            <StatusPill status={ordem.status} tone={toneForStatus(ordem.status)} pulsar={ordem.situacao === 'Em risco'} />
          ) : (
            '—'
          )
        },
        valor: (item) => ordemPorId(item.ordemId)?.status ?? '',
      },
      {
        id: 'aderencia',
        titulo: 'Aderência',
        alinhar: 'direita',
        render: (item) => (
          <span className="inline-flex flex-col items-end leading-tight">
            <span className={cn('font-semibold tabular-nums', item.aderenciaPercent < 70 ? 'text-danger' : 'text-ink')}>
              {formatPercent(item.aderenciaPercent, 0)}
            </span>
            <TrendDelta delta={formatPontosPercentuais(item.aderenciaDeltaPP, 0)} deltaGoodWhen="up" />
          </span>
        ),
        valor: (item) => item.aderenciaPercent,
      },
    ],
    [],
  )

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular impacto') abrirSimulador()
    else if (rotulo === 'Acionar plano') {
      addToast({
        titulo: 'Plano de ação acionado',
        descricao: 'Reprogramação da L12 e priorização de lotes de maior margem enviadas ao Sequenciamento.',
        tone: 'success',
      })
    } else if (rotulo === 'Ver produtos críticos') {
      ordensRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <PageHeader
        titulo="Custos e Performance"
        descricao="Monitore custos industriais, produtividade e impacto financeiro em tempo real."
      />

      <FilterBar />

      <KpiRow kpis={kpisPorTela['/custos']} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Visão Financeira da Operação"
            info="Custo real vs orçado e margem por hora do Turno A (06:00 – 14:00), em R$ mil."
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
            <p className="mb-1 flex flex-wrap items-center gap-3 text-caption text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
                Custo Real
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed border-neutral" aria-hidden="true" />
                Custo Orçado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-sm bg-success/30" aria-hidden="true" />
                Margem (eixo direito)
              </span>
            </p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dadosGrafico} margin={{ top: 6, right: 14, bottom: 0, left: 14 }}>
                  <CartesianGrid {...GRID} />
                  <defs>
                    <linearGradient id="gradMargem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.success} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={colors.success} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={EIXO.tick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis yAxisId="custo" hide domain={[0, 'dataMax + 60']} />
                  <YAxis yAxisId="margem" hide orientation="right" domain={[0, 'dataMax + 120']} />
                  <ChartTooltip
                    cursor={{ stroke: colors.line }}
                    content={<TooltipHpo />}
                    formatter={(valor: number, nome: string) => [
                      formatMoedaCompacta(valor * 1000),
                      nome === 'custoReal' ? 'Custo Real' : nome === 'custoOrcado' ? 'Custo Orçado' : 'Margem',
                    ]}
                  />
                  <Area
                    yAxisId="margem"
                    type="monotone"
                    dataKey="margem"
                    stroke={colors.success}
                    strokeWidth={1.4}
                    fill="url(#gradMargem)"
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="custo"
                    type="monotone"
                    dataKey="custoOrcado"
                    stroke="#94A3B8"
                    strokeWidth={1.6}
                    strokeDasharray="5 4"
                    dot={false}
                    activeDot={DOT_HOVER}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="custo"
                    type="monotone"
                    dataKey="custoReal"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={DOT_HOVER}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-3 border-t border-line pt-3">
              <StatRodape label="Custo Real acum." valor={formatMoedaCompacta(totais.real)} />
              <StatRodape label="Orçado acum." valor={formatMoedaCompacta(totais.orcado)} />
              <StatRodape
                label="Diferença"
                valor={`−${formatMoedaCompacta(Math.abs(totais.diferenca))} (−${formatPercent((Math.abs(totais.diferenca) / totais.orcado) * 100)})`}
                destaque="success"
              />
              <StatRodape label="Margem acum." valor={formatMoedaCompacta(totais.margem)} />
              <StatRodape label="% Margem" valor={formatPercent(totais.margemPercent)} />
            </div>
          </SectionCard>

          <SectionCard
            titulo="Composição de Custos"
            info="Participação de cada categoria no custo industrial do turno."
          >
            <MiniBarList
              itens={composicaoCustos.map((item) => ({
                id: item.id,
                label: item.categoria,
                valor: formatMoedaCompacta(item.valor),
                percent: item.percent,
              }))}
            />
            <p className="mt-3 border-t border-line pt-2.5 text-caption text-muted">
              Custo industrial do turno: <strong className="text-ink">{formatMoedaCompacta(totais.real)}</strong>
            </p>
          </SectionCard>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/custos']} onAcao={aoAcaoCopilot} />
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard
          titulo="Drivers de Custo e Desvios (Top 6)"
          info="Principais desvios de custo do turno, em R$ e % do desvio total."
          acao={{
            rotulo: 'Ver ordens impactadas',
            onClick: () => ordensRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          }}
        >
          <MiniBarList
            itens={driversCusto.map((item) => ({
              id: item.id,
              label: item.driver,
              valor: formatMoedaCompacta(item.valor),
              percent: item.percent,
            }))}
          />
        </SectionCard>

        <SectionCard
          className="col-span-2"
          titulo="Performance por Linha"
          contagem={{ visiveis: performanceRecorte.length, total: performancePorLinha.length }}
          info="Indicadores financeiros por linha de Anápolis — média dos últimos 7 dias, no recorte atual."
          corpoSemPadding
        >
          {performanceRecorte.length > 0 ? (
            <DataTable
              rotulo="Performance financeira por linha"
              colunas={colunasLinhas}
              linhas={performanceRecorte}
              chave={(item) => item.linhaId}
            />
          ) : (
            <EmptyState
              titulo="Nenhuma linha no recorte atual"
              descricao="Os indicadores financeiros por linha desta demo cobrem Anápolis."
              acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
            />
          )}
        </SectionCard>
      </div>

      <div ref={ordensRef} className="grid scroll-mt-4 grid-cols-3 items-start gap-5">
        <SectionCard
          className="col-span-2"
          titulo="Ordens / Produtos com Maior Impacto"
          contagem={{ visiveis: ordensImpactoRecorte.length, total: ordensImpactoFinanceiro.length }}
          info="Ordens-âncora com maior desvio financeiro no turno, no recorte atual. Aderência igual à do Planejamento."
          corpoSemPadding
        >
          {ordensImpactoRecorte.length > 0 ? (
            <DataTable
              rotulo="Ordens com maior impacto financeiro"
              colunas={colunasOrdens}
              linhas={ordensImpactoRecorte}
              chave={(item) => item.ordemId}
            />
          ) : (
            <EmptyState
              titulo="Nenhuma ordem no recorte atual"
              descricao="Os desvios financeiros do turno estão nas ordens-âncora de Anápolis."
              acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
            />
          )}
        </SectionCard>

        <SectionCard titulo="Prontidão Financeira" info="Números-base do turno e saúde financeira consolidada.">
          <div className="flex flex-col items-center gap-1 border-b border-line pb-4">
            <ScoreDonut valor={PRONTIDAO_FINANCEIRA_SCORE} qualificador="Bom" rotulo="Saúde financeira do turno" />
            <TrendDelta delta={formatPontosPercentuais(PRONTIDAO_FINANCEIRA_DELTA_PP, 0)} deltaGoodWhen="up" />
          </div>
          <dl className="mt-4 flex flex-col gap-2.5 text-body-sm">
            {prontidaoFinanceira.map((item) => (
              <div key={item.item} className="flex items-center justify-between gap-2">
                <dt className="truncate text-muted" title={item.item}>
                  {item.item}
                </dt>
                <dd className="shrink-0 font-semibold tabular-nums text-ink">{item.valor}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>

      <PageFooter />
    </>
  )
}
