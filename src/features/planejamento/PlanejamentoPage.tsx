import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarRange, CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { FiltroChips } from '@/components/shared/FilterBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
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
  linhasFiltradas,
  materiais,
  ordens,
  ordensFiltradas,
  planoPorLinha,
  produtoPorId,
  restricoes,
  skusRisco,
  type FamiliaProduto,
  type Material,
  type NomeFabrica,
  type OrdemProducao,
  type PlanoLinha,
  type Restricao,
  type SkuRisco,
} from '@/data'

const ABAS = [
  { id: 'visao-geral', rotulo: 'Visão Geral' },
  { id: 'plano-linha', rotulo: 'Plano por Linha' },
  { id: 'calendario', rotulo: 'Calendário de Campanhas' },
  { id: 'plano-produto', rotulo: 'Plano por Produto' },
  { id: 'necessidades', rotulo: 'Necessidades' },
  { id: 'restricoes', rotulo: 'Restrições e Riscos' },
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
  {
    id: 'codigo',
    titulo: 'SKU',
    render: (sku) => <span className="font-medium text-ink">{sku.codigo}</span>,
    valor: (sku) => sku.codigo,
  },
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

// ── Tab Plano por Produto — agregação das 14 ordens da semana ────────────────

interface PlanoProduto {
  produtoId: string
  ordens: OrdemProducao[]
}

const planoPorProduto: PlanoProduto[] = [...new Set(ordens.map((ordem) => ordem.produtoId))].map((produtoId) => ({
  produtoId,
  ordens: ordens.filter((ordem) => ordem.produtoId === produtoId),
}))

const colunasPlanoProduto: ColunaDataTable<PlanoProduto>[] = [
  {
    id: 'produto',
    titulo: 'Produto',
    render: (plano) => {
      const produto = produtoPorId(plano.produtoId)
      return (
        <span className="leading-tight">
          <span className="block font-medium text-ink">{produto?.nome ?? plano.produtoId}</span>
          <span className="block text-caption text-muted">{produto?.apresentacao}</span>
        </span>
      )
    },
    valor: (plano) => produtoPorId(plano.produtoId)?.nome ?? plano.produtoId,
  },
  {
    id: 'familia',
    titulo: 'Família',
    render: (plano) => produtoPorId(plano.produtoId)?.familia ?? '—',
    valor: (plano) => produtoPorId(plano.produtoId)?.familia ?? '',
  },
  {
    id: 'ordens',
    titulo: 'Ordens',
    render: (plano) => (
      <span className="flex flex-wrap gap-x-2">
        {plano.ordens.map((ordem) => (
          <IdLink key={ordem.id} id={ordem.id} />
        ))}
      </span>
    ),
    valor: (plano) => plano.ordens.length,
  },
  {
    id: 'quantidade',
    titulo: 'Quantidade',
    alinhar: 'direita',
    render: (plano) =>
      `${formatNumero(plano.ordens.reduce((soma, ordem) => soma + ordem.quantidade, 0))} ${plano.ordens[0].unidade}`,
    valor: (plano) => plano.ordens.reduce((soma, ordem) => soma + ordem.quantidade, 0),
  },
  {
    id: 'linhas',
    titulo: 'Linhas',
    render: (plano) => [...new Set(plano.ordens.map((ordem) => ordem.linhaId))].join(' · '),
    valor: (plano) => plano.ordens.map((ordem) => ordem.linhaId).join(),
  },
  {
    id: 'janela',
    titulo: 'Janela',
    render: (plano) => {
      const inicio = new Date(Math.min(...plano.ordens.map((ordem) => ordem.inicio.getTime())))
      const fim = new Date(Math.max(...plano.ordens.map((ordem) => ordem.fim.getTime())))
      return `${formatDiaMes(inicio)} – ${formatDiaMes(fim)}`
    },
    valor: (plano) => Math.min(...plano.ordens.map((ordem) => ordem.inicio.getTime())),
  },
  {
    id: 'prontidao',
    titulo: 'Prontidão média',
    largura: 'w-36',
    render: (plano) => {
      const media = Math.round(
        plano.ordens.reduce((soma, ordem) => soma + ordem.prontidaoMateriais, 0) / plano.ordens.length,
      )
      return <ProgressBar valor={media} tone={toneDaProntidao(media)} />
    },
    valor: (plano) =>
      plano.ordens.reduce((soma, ordem) => soma + ordem.prontidaoMateriais, 0) / plano.ordens.length,
  },
]

// ── Tab Necessidades — demanda de 7 dias por material ────────────────────────

const colunasNecessidades: ColunaDataTable<Material>[] = [
  {
    id: 'material',
    titulo: 'Material',
    render: (material) => (
      <span className="leading-tight">
        <IdLink id={material.id} />
        <span className="block text-caption text-muted">{material.nome}</span>
      </span>
    ),
    valor: (material) => material.nome,
  },
  { id: 'categoria', titulo: 'Categoria', render: (material) => material.categoria, valor: (material) => material.categoria },
  {
    id: 'necessidade',
    titulo: 'Necessidade (7 dias)',
    alinhar: 'direita',
    render: (material) =>
      material.consumoDia !== undefined ? `${formatNumero(material.consumoDia * 7)} ${material.unidade}` : '—',
    valor: (material) => (material.consumoDia ?? 0) * 7,
  },
  {
    id: 'estoque',
    titulo: 'Estoque',
    alinhar: 'direita',
    render: (material) => `${formatNumero(material.estoque)} ${material.unidade}`,
    valor: (material) => material.estoque,
  },
  {
    id: 'cobertura',
    titulo: 'Cobertura',
    alinhar: 'direita',
    render: (material) => (
      <span className={material.coberturaDias < 2 ? 'font-semibold text-danger' : 'text-ink'}>
        {formatNumero(material.coberturaDias, 1)} dias
      </span>
    ),
    valor: (material) => material.coberturaDias,
  },
  {
    id: 'pedidos',
    titulo: 'Pedidos abertos',
    alinhar: 'direita',
    render: (material) => `${formatNumero(material.pedidosAbertos)} ${material.unidade}`,
    valor: (material) => material.pedidosAbertos,
  },
  {
    id: 'status',
    titulo: 'Status',
    render: (material) => <StatusPill status={material.status} pulsar={material.status === 'Crítico'} />,
    valor: (material) => material.status,
  },
]

// ── Tab Restrições e Riscos — as restrições ativas do otimizador ─────────────

const colunasRestricoes: ColunaDataTable<Restricao>[] = [
  {
    id: 'tipo',
    titulo: 'Tipo',
    render: (restricao) => <span className="capitalize text-muted">{restricao.tipo}</span>,
    valor: (restricao) => restricao.tipo,
  },
  {
    id: 'titulo',
    titulo: 'Restrição',
    render: (restricao) => <span className="font-medium text-ink">{restricao.titulo}</span>,
    valor: (restricao) => restricao.titulo,
  },
  {
    id: 'detalhe',
    titulo: 'Detalhe',
    render: (restricao) => (
      <span className="block max-w-[420px] whitespace-normal text-muted">{restricao.detalhe}</span>
    ),
  },
  {
    id: 'severidade',
    titulo: 'Severidade',
    render: (restricao) => <StatusPill status={restricao.severidade} pulsar={restricao.severidade === 'Crítica'} />,
    valor: (restricao) => ({ Crítica: 0, Alta: 1, Média: 2, Baixa: 3 })[restricao.severidade],
  },
]

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
  const filtros = useAppStore((s) => s.filtros)
  const setFiltro = useAppStore((s) => s.setFiltro)
  const resetFiltros = useAppStore((s) => s.resetFiltros)

  const [abaAtiva, setAbaAtiva] = useState('visao-geral')
  const [modalLista, setModalLista] = useState<'riscos' | 'ordens' | null>(null)
  const [horizonte, setHorizonte] = useState('Semanal')
  const [deslocamentoPeriodo, setDeslocamentoPeriodo] = useState(0)
  const [cargaRedistribuida, setCargaRedistribuida] = useState(false)

  const diasHorizonte = horizonte === 'Semanal' ? 7 : 28
  const inicioPeriodo = addDays(new Date(2025, 4, 20), deslocamentoPeriodo * diasHorizonte)
  const fimPeriodo = addDays(inicioPeriodo, diasHorizonte - 1)
  const rotuloPeriodo = `${formatDiaMes(inicioPeriodo)} – ${formatData(fimPeriodo)}`

  // Recorte global aplicado às tabelas da tela.
  const ordensRecorte = useMemo(() => ordensFiltradas(filtros), [filtros])
  const linhasRecorte = useMemo(() => linhasFiltradas(filtros), [filtros])
  const idsLinhasRecorte = useMemo(() => new Set(linhasRecorte.map((linha) => linha.id)), [linhasRecorte])
  const skusRecorte = useMemo(() => skusRisco.filter((sku) => sku.fabrica === filtros.fabrica), [filtros])
  const planoRecorte = useMemo(() => planoPorLinha.filter((plano) => idsLinhasRecorte.has(plano.linhaId)), [idsLinhasRecorte])
  const campanhasRecorte = useMemo(
    () => calendarioCampanhas.filter((campanha) => idsLinhasRecorte.has(campanha.rotulo.split('— ')[1] ?? '')),
    [idsLinhasRecorte],
  )

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

      {/* Barra de contexto — o Select de fábrica lê e grava o filtro global */}
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-card px-3 py-2.5 shadow-card">
        <Select
          rotulo="Fábrica"
          valor={filtros.fabrica}
          opcoes={FABRICAS}
          onChange={(valor) => setFiltro('fabrica', valor as NomeFabrica)}
        />
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

      <FiltroChips />

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
                  titulo="SKUs em Risco de Ruptura"
                  contagem={{ visiveis: skusRecorte.length, total: skusRisco.length }}
                  info={`Amostra dos ${TOTAL_SKUS_RISCO} SKUs com ruptura projetada nas próximas 2 semanas, no recorte da fábrica selecionada.`}
                  acao={{ rotulo: 'Ver todos os riscos', onClick: () => setModalLista('riscos') }}
                  corpoSemPadding
                >
                  {skusRecorte.length > 0 ? (
                    <DataTable rotulo="SKUs em risco de ruptura" colunas={colunasSkus} linhas={skusRecorte} chave={(sku) => sku.codigo} />
                  ) : (
                    <EmptyState
                      titulo={`Sem SKUs em risco para ${filtros.fabrica}`}
                      descricao="Os riscos de ruptura das próximas 2 semanas estão concentrados nas demais plantas."
                      acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
                    />
                  )}
                </SectionCard>
              </div>

              <SectionCard
                titulo="Ordens Planejadas"
                contagem={{ visiveis: ordensRecorte.length, total: ordens.length }}
                info={`Ordens da semana 20 – 26/mai no recorte atual — amostra das ${formatNumero(TOTAL_ORDENS_PLANEJADAS)} ordens do horizonte.`}
                acao={{ rotulo: 'Ver todas as ordens', onClick: () => setModalLista('ordens') }}
                corpoSemPadding
              >
                {ordensRecorte.length > 0 ? (
                  <DataTable
                    rotulo="Ordens planejadas do horizonte"
                    colunas={colunasOrdens}
                    linhas={ordensRecorte}
                    chave={(o) => o.id}
                    alturaMax={420}
                    ordenacaoInicial={{ coluna: 'inicio', direcao: 'asc' }}
                  />
                ) : (
                  <EmptyState
                    icone={CalendarX2}
                    titulo="Nenhuma ordem no recorte atual"
                    descricao="Ajuste fábrica, área, turno ou período para voltar a ver ordens da semana."
                    acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
                  />
                )}
              </SectionCard>
            </>
          ) : null}

          {abaAtiva === 'plano-linha' ? (
            <SectionCard
              titulo="Plano por Linha"
              contagem={{ visiveis: planoRecorte.length, total: planoPorLinha.length }}
              info="Horas planejadas por linha e semana no horizonte W21 – W25, no recorte atual."
              corpoSemPadding
            >
              {planoRecorte.length > 0 ? (
                <DataTable
                  rotulo="Plano de horas por linha e semana"
                  colunas={colunasPlanoLinha}
                  linhas={planoRecorte}
                  chave={(plano) => plano.linhaId}
                  ordenacaoInicial={{ coluna: 'linha', direcao: 'asc' }}
                />
              ) : (
                <EmptyState
                  titulo="Nenhuma linha no recorte atual"
                  descricao="A combinação de fábrica e área não corresponde a nenhuma linha de produção."
                  acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
                />
              )}
            </SectionCard>
          ) : null}

          {abaAtiva === 'calendario' ? (
            <SectionCard
              titulo="Calendário de Campanhas"
              contagem={{ visiveis: campanhasRecorte.length, total: calendarioCampanhas.length }}
              info="Campanhas por família e semana no recorte atual. As cores seguem a família do produto."
            >
              {campanhasRecorte.length === 0 ? (
                <EmptyState
                  icone={CalendarX2}
                  titulo="Nenhuma campanha no recorte atual"
                  descricao="Ajuste fábrica ou área para ver as campanhas da semana."
                  acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
                />
              ) : (
              <>
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
                          const campanhas = campanhasRecorte.filter(
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
              </>
              )}
            </SectionCard>
          ) : null}

          {abaAtiva === 'plano-produto' ? (
            <SectionCard
              titulo="Plano por Produto"
              contagem={{ visiveis: planoPorProduto.length, total: planoPorProduto.length }}
              info="Agregação das 14 ordens da semana 20 – 26/mai por produto."
              corpoSemPadding
            >
              <DataTable
                rotulo="Plano da semana agregado por produto"
                colunas={colunasPlanoProduto}
                linhas={planoPorProduto}
                chave={(plano) => plano.produtoId}
                ordenacaoInicial={{ coluna: 'quantidade', direcao: 'desc' }}
              />
            </SectionCard>
          ) : null}

          {abaAtiva === 'necessidades' ? (
            <SectionCard
              titulo="Necessidades de Materiais"
              contagem={{ visiveis: materiais.length, total: materiais.length }}
              info="Demanda de 7 dias contra estoque e pedidos abertos — clique no código para abrir a ficha."
              corpoSemPadding
            >
              <DataTable
                rotulo="Necessidades de materiais da semana"
                colunas={colunasNecessidades}
                linhas={materiais}
                chave={(material) => material.id}
                ordenacaoInicial={{ coluna: 'cobertura', direcao: 'asc' }}
              />
            </SectionCard>
          ) : null}

          {abaAtiva === 'restricoes' ? (
            <SectionCard
              titulo="Restrições e Riscos"
              contagem={{ visiveis: restricoes.length, total: restricoes.length }}
              info="Restrições ativas consideradas pelo otimizador da semana — as mesmas do Sequenciamento."
              corpoSemPadding
            >
              <DataTable
                rotulo="Restrições e riscos da semana"
                colunas={colunasRestricoes}
                linhas={restricoes}
                chave={(restricao) => restricao.id}
                ordenacaoInicial={{ coluna: 'severidade', direcao: 'asc' }}
              />
            </SectionCard>
          ) : null}
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/planejamento']} onAcao={aoAcaoCopilot} />
      </div>

      <Modal
        aberto={modalLista === 'riscos'}
        onFechar={() => setModalLista(null)}
        titulo="SKUs em Risco de Ruptura"
        descricao={`Exibindo os ${skusRisco.length} SKUs modelados de um universo de ${TOTAL_SKUS_RISCO} em risco nas próximas 2 semanas.`}
        largura="lg"
        rodape={
          <Button variante="outline" tamanho="sm" onClick={() => { setModalLista(null); navigate('/materiais') }}>
            Ir para Materiais
          </Button>
        }
      >
        <DataTable rotulo="Todos os SKUs em risco modelados" colunas={colunasSkus} linhas={skusRisco} chave={(sku) => sku.codigo} />
      </Modal>

      <Modal
        aberto={modalLista === 'ordens'}
        onFechar={() => setModalLista(null)}
        titulo="Ordens Planejadas"
        descricao={`Exibindo as ${ordens.length} ordens modeladas da semana 20 – 26/mai de um universo de ${formatNumero(TOTAL_ORDENS_PLANEJADAS)} no horizonte.`}
        largura="lg"
      >
        <DataTable
          rotulo="Todas as ordens planejadas modeladas"
          colunas={colunasOrdens}
          linhas={ordens}
          chave={(ordem) => ordem.id}
          ordenacaoInicial={{ coluna: 'inicio', direcao: 'asc' }}
        />
      </Modal>

      <PageFooter />
    </>
  )
}
