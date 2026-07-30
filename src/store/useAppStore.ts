import { create } from 'zustand'
import { personaPadrao, personas, type Persona } from '@/data/personas'
import {
  TURNO_A_FIM,
  TURNO_A_INICIO,
  type Area,
  type NomeFabrica,
  type Periodo,
  type Turno,
} from '@/data/constants'
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
}

export interface Rejeicao {
  id: string
  motivo: string
}

const filtrosIniciais: Filtros = {
  fabrica: 'Anápolis',
  area: 'Todas as áreas',
  turno: 'Turno A (06:00 – 14:00)',
  periodo: 'Turno atual',
  periodoInicio: TURNO_A_INICIO,
  periodoFim: TURNO_A_FIM,
}

interface AppState {
  // Persona
  persona: Persona
  personas: Persona[]
  setPersona: (id: string) => void

  // Filtros globais (FilterBar lê e grava aqui)
  filtros: Filtros
  setFiltro: <K extends keyof Filtros>(chave: K, valor: Filtros[K]) => void
  resetFiltros: () => void

  // Layout
  sidebarRecolhida: boolean
  alternarSidebar: () => void
  copilotoAberto: boolean
  alternarCopiloto: () => void

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

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  /** Alias mantido pela API original do shell (Header usa mostrarToast). */
  mostrarToast: (toast: Omit<Toast, 'id'>) => void
  descartarToast: (id: number) => void
}

/** Contador determinístico de toasts — evita Math.random e chaves instáveis. */
let sequenciaToast = 0

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
    persona: personaPadrao,
    personas,
    setPersona: (id) =>
      set((estado) => ({ persona: estado.personas.find((p) => p.id === id) ?? estado.persona })),

    filtros: filtrosIniciais,
    setFiltro: (chave, valor) =>
      set((estado) => ({ filtros: { ...estado.filtros, [chave]: valor } })),
    resetFiltros: () => set({ filtros: filtrosIniciais }),

    sidebarRecolhida: false,
    alternarSidebar: () => set((estado) => ({ sidebarRecolhida: !estado.sidebarRecolhida })),
    copilotoAberto: true,
    alternarCopiloto: () => set((estado) => ({ copilotoAberto: !estado.copilotoAberto })),

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
            descricao: `${id} aprovado e enviado para execução.`,
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
            descricao: `${id} rejeitado: ${motivo}`,
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
      set((estado) => ({
        cenarioAtivo: id,
        toasts: empilharToast(estado, {
          titulo: 'Cenário aplicado',
          descricao: 'O plano da semana foi recalculado com o cenário selecionado.',
          tone: 'success',
        }),
      })),

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

    toasts: [],
    addToast: (toast) => set((estado) => ({ toasts: empilharToast(estado, toast) })),
    mostrarToast: (toast) => set((estado) => ({ toasts: empilharToast(estado, toast) })),
    descartarToast: (id) =>
      set((estado) => ({ toasts: estado.toasts.filter((toast) => toast.id !== id) })),
  }
})
