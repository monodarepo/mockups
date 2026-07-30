import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarRange,
  Clock,
  Gauge,
  Package,
  ShieldAlert,
  Timer,
  Wrench,
} from 'lucide-react'
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
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { formatDataNumerica, formatDiaMes, formatHora, formatMoedaCompacta, formatNumero } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  FABRICAS,
  SEMANA_PLANEJAMENTO_FIM,
  SEMANA_PLANEJAMENTO_INICIO,
  blocosSequencia,
  blocosSequenciaOtimizada,
  conteudoCopilot,
  fabricas,
  impactoDaMudanca,
  kpisSequenciamento,
  ordens,
  produtoPorId,
  restricoes,
  type NomeFabrica,
  type OrdemProducao,
  type Restricao,
  type SituacaoOrdem,
} from '@/data'
import { GanttSequencia, LegendaGantt, type ZoomGantt } from './GanttSequencia'
import { MatrizSetup } from './MatrizSetup'

const pesoSituacao: Record<SituacaoOrdem, number> = { 'Em risco': 0, Bloqueada: 1, Atenção: 2, 'No prazo': 3 }

const iconeDaRestricao: Record<Restricao['tipo'], typeof Package> = {
  material: Package,
  manutencao: Wrench,
  qualidade: ShieldAlert,
  capacidade: Gauge,
  setup: Timer,
  folga: Clock,
}

const corDoIconeRestricao: Record<Restricao['tipo'], string> = {
  material: 'bg-danger-soft text-danger',
  manutencao: 'bg-neutral-soft text-neutral-strong',
  qualidade: 'bg-clean-soft text-clean-strong',
  capacidade: 'bg-warning-soft text-warning-strong',
  setup: 'bg-setup-soft text-setup-strong',
  folga: 'bg-info-soft text-info-strong',
}

const colunasOrdensCriticas: ColunaDataTable<OrdemProducao>[] = [
  {
    id: 'id',
    titulo: 'Ordem',
    render: (o) => (
      <span title={produtoPorId(o.produtoId)?.nome}>
        <IdLink id={o.id} />
      </span>
    ),
    valor: (o) => o.id,
  },
  {
    id: 'prazo',
    titulo: 'Prazo',
    render: (o) => `${formatDiaMes(o.fim)} ${formatHora(o.fim)}`,
    valor: (o) => o.fim,
  },
  { id: 'prioridade', titulo: 'Prioridade', render: (o) => <StatusPill status={o.prioridade} /> },
  {
    id: 'status',
    titulo: 'Status',
    render: (o) => <StatusPill status={o.situacao} pulsar={o.situacao === 'Em risco'} />,
    valor: (o) => pesoSituacao[o.situacao],
  },
  {
    id: 'prontidao',
    titulo: 'Prontidão',
    largura: 'w-32',
    render: (o) => (
      <ProgressBar
        valor={o.prontidaoMateriais}
        tone={o.prontidaoMateriais < 65 ? 'danger' : o.prontidaoMateriais < 80 ? 'warning' : 'success'}
      />
    ),
    valor: (o) => o.prontidaoMateriais,
  },
]

export function SequenciamentoPage() {
  const setPersona = useAppStore((s) => s.setPersona)
  const setFiltro = useAppStore((s) => s.setFiltro)
  const filtros = useAppStore((s) => s.filtros)
  const addToast = useAppStore((s) => s.addToast)
  const sequenciaOtimizada = useAppStore((s) => s.sequenciaOtimizada)
  const otimizarSequencia = useAppStore((s) => s.otimizarSequencia)
  const desfazerOtimizacao = useAppStore((s) => s.desfazerOtimizacao)

  const [linhaFiltro, setLinhaFiltro] = useState('Todas as linhas')
  const [zoom, setZoom] = useState<ZoomGantt>('dia')
  const [otimizando, setOtimizando] = useState(false)
  const [movimentoPendente, setMovimentoPendente] = useState<{ blocoId: string; deltaHoras: number } | null>(null)
  const [deslocamentos, setDeslocamentos] = useState<Record<string, number>>({})
  const [ajusteAprovado, setAjusteAprovado] = useState(false)
  const [modalAberto, setModalAberto] = useState<'comparar' | 'simular' | null>(null)
  const ganttScrollRef = useRef<HTMLDivElement>(null)

  // Persona desta tela: Camila Azevedo, PCP.
  useEffect(() => {
    setPersona('camila')
  }, [setPersona])

  const linhasAnapolis = useMemo(() => fabricas.find((f) => f.id === 'anapolis')?.linhas ?? [], [])
  const linhasVisiveis = useMemo(
    () => (linhaFiltro === 'Todas as linhas' ? linhasAnapolis : linhasAnapolis.filter((l) => l.nome === linhaFiltro)),
    [linhasAnapolis, linhaFiltro],
  )

  const blocos = sequenciaOtimizada ? blocosSequenciaOtimizada : blocosSequencia
  const ordensEmExecucao = useMemo(
    () => new Set(ordens.filter((o) => o.status === 'Em execução').map((o) => o.id)),
    [],
  )

  const ordensCriticas = useMemo(
    () =>
      ordens
        .filter((o) => o.fabricaId === 'anapolis')
        .sort((a, b) => pesoSituacao[a.situacao] - pesoSituacao[b.situacao] || a.prontidaoMateriais - b.prontidaoMateriais)
        .slice(0, 5),
    [],
  )

  const executarOtimizacao = () => {
    if (sequenciaOtimizada) {
      addToast({ titulo: 'Sequência já otimizada', descricao: 'Use "Desfazer otimização" para voltar à sequência vigente.', tone: 'info' })
      return
    }
    setMovimentoPendente(null)
    setDeslocamentos({})
    setOtimizando(true)
    window.setTimeout(() => {
      otimizarSequencia()
      setOtimizando(false)
    }, 1_500)
  }

  const desfazer = () => {
    setMovimentoPendente(null)
    setDeslocamentos({})
    desfazerOtimizacao()
  }

  const aoSoltarBloco = (blocoId: string, deltaHoras: number) => {
    setMovimentoPendente({ blocoId, deltaHoras })
  }

  const aplicarMudanca = () => {
    if (!movimentoPendente) return
    const bloco = blocos.find((b) => b.id === movimentoPendente.blocoId)
    setDeslocamentos((atual) => ({
      ...atual,
      [movimentoPendente.blocoId]: (atual[movimentoPendente.blocoId] ?? 0) + movimentoPendente.deltaHoras,
    }))
    setMovimentoPendente(null)
    const sinal = movimentoPendente.deltaHoras > 0 ? '+' : '−'
    addToast({
      titulo: 'Mudança aplicada',
      descricao: `${bloco?.rotulo ?? movimentoPendente.blocoId} deslocado em ${sinal}${formatNumero(Math.abs(movimentoPendente.deltaHoras), 1)} h.`,
      tone: 'success',
    })
  }

  const aprovarAjuste = () => {
    if (ajusteAprovado) {
      addToast({ titulo: 'Ajuste já registrado', descricao: 'O reagrupamento segue no plano da semana.', tone: 'info' })
      return
    }
    setAjusteAprovado(true)
    useAppStore.setState((estado) => ({ pendencias: Math.max(0, estado.pendencias - 1) }))
    addToast({ titulo: 'Ajuste aprovado', descricao: 'Reagrupamento da família Analgésicos registrado no plano.', tone: 'success' })
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Reagrupar Campanhas') executarOtimizacao()
    else if (rotulo === 'Simular Parada') setModalAberto('simular')
    else if (rotulo === 'Aprovar Ajuste') aprovarAjuste()
  }

  const impacto = movimentoPendente ? impactoDaMudanca(movimentoPendente.deltaHoras) : null
  const blocoPendente = movimentoPendente ? blocos.find((b) => b.id === movimentoPendente.blocoId) : null

  return (
    <>
      <PageHeader
        titulo="Sequenciamento da Produção"
        descricao="Otimize a ordem das campanhas, reduza setups e responda rapidamente aos desvios operacionais."
      />

      <KpiRow kpis={kpisSequenciamento(sequenciaOtimizada)} />

      {/* Barra de controles */}
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-card px-3 py-2.5 shadow-card">
        <Select
          rotulo="Fábrica"
          valor={filtros.fabrica}
          opcoes={FABRICAS}
          onChange={(valor) => {
            if (valor !== 'Anápolis') {
              addToast({ titulo: 'Sequência detalhada em Anápolis', descricao: 'Nesta demo, o Gantt cobre as linhas L03–L15.', tone: 'info' })
            }
            setFiltro('fabrica', 'Anápolis' as NomeFabrica)
          }}
        />
        <Select
          rotulo="Linha"
          valor={linhaFiltro}
          opcoes={['Todas as linhas', ...linhasAnapolis.map((l) => l.nome)]}
          onChange={setLinhaFiltro}
        />
        <span className="flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-body-sm font-medium text-ink">
          <CalendarRange size={14} className="text-muted" aria-hidden="true" />
          {formatDataNumerica(SEMANA_PLANEJAMENTO_INICIO).slice(0, 5)} – {formatDataNumerica(SEMANA_PLANEJAMENTO_FIM).slice(0, 5)}
        </span>

        <span className="flex h-9 items-center gap-2 rounded-lg border border-line bg-card pl-3 pr-1.5">
          <span className="text-caption text-muted">Cenário</span>
          <span className="text-body-sm font-medium text-ink">
            {sequenciaOtimizada ? 'Sequência Otimizada' : 'Sequência vigente'}
          </span>
          <Badge tone={sequenciaOtimizada ? 'success' : 'neutral'}>Ativo</Badge>
        </span>

        <span className="ml-auto flex items-center gap-2">
          {sequenciaOtimizada ? (
            <Button variante="outline" onClick={desfazer}>
              Desfazer otimização
            </Button>
          ) : (
            <Button onClick={executarOtimizacao} disabled={otimizando}>
              <span aria-hidden="true">✦</span>
              {otimizando ? 'Otimizando sequência…' : 'Otimizar Sequência'}
            </Button>
          )}
          <Button variante="outline" onClick={() => setModalAberto('comparar')}>
            Comparar Cenários
          </Button>
          <Button
            variante="outline"
            onClick={() =>
              addToast({ titulo: 'Sequência publicada', descricao: 'MES e líderes de turno notificados da nova ordem.', tone: 'success' })
            }
          >
            Publicar Sequência
          </Button>
        </span>
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 min-w-0">
          <SectionCard
            titulo="Sequência por Linha"
            info="Arraste blocos de produção na horizontal para reprogramar. Setups (S), limpezas (L), manutenção e folgas seguem a legenda."
            direita={
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-line bg-app p-0.5" role="group" aria-label="Zoom do Gantt">
                  {(['dia', 'semana', 'turno'] as const).map((opcao) => (
                    <button
                      key={opcao}
                      type="button"
                      aria-pressed={zoom === opcao}
                      onClick={() => setZoom(opcao)}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-body-sm font-medium capitalize transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        zoom === opcao ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink',
                      )}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
                <Button
                  variante="outline"
                  tamanho="sm"
                  onClick={() => ganttScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })}
                >
                  Hoje
                </Button>
              </div>
            }
            className="relative"
          >
            <GanttSequencia
              linhas={linhasVisiveis}
              blocos={blocos}
              zoom={zoom}
              ordensEmExecucao={ordensEmExecucao}
              deslocamentos={deslocamentos}
              movimentoPendente={movimentoPendente}
              onSoltarBloco={aoSoltarBloco}
              otimizando={otimizando}
              scrollRef={ganttScrollRef}
            />
            <LegendaGantt />

            {movimentoPendente && impacto ? (
              <Card className="absolute right-6 top-16 z-30 w-[300px] p-4 shadow-pop">
                <h3 className="text-body-sm font-semibold text-ink">Impacto da mudança</h3>
                <p className="mt-0.5 truncate text-caption text-muted" title={blocoPendente?.rotulo}>
                  {blocoPendente?.rotulo} {blocoPendente?.ordemId ? `· ${blocoPendente.ordemId}` : ''}
                </p>
                <dl className="mt-3 flex flex-col gap-2 text-body-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Δ prazo</dt>
                    <dd className={cn('font-semibold tabular-nums', impacto.prazoHoras > 0 ? 'text-danger' : 'text-success')}>
                      {impacto.prazoHoras > 0 ? '+' : '−'}
                      {formatNumero(Math.abs(impacto.prazoHoras), 1)} h
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Δ setup</dt>
                    <dd className={cn('font-semibold tabular-nums', impacto.setupMinutos > 0 ? 'text-danger' : 'text-success')}>
                      {impacto.setupMinutos > 0 ? '+' : '−'}
                      {formatNumero(Math.abs(impacto.setupMinutos))} min
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Risco de ruptura</dt>
                    <dd>
                      <StatusPill status={impacto.riscoRuptura} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Utilização da linha</dt>
                    <dd className={cn('font-semibold tabular-nums', impacto.utilizacaoPontos < 0 ? 'text-danger' : 'text-success')}>
                      {impacto.utilizacaoPontos > 0 ? '+' : '−'}
                      {formatNumero(Math.abs(impacto.utilizacaoPontos), 1)} p.p.
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Custo adicional</dt>
                    <dd className="font-semibold tabular-nums text-ink">{formatMoedaCompacta(impacto.custoAdicional)}</dd>
                  </div>
                </dl>
                <div className="mt-3.5 flex gap-2">
                  <Button tamanho="sm" className="flex-1" onClick={aplicarMudanca}>
                    Aplicar mudança
                  </Button>
                  <Button variante="outline" tamanho="sm" className="flex-1" onClick={() => setMovimentoPendente(null)}>
                    Desfazer
                  </Button>
                </div>
              </Card>
            ) : null}
          </SectionCard>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/sequenciamento']} onAcao={aoAcaoCopilot} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <SectionCard
          titulo="Matriz de Troca / Setup"
          info="Minutos de troca entre famílias (de → para). Verde = troca rápida; vermelho = limpeza obrigatória."
        >
          <MatrizSetup />
        </SectionCard>

        <SectionCard
          titulo={`Ordens Críticas (${ordensCriticas.length})`}
          info="Ordens de Anápolis ordenadas por situação e prontidão de materiais."
          corpoSemPadding
        >
          <DataTable
            rotulo="Ordens críticas da semana"
            colunas={colunasOrdensCriticas}
            linhas={ordensCriticas}
            chave={(o) => o.id}
          />
        </SectionCard>

        <SectionCard
          titulo={`Restrições e Conflitos (${restricoes.length})`}
          info="Restrições ativas consideradas pelo otimizador de sequência."
        >
          <ul className="flex flex-col gap-2.5">
            {restricoes.map((restricao) => {
              const Icone = iconeDaRestricao[restricao.tipo]
              return (
                <li key={restricao.id} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                      corDoIconeRestricao[restricao.tipo],
                    )}
                  >
                    <Icone size={14} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center justify-between gap-2">
                      <span className="truncate text-body-sm font-medium text-ink" title={restricao.titulo}>
                        {restricao.titulo}
                      </span>
                      <StatusPill status={restricao.severidade} pulsar={restricao.severidade === 'Crítica'} />
                    </p>
                    <p className="mt-0.5 text-caption leading-snug text-muted">{restricao.detalhe}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      </div>

      <Modal
        aberto={modalAberto !== null}
        onFechar={() => setModalAberto(null)}
        titulo={modalAberto === 'comparar' ? 'Comparar Cenários' : 'Simular Parada'}
        descricao="Gêmeo da Fábrica — simulação de eventos sobre o plano da semana"
        rodape={
          <Button variante="outline" tamanho="sm" onClick={() => setModalAberto(null)}>
            Fechar
          </Button>
        }
      >
        <p className="rounded-lg bg-primary-soft px-4 py-6 text-center text-body font-medium text-primary-strong">
          {modalAberto === 'comparar' ? 'Comparação de cenários' : 'Simulador de paradas'} — disponível no Prompt 8
        </p>
      </Modal>

      <PageFooter />
    </>
  )
}
