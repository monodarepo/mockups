import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarRange, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import {
  Bar,
  BarChart,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { addDays } from 'date-fns'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/cn'
import { colors, type Tone } from '@/lib/colors'
import { formatData, formatDiaMes, formatHora, formatNumero, formatPercent } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  CAPACIDADE_DISPONIVEL_H,
  FABRICAS,
  SEMANAS_PLANEJAMENTO,
  TOTAL_ORDENS_PLANEJADAS,
  TOTAL_SKUS_RISCO,
  aderenciaPorOrdem,
  calendarioCampanhas,
  cargaVsCapacidade,
  cenarioPorId,
  coberturaEstoque,
  conteudoCopilot,
  fabricas,
  kpisPorTela,
  linhaPorId,
  ordens,
  planoPorLinha,
  produtoPorId,
  skusRisco,
  type FamiliaProduto,
  type OrdemProducao,
  type PlanoLinha,
  type SkuRisco,
} from '@/data'

const ABAS = [
  { id: 'visao-geral', rotulo: 'Visão Geral' },
  { id: 'plano-linha', rotulo: 'Plano por Linha' },
  { id: 'calendario', rotulo: 'Calendário de Campanhas' },
  { id: 'plano-produto', rotulo: 'Plano por Produto', desabilitada: true, motivoDesabilitada: 'Próxima fase' },
  { id: 'necessidades', rotulo: 'Necessidades', desabilitada: true, motivoDesabilitada: 'Próxima fase' },
  { id: 'restricoes', rotulo: 'Restrições e Riscos', desabilitada: true, motivoDesabilitada: 'Próxima fase' },
]

const corDaFamilia: Record<FamiliaProduto, string> = {
  Analgésicos: 'bg-primary-soft text-primary-strong border border-primary/30',
  Antigripais: 'bg-clean-soft text-clean-strong border border-clean/30',
  Antitérmicos: 'bg-info-soft text-info-strong border border-info/30',
  Vitaminas: 'bg-warning-soft text-warning-strong border border-warning/40',
  Outros: 'bg-success-soft text-success-strong border border-success/30',
}

const FAMILIAS_CALENDARIO: FamiliaProduto[] = ['Analgésicos', 'Antigripais', 'Antitérmicos', 'Vitaminas', 'Outros']

function classeDaCobertura(dias: number): string {
  if (dias < 20) return 'bg-danger-soft text-danger-strong'
  if (dias <= 25) return 'bg-warning-soft text-warning-strong'
  return 'bg-success-soft text-success-strong'
}

const colunasSkus: ColunaDataTable<SkuRisco>[] = [
  { id: 'codigo', titulo: 'SKU', render: (sku) => <IdLink id={sku.codigo} />, valor: (sku) => sku.codigo },
  { id: 'produto', titulo: 'Produto', render: (sku) => sku.produto, valor: (sku) => sku.produto },
  { id: 'fabrica', titulo: 'Fábrica', render: (sku) => sku.fabrica, valor: (sku) => sku.fabrica },
  {
    id: 'risco',
    titulo: 'Risco',
    render: (sku) => <StatusPill status={sku.risco} pulsar={sku.risco === 'Alto'} />,
    valor: (sku) => ({ Alto: 0, Médio: 1, Baixo: 2 })[sku.risco],
  },
  { id: 'ruptura', titulo: 'Ruptura', render: (sku) => formatDiaMes(sku.ruptura), valor: (sku) => sku.ruptura },
]

const colunasPlanoLinha: ColunaDataTable<PlanoLinha>[] = [
  {
    id: 'linha',
    titulo: 'Linha',
    render: (plano) => <span className="font-semibold text-ink">{linhaPorId(plano.linhaId)?.nome ?? plano.linhaId}</span>,
    valor: (plano) => plano.linhaId,
  },
  {
    id: 'fabrica',
    titulo: 'Fábrica',
    render: (plano) => fabricas.find((f) => f.id === linhaPorId(plano.linhaId)?.fabricaId)?.nome ?? '—',
    valor: (plano) => linhaPorId(plano.linhaId)?.fabricaId ?? '',
  },
  ...SEMANAS_PLANEJAMENTO.map((semana, indice) => ({
    id: semana.toLowerCase(),
    titulo: `${semana} (h)`,
    alinhar: 'direita' as const,
    render: (plano: PlanoLinha) => formatNumero(plano.horas[indice]),
    valor: (plano: PlanoLinha) => plano.horas[indice],
  })),
  {
    id: 'utilizacao',
    titulo: 'Utilização',
    largura: 'w-36',
    render: (plano) => {
      const capacidade = linhaPorId(plano.linhaId)?.capacidadeUtilizada ?? 0
      return <ProgressBar valor={capacidade} tone={capacidade > 90 ? 'warning' : 'primary'} />
    },
    valor: (plano) => linhaPorId(plano.linhaId)?.capacidadeUtilizada ?? 0,
  },
]

function toneDaProntidao(prontidao: number): Tone {
  if (prontidao < 65) return 'danger'
  if (prontidao < 80) return 'warning'
  return 'success'
}

const colunasOrdens: ColunaDataTable<OrdemProducao>[] = [
  { id: 'id', titulo: 'Ordem', render: (o) => <IdLink id={o.id} />, valor: (o) => o.id },
  {
    id: 'produto',
    titulo: 'Produto',
    render: (o) => produtoPorId(o.produtoId)?.nome ?? o.produtoId,
    valor: (o) => produtoPorId(o.produtoId)?.nome ?? o.produtoId,
  },
  {
    id: 'fabrica',
    titulo: 'Fábrica',
    render: (o) => fabricas.find((f) => f.id === o.fabricaId)?.nome ?? o.fabricaId,
    valor: (o) => o.fabricaId,
  },
  { id: 'linha', titulo: 'Linha Sugerida', render: (o) => o.linhaId, valor: (o) => o.linhaId },
  {
    id: 'inicio',
    titulo: 'Início',
    render: (o) => `${formatDiaMes(o.inicio)} ${formatHora(o.inicio)}`,
    valor: (o) => o.inicio,
  },
  {
    id: 'fim',
    titulo: 'Término',
    render: (o) => `${formatDiaMes(o.fim)} ${formatHora(o.fim)}`,
    valor: (o) => o.fim,
  },
  { id: 'qtd', titulo: 'Quantidade', alinhar: 'direita', render: (o) => formatNumero(o.quantidade), valor: (o) => o.quantidade },
  { id: 'unid', titulo: 'Unid.', render: (o) => o.unidade, valor: (o) => o.unidade },
  { id: 'prioridade', titulo: 'Prioridade', render: (o) => <StatusPill status={o.prioridade} /> },
  {
    id: 'status',
    titulo: 'Status',
    render: (o) => <StatusPill status={o.status} pulsar={o.situacao === 'Em risco'} />,
    valor: (o) => o.status,
  },
  {
    id: 'prontidao',
    titulo: 'Prontidão',
    largura: 'w-32',
    render: (o) => <ProgressBar valor={o.prontidaoMateriais} tone={toneDaProntidao(o.prontidaoMateriais)} />,
    valor: (o) => o.prontidaoMateriais,
  },
  {
    id: 'aderencia',
    titulo: 'Aderência',
    alinhar: 'direita',
    render: (o) => {
      const aderencia = aderenciaPorOrdem[o.id]
      if (aderencia === undefined) return <span className="text-muted">—</span>
      return (
        <span className={cn('font-semibold tabular-nums', aderencia < 70 ? 'text-danger' : 'text-ink')}>
          {formatPercent(aderencia, 0)}
        </span>
      )
    },
    valor: (o) => aderenciaPorOrdem[o.id] ?? -1,
  },
]

export function PlanejamentoPage() {
  const navigate = useNavigate()
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const cenarioAtivo = useAppStore((s) => s.cenarioAtivo)

  const [abaAtiva, setAbaAtiva] = useState('visao-geral')
  const [fabricaFiltro, setFabricaFiltro] = useState('Todas')
  const [horizonte, setHorizonte] = useState('Semanal')
  const [deslocamentoPeriodo, setDeslocamentoPeriodo] = useState(0)
  const [cargaRedistribuida, setCargaRedistribuida] = useState(false)

  const inicioPeriodo = addDays(new Date(2025, 4, 20), deslocamentoPeriodo * 28)
  const fimPeriodo = addDays(inicioPeriodo, 27)
  const rotuloPeriodo = `${formatDiaMes(inicioPeriodo)} – ${formatData(fimPeriodo)}`

  const nomeCenario = cenarioAtivo === 'cenario-base' ? 'Plano Mestre' : cenarioPorId(cenarioAtivo)?.nome ?? cenarioAtivo

  const dadosCarga = useMemo(
    () =>
      cargaVsCapacidade.map((semana) => ({
        ...semana,
        rotulo: `${semana.semana}`,
      })),
    [],
  )

  const redistribuirCarga = () => {
    if (cargaRedistribuida) {
      addToast({ titulo: 'Redistribuição já registrada', descricao: 'A carga da W24 segue balanceada entre as plantas.', tone: 'info' })
      return
    }
    setCargaRedistribuida(true)
    addToast({
      titulo: 'Redistribuição aprovada',
      descricao: 'Carga excedente da W24 dividida entre Goiânia e Pouso Alegre.',
      tone: 'success',
    })
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Otimizar Sequência') navigate('/sequenciamento')
    else if (rotulo === 'Simular Cenário de Manutenção') abrirSimulador('EV-001')
    else if (rotulo === 'Redistribuir Carga entre Fábricas') redistribuirCarga()
  }

  return (
    <>
      <PageHeader
        titulo="Planejamento da Produção"
        descricao="Planeje, simule e otimize sua produção de ponta a ponta."
      />

      {/* Barra de contexto */}
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-card px-3 py-2.5 shadow-card">
        <Select rotulo="Fábrica" valor={fabricaFiltro} opcoes={['Todas', ...FABRICAS]} onChange={setFabricaFiltro} />
        <Select rotulo="Horizonte" valor={horizonte} opcoes={['Semanal', 'Mensal']} onChange={setHorizonte} />
        <span className="flex h-9 items-center gap-1 rounded-lg border border-line bg-card pl-3 pr-1">
          <CalendarRange size={14} className="text-muted" aria-hidden="true" />
          <span className="px-1 text-body-sm font-medium text-ink">{rotuloPeriodo}</span>
          <button
            type="button"
            aria-label="Período anterior"
            onClick={() => setDeslocamentoPeriodo((d) => d - 1)}
            className="rounded p-1 text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Próximo período"
            onClick={() => setDeslocamentoPeriodo((d) => d + 1)}
            className="rounded p-1 text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </span>

        <span className="flex h-9 items-center gap-2 rounded-lg border border-line bg-card pl-3 pr-1.5">
          <span className="text-caption text-muted">Cenário</span>
          <span className="text-body-sm font-medium text-ink">{nomeCenario}</span>
          <Badge tone={cenarioAtivo === 'cenario-base' ? 'neutral' : 'success'}>Ativo</Badge>
        </span>

        <span className="ml-auto flex items-center gap-2">
          <Button variante="outline" onClick={() => abrirSimulador()}>
            Comparar Cenários
          </Button>
          <Button onClick={() => abrirSimulador()}>Novo Cenário</Button>
        </span>
      </div>

      <KpiRow kpis={kpisPorTela['/planejamento']} />

      <Tabs abas={ABAS} ativa={abaAtiva} onChange={setAbaAtiva} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          {abaAtiva === 'visao-geral' ? (
            <>
              <SectionCard
                titulo="Carga vs Capacidade"
                info="Horas planejadas por semana contra a capacidade disponível. O excedente da W24 vem da sobrecarga da L12."
              >
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosCarga} margin={{ top: 12, right: 12, bottom: 0, left: 12 }} barCategoryGap="32%">
                      <XAxis
                        dataKey="rotulo"
                        tick={{ fontSize: 11, fill: colors.muted }}
                        tickLine={false}
                        axisLine={{ stroke: colors.line }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: colors.muted }}
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        tickFormatter={(valor: number) => formatNumero(valor)}
                      />
                      <ChartTooltip
                        cursor={{ fill: colors.line, fillOpacity: 0.3 }}
                        contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                        formatter={(valor: number, nome: string) => [
                          `${formatNumero(valor)} h`,
                          nome === 'carga' ? 'Carga Planejada' : nome === 'adicional' ? 'Capacidade Adicional' : 'Excedente',
                        ]}
                        labelFormatter={(rotulo: string) =>
                          `${rotulo} · ${cargaVsCapacidade.find((s) => s.semana === rotulo)?.faixa ?? ''}`
                        }
                      />
                      <Legend
                        formatter={(nome: string) =>
                          nome === 'carga' ? 'Carga Planejada' : nome === 'adicional' ? 'Capacidade Adicional' : 'Excedente (sobrecarga)'
                        }
                        wrapperStyle={{ fontSize: 12 }}
                        iconSize={10}
                      />
                      <Bar dataKey="carga" stackId="carga" fill={colors.primary} isAnimationActive={false} />
                      <Bar dataKey="adicional" stackId="carga" fill={colors.success} isAnimationActive={false} />
                      <Bar dataKey="excedente" stackId="carga" fill={colors.danger} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      <ReferenceLine
                        y={CAPACIDADE_DISPONIVEL_H}
                        stroke={colors.muted}
                        strokeDasharray="6 4"
                        label={{
                          value: `Capacidade Disponível (${formatNumero(CAPACIDADE_DISPONIVEL_H)} h)`,
                          position: 'insideTopRight',
                          fill: colors.muted,
                          fontSize: 11,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <div className="grid grid-cols-2 gap-5">
                <SectionCard
                  titulo="Cobertura de Estoque (dias)"
                  info="Cobertura projetada por fábrica e semana. Vermelho: abaixo de 20 dias; âmbar: 20 – 25 dias."
                >
                  <table className="w-full border-separate border-spacing-1 text-body-sm" aria-label="Cobertura de estoque por fábrica e semana">
                    <thead>
                      <tr>
                        <th scope="col" className="pb-1 text-left text-caption font-semibold text-muted">
                          Fábrica
                        </th>
                        {SEMANAS_PLANEJAMENTO.map((semana) => (
                          <th key={semana} scope="col" className="pb-1 text-center text-caption font-semibold text-muted">
                            {semana}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {coberturaEstoque.map((linha) => (
                        <tr key={linha.fabrica}>
                          <th
                            scope="row"
                            className={cn('pr-2 text-left text-body-sm', linha.total ? 'font-bold text-ink' : 'font-medium text-muted')}
                          >
                            {linha.fabrica}
                          </th>
                          {linha.valores.map((valor, indice) => (
                            <td
                              key={SEMANAS_PLANEJAMENTO[indice]}
                              className={cn(
                                'h-9 rounded-md text-center font-semibold tabular-nums',
                                classeDaCobertura(valor),
                                linha.total && 'ring-1 ring-line',
                              )}
                            >
                              {formatNumero(valor, 1)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </SectionCard>

                <SectionCard
                  titulo={`SKUs em Risco de Ruptura (${TOTAL_SKUS_RISCO})`}
                  info="Amostra dos SKUs com ruptura projetada nas próximas 2 semanas."
                  acao={{ rotulo: 'Ver todos os riscos', onClick: () => navigate('/materiais') }}
                  corpoSemPadding
                >
                  <DataTable rotulo="SKUs em risco de ruptura" colunas={colunasSkus} linhas={skusRisco} chave={(sku) => sku.codigo} />
                </SectionCard>
              </div>

              <SectionCard
                titulo={`Ordens Planejadas (${formatNumero(TOTAL_ORDENS_PLANEJADAS)})`}
                info="Amostra das ordens do horizonte — as 14 ordens da semana 20 – 26/mai."
                direita={
                  <div className="flex items-center gap-3">
                    <Button
                      variante="outline"
                      tamanho="sm"
                      onClick={() => addToast({ titulo: 'Filtros', descricao: 'Filtros avançados disponíveis na demo completa.', tone: 'info' })}
                    >
                      <SlidersHorizontal size={14} aria-hidden="true" />
                      Filtros
                    </Button>
                    <button
                      type="button"
                      onClick={() => addToast({ titulo: 'Todas as ordens', descricao: 'Lista completa disponível na demo completa.', tone: 'info' })}
                      className="whitespace-nowrap text-body-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Ver todas as ordens →
                    </button>
                  </div>
                }
                corpoSemPadding
              >
                <DataTable
                  rotulo="Ordens planejadas do horizonte"
                  colunas={colunasOrdens}
                  linhas={ordens}
                  chave={(o) => o.id}
                  alturaMax={420}
                  ordenacaoInicial={{ coluna: 'inicio', direcao: 'asc' }}
                />
              </SectionCard>
            </>
          ) : null}

          {abaAtiva === 'plano-linha' ? (
            <SectionCard
              titulo="Plano por Linha"
              info="Horas planejadas por linha e semana no horizonte W21 – W25."
              corpoSemPadding
            >
              <DataTable
                rotulo="Plano de horas por linha e semana"
                colunas={colunasPlanoLinha}
                linhas={planoPorLinha}
                chave={(plano) => plano.linhaId}
                ordenacaoInicial={{ coluna: 'linha', direcao: 'asc' }}
              />
            </SectionCard>
          ) : null}

          {abaAtiva === 'calendario' ? (
            <SectionCard
              titulo="Calendário de Campanhas"
              info="Campanhas por família e semana. As cores seguem a família do produto."
            >
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1" aria-label="Calendário de campanhas por família e semana">
                  <thead>
                    <tr>
                      <th scope="col" className="w-28 pb-1 text-left text-caption font-semibold text-muted">
                        Família
                      </th>
                      {SEMANAS_PLANEJAMENTO.map((semana) => (
                        <th key={semana} scope="col" className="pb-1 text-center text-caption font-semibold text-muted">
                          {semana}
                          <span className="block font-normal">
                            {cargaVsCapacidade.find((s) => s.semana === semana)?.faixa}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FAMILIAS_CALENDARIO.map((familia) => (
                      <tr key={familia}>
                        <th scope="row" className="pr-2 text-left text-body-sm font-semibold text-ink">
                          {familia}
                        </th>
                        {SEMANAS_PLANEJAMENTO.map((semana) => {
                          const campanhas = calendarioCampanhas.filter(
                            (campanha) => campanha.familia === familia && campanha.semana === semana,
                          )
                          return (
                            <td key={semana} className="h-16 w-1/5 rounded-md bg-app/60 p-1 align-top">
                              <div className="flex flex-col gap-1">
                                {campanhas.map((campanha) => (
                                  <span
                                    key={campanha.rotulo + campanha.semana}
                                    className={cn(
                                      'block truncate rounded-md px-1.5 py-1 text-[11px] font-semibold',
                                      corDaFamilia[familia],
                                    )}
                                    title={campanha.rotulo}
                                  >
                                    {campanha.rotulo}
                                  </span>
                                ))}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {FAMILIAS_CALENDARIO.map((familia) => (
                  <span key={familia} className="flex items-center gap-1.5 text-caption text-muted">
                    <span className={cn('h-3 w-5 rounded', corDaFamilia[familia])} aria-hidden="true" />
                    {familia}
                  </span>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/planejamento']} onAcao={aoAcaoCopilot} />
      </div>

      <PageFooter />
    </>
  )
}
