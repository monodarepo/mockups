import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  CircleDollarSign,
  FlaskConical,
  Gauge,
  LayoutGrid,
  List,
  ListOrdered,
  Package,
  Plus,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageFooter } from '@/components/shared/PageFooter'
import { FilterBar } from '@/components/shared/FilterBar'
import { KpiRow } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { CopilotPanel } from '@/components/shared/CopilotPanel'
import { StatusPill } from '@/components/shared/StatusPill'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ScoreDonut } from '@/components/shared/ScoreDonut'
import { DataTable, type ColunaDataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { colors, toneHex, type Tone } from '@/lib/colors'
import { formatDataHora, formatHora, formatMoedaCompacta, formatNumero, formatPercent } from '@/lib/format'
import { useAppStore } from '@/store'
import {
  GOVERNANCA_AGENTES_SCORE,
  ULTIMA_VERIFICACAO_GOVERNANCA,
  acoesAgentes,
  agentePorId,
  agentes,
  conteudoCopilot,
  desempenhoAgentes,
  distribuicaoGovernanca,
  kpisAgentes,
  niveisAutonomia,
  orquestracaoPrincipal,
  orquestracaoRamos,
  selosGovernanca,
  type AcaoAgente,
  type AgenteIA,
  type DesempenhoAgente,
  type StatusAcaoAgente,
  type StatusAgente,
} from '@/data'

const toneDoStatusAgente: Record<StatusAgente, Tone> = {
  Ativo: 'success',
  Monitorando: 'warning',
  'Em aprovação': 'warning',
  Pausado: 'neutral',
  'Em treinamento': 'info',
}

const ICONES_DOMINIO: Record<string, typeof Activity> = {
  Planejamento: CalendarRange,
  Sequenciamento: ListOrdered,
  Gargalos: Gauge,
  Materiais: Package,
  Qualidade: FlaskConical,
  Manutenção: Wrench,
  Custos: CircleDollarSign,
  Execução: Activity,
  Auditoria: ShieldCheck,
}

function IconeAgente({ dominio, tamanho = 18 }: { dominio: string; tamanho?: number }) {
  const Icone = ICONES_DOMINIO[dominio] ?? Activity
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      <Icone size={tamanho} aria-hidden="true" />
    </span>
  )
}

/** Diagrama SVG da orquestração — fluxo principal com ramificações tracejadas. */
function DiagramaOrquestracao() {
  const NO_W = 150
  const NO_H = 58
  const RAMO_H = 50
  const xs = [16, 214, 412, 610]

  return (
    <svg viewBox="0 0 800 240" className="block h-auto w-full" role="img" aria-label="Fluxo de orquestração dos agentes">
      <defs>
        <marker id="seta-fluxo" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={colors.primary} />
        </marker>
      </defs>

      {/* Conexões do fluxo principal */}
      {xs.slice(0, -1).map((x, i) => (
        <g key={`fluxo-${i}`}>
          <line x1={x + NO_W} y1={30 + NO_H / 2} x2={xs[i + 1] - 2} y2={30 + NO_H / 2} stroke="#C7D4E6" strokeWidth="1.6" markerEnd="url(#seta-fluxo)" />
          <line
            x1={x + NO_W}
            y1={30 + NO_H / 2}
            x2={xs[i + 1] - 8}
            y2={30 + NO_H / 2}
            stroke={colors.primary}
            strokeWidth="1.6"
            strokeDasharray="5 11"
            className="animate-flow motion-reduce:animate-none"
          />
        </g>
      ))}

      {/* Ramificações tracejadas */}
      {orquestracaoRamos.map((ramo) => {
        const indice = orquestracaoPrincipal.findIndex((no) => no.dominio === ramo.origem)
        const cx = xs[indice] + NO_W / 2
        return (
          <g key={ramo.dominio}>
            <line
              x1={cx}
              y1={30 + NO_H}
              x2={cx}
              y2={168}
              stroke="#C7D4E6"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              markerEnd="url(#seta-fluxo)"
            />
            <line
              x1={cx}
              y1={30 + NO_H}
              x2={cx}
              y2={162}
              stroke={colors.info}
              strokeWidth="1.4"
              strokeDasharray="4 12"
              className="animate-flow motion-reduce:animate-none"
            />
            <rect x={xs[indice]} y={170} width={NO_W} height={RAMO_H} rx="10" fill="#F8FAFD" stroke="#D7E0EC" strokeDasharray="4 3" strokeWidth="1.2" />
            <text x={cx} y={170 + 21} textAnchor="middle" fontSize="12" fontWeight="600" fill={colors.ink}>
              {ramo.dominio}
            </text>
            <text x={cx} y={170 + 38} textAnchor="middle" fontSize="11" fill={colors.muted}>
              {formatNumero(ramo.eventos)} eventos
            </text>
          </g>
        )
      })}

      {/* Nós do fluxo principal */}
      {orquestracaoPrincipal.map((no, i) => (
        <g key={no.dominio}>
          <rect x={xs[i]} y={30} width={NO_W} height={NO_H} rx="12" fill="#FFFFFF" stroke={colors.primary} strokeOpacity="0.45" strokeWidth="1.4" />
          <text x={xs[i] + NO_W / 2} y={54} textAnchor="middle" fontSize="13" fontWeight="600" fill={colors.ink}>
            {no.dominio}
          </text>
          <text x={xs[i] + NO_W / 2} y={72} textAnchor="middle" fontSize="11" fill={colors.muted}>
            {formatNumero(no.eventos)} eventos hoje
          </text>
        </g>
      ))}
    </svg>
  )
}

function CardAgente({ agente }: { agente: AgenteIA }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-app/40 p-3.5 transition-shadow duration-150 hover:shadow-card">
      <div className="flex items-center gap-2.5">
        <IconeAgente dominio={agente.dominio} />
        <p className="min-w-0 flex-1 text-body-sm font-semibold leading-snug text-ink">{agente.nome}</p>
      </div>
      <p className="flex flex-wrap items-center gap-1.5">
        <StatusPill status={agente.status} tone={toneDoStatusAgente[agente.status]} />
        <Badge tone="info">{agente.autonomia}</Badge>
      </p>
      <p className="line-clamp-2 min-h-[36px] text-caption leading-snug text-muted" title={agente.descricao}>
        {agente.descricao}
      </p>
      <dl className="flex items-center justify-between gap-2 border-t border-line pt-2 text-caption text-muted">
        <div>
          <dt className="sr-only">Tarefas hoje</dt>
          <dd>
            <strong className="text-ink">{formatNumero(agente.tarefasHoje)}</strong> tarefas
          </dd>
        </div>
        <div>
          <dt className="sr-only">SLA</dt>
          <dd>
            SLA <strong className="text-ink">{formatPercent(agente.slaPercent)}</strong>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Taxa de aceitação</dt>
          <dd>
            Aceit. <strong className="text-ink">{formatPercent(agente.taxaAceitacao, 0)}</strong>
          </dd>
        </div>
      </dl>
    </div>
  )
}

export function AgentesPage() {
  const setPersona = useAppStore((s) => s.setPersona)
  const addToast = useAppStore((s) => s.addToast)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)

  const [modoCatalogo, setModoCatalogo] = useState<'grade' | 'lista'>('grade')
  // Decisões em aprovação (KPI reativo) e status locais da fila de ações.
  const [decisoesEmAprovacao, setDecisoesEmAprovacao] = useState(9)
  const [statusAcoes, setStatusAcoes] = useState<Record<string, StatusAcaoAgente>>({})
  const desempenhoRef = useRef<HTMLDivElement | null>(null)

  // Persona desta tela: Camila Azevedo.
  useEffect(() => {
    setPersona('camila')
  }, [setPersona])

  const statusDaAcao = (acao: AcaoAgente): StatusAcaoAgente => statusAcoes[acao.id] ?? acao.status
  const aguardaDecisao = (status: StatusAcaoAgente) => status === 'Pendente' || status === 'Em análise'

  // Catálogo: 8 cards — o Agente de Auditoria aparece na tabela de desempenho.
  const catalogoAgentes = useMemo(() => agentes.filter((agente) => agente.dominio !== 'Auditoria'), [])

  const aprovarAcao = (acao: AcaoAgente) => {
    if (!aguardaDecisao(statusDaAcao(acao))) return
    setStatusAcoes((atual) => ({ ...atual, [acao.id]: 'Aprovada' }))
    setDecisoesEmAprovacao((atual) => Math.max(0, atual - 1))
    // A decisão sai da fila global de pendências (badge do menu).
    useAppStore.setState((estado) => ({ pendencias: Math.max(0, estado.pendencias - 1) }))
    addToast({ titulo: 'Aprovada', descricao: `${acao.titulo} — encaminhada ao Agente de Execução.`, tone: 'success' })
  }

  const rejeitarAcao = (acao: AcaoAgente) => {
    if (!aguardaDecisao(statusDaAcao(acao))) return
    setStatusAcoes((atual) => ({ ...atual, [acao.id]: 'Rejeitada' }))
    setDecisoesEmAprovacao((atual) => Math.max(0, atual - 1))
    addToast({ titulo: 'Rejeitada', descricao: 'Registrada na trilha de auditoria.', tone: 'info' })
  }

  const aoAcaoCopilot = (rotulo: string) => {
    if (rotulo === 'Simular impacto') abrirSimulador('EV-002')
    else if (rotulo === 'Aprovar automação') {
      const ibuprofeno = acoesAgentes.find((acao) => acao.id === 'ACA-002')
      if (ibuprofeno && aguardaDecisao(statusDaAcao(ibuprofeno))) aprovarAcao(ibuprofeno)
      else addToast({ titulo: 'Automação já decidida', descricao: 'A compra de Ibuprofeno API já saiu da fila.', tone: 'info' })
    } else if (rotulo === 'Ver agentes críticos') {
      desempenhoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const colunasCatalogo: ColunaDataTable<AgenteIA>[] = useMemo(
    () => [
      {
        id: 'agente',
        titulo: 'Agente',
        render: (item) => (
          <span className="flex items-center gap-2.5">
            <IconeAgente dominio={item.dominio} tamanho={16} />
            <span className="leading-tight">
              <span className="block font-medium text-ink">{item.nome}</span>
              <span className="block max-w-[260px] truncate text-caption text-muted" title={item.descricao}>
                {item.descricao}
              </span>
            </span>
          </span>
        ),
        valor: (item) => item.nome,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => <StatusPill status={item.status} tone={toneDoStatusAgente[item.status]} />,
        valor: (item) => item.status,
      },
      {
        id: 'nivel',
        titulo: 'Nível',
        render: (item) => <Badge tone="info">{item.autonomia}</Badge>,
        valor: (item) => item.autonomia,
      },
      {
        id: 'tarefas',
        titulo: 'Tarefas hoje',
        alinhar: 'direita',
        render: (item) => formatNumero(item.tarefasHoje),
        valor: (item) => item.tarefasHoje,
      },
      {
        id: 'sla',
        titulo: 'SLA',
        alinhar: 'direita',
        render: (item) => formatPercent(item.slaPercent),
        valor: (item) => item.slaPercent,
      },
      {
        id: 'aceitacao',
        titulo: 'Aceitação',
        alinhar: 'direita',
        render: (item) => formatPercent(item.taxaAceitacao, 0),
        valor: (item) => item.taxaAceitacao,
      },
    ],
    [],
  )

  const colunasFila: ColunaDataTable<AcaoAgente>[] = useMemo(
    () => [
      {
        id: 'hora',
        titulo: 'Hora',
        render: (item) => <span className="tabular-nums text-muted">{formatHora(item.criadaEm)}</span>,
        valor: (item) => item.criadaEm,
      },
      {
        id: 'agente',
        titulo: 'Agente',
        render: (item) => <span className="font-medium text-ink">{agentePorId(item.agenteId)?.dominio ?? '—'}</span>,
        valor: (item) => agentePorId(item.agenteId)?.dominio ?? '',
      },
      {
        id: 'acao',
        titulo: 'Ação proposta',
        render: (item) => (
          <span className="leading-tight">
            <span className="block font-medium text-ink">{item.titulo}</span>
            <span className="block max-w-[340px] truncate text-caption text-muted" title={item.justificativa}>
              {item.justificativa}
            </span>
          </span>
        ),
        valor: (item) => item.titulo,
      },
      {
        id: 'impacto',
        titulo: 'Impacto',
        render: (item) => <span className="font-semibold text-ink">{item.impacto}</span>,
        valor: (item) => item.impacto,
      },
      {
        id: 'status',
        titulo: 'Status',
        render: (item) => {
          const status = statusDaAcao(item)
          return <StatusPill status={status} pulsar={status === 'Pendente'} />
        },
        valor: (item) => statusDaAcao(item),
      },
      {
        id: 'responsavel',
        titulo: 'Responsável',
        render: (item) => item.responsavel,
        valor: (item) => item.responsavel,
      },
      {
        id: 'decisao',
        titulo: 'Decisão',
        render: (item) =>
          aguardaDecisao(statusDaAcao(item)) ? (
            <span className="flex items-center gap-2">
              <Button tamanho="sm" onClick={() => aprovarAcao(item)}>
                Aprovar
              </Button>
              <Button variante="outline" tamanho="sm" onClick={() => rejeitarAcao(item)}>
                Rejeitar
              </Button>
            </span>
          ) : (
            <span className="text-caption text-muted">Decidida às {formatHora(item.criadaEm)}</span>
          ),
      },
    ],
    // Recriadas quando uma decisão muda de status.
    [statusAcoes], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const colunasDesempenho: ColunaDataTable<DesempenhoAgente>[] = useMemo(
    () => [
      {
        id: 'agente',
        titulo: 'Agente',
        render: (item) => {
          const agente = agentePorId(item.agenteId)
          return (
            <span className="flex items-center gap-2.5">
              <IconeAgente dominio={agente?.dominio ?? ''} tamanho={16} />
              <span className="font-medium text-ink">{agente?.nome ?? item.agenteId}</span>
            </span>
          )
        },
        valor: (item) => agentePorId(item.agenteId)?.nome ?? '',
      },
      {
        id: 'acoes',
        titulo: 'Ações (30 dias)',
        alinhar: 'direita',
        render: (item) => formatNumero(item.acoes),
        valor: (item) => item.acoes,
      },
      {
        id: 'ganho',
        titulo: 'Ganho gerado',
        alinhar: 'direita',
        render: (item) =>
          item.ganho !== null ? (
            <span className="font-semibold text-success">{formatMoedaCompacta(item.ganho)}</span>
          ) : (
            <span className="text-muted" title="Agente de suporte — não gera ganho direto">
              —
            </span>
          ),
        valor: (item) => item.ganho ?? 0,
      },
      {
        id: 'assertividade',
        titulo: 'Assertividade',
        alinhar: 'direita',
        render: (item) => formatPercent(item.assertividadePercent, 0),
        valor: (item) => item.assertividadePercent,
      },
      {
        id: 'incidentes',
        titulo: 'Incidentes',
        alinhar: 'direita',
        render: (item) =>
          item.incidentes > 0 ? (
            <span className="font-semibold text-warning-strong">{formatNumero(item.incidentes)}</span>
          ) : (
            <span className="text-muted">0</span>
          ),
        valor: (item) => item.incidentes,
      },
    ],
    [],
  )

  return (
    <>
      <PageHeader
        titulo="Agentes de IA"
        descricao="Orquestre agentes inteligentes, acompanhe automações e governe decisões operacionais em tempo real."
        acoes={
          <>
            <Button
              tamanho="sm"
              onClick={() => addToast({ titulo: 'Novo agente', descricao: 'Assistente de criação disponível na demo completa.', tone: 'info' })}
            >
              <Plus size={14} aria-hidden="true" />
              Novo agente
            </Button>
            <Button
              variante="outline"
              tamanho="sm"
              onClick={() => addToast({ titulo: 'Playbooks', descricao: 'Biblioteca de playbooks disponível na demo completa.', tone: 'info' })}
            >
              <BookOpen size={14} aria-hidden="true" />
              Playbooks
            </Button>
          </>
        }
      />

      <FilterBar />

      <KpiRow kpis={kpisAgentes(decisoesEmAprovacao)} />

      <div className="grid grid-cols-3 items-start gap-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-5">
          <SectionCard
            titulo={`Catálogo de Agentes (${catalogoAgentes.length})`}
            info="Agentes de Anápolis — o Agente de Auditoria aparece na tabela de desempenho."
            corpoSemPadding={modoCatalogo === 'lista'}
            direita={
              <div className="flex rounded-lg border border-line bg-app p-0.5" role="group" aria-label="Modo do catálogo">
                {(
                  [
                    ['grade', 'Grade', LayoutGrid],
                    ['lista', 'Lista', List],
                  ] as const
                ).map(([modo, rotulo, Icone]) => (
                  <button
                    key={modo}
                    type="button"
                    aria-pressed={modoCatalogo === modo}
                    onClick={() => setModoCatalogo(modo)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-body-sm font-medium transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      modoCatalogo === modo ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink',
                    )}
                  >
                    <Icone size={14} aria-hidden="true" />
                    {rotulo}
                  </button>
                ))}
              </div>
            }
          >
            {modoCatalogo === 'grade' ? (
              <div className="grid grid-cols-4 gap-3">
                {catalogoAgentes.map((agente) => (
                  <CardAgente key={agente.id} agente={agente} />
                ))}
              </div>
            ) : (
              <DataTable
                rotulo="Catálogo de agentes em lista"
                colunas={colunasCatalogo}
                linhas={catalogoAgentes}
                chave={(item) => item.id}
              />
            )}
          </SectionCard>

          <SectionCard
            titulo="Orquestração dos Agentes"
            info="Eventos processados hoje no fluxo principal e nas ramificações de suporte."
            corpoSemPadding
          >
            <div className="p-4">
              <DiagramaOrquestracao />
            </div>
          </SectionCard>
        </div>

        <CopilotPanel conteudo={conteudoCopilot['/agentes']} onAcao={aoAcaoCopilot} />
      </div>

      <SectionCard
        titulo={`Fila de Ações e Aprovações (${acoesAgentes.length})`}
        info="Decisões propostas pelos agentes hoje — aprovar encaminha ao Agente de Execução."
        corpoSemPadding
      >
        <DataTable
          rotulo="Fila de ações e aprovações dos agentes"
          colunas={colunasFila}
          linhas={acoesAgentes}
          chave={(item) => item.id}
        />
      </SectionCard>

      <div ref={desempenhoRef} className="grid scroll-mt-4 grid-cols-3 items-start gap-5">
        <SectionCard titulo="Níveis de Autonomia" info="Distribuição da rede de 12 agentes por nível de autonomia.">
          <ul className="flex flex-col gap-3.5">
            {niveisAutonomia.map((nivel) => (
              <li key={nivel.nivel} className="rounded-xl border border-line bg-app/40 px-3 py-2.5">
                <p className="flex items-baseline justify-between gap-2">
                  <span className="text-body-sm font-semibold text-ink">
                    {nivel.nivel} <span className="font-normal text-muted">· {nivel.rotulo}</span>
                  </span>
                  <span className="text-caption tabular-nums text-muted">
                    {formatNumero(nivel.agentes)} {nivel.agentes === 1 ? 'agente' : 'agentes'}
                  </span>
                </p>
                <ProgressBar valor={nivel.percent} tone={nivel.percent === 0 ? 'neutral' : 'primary'} className="mt-1.5" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          className="col-span-2"
          titulo="Desempenho dos Agentes"
          info="Ações, ganho gerado, assertividade e incidentes nos últimos 30 dias."
          corpoSemPadding
        >
          <DataTable
            rotulo="Desempenho dos agentes nos últimos 30 dias"
            colunas={colunasDesempenho}
            linhas={desempenhoAgentes}
            chave={(item) => item.agenteId}
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-3 items-start gap-5">
        <SectionCard titulo="Governança Geral" info="Classificação das decisões dos agentes nos últimos 30 dias.">
          <div className="flex justify-center border-b border-line pb-4">
            <ScoreDonut valor={GOVERNANCA_AGENTES_SCORE} rotulo="Decisões dentro da política" />
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {distribuicaoGovernanca.map((faixa) => (
              <li key={faixa.rotulo} className="flex items-center justify-between gap-2 text-body-sm">
                <span className="flex items-center gap-2 text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: toneHex[faixa.tone] }} aria-hidden="true" />
                  {faixa.rotulo}
                </span>
                <span className="font-semibold tabular-nums text-ink">{formatPercent(faixa.percent, 0)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          className="col-span-2"
          titulo="Governança e Segurança"
          info="Controles ativos sobre as decisões dos agentes."
        >
          <div className="grid grid-cols-3 gap-3">
            {selosGovernanca.map((selo) => (
              <div key={selo.titulo} className="flex items-start gap-2.5 rounded-xl border border-line bg-app/40 px-3 py-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold text-ink" title={selo.titulo}>
                    {selo.titulo}
                  </p>
                  <p className="truncate text-caption text-muted" title={selo.detalhe}>
                    {selo.detalhe}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-line pt-2.5 text-caption text-muted">
            Última verificação {formatDataHora(ULTIMA_VERIFICACAO_GOVERNANCA)}
          </p>
        </SectionCard>
      </div>

      <PageFooter />
    </>
  )
}
