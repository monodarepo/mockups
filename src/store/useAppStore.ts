import { create } from 'zustand'
import { visaoPadrao, visoes, type Visao } from '@/data/visoes'
import {
  TURNO_A_FIM,
  TURNO_A_INICIO,
  type Area,
  type NomeFabrica,
  type Periodo,
  type Turno,
} from '@/data/constants'
import { cenarioPorId } from '@/data/cenarios'
import { tipoDaEntidade, type TipoEntidade } from '@/data/entidades'
import { lotes } from '@/data/lotes'
import { ordensManutencao, otRecomendadaCompressora } from '@/data/manutencao'
import type {
  AgendamentoRelatorio,
  AgenteIA,
  MensagemCopilot,
  OrdemManutencao,
  RegraNegocio,
  Relatorio,
} from '@/data/types'
import type { Tone } from '@/lib/colors'

export interface Filtros {
  fabrica: NomeFabrica
  area: Area
  turno: Turno
  periodo: Periodo
  periodoInicio: Date
  periodoFim: Date
}

export interface Toast {
  id: number
  titulo: string
  descricao?: string
  tone: Tone
  /** Ação opcional do toast — botão que navega para a rota indicada. */
  acao?: { rotulo: string; para: string }
}

/** Ficha universal aberta (drawer de Ordem, Material, Lote, Ativo ou OT). */
export interface FichaAberta {
  tipo: TipoEntidade
  id: string
}

export interface Rejeicao {
  id: string
  motivo: string
}

export const filtrosIniciais: Filtros = {
  fabrica: 'Anápolis',
  area: 'Todas as áreas',
  turno: 'Turno A (06:00 – 14:00)',
  periodo: 'Turno atual',
  periodoInicio: TURNO_A_INICIO,
  periodoFim: TURNO_A_FIM,
}

interface AppState {
  // Visão ativa (papel funcional do usuário)
  visao: Visao
  visoes: Visao[]
  setVisao: (id: string) => void

  // Filtros globais (FilterBar lê e grava aqui)
  filtros: Filtros
  setFiltro: <K extends keyof Filtros>(chave: K, valor: Filtros[K]) => void
  resetFiltros: () => void

  // Layout
  sidebarRecolhida: boolean
  alternarSidebar: () => void
  copilotoAberto: boolean
  alternarCopiloto: () => void

  // Busca global — campo do header e Ctrl/⌘+K abrem a mesma paleta
  paletaAberta: boolean
  abrirPaleta: () => void
  fecharPaleta: () => void

  // Ficha universal — qualquer ID clicável abre a ficha da entidade
  fichaAberta: FichaAberta | null
  /** Resolve o tipo pelo prefixo do ID; IDs desconhecidos são ignorados. */
  abrirFicha: (id: string) => void
  fecharFicha: () => void

  // Fila de liberação de lotes (QA) — priorizar move ao topo
  ordemFilaLotes: string[]
  priorizarLote: (id: string) => void

  // Carteira de OTs — "Acionar manutenção" cria a OT-245690 no topo
  filaOts: OrdemManutencao[]
  priorizarOt: (id: string) => void
  acionarManutencaoCompressora: () => void

  // Relatórios — criações e agendamentos da sessão
  relatoriosCriados: Relatorio[]
  criarRelatorio: (dados: Pick<Relatorio, 'nome' | 'categoria' | 'formato' | 'responsavel'>) => void
  agendamentosCriados: AgendamentoRelatorio[]
  agendarEnvio: (dados: Omit<AgendamentoRelatorio, 'id' | 'status'>) => void
  relatoriosAtualizados: string[]
  marcarRelatorioAtualizado: (id: string) => void

  // Agentes IA — pausar/ativar e criação da sessão
  /** IDs com status invertido em relação ao dado base (toggle pausar/ativar). */
  agentesAlternados: string[]
  alternarAgente: (id: string, nome: string, pausando: boolean) => void
  agentesCriados: AgenteIA[]
  criarAgente: (dados: Pick<AgenteIA, 'nome' | 'dominio' | 'autonomia'>) => void

  // Configurações — regras de negócio criadas na sessão
  regrasCriadas: RegraNegocio[]
  criarRegra: (dados: Pick<RegraNegocio, 'nome' | 'criticidade'>) => void

  // Notificações do sino — "Marcar todas como lidas" zera e persiste na sessão
  notificacoesLidas: boolean
  marcarNotificacoesLidas: () => void

  // Decisões — alertas e ações de agentes compartilham a mesma fila
  pendencias: number
  aprovados: string[]
  rejeitados: Rejeicao[]
  executados: string[]
  aprovarAlerta: (id: string) => void
  rejeitarAlerta: (id: string, motivo: string) => void
  executarAcao: (id: string) => void

  // Gêmeo da fábrica e sequenciamento
  cenarioAtivo: string
  aplicarCenario: (id: string) => void
  sequenciaOtimizada: boolean
  otimizarSequencia: () => void
  desfazerOtimizacao: () => void

  // Simulador de Cenários — overlay global, aberto de qualquer tela
  simuladorAberto: boolean
  /** Evento pré-selecionado ao abrir (ex.: EV-001 vindo do copiloto). */
  simuladorEventoId: string | null
  abrirSimulador: (eventoId?: string) => void
  fecharSimulador: () => void

  // Conversas do copiloto — histórico por tela, persistido na sessão
  conversas: Record<string, MensagemCopilot[]>
  registrarMensagem: (tela: string, mensagem: Omit<MensagemCopilot, 'id'>) => MensagemCopilot

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  /** Alias mantido pela API original do shell (Header usa mostrarToast). */
  mostrarToast: (toast: Omit<Toast, 'id'>) => void
  descartarToast: (id: number) => void
}

/** Contador determinístico de toasts — evita Math.random e chaves instáveis. */
let sequenciaToast = 0

/** Contador determinístico de mensagens do copiloto. */
let sequenciaMensagem = 0

function jaResolvido(estado: AppState, id: string): boolean {
  return (
    estado.aprovados.includes(id) ||
    estado.executados.includes(id) ||
    estado.rejeitados.some((rejeicao) => rejeicao.id === id)
  )
}

export const useAppStore = create<AppState>((set) => {
  const empilharToast = (estado: AppState, toast: Omit<Toast, 'id'>): Toast[] => [
    ...estado.toasts,
    { ...toast, id: ++sequenciaToast },
  ]

  return {
    visao: visaoPadrao,
    visoes,
    setVisao: (id) =>
      set((estado) => ({ visao: estado.visoes.find((v) => v.id === id) ?? estado.visao })),

    filtros: filtrosIniciais,
    setFiltro: (chave, valor) =>
      set((estado) => ({ filtros: { ...estado.filtros, [chave]: valor } })),
    resetFiltros: () => set({ filtros: filtrosIniciais }),

    sidebarRecolhida: false,
    alternarSidebar: () => set((estado) => ({ sidebarRecolhida: !estado.sidebarRecolhida })),
    copilotoAberto: true,
    alternarCopiloto: () => set((estado) => ({ copilotoAberto: !estado.copilotoAberto })),

    paletaAberta: false,
    abrirPaleta: () => set({ paletaAberta: true }),
    fecharPaleta: () => set({ paletaAberta: false }),

    fichaAberta: null,
    abrirFicha: (id) => {
      const tipo = tipoDaEntidade(id)
      if (!tipo) return
      set({ fichaAberta: { tipo, id } })
    },
    fecharFicha: () => set({ fichaAberta: null }),

    ordemFilaLotes: lotes.map((lote) => lote.id),
    priorizarLote: (id) =>
      set((estado) => ({
        ordemFilaLotes: [id, ...estado.ordemFilaLotes.filter((item) => item !== id)],
        toasts: empilharToast(estado, { titulo: `Lote ${id} priorizado na fila de análise`, tone: 'success' }),
      })),

    filaOts: ordensManutencao,
    priorizarOt: (id) =>
      set((estado) => {
        const alvo = estado.filaOts.find((ot) => ot.id === id)
        if (!alvo) return estado
        return {
          filaOts: [alvo, ...estado.filaOts.filter((ot) => ot.id !== id)],
          toasts: empilharToast(estado, {
            titulo: `${id} priorizada`,
            descricao: 'Reordenada para o topo da carteira do turno.',
            tone: 'success',
          }),
        }
      }),
    acionarManutencaoCompressora: () =>
      set((estado) => {
        if (estado.filaOts.some((ot) => ot.id === otRecomendadaCompressora.id)) {
          return {
            toasts: empilharToast(estado, {
              titulo: 'OT 245690 já está na fila',
              descricao: 'Programada para quarta, 02:00 – 05:00.',
              tone: 'info',
            }),
          }
        }
        return {
          filaOts: [otRecomendadaCompressora, ...estado.filaOts],
          toasts: empilharToast(estado, {
            titulo: 'OT 245690 criada',
            descricao: 'Janela de menor impacto: quarta, 02:00 – 05:00 — recomendação do Agente de Manutenção.',
            tone: 'success',
          }),
        }
      }),

    relatoriosCriados: [],
    criarRelatorio: (dados) =>
      set((estado) => {
        const id = `REL-${String(11 + estado.relatoriosCriados.length).padStart(3, '0')}`
        const novo: Relatorio = {
          id,
          ...dados,
          descricao: 'Relatório criado nesta sessão a partir do formulário da biblioteca.',
          periodicidade: 'Sob demanda',
          ultimaGeracao: new Date(2025, 4, 19, 10, 18),
          situacao: 'Atualizado',
        }
        return {
          relatoriosCriados: [...estado.relatoriosCriados, novo],
          toasts: empilharToast(estado, {
            titulo: 'Relatório criado',
            descricao: `${dados.nome} entrou na biblioteca (${id}).`,
            tone: 'success',
          }),
        }
      }),
    agendamentosCriados: [],
    agendarEnvio: (dados) =>
      set((estado) => ({
        agendamentosCriados: [
          ...estado.agendamentosCriados,
          { ...dados, id: `AGD-${String(6 + estado.agendamentosCriados.length).padStart(2, '0')}`, status: 'Programado' },
        ],
        toasts: empilharToast(estado, {
          titulo: 'Envio agendado',
          descricao: `Programado via ${dados.canal} para ${dados.destinatarios}.`,
          tone: 'success',
        }),
      })),
    relatoriosAtualizados: [],
    marcarRelatorioAtualizado: (id) =>
      set((estado) => ({
        relatoriosAtualizados: estado.relatoriosAtualizados.includes(id)
          ? estado.relatoriosAtualizados
          : [...estado.relatoriosAtualizados, id],
      })),

    agentesAlternados: [],
    alternarAgente: (id, nome, pausando) =>
      set((estado) => ({
        agentesAlternados: estado.agentesAlternados.includes(id)
          ? estado.agentesAlternados.filter((item) => item !== id)
          : [...estado.agentesAlternados, id],
        toasts: empilharToast(estado, {
          titulo: pausando ? `${nome} pausado` : `${nome} ativado`,
          descricao: pausando
            ? 'O agente para de propor ações até ser reativado.'
            : 'O agente volta a operar dentro do escopo aprovado.',
          tone: pausando ? 'neutral' : 'success',
        }),
      })),
    agentesCriados: [],
    criarAgente: (dados) =>
      set((estado) => {
        const novo: AgenteIA = {
          id: `ag-novo-${estado.agentesCriados.length + 1}`,
          ...dados,
          descricao: 'Agente criado nesta sessão — inicia pausado até a aprovação de escopo pela governança.',
          status: 'Pausado',
          tarefasHoje: 0,
          slaPercent: 0,
          taxaAceitacao: 0,
        }
        return {
          agentesCriados: [...estado.agentesCriados, novo],
          toasts: empilharToast(estado, {
            titulo: 'Agente criado',
            descricao: `${dados.nome} entra pausado, aguardando aprovação de escopo.`,
            tone: 'success',
          }),
        }
      }),

    regrasCriadas: [],
    criarRegra: (dados) =>
      set((estado) => ({
        regrasCriadas: [
          ...estado.regrasCriadas,
          { ...dados, id: `RN-${String(6 + estado.regrasCriadas.length).padStart(2, '0')}`, status: 'Ativa', ultimaExecucao: 'Agora' },
        ],
        toasts: empilharToast(estado, {
          titulo: 'Configuração criada',
          descricao: `${dados.nome} ativa no motor de regras.`,
          tone: 'success',
        }),
      })),

    notificacoesLidas: false,
    marcarNotificacoesLidas: () => set({ notificacoesLidas: true }),

    pendencias: 12,
    aprovados: [],
    rejeitados: [],
    executados: [],
    aprovarAlerta: (id) =>
      set((estado) => {
        if (jaResolvido(estado, id)) return estado
        return {
          aprovados: [...estado.aprovados, id],
          pendencias: Math.max(0, estado.pendencias - 1),
          toasts: empilharToast(estado, {
            titulo: 'Aprovado',
            descricao: 'Encaminhado ao Agente de Execução.',
            tone: 'success',
          }),
        }
      }),
    rejeitarAlerta: (id, motivo) =>
      set((estado) => {
        if (jaResolvido(estado, id)) return estado
        return {
          rejeitados: [...estado.rejeitados, { id, motivo }],
          pendencias: Math.max(0, estado.pendencias - 1),
          toasts: empilharToast(estado, {
            titulo: 'Rejeitado',
            descricao: 'Registrado na trilha de auditoria.',
            tone: 'neutral',
          }),
        }
      }),
    executarAcao: (id) =>
      set((estado) => {
        if (estado.executados.includes(id)) return estado
        const resolviaPendencia = !jaResolvido(estado, id)
        return {
          executados: [...estado.executados, id],
          pendencias: resolviaPendencia ? Math.max(0, estado.pendencias - 1) : estado.pendencias,
          toasts: empilharToast(estado, {
            titulo: 'Ação executada',
            descricao: `${id} em execução — acompanhe o resultado na tela de origem.`,
            tone: 'success',
          }),
        }
      }),

    cenarioAtivo: 'cenario-base',
    aplicarCenario: (id) =>
      set((estado) => {
        const nome = cenarioPorId(id)?.nome ?? id
        // A aprovação do cenário resolve uma pendência — apenas na primeira vez.
        const jaAprovado = estado.aprovados.includes(id)
        return {
          cenarioAtivo: id,
          aprovados: jaAprovado ? estado.aprovados : [...estado.aprovados, id],
          pendencias: jaAprovado ? estado.pendencias : Math.max(0, estado.pendencias - 1),
          toasts: empilharToast(estado, {
            titulo: `${nome} aplicado ao plano`,
            descricao: 'Sequenciamento e planejamento recalculados para a semana 20 – 26/mai.',
            tone: 'success',
          }),
        }
      }),

    sequenciaOtimizada: false,
    otimizarSequencia: () =>
      set((estado) => ({
        sequenciaOtimizada: true,
        toasts: empilharToast(estado, {
          titulo: 'Sequência otimizada',
          descricao: '−3 setups · +10,7 h de capacidade · ganho estimado de R$ 210 mil.',
          tone: 'success',
        }),
      })),
    desfazerOtimizacao: () =>
      set((estado) => ({
        sequenciaOtimizada: false,
        toasts: empilharToast(estado, {
          titulo: 'Otimização desfeita',
          descricao: 'O Gantt voltou à sequência vigente.',
          tone: 'neutral',
        }),
      })),

    simuladorAberto: false,
    simuladorEventoId: null,
    abrirSimulador: (eventoId) => set({ simuladorAberto: true, simuladorEventoId: eventoId ?? null }),
    fecharSimulador: () => set({ simuladorAberto: false, simuladorEventoId: null }),

    conversas: {},
    registrarMensagem: (tela, mensagem) => {
      const completa: MensagemCopilot = { ...mensagem, id: ++sequenciaMensagem }
      set((estado) => ({
        conversas: {
          ...estado.conversas,
          [tela]: [...(estado.conversas[tela] ?? []), completa],
        },
      }))
      return completa
    },

    toasts: [],
    addToast: (toast) => set((estado) => ({ toasts: empilharToast(estado, toast) })),
    mostrarToast: (toast) => set((estado) => ({ toasts: empilharToast(estado, toast) })),
    descartarToast: (id) =>
      set((estado) => ({ toasts: estado.toasts.filter((toast) => toast.id !== id) })),
  }
})
