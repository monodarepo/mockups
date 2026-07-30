import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { DOT_HOVER, EIXO, GRID, TooltipHpo } from '@/components/charts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { Modal } from '@/components/ui/Modal'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { TrendDelta } from '@/components/shared/TrendDelta'
import { FactoryMap, type PinFabrica } from '@/components/shared/FactoryMap'
import { DataTable, IdLink, type ColunaDataTable } from '@/components/shared/DataTable'
import { cn } from '@/lib/cn'
import { colors, toneHex, type Tone } from '@/lib/colors'
import {
  formatDiaMes,
  formatDiaSemana,
  formatFaixaHoraria,
  formatNumero,
  formatPercent,
  formatPercentAssinado,
  formatPontosPercentuais,
} from '@/lib/format'
import { useDestaque } from '@/lib/useDestaque'
import { useAppStore } from '@/store'
import {
  PRONTIDAO_MANUTENCAO_SCORE,
  SLA_OTS_PERCENT,
  TECNICOS_DISPONIVEIS,
  TECNICOS_TOTAL,
  alertasPreditivos,
  conteudoCopilot,
  equipamentoPorId,
  kpisPorTela,
  linhaPorId,
  linhasFiltradas,
  otsFiltradas,
  prontidaoManutencao,
  tendenciaCondicao,
  type JanelaCondicao,
  type OrdemManutencao,
  type Prioridade,
  type SeveridadeAlerta,
} from '@/data'

/** Pins de saúde dos ativos sobre a planta de Anápolis. */
const PINS_SAUDE: Array<PinFabrica & { equipamentoId?: string }> = [
  { id: 'pin-l12', label: 'Compressora L12', valorPercent: 72, status: 'critico', posicao: [13.3, 51], equipamentoId: 'eq-compressora-l12' },
  { id: 'pin-l08', label: 'Sólidos L08', valorPercent: 88, status: 'atencao', posicao: [31.8, 51], equipamentoId: 'eq-esteira-l08' },
  { id: 'pin-l03', label: 'Cápsulas L03', valorPercent: 91, status: 'normal', posicao: [50.3, 51], equipamentoId: 'eq-encapsuladora-l03' },
  { id: 'pin-utilidades', label: 'Utilidades', valorPercent: 94, status: 'manutencao', posicao: [38.9, 77.6], equipamentoId: 'eq-hvac-ahu-03' },
  { id: 'pin-l05', label: 'Revestimento L05', valorPercent: 93, status: 'normal', posicao: [55.3, 22.4] },
  { id: 'pin-l15', label: 'Embalagem L15', valorPercent: 65, status: 'critico', posicao: [87, 51], equipamentoId: 'eq-seladora-l15' },
]

const toneDaSeveridade: Record<SeveridadeAlerta, Tone> = {
  Crítica: 'danger',
  Alta: 'danger',
  Média: 'warning',
  Baixa: 'info',
}

/** Impacto na produção derivado do nível de risco de falha do ativo. */
const impactoDoRisco: Record<Prioridade, 'Alto' | 'Médio' | 'Baixo'> = {
  Alta: 'Alto',
  Média: 'Médio',
  Baixa: 'Baixo',
}

const JANELAS: Array<{ id: JanelaCondicao; rotulo: string }> = [
  { id: '6h', rotulo: '6h' },
  { id: '24h', rotulo: '24h' },
  { id: '7d', rotulo: '7d' },
]

/** Pictograma SVG de compressor industrial. */
function PictogramaCompressor() {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="9" y="8" width="15" height="12" rx="2.5" fill={colors.primary} fillOpacity="0.25" stroke={colors.primary} strokeWidth="1.4" />
        <circle cx="7.5" cy="14" r="4.5" fill={colors.primary} fillOpacity="0.5" stroke={colors.primary} strokeWidth="1.4" />
        <circle cx="7.5" cy="14" r="1.6" fill={colors.primary} />
        <path d="M13 11.5h8M13 14h8M13 16.5h8" stroke={colors.primary} strokeWidth="1.1" opacity="0.7" />
        <path d="M10 20v3M23 20v3M6.5 23h20" stroke={colors.primary} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function CampoAtivo({
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
  pill?: { status: string; tone?: Tone; pulsar?: boolean }
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-app/50 px-3 py-2.5">
      <p className="truncate text-caption text-muted" title={label}>
        {label}
      </p>
      {pill ? (
        <p className="mt-1.5">
          <StatusPill status={pill.status} tone={pill.tone} pulsar={pill.pulsar} />
        </p>
      ) : (
        <p className="mt-0.5 truncate text-[17px] font-bold leading-6 text-ink" title={valor}>
          {valor}
        </p>
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

export function ManutencaoPage() {
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const filtros = useAppStore((s) => s.filtros)
  const resetFiltros = useAppStore((s) => s.resetFiltros)
  const destaque = useDestaque()

  // A fila vive no store: "Acionar manutenção" (aqui ou na ficha) insere a OT-245690 no topo.
  const filaOts = useAppStore((s) => s.filaOts)
  const acionarManutencao = useAppStore((s) => s.acionarManutencaoCompressora)
  const priorizarOtStore = useAppStore((s) => s.priorizarOt)
  const abrirFicha = useAppStore((s) => s.abrirFicha)
  // ?ativo= permite chegar com contexto (ex.: "Ver Manutenção" no Gêmeo da Fábrica).
  const [parametrosBusca] = useSearchParams()
  const [ativoSelecionadoId, setAtivoSelecionadoId] = useState(() => {
    const ativoParam = parametrosBusca.get('ativo')
    return ativoParam && equipamentoPorId(ativoParam) ? ativoParam : 'eq-compressora-l12'
  })
  const [janela, setJanela] = useState<JanelaCondicao>('24h')
  const [modalTodas, setModalTodas] = useState(false)

  // A busca global pode trocar o ?ativo= com a tela já montada.
  useEffect(() => {
    const ativoParam = parametrosBusca.get('ativo')
    if (ativoParam && equipamentoPorId(ativoParam)) setAtivoSelecionadoId(ativoParam)
  }, [parametrosBusca])

  const ativo = equipamentoPorId(ativoSelecionadoId) ?? equipamentoPorId('eq-compressora-l12')!
  const tendencia = useMemo(() => tendenciaCondicao(ativo.id, janela), [ativo.id, janela])
  const impactoProducao = impactoDoRisco[ativo.nivelRiscoFalha ?? 'Baixa']

  // Recorte global sobre a fila local (mantém a ordem de priorização).
  const filaRecorte = useMemo(() => otsFiltradas(filtros, filaOts), [filtros, filaOts])
  const idsLinhasRecorte = useMemo(() => new Set(linhasFiltradas(filtros).map((linha) => linha.id)), [filtros])
  const pinsRecorte = useMemo(
    () =>
      PINS_SAUDE.filter((pin) => {
        const linhaId = pin.label.match(/[LP]\d+/)?.[0]
        if (!linhaId) return filtros.area === 'Todas as áreas'
        return idsLinhasRecorte.has(linhaId)
      }),
    [idsLinhasRecorte, filtros.area],
  )
  const alertasPreditivosRecorte = useMemo(
    () =>
      alertasPreditivos.filter((alerta) => {
        const equipamento = alerta.ativoId ? equipamentoPorId(alerta.ativoId) : undefined
        if (filtros.fabrica !== 'Anápolis') return false
        if (filtros.area === 'Todas as áreas') return true
        if (equipamento?.linhaId) return idsLinhasRecorte.has(equipamento.linhaId)
        return equipamento?.area === filtros.area
      }),
    [idsLinhasRecorte, filtros],
  )

  const criarOtRecomendada = () => {
    acionarManutencao()
    setAtivoSelecionadoId('eq-compressora-l12')
  }

  const priorizarOtDoAtivo = () => {
    if (ativo.otVinculada) priorizarOtStore(ativo.otVinculada)
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular impacto') abrirSimulador('EV-001')
    else if (rotulo === 'Acionar manutenção') criarOtRecomendada()
    else if (rotulo === 'Priorizar OT') priorizarOtDoAtivo()
  }

  const colunasFila: ColunaDataTable<OrdemManutencao>[] = useMemo(
    () => [
      {
        id: 'ot',
        titulo: 'OT',
        render: (item) => <IdLink id={item.id} onClick={() => setAtivoSelecionadoId(item.ativoId)} />,
        valor: (item) => item.id,
      },
      {
        id: 'ativo',
        titulo: 'Ativo',
        render: (item) => {
          const equipamento = equipamentoPorId(item.ativoId)
          return (
            <span className="leading-tight">
              <span className="block font-medium text-ink">{equipamento?.nome ?? item.ativoId}</span>
              <span className="block text-caption text-muted">{equipamento?.tipo}</span>
            </span>
          )
        },
        valor: (item) => equipamentoPorId(item.ativoId)?.nome ?? '',
      },
      {
        id: 'area',
        titulo: 'Área / Linha',
        render: (item) => {
          const equipamento = equipamentoPorId(item.ativoId)
          return equipamento?.linhaId ?? equipamento?.area ?? '—'
        },
        valor: (item) => {
          const equipamento = equipamentoPorId(item.ativoId)
          return equipamento?.linhaId ?? equipamento?.area ?? ''
        },
      },
      {
        id: 'tipo',
        titulo: 'Tipo',
        render: (item) => <span className="text-muted">{item.tipo}</span>,
        valor: (item) => item.tipo,
        filtravel: true,
      },
      {
        id: 'prioridade',
        titulo: 'Prioridade',
        render: (item) => <StatusPill status={item.prioridade} />,
        valor: (item) => item.prioridade,
        filtravel: true,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => <StatusPill status={item.status} pulsar={item.status === 'Atrasada'} />,
        valor: (item) => item.status,
        filtravel: true,
      },
      {
        id: 'janela',
        titulo: 'Janela',
        render: (item) => (
          <span className="tabular-nums text-ink">
            {formatDiaSemana(item.janelaInicio)} {formatDiaMes(item.janelaInicio)} ·{' '}
            {formatFaixaHoraria(item.janelaInicio, item.janelaFim)}
          </span>
        ),
        valor: (item) => item.janelaInicio,
      },
      {
        id: 'responsavel',
        titulo: 'Responsável',
        render: (item) => item.responsavel,
        valor: (item) => item.responsavel,
      },
    ],
    [],
  )

  return (
    <>
      <PageHeader
        titulo="Manutenção"
        descricao="Monitore a saúde dos ativos, antecipe falhas e planeje intervenções nas janelas certas."
      />

      <FilterBar />

      <KpiRow kpis={kpisPorTela['/manutencao']} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo="Mapa de Saúde dos Ativos"
            info="Saúde por linha e utilidades na planta de Anápolis — clique em um pin para abrir o detalhe do ativo."
            corpoSemPadding
          >
            {filtros.fabrica !== 'Anápolis' ? (
              <EmptyState
                titulo={`Sem planta detalhada para ${filtros.fabrica}`}
                descricao="O mapa de saúde dos ativos deste mockup está modelado para a planta de Anápolis."
                acao={{ rotulo: 'Voltar para Anápolis', onClick: resetFiltros }}
                alturaMin={280}
              />
            ) : (
              <div className="p-4">
                <FactoryMap
                  pins={pinsRecorte}
                  onSelecionarPin={(pin) => {
                    const equipamentoId = PINS_SAUDE.find((item) => item.id === pin.id)?.equipamentoId
                    if (equipamentoId) setAtivoSelecionadoId(equipamentoId)
                  }}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard
            titulo="Alertas Preditivos e Eventos"
            contagem={{ visiveis: alertasPreditivosRecorte.length, total: alertasPreditivos.length }}
            info="Alertas gerados pelos modelos preditivos, por severidade, no recorte atual."
          >
            {alertasPreditivosRecorte.length === 0 ? (
              <EmptyState
                titulo="Sem alertas preditivos neste recorte"
                descricao="Os modelos preditivos desta demo monitoram os ativos de Anápolis."
                acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
              />
            ) : (
            <ul className="flex flex-col gap-3">
              {alertasPreditivosRecorte.map((alerta) => (
                <li key={alerta.id} className="flex items-start gap-3 border-b border-line pb-3 last:border-b-0 last:pb-0">
                  <span
                    className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: toneHex[toneDaSeveridade[alerta.severidade]] }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium leading-snug text-ink">{alerta.evento}</p>
                    <p className="text-caption text-muted">Causa provável: {alerta.causaProvavel}</p>
                  </div>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <StatusPill status={alerta.severidade} pulsar={alerta.severidade === 'Crítica'} />
                    <button
                      type="button"
                      onClick={() => {
                        if (alerta.ativoId) setAtivoSelecionadoId(alerta.ativoId)
                      }}
                      className="rounded text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {alerta.proximaAcao}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            )}
          </SectionCard>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/manutencao']} onAcao={aoAcaoCopilot} />
      </div>

      <SectionCard
        titulo="Fila de Ordens de Manutenção"
        contagem={{ visiveis: filaRecorte.length, total: filaOts.length }}
        info="28 OTs na rede — a carteira detalhada cobre as de Anápolis, no recorte atual. Clique em uma linha para abrir o detalhe do ativo."
        acao={{ rotulo: 'Ver todas (28)', onClick: () => setModalTodas(true) }}
        corpoSemPadding
      >
        {filaRecorte.length > 0 ? (
          <DataTable
            rotulo="Fila de ordens de manutenção de Anápolis"
            colunas={colunasFila}
            linhas={filaRecorte}
            chave={(item) => item.id}
            onLinhaClick={(item) => setAtivoSelecionadoId(item.ativoId)}
            linhaSelecionada={filaRecorte.find((ot) => ot.ativoId === ativoSelecionadoId)?.id}
            linhaDestacada={destaque}
            busca
          />
        ) : (
          <EmptyState
            titulo="Nenhuma OT no recorte atual"
            descricao="A carteira detalhada desta demo cobre os ativos de Anápolis — ajuste fábrica, área, turno ou período."
            acao={{ rotulo: 'Limpar filtros', onClick: resetFiltros }}
          />
        )}
      </SectionCard>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard
          className="col-span-2"
          titulo="Detalhe do Ativo Selecionado"
          info="Clique em uma OT, em um pin do mapa ou em um alerta para trocar este card."
          acao={{ rotulo: 'Abrir ficha do ativo', onClick: () => abrirFicha(ativo.id) }}
        >
          {filtros.fabrica !== 'Anápolis' ? (
            <EmptyState
              titulo={`Sem ativos monitorados em ${filtros.fabrica}`}
              descricao="O monitoramento de condição desta demo cobre os 8 ativos de Anápolis."
              acao={{ rotulo: 'Voltar para Anápolis', onClick: resetFiltros }}
            />
          ) : (
          // key força remontagem com fade suave ao trocar o ativo
          <div key={ativo.id} className="animate-toast-in motion-reduce:animate-none">
            <div className="flex flex-wrap items-center gap-3">
              <PictogramaCompressor />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-card-title font-semibold text-ink">{ativo.nome}</span>
                  <span className="text-body-sm text-muted">{ativo.tipo}</span>
                  <StatusPill status={ativo.status} pulsar={ativo.status === 'Crítico'} />
                </p>
                <p className="mt-0.5 text-caption text-muted">
                  {ativo.linhaId ? (linhaPorId(ativo.linhaId)?.nome ?? ativo.linhaId) : ativo.area}
                  {ativo.otVinculada ? (
                    <>
                      {' · ordem vinculada '}
                      <IdLink id={ativo.otVinculada} />
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <CampoAtivo
                label="Disponibilidade"
                valor={formatPercent(ativo.disponibilidade, 0)}
                delta={
                  ativo.variacaoDisponibilidade !== undefined
                    ? formatPontosPercentuais(ativo.variacaoDisponibilidade, 0)
                    : undefined
                }
                deltaGoodWhen="up"
                sublabel="vs última semana"
              />
              {ativo.indicadores.map((indicador) => (
                <CampoAtivo
                  key={indicador.nome}
                  label={indicador.nome}
                  valor={`${formatNumero(indicador.valor, Number.isInteger(indicador.valor) ? 0 : 1)} ${indicador.unidade}`}
                  delta={
                    indicador.variacaoPercent !== undefined
                      ? formatPercentAssinado(indicador.variacaoPercent, 0)
                      : undefined
                  }
                  // Cor guiada pela situação do indicador: fora do normal fica vermelho.
                  deltaGoodWhen={
                    indicador.situacao === 'Normal'
                      ? 'down'
                      : (indicador.variacaoPercent ?? 0) > 0
                        ? 'down'
                        : 'up'
                  }
                  sublabel={indicador.variacaoPercent === undefined ? indicador.situacao : indicador.situacao}
                />
              ))}
              <CampoAtivo
                label="Última manutenção"
                valor={formatDiaMes(ativo.ultimaManutencaoData)}
                sublabel={ativo.ultimaManutencaoTipo}
              />
              <CampoAtivo label="Próxima preventiva" valor={formatDiaMes(ativo.proximaPreventiva)} sublabel="janela reservada" />
              <CampoAtivo
                label="Probabilidade de falha (7 dias)"
                valor={ativo.probabilidadeFalha !== undefined ? formatPercent(ativo.probabilidadeFalha, 0) : '—'}
                sublabel={ativo.nivelRiscoFalha ? `nível ${ativo.nivelRiscoFalha}` : undefined}
              />
              <CampoAtivo
                label="Peças críticas"
                valor={`${formatNumero(ativo.pecasCriticasEstoque ?? 0)} ${(ativo.pecasCriticasEstoque ?? 0) === 1 ? 'item' : 'itens'}`}
                sublabel="em estoque"
              />
              <CampoAtivo
                label="Impacto na produção"
                pill={{ status: impactoProducao, pulsar: impactoProducao === 'Alto' && ativo.status === 'Crítico' }}
              />
            </div>
          </div>
          )}
        </SectionCard>

        <SectionCard titulo="Prontidão da Manutenção" info="Score consolidado da função manutenção na fábrica.">
          <div className="flex justify-center border-b border-line pb-4">
            <ScoreDonut valor={PRONTIDAO_MANUTENCAO_SCORE} rotulo="Prontidão geral da manutenção" />
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {prontidaoManutencao.map((item) => (
              <li key={item.item} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-body-sm text-ink" title={item.item}>
                  {item.item}
                </span>
                <ProgressBar valor={item.percent} tone={item.percent >= 90 ? 'primary' : 'warning'} />
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-3 text-body-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">Técnicos disponíveis</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {formatNumero(TECNICOS_DISPONIVEIS)}/{formatNumero(TECNICOS_TOTAL)}{' '}
                <span className="font-normal text-muted">
                  ({formatPercent((TECNICOS_DISPONIVEIS / TECNICOS_TOTAL) * 100, 0)})
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">SLA de OTs</dt>
              <dd className="font-semibold tabular-nums text-ink">{formatPercent(SLA_OTS_PERCENT, 0)}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard
        titulo="Tendência de Condição"
        info="Vibração, temperatura e energia do ativo selecionado — janelas de 6 h, 24 h e 7 dias."
        direita={
          <div className="flex rounded-lg border border-line bg-app p-0.5" role="group" aria-label="Janela da tendência">
            {JANELAS.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                aria-pressed={janela === opcao.id}
                onClick={() => setJanela(opcao.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-body-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  janela === opcao.id ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink',
                )}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        }
      >
        {filtros.fabrica !== 'Anápolis' ? (
          <EmptyState
            titulo="Sem tendência de condição neste recorte"
            descricao="Os sensores de condição desta demo estão instalados nos ativos de Anápolis."
            acao={{ rotulo: 'Voltar para Anápolis', onClick: resetFiltros }}
          />
        ) : (
        <>
        <p className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-caption text-muted">
          <span className="font-semibold text-ink">{ativo.nome}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-danger" aria-hidden="true" />
              Vibração (mm/s)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-warning" aria-hidden="true" />
              Temperatura (°C)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
              Energia (kW)
            </span>
          </span>
        </p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tendencia} margin={{ top: 6, right: 14, bottom: 0, left: 14 }}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="label"
                interval={janela === '24h' ? 3 : 0}
                tick={EIXO.tick}
                tickLine={false}
                axisLine={false}
              />
              <YAxis yAxisId="vibracao" hide domain={[0, 'dataMax + 4']} />
              <YAxis yAxisId="temperatura" hide domain={[0, 'dataMax + 20']} />
              <YAxis yAxisId="energia" hide orientation="right" domain={[0, 'dataMax + 40']} />
              <ChartTooltip
                cursor={{ stroke: colors.line }}
                content={<TooltipHpo />}
                formatter={(valor: number, nome: string) => {
                  if (nome === 'vibracao') return [`${formatNumero(valor, 1)} mm/s`, 'Vibração']
                  if (nome === 'temperatura') return [`${formatNumero(valor, 1)} °C`, 'Temperatura']
                  return [`${formatNumero(valor)} kW`, 'Energia']
                }}
              />
              <Line yAxisId="vibracao" type="monotone" dataKey="vibracao" stroke={colors.danger} strokeWidth={2} dot={false} activeDot={DOT_HOVER} isAnimationActive={false} />
              <Line yAxisId="temperatura" type="monotone" dataKey="temperatura" stroke={colors.warning} strokeWidth={1.6} dot={false} activeDot={DOT_HOVER} isAnimationActive={false} />
              <Line yAxisId="energia" type="monotone" dataKey="energia" stroke={colors.primary} strokeWidth={1.6} dot={false} activeDot={DOT_HOVER} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </>
        )}
      </SectionCard>

      <Modal
        aberto={modalTodas}
        onFechar={() => setModalTodas(false)}
        titulo="Toda a carteira de manutenção"
        descricao={`Exibindo as ${filaOts.length} OTs modeladas de Anápolis de um universo de 28 na rede.`}
        largura="lg"
      >
        <DataTable
          rotulo="Todas as ordens de manutenção modeladas"
          colunas={colunasFila}
          linhas={filaOts}
          chave={(item) => item.id}
          onLinhaClick={(item) => {
            setModalTodas(false)
            setAtivoSelecionadoId(item.ativoId)
          }}
        />
      </Modal>

      <PageFooter />
    </>
  )
}
