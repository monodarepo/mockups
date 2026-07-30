import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays } from 'date-fns'
import { CalendarRange, Search } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { PerspectivaSupply } from './PerspectivaSupply'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { MapaRede } from '@/components/shared/MapaRede'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DataTable, type ColunaDataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/cn'
import { colors, type Tone } from '@/lib/colors'
import { formatData, formatDiaMes, formatHora, formatMoedaCompacta, formatNumero, formatPercent } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  FABRICAS,
  HOJE,
  alertas,
  conteudoCopilot,
  fabricaDaLinha,
  fabricaPorId,
  fabricas,
  fabricasOperacionais,
  kpisPorTela,
  linhas,
  materiais,
  ordens,
  producaoVsPlano,
  produtoPorId,
  rotuloStatusLinha,
  type Linha,
  type NomeFabrica,
  type SituacaoOrdem,
} from '@/data'

const pesoStatusLinha = { critico: 0, parada: 1, atencao: 2, normal: 3 } as const
const pesoSituacao: Record<SituacaoOrdem, number> = { 'Em risco': 0, Bloqueada: 1, Atenção: 2, 'No prazo': 3 }
const pesoPrioridade = { Alta: 0, Média: 1, Baixa: 2 } as const
const pesoSeveridade = { Crítica: 0, Alta: 1, Média: 2, Baixa: 3 } as const

function toneDaProntidao(prontidao: number): Tone {
  if (prontidao < 65) return 'danger'
  if (prontidao < 80) return 'warning'
  return 'success'
}

const colunasLista: ColunaDataTable<Linha>[] = [
  {
    id: 'fabrica',
    titulo: 'Fábrica',
    render: (linha) => fabricas.find((f) => f.id === linha.fabricaId)?.nome ?? linha.fabricaId,
    valor: (linha) => linha.fabricaId,
  },
  { id: 'linha', titulo: 'Linha', render: (linha) => linha.nome, valor: (linha) => linha.id },
  {
    id: 'status',
    titulo: 'Status',
    render: (linha) => (
      <StatusPill status={rotuloStatusLinha[linha.status]} pulsar={linha.status === 'critico'} />
    ),
    valor: (linha) => pesoStatusLinha[linha.status],
  },
  {
    id: 'utilizacao',
    titulo: 'Utilização',
    largura: 'w-40',
    render: (linha) => <ProgressBar valor={linha.capacidadeUtilizada} tone={toneDaProntidao(linha.capacidadeUtilizada)} />,
    valor: (linha) => linha.capacidadeUtilizada,
  },
  {
    id: 'oee',
    titulo: 'OEE',
    alinhar: 'direita',
    render: (linha) => formatPercent(linha.oee, 0),
    valor: (linha) => linha.oee,
  },
]

export function VisaoGeralPage() {
  const navigate = useNavigate()
  const setFiltro = useAppStore((s) => s.setFiltro)
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const abrirPaleta = useAppStore((s) => s.abrirPaleta)

  const [perspectiva, setPerspectiva] = useState<'operacoes' | 'supply'>('operacoes')
  const [modoPanorama, setModoPanorama] = useState<'mapa' | 'lista'>('mapa')
  const [modalLinhas, setModalLinhas] = useState(false)
  const [fabricaSelecionada, setFabricaSelecionada] = useState('Todas as fábricas')
  const [ajusteAprovado, setAjusteAprovado] = useState(false)
  const panoramaRef = useRef<HTMLDivElement>(null)

  const periodoRotulo = `${formatDiaMes(HOJE)} – ${formatData(addDays(HOJE, 6))}`

  // Recorte local da torre: "Todas as fábricas" mantém a visão de rede.
  const recorteFabrica = fabricaSelecionada === 'Todas as fábricas' ? undefined : fabricaSelecionada
  const linhasRecorte = useMemo(
    () => (recorteFabrica ? linhas.filter((linha) => fabricaPorId(linha.fabricaId)?.nome === recorteFabrica) : linhas),
    [recorteFabrica],
  )

  const linhasAtivas = useMemo(() => linhasRecorte.filter((linha) => linha.status !== 'parada').length, [linhasRecorte])
  const linhasEmAlerta = useMemo(
    () => linhasRecorte.filter((linha) => linha.status === 'atencao' || linha.status === 'critico').length,
    [linhasRecorte],
  )
  const linhasParadas = linhasRecorte.length - linhasAtivas

  const linhasCriticas = useMemo(
    () =>
      [...linhasRecorte]
        .sort(
          (a, b) =>
            pesoStatusLinha[a.status] - pesoStatusLinha[b.status] ||
            a.capacidadeUtilizada - b.capacidadeUtilizada,
        )
        .slice(0, 5),
    [linhasRecorte],
  )

  const ordensPrioritarias = useMemo(
    () =>
      ordens
        .filter((ordem) => !recorteFabrica || fabricaPorId(ordem.fabricaId)?.nome === recorteFabrica)
        .sort(
          (a, b) =>
            pesoSituacao[a.situacao] - pesoSituacao[b.situacao] ||
            pesoPrioridade[a.prioridade] - pesoPrioridade[b.prioridade] ||
            a.fim.getTime() - b.fim.getTime(),
        )
        .slice(0, 5),
    [recorteFabrica],
  )

  const alertasPrincipais = useMemo(
    () =>
      alertas
        .filter((alerta) => !recorteFabrica || fabricaPorId(alerta.fabricaId)?.nome === recorteFabrica)
        .sort(
          (a, b) =>
            pesoSeveridade[a.severidade] - pesoSeveridade[b.severidade] ||
            b.impactoEstimado - a.impactoEstimado,
        )
        .slice(0, 5),
    [recorteFabrica],
  )

  // Seleção fixa da Visão Geral: APIs e embalagens que sustentam a semana.
  const materiaisProntidao = useMemo(() => {
    const destaque = ['MAT-API-001', 'MAT-API-002', 'MAT-EMB-020', 'MAT-EMB-021', 'MAT-EMB-022']
    return destaque
      .map((id) => materiais.find((material) => material.id === id))
      .filter((material) => material !== undefined)
      .filter(
        (material) =>
          !recorteFabrica ||
          (material.linhasAfetadas
            ? material.linhasAfetadas.some((linhaId) => fabricaDaLinha(linhaId) === recorteFabrica)
            : recorteFabrica === 'Anápolis'),
      )
  }, [recorteFabrica])

  const aoSelecionarFabrica = (nome: string) => {
    setFiltro('fabrica', nome as NomeFabrica)
    setFabricaSelecionada(nome)
    addToast({ titulo: `Filtro aplicado: ${nome}`, descricao: 'As telas operacionais passam a usar este recorte.', tone: 'info' })
  }

  const aoMudarSeletorFabrica = (valor: string) => {
    setFabricaSelecionada(valor)
    if (valor !== 'Todas as fábricas') aoSelecionarFabrica(valor)
  }

  const aprovarAjuste = () => {
    if (ajusteAprovado) {
      addToast({ titulo: 'Ajuste já registrado', descricao: 'A realocação P24 → P27 segue no plano da semana.', tone: 'info' })
      return
    }
    setAjusteAprovado(true)
    useAppStore.setState((estado) => ({ pendencias: Math.max(0, estado.pendencias - 1) }))
    addToast({ titulo: 'Ajuste aprovado', descricao: 'Realocação P24 → P27 registrada.', tone: 'success' })
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular cenário') abrirSimulador()
    else if (rotulo === 'Aprovar ajuste') aprovarAjuste()
    else if (rotulo === 'Ver ordens críticas') navigate('/alertas')
  }

  return (
    <>
      <PageHeader
        titulo="Torre de Controle da Produção"
        descricao={
          perspectiva === 'supply'
            ? 'Visão integrada do abastecimento — do recebimento à entrega — em tempo real.'
            : 'Visão integrada das fábricas, linhas e riscos operacionais em tempo real.'
        }
        acoes={
          <>
            <div className="flex rounded-lg border border-line bg-app p-0.5" role="group" aria-label="Perspectiva da torre de controle">
              {(
                [
                  ['operacoes', 'Operações'],
                  ['supply', 'Supply'],
                ] as const
              ).map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={perspectiva === id}
                  onClick={() => setPerspectiva(id)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    perspectiva === id ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink',
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            {perspectiva === 'operacoes' ? (
              <>
                <button
                  type="button"
                  onClick={abrirPaleta}
                  className={cn(
                    'flex h-9 w-[260px] items-center gap-2 rounded-lg border border-line bg-card px-3 text-body-sm text-muted',
                    'transition-colors duration-150 hover:border-primary/40 hover:text-ink',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  )}
                >
                  <Search size={15} aria-hidden="true" />
                  <span className="flex-1 truncate text-left">Buscar produto, ordem, linha…</span>
                  <kbd className="rounded-md border border-line bg-app px-1.5 py-0.5 text-caption">Ctrl K</kbd>
                </button>
                <Select
                  ariaLabel="Filtrar fábrica"
                  valor={fabricaSelecionada}
                  opcoes={['Todas as fábricas', ...FABRICAS]}
                  onChange={aoMudarSeletorFabrica}
                />
              </>
            ) : null}
            <span className="flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-body-sm font-medium text-ink">
              <CalendarRange size={14} className="text-muted" aria-hidden="true" />
              {periodoRotulo}
            </span>
          </>
        }
      />

      {perspectiva === 'supply' ? (
        // key força remontagem com fade suave ao alternar a perspectiva
        <div key="supply" className="flex animate-toast-in flex-col gap-5 motion-reduce:animate-none">
          <PerspectivaSupply />
        </div>
      ) : (
        <div key="operacoes" className="flex animate-toast-in flex-col gap-5 motion-reduce:animate-none">
      <KpiRow kpis={kpisPorTela['/']} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div ref={panoramaRef} className="col-span-2 min-w-0 scroll-mt-4">
          <SectionCard
            titulo="Panorama das Fábricas e Linhas"
            info="Status agregado por fábrica com utilização de cada linha. Clique em uma fábrica para aplicar o filtro global."
            direita={
              <div className="flex rounded-lg border border-line bg-app p-0.5" role="group" aria-label="Modo de exibição">
                {(['mapa', 'lista'] as const).map((modo) => (
                  <button
                    key={modo}
                    type="button"
                    aria-pressed={modoPanorama === modo}
                    onClick={() => setModoPanorama(modo)}
                    className={cn(
                      'rounded-md px-3 py-1 text-body-sm font-medium capitalize transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      modoPanorama === modo ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink',
                    )}
                  >
                    {modo}
                  </button>
                ))}
              </div>
            }
            corpoSemPadding
          >
            <div className="flex items-stretch gap-0 px-5 pb-4">
              <div className="min-w-0 flex-1">
                {modoPanorama === 'mapa' ? (
                  <MapaRede fabricas={fabricasOperacionais} onSelecionarFabrica={aoSelecionarFabrica} />
                ) : (
                  <div className="overflow-hidden rounded-xl border border-line">
                    <DataTable
                      rotulo="Linhas por fábrica"
                      colunas={colunasLista}
                      linhas={linhasRecorte}
                      chave={(linha) => linha.id}
                      alturaMax={396}
                      acao={{
                        rotulo: 'Filtrar',
                        onClick: (linha) =>
                          aoSelecionarFabrica(fabricas.find((f) => f.id === linha.fabricaId)?.nome ?? linha.fabricaId),
                      }}
                      ordenacaoInicial={{ coluna: 'status', direcao: 'asc' }}
                    />
                  </div>
                )}
              </div>

              <dl className="ml-5 flex w-[172px] shrink-0 flex-col justify-center gap-4 border-l border-line pl-5">
                <div>
                  <dt className="text-caption text-muted">Fábricas</dt>
                  <dd className="text-[22px] font-bold leading-7 text-ink">
                    {formatNumero(recorteFabrica ? 1 : fabricasOperacionais.length)}
                  </dd>
                  <dd className="text-caption text-success">{recorteFabrica ?? 'todas operando'}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Linhas ativas</dt>
                  <dd className="text-[22px] font-bold leading-7 text-ink">{formatNumero(linhasAtivas)}</dd>
                  <dd className="text-caption text-muted">
                    de {formatNumero(linhasRecorte.length)} {recorteFabrica ? 'no recorte' : 'na rede'}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Em alerta</dt>
                  <dd className="text-[22px] font-bold leading-7 text-warning-strong">{formatNumero(linhasEmAlerta)}</dd>
                  <dd className="text-caption text-muted">atenção ou crítico</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Parada não planejada</dt>
                  <dd className={cn('text-[22px] font-bold leading-7', linhasParadas > 0 ? 'text-danger' : 'text-ink')}>
                    {formatNumero(linhasParadas)}
                  </dd>
                  <dd className="text-caption text-muted">
                    {linhasParadas > 0 ? 'L15 — falta de blister' : 'nenhuma no recorte'}
                  </dd>
                </div>
              </dl>
            </div>
          </SectionCard>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/']} onAcao={aoAcaoCopilot} />
      </div>

      <div className="grid grid-cols-5 gap-5">
        <SectionCard titulo="Produção vs Plano" info="Produção diária da rede contra o plano, em milhares de unidades.">
          <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />
              Real <strong className="text-ink">{formatNumero(producaoVsPlano[producaoVsPlano.length - 1].real)}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-0 w-4 border-t-2 border-dashed border-neutral" aria-hidden="true" />
              Plano <strong className="text-ink">{formatNumero(producaoVsPlano[producaoVsPlano.length - 1].plano)}</strong>
            </span>
          </div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={producaoVsPlano} margin={{ top: 6, right: 12, bottom: 0, left: 12 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: colors.muted }}
                  tickLine={false}
                  axisLine={{ stroke: colors.line }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis hide domain={['dataMin - 120', 'dataMax + 60']} />
                <ChartTooltip
                  cursor={{ stroke: colors.line }}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${colors.line}` }}
                  formatter={(valor: number, nome: string) => [
                    `${formatNumero(valor)} mil un`,
                    nome === 'real' ? 'Real' : 'Plano',
                  ]}
                />
                <Line type="monotone" dataKey="plano" stroke="#94A3B8" strokeWidth={1.6} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="real" stroke={colors.primary} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-caption text-muted">Últimos 7 dias · mil unidades/dia</p>
        </SectionCard>

        <SectionCard
          titulo="Linhas Críticas"
          info="Linhas com pior status e utilização na rede."
          acao={{ rotulo: 'Ver todas as linhas', onClick: () => setModalLinhas(true) }}
        >
          <ul className="flex flex-col gap-3">
            {linhasCriticas.map((linha) => (
              <li key={linha.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-body-sm font-semibold text-ink">{linha.id}</span>
                  <StatusPill status={rotuloStatusLinha[linha.status]} pulsar={linha.status === 'critico'} />
                </div>
                <ProgressBar
                  valor={linha.capacidadeUtilizada}
                  tone={
                    linha.status === 'critico'
                      ? 'danger'
                      : linha.status === 'parada'
                        ? 'neutral'
                        : linha.status === 'atencao'
                          ? 'warning'
                          : 'success'
                  }
                />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard titulo="Ordens Prioritárias" info="Ordens com maior risco de atraso na semana.">
          <ul className="flex flex-col gap-2.5">
            {ordensPrioritarias.map((ordem) => (
              <li key={ordem.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium text-ink">
                    {produtoPorId(ordem.produtoId)?.nome ?? ordem.produtoId}
                  </p>
                  <p className="text-caption text-muted">
                    {ordem.linhaId} · até {formatDiaMes(ordem.fim)} {formatHora(ordem.fim)}
                  </p>
                </div>
                <StatusPill status={ordem.situacao} pulsar={ordem.situacao === 'Em risco'} />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          titulo="Alertas e Decisões"
          info="Maiores riscos abertos na central, por severidade e impacto."
          acao={{ rotulo: 'Ver central', onClick: () => navigate('/alertas') }}
        >
          {alertasPrincipais.length === 0 ? (
            <EmptyState
              titulo="Sem alertas neste recorte"
              descricao={`${recorteFabrica} não tem alertas abertos hoje.`}
              alturaMin={140}
            />
          ) : (
          <ul className="flex flex-col gap-2.5">
            {alertasPrincipais.map((alerta) => (
              <li key={alerta.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium text-ink" title={alerta.titulo}>
                    {alerta.titulo}
                  </p>
                  <StatusPill status={alerta.severidade} pulsar={alerta.severidade === 'Crítica'} className="mt-0.5" />
                </div>
                <span className="shrink-0 text-body-sm font-semibold tabular-nums text-ink">
                  {formatMoedaCompacta(alerta.impactoEstimado)}
                </span>
              </li>
            ))}
          </ul>
          )}
        </SectionCard>

        <SectionCard
          titulo="Prontidão de Materiais"
          info="Prontidão dos materiais para as ordens da semana."
          acao={{ rotulo: 'Ver todos os materiais', onClick: () => navigate('/materiais') }}
        >
          {materiaisProntidao.length === 0 ? (
            <EmptyState
              titulo="Sem materiais críticos neste recorte"
              descricao="Os materiais acompanhados da semana pertencem a Anápolis."
              alturaMin={140}
            />
          ) : (
          <ul className="flex flex-col gap-3">
            {materiaisProntidao.map((material) => (
              <li key={material.id}>
                <p className="mb-1 truncate text-body-sm font-medium text-ink" title={material.nome}>
                  {material.nome}
                </p>
                <ProgressBar valor={material.prontidaoPercent} tone={toneDaProntidao(material.prontidaoPercent)} />
              </li>
            ))}
          </ul>
          )}
        </SectionCard>
      </div>
        </div>
      )}

      <Modal
        aberto={modalLinhas}
        onFechar={() => setModalLinhas(false)}
        titulo="Todas as linhas da rede"
        descricao="As 13 linhas das 3 fábricas operacionais — todas modeladas neste mockup."
        largura="lg"
      >
        <DataTable
          rotulo="Todas as linhas da rede"
          colunas={colunasLista}
          linhas={linhas}
          chave={(linha) => linha.id}
          ordenacaoInicial={{ coluna: 'status', direcao: 'asc' }}
          acao={{
            rotulo: 'Filtrar',
            onClick: (linha) => {
              setModalLinhas(false)
              aoSelecionarFabrica(fabricas.find((f) => f.id === linha.fabricaId)?.nome ?? linha.fabricaId)
            },
          }}
        />
      </Modal>

      <PageFooter />
    </>
  )
}
