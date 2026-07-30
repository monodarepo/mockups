import { useMemo, useState } from 'react'
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
import { FactoryMap, type PinFabrica } from '@/components/shared/FactoryMap'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { colors, toneHex, type Tone } from '@/lib/colors'
import { formatNumero, formatPercentAssinado } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  PRONTIDAO_ABASTECIMENTO_SCORE,
  conteudoCopilot,
  eventosMateriais,
  kpisPorTela,
  linhaPorId,
  materiais,
  materialPorId,
  ordemPorId,
  ordensImpactadas,
  produtoPorId,
  prontidaoAbastecimento,
  tendenciaMaterial24h,
  type Material,
  type OrdemImpactada,
  type SeveridadeAlerta,
} from '@/data'

/** Pins de prontidão sobre a planta de Anápolis — materiais nos armazéns/áreas, linhas nos blocos. */
const PINS_PRONTIDAO: PinFabrica[] = [
  { id: 'pin-apis', label: 'APIs', valorPercent: 92, status: 'normal', posicao: [16.3, 77.6] },
  { id: 'pin-excipientes', label: 'Excipientes', valorPercent: 95, status: 'normal', posicao: [15, 22.4] },
  { id: 'pin-capsulas', label: 'Cápsulas', valorPercent: 88, status: 'atencao', posicao: [50.3, 35.7] },
  { id: 'pin-blister', label: 'Blister', valorPercent: 62, status: 'critico', posicao: [80.5, 22.4] },
  { id: 'pin-cartuchos', label: 'Cartuchos', valorPercent: 91, status: 'normal', posicao: [83.6, 77.6] },
  { id: 'pin-utilidades', label: 'Utilidades', valorPercent: 97, status: 'normal', posicao: [38.9, 77.6] },
  { id: 'pin-l12', label: 'Compressão L12', valorPercent: 78, status: 'atencao', posicao: [13.3, 51] },
  { id: 'pin-l08', label: 'Sólidos L08', valorPercent: 94, status: 'normal', posicao: [31.8, 51] },
  { id: 'pin-l03', label: 'Cápsulas L03', valorPercent: 90, status: 'normal', posicao: [50.3, 51] },
  { id: 'pin-l15', label: 'Embalagem L15', valorPercent: 65, status: 'critico', posicao: [87, 51] },
  { id: 'pin-l05', label: 'Revestimento L05', valorPercent: 82, status: 'atencao', posicao: [55.3, 22.4] },
]

const toneDaSeveridade: Record<SeveridadeAlerta, Tone> = {
  Crítica: 'danger',
  Alta: 'danger',
  Média: 'warning',
  Baixa: 'info',
}

const toneDoRisco: Record<OrdemImpactada['risco'], Tone> = {
  Alto: 'danger',
  Médio: 'warning',
  Baixo: 'success',
}

/** Risco de ruptura derivado da cobertura: < 2 dias Alto · < 4 dias Médio · demais Baixo. */
function riscoRuptura(material: Material): 'Alto' | 'Médio' | 'Baixo' {
  if (material.coberturaDias < 2) return 'Alto'
  if (material.coberturaDias < 4) return 'Médio'
  return 'Baixo'
}

/** Variação da cobertura em dias vs última semana, derivada da variação de estoque. */
function variacaoCoberturaDias(material: Material): number {
  return Math.round((material.coberturaDias * material.variacaoEstoquePercent) / 5) / 10
}

function rotuloDias(valor: number): string {
  return `${formatNumero(valor, 1)} ${valor < 2 ? 'dia' : 'dias'}`
}

/** Pictograma SVG do material: tambor industrial para APIs/insumos, cartucho para embalagens. */
function PictogramaMaterial({ categoria }: { categoria: Material['categoria'] }) {
  const embalagem = categoria === 'Embalagem'
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
      {embalagem ? (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <rect x="4" y="9" width="18" height="13" rx="1.5" fill={colors.primary} fillOpacity="0.25" />
          <rect x="4" y="9" width="18" height="13" rx="1.5" stroke={colors.primary} strokeWidth="1.4" />
          <path d="M4 9l3.2-4h11.6L22 9" stroke={colors.primary} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M13 9v13" stroke={colors.primary} strokeWidth="1.4" />
        </svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <path
            d="M4.5 5v15c0 1.8 3.8 3.2 8.5 3.2s8.5-1.4 8.5-3.2V5"
            fill={colors.primary}
            fillOpacity="0.25"
            stroke={colors.primary}
            strokeWidth="1.4"
          />
          <ellipse cx="13" cy="5" rx="8.5" ry="2.8" fill={colors.primary} fillOpacity="0.5" stroke={colors.primary} strokeWidth="1.4" />
          <path d="M4.5 10.4c2 1.1 5 1.7 8.5 1.7s6.5-.6 8.5-1.7" stroke={colors.primary} strokeWidth="1.2" />
          <path d="M4.5 15.6c2 1.1 5 1.7 8.5 1.7s6.5-.6 8.5-1.7" stroke={colors.primary} strokeWidth="1.2" />
        </svg>
      )}
    </span>
  )
}

function CampoDetalhe({
  label,
  valor,
  delta,
  deltaGoodWhen,
  sublabel,
  pill,
}: {
  label: string
  valor?: string
  delta?: string
  deltaGoodWhen?: 'up' | 'down'
  sublabel?: string
  pill?: { status: string; tone: Tone }
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-app/50 px-3 py-2.5">
      <p className="truncate text-caption text-muted" title={label}>
        {label}
      </p>
      {pill ? (
        <p className="mt-1.5">
          <StatusPill status={pill.status} tone={pill.tone} />
        </p>
      ) : (
        <p className="mt-0.5 text-[17px] font-bold leading-6 text-ink">{valor}</p>
      )}
      {delta || sublabel ? (
        <p className="flex items-baseline gap-1.5">
          {delta ? <TrendDelta delta={delta} deltaGoodWhen={deltaGoodWhen} /> : null}
          {sublabel ? (
            <span className="truncate text-caption text-muted" title={sublabel}>
              {sublabel}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}

export function MateriaisPage() {
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)

  const [materialSelecionadoId, setMaterialSelecionadoId] = useState('MAT-API-001')

  const material = materialPorId(materialSelecionadoId) ?? materiais[0]
  const risco = riscoRuptura(material)
  const variacaoCobertura = variacaoCoberturaDias(material)
  const tendencia = useMemo(() => tendenciaMaterial24h(material), [material])

  // Fila de críticos: os 8 materiais com menor cobertura.
  const filaCriticos = useMemo(
    () => [...materiais].sort((a, b) => a.coberturaDias - b.coberturaDias).slice(0, 8),
    [],
  )

  const colunasFila: ColunaDataTable<Material>[] = useMemo(
    () => [
      {
        id: 'material',
        titulo: 'Material',
        render: (item) => (
          <span className="leading-tight">
            <span className="block font-medium text-ink">{item.nome}</span>
            <span className="block text-caption text-muted">{item.fornecedor}</span>
          </span>
        ),
        valor: (item) => item.nome,
      },
      {
        id: 'codigo',
        titulo: 'Código',
        render: (item) => <IdLink id={item.id} onClick={() => setMaterialSelecionadoId(item.id)} />,
        valor: (item) => item.id,
      },
      {
        id: 'categoria',
        titulo: 'Categoria',
        render: (item) => <span className="text-muted">{item.categoria}</span>,
        valor: (item) => item.categoria,
      },
      {
        id: 'estoque',
        titulo: 'Estoque',
        alinhar: 'direita',
        render: (item) => `${formatNumero(item.estoque)} ${item.unidade}`,
        valor: (item) => item.estoque,
      },
      {
        id: 'cobertura',
        titulo: 'Cobertura',
        alinhar: 'direita',
        render: (item) => (
          <span className={item.coberturaDias < 2 ? 'font-semibold text-danger' : 'font-medium text-ink'}>
            {rotuloDias(item.coberturaDias)}
          </span>
        ),
        valor: (item) => item.coberturaDias,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => <StatusPill status={item.status} pulsar={item.status === 'Crítico'} />,
        valor: (item) => item.status,
      },
      {
        id: 'acao',
        titulo: 'Próxima ação',
        render: (item) => (
          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation()
              addToast({ titulo: item.proximaAcao, descricao: `${item.nome} — ação encaminhada a suprimentos.`, tone: 'info' })
            }}
            className="block max-w-[220px] truncate rounded text-left font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={item.proximaAcao}
          >
            {item.proximaAcao}
          </button>
        ),
      },
    ],
    [addToast],
  )

  const colunasOrdens: ColunaDataTable<OrdemImpactada>[] = useMemo(
    () => [
      {
        id: 'ordem',
        titulo: 'Ordem',
        render: (item) => <IdLink id={item.ordemId} />,
        valor: (item) => item.ordemId,
      },
      {
        id: 'produto',
        titulo: 'Produto',
        render: (item) => {
          const ordem = ordemPorId(item.ordemId)
          const produto = ordem ? produtoPorId(ordem.produtoId) : undefined
          return (
            <span className="leading-tight">
              <span className="block font-medium text-ink">{produto?.nome ?? '—'}</span>
              <span className="block text-caption text-muted">{produto?.apresentacao}</span>
            </span>
          )
        },
        valor: (item) => produtoPorId(ordemPorId(item.ordemId)?.produtoId ?? '')?.nome ?? '',
      },
      {
        id: 'linha',
        titulo: 'Linha',
        render: (item) => linhaPorId(ordemPorId(item.ordemId)?.linhaId ?? '')?.nome ?? '—',
        valor: (item) => ordemPorId(item.ordemId)?.linhaId ?? '',
      },
      {
        id: 'material',
        titulo: 'Material crítico',
        render: (item) => (
          <span className="leading-tight">
            <IdLink id={item.materialId} onClick={() => setMaterialSelecionadoId(item.materialId)} />
            <span className="block text-caption text-muted">{materialPorId(item.materialId)?.nome}</span>
          </span>
        ),
        valor: (item) => item.materialId,
      },
      {
        id: 'impacto',
        titulo: 'Impacto',
        render: (item) =>
          item.impacto === 'Sem impacto' ? (
            <span className="text-muted">{item.impacto}</span>
          ) : (
            <span className="font-semibold text-warning-strong">{item.impacto}</span>
          ),
        valor: (item) => item.impacto,
      },
      {
        id: 'risco',
        titulo: 'Risco',
        render: (item) => <StatusPill status={item.risco} tone={toneDoRisco[item.risco]} pulsar={item.risco === 'Alto'} />,
        valor: (item) => item.risco,
      },
    ],
    [],
  )

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular impacto') abrirSimulador('EV-002')
    else if (rotulo === 'Acionar suprimentos') {
      addToast({
        titulo: 'Suprimentos acionado',
        descricao: 'Cotação da transferência Goiânia → Anápolis solicitada — resposta até 12:00.',
        tone: 'success',
      })
    } else if (rotulo === 'Priorizar materiais') {
      addToast({
        titulo: 'Materiais priorizados',
        descricao: 'Ibuprofeno API e Blister Alu/Alu 10cp no topo da fila de abastecimento.',
        tone: 'success',
      })
    }
  }

  return (
    <>
      <PageHeader
        titulo="Materiais"
        descricao="Monitore disponibilidade de insumos, antecipe faltas e assegure prontidão operacional em tempo real."
      />

      <FilterBar />

      <KpiRow kpis={kpisPorTela['/materiais']} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Mapa de Prontidão de Materiais"
            info="Prontidão por área e por linha na planta de Anápolis — pins vermelhos pulsam."
            corpoSemPadding
          >
            <div className="p-4">
              <FactoryMap pins={PINS_PRONTIDAO} />
            </div>
          </SectionCard>

          <SectionCard
            titulo="Fila de Materiais Críticos"
            info="Os 8 materiais com menor cobertura. Clique em uma linha para abrir o detalhe abaixo."
            corpoSemPadding
          >
            <DataTable
              rotulo="Fila de materiais críticos por cobertura"
              colunas={colunasFila}
              linhas={filaCriticos}
              chave={(item) => item.id}
              onLinhaClick={(item) => setMaterialSelecionadoId(item.id)}
              linhaSelecionada={materialSelecionadoId}
            />
          </SectionCard>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/materiais']} onAcao={aoAcaoCopilot} />
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard
          titulo="Detalhe do Material Selecionado"
          info="Selecione outro material na fila para trocar este card."
          className="col-span-2"
          acao={{
            rotulo: 'Ver histórico do material',
            onClick: () =>
              addToast({ titulo: 'Histórico do material', descricao: 'Disponível na demo completa.', tone: 'info' }),
          }}
        >
          {/* key força remontagem com fade suave ao trocar o material */}
          <div key={material.id} className="animate-toast-in motion-reduce:animate-none">
            <div className="flex flex-wrap items-center gap-3">
              <PictogramaMaterial categoria={material.categoria} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-card-title font-semibold text-ink">{material.nome}</span>
                  <StatusPill status={material.status} pulsar={material.status === 'Crítico'} />
                </p>
                <p className="mt-0.5 text-caption text-muted">
                  {material.id} · {material.categoria} · {material.fornecedor}
                  {material.loteAtual ? ` · lote ${material.loteAtual}` : ''}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <CampoDetalhe
                label="Consumo atual"
                valor={`${formatNumero(material.consumoDia ?? 0)} ${material.unidade}/dia`}
                delta={
                  material.variacaoConsumoPercent !== undefined
                    ? formatPercentAssinado(material.variacaoConsumoPercent, 0)
                    : undefined
                }
                deltaGoodWhen="down"
                sublabel="vs plano"
              />
              <CampoDetalhe
                label="Estoque atual"
                valor={`${formatNumero(material.estoque)} ${material.unidade}`}
                delta={material.variacaoEstoquePercent !== 0 ? formatPercentAssinado(material.variacaoEstoquePercent, 0) : undefined}
                deltaGoodWhen="up"
                sublabel="vs última semana"
              />
              <CampoDetalhe
                label="Estoque de segurança"
                valor={
                  material.estoqueSeguranca !== undefined
                    ? `${formatNumero(material.estoqueSeguranca)} ${material.unidade}`
                    : '—'
                }
                sublabel={
                  material.estoqueSeguranca !== undefined && material.estoque < material.estoqueSeguranca
                    ? 'estoque abaixo do mínimo'
                    : 'dentro do mínimo'
                }
              />
              <CampoDetalhe
                label="Cobertura"
                valor={rotuloDias(material.coberturaDias)}
                delta={variacaoCobertura !== 0 ? `${variacaoCobertura > 0 ? '+' : ''}${formatNumero(variacaoCobertura, 1)}` : undefined}
                deltaGoodWhen="up"
                sublabel="dias · vs última semana"
              />
              <CampoDetalhe label="Lead time de reposição" valor={`${formatNumero(material.leadTimeDias)} dias`} sublabel={material.fornecedor} />
              <CampoDetalhe
                label="Pedidos em aberto"
                valor={`${formatNumero(material.pedidosAbertos)} ${material.unidade}`}
                sublabel={material.pedidosAbertos === 0 ? 'nenhuma reposição a caminho' : 'reposição confirmada'}
              />
              <CampoDetalhe
                label="CoA do lote atual"
                pill={{ status: material.coa ?? 'Pendente', tone: material.coa === 'Recebido' ? 'success' : 'warning' }}
              />
              <CampoDetalhe label="Risco de ruptura" pill={{ status: risco, tone: toneDoRisco[risco] }} />
            </div>
          </div>
        </SectionCard>

        <SectionCard titulo="Eventos e Alertas" info="Linha do tempo de materiais do Turno A.">
          <ol className="flex flex-col">
            {eventosMateriais.map((evento, indice) => (
              <li key={evento.id} className="relative flex gap-3 pb-4 last:pb-0">
                {indice < eventosMateriais.length - 1 ? (
                  <span className="absolute left-[3px] top-4 h-full w-px bg-line" aria-hidden="true" />
                ) : null}
                <span
                  className="relative mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: toneHex[toneDaSeveridade[evento.severidade]] }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-caption font-semibold tabular-nums text-muted">{evento.hora}</p>
                  <p className="text-body-sm leading-snug text-ink">{evento.titulo}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard
          titulo="Tendência de Consumo e Cobertura (últimas 24h)"
          info="Consumo acumulado, estoque projetado e cobertura do material selecionado."
          className="col-span-2"
        >
          <p className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-caption text-muted">
            <span className="font-semibold text-ink">
              {material.nome} · {material.unidade}
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
                Consumo acumulado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-info" aria-hidden="true" />
                Estoque projetado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed border-warning" aria-hidden="true" />
                Cobertura (dias)
              </span>
            </span>
          </p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tendencia} margin={{ top: 6, right: 12, bottom: 0, left: 12 }}>
                <XAxis
                  dataKey="label"
                  interval={3}
                  tick={{ fontSize: 10, fill: colors.muted }}
                  tickLine={false}
                  axisLine={{ stroke: colors.line }}
                />
                <YAxis yAxisId="quantidade" hide domain={[0, 'dataMax + 40']} />
                <YAxis yAxisId="dias" hide orientation="right" domain={[0, 'dataMax + 1']} />
                <ChartTooltip
                  cursor={{ stroke: colors.line }}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                  formatter={(valor: number, nome: string) => {
                    if (nome === 'cobertura') return [rotuloDias(valor), 'Cobertura']
                    return [
                      `${formatNumero(valor, 1)} ${material.unidade}`,
                      nome === 'consumo' ? 'Consumo acumulado' : 'Estoque projetado',
                    ]
                  }}
                />
                <Line yAxisId="quantidade" type="monotone" dataKey="consumo" stroke={colors.primary} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="quantidade" type="monotone" dataKey="estoque" stroke={colors.info} strokeWidth={1.8} dot={false} isAnimationActive={false} />
                <Line
                  yAxisId="dias"
                  type="monotone"
                  dataKey="cobertura"
                  stroke={colors.warning}
                  strokeWidth={1.6}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard titulo="Prontidão de Materiais" info="Score consolidado de abastecimento da fábrica.">
          <div className="flex justify-center border-b border-line pb-4">
            <ScoreDonut valor={PRONTIDAO_ABASTECIMENTO_SCORE} rotulo="Prontidão geral de abastecimento" />
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {prontidaoAbastecimento.map((item) => (
              <li key={item.item} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-body-sm text-ink" title={item.item}>
                  {item.item}
                </span>
                <ProgressBar valor={item.percent} tone={item.percent >= 90 ? 'primary' : 'warning'} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        titulo={`Ordens Impactadas (${ordensImpactadas.length})`}
        info="Ordens-âncora da semana com risco por material."
        corpoSemPadding
        acao={{ rotulo: 'Simular impacto', onClick: () => abrirSimulador('EV-002') }}
      >
        <DataTable
          rotulo="Ordens impactadas por materiais críticos"
          colunas={colunasOrdens}
          linhas={ordensImpactadas}
          chave={(item) => item.ordemId}
        />
      </SectionCard>

      <PageFooter />
    </>
  )
}
