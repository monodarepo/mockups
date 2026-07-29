import { create } from 'zustand'
import { personaPadrao, personas, type Persona } from '@/data/personas'
import {
  TURNO_A_FIM,
  TURNO_A_INICIO,
  type Area,
  type Fabrica,
  type Periodo,
  type Turno,
} from '@/data/constants'
import type { Tone } from '@/lib/colors'

export interface Filtros {
  fabrica: Fabrica
  area: Area
  turno: Turno
  periodo: Periodo
  periodoInicio: Date
  periodoFim: Date
}

export type StatusAprovacao = 'pendente' | 'aprovado' | 'rejeitado'

export interface Toast {
  id: number
  titulo: string
  descricao?: string
  tone: Tone
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

  // Filtros globais
  filtros: Filtros
  setFiltro: <K extends keyof Filtros>(chave: K, valor: Filtros[K]) => void
  resetFiltros: () => void

  // Layout
  sidebarRecolhida: boolean
  alternarSidebar: () => void
  copilotoAberto: boolean
  alternarCopiloto: () => void

  // Decisões
  pendencias: number
  setPendencias: (valor: number) => void
  aprovacoes: Record<string, StatusAprovacao>
  registrarAprovacao: (id: string, status: StatusAprovacao) => void

  // Cenário do gêmeo digital
  cenarioAtivo: string
  setCenarioAtivo: (id: string) => void

  // Toasts
  toasts: Toast[]
  mostrarToast: (toast: Omit<Toast, 'id'>) => void
  descartarToast: (id: number) => void
}

/** Contador determinístico de toasts — evita Math.random e chaves instáveis. */
let sequenciaToast = 0

export const useAppStore = create<AppState>((set) => ({
  persona: personaPadrao,
  personas,
  setPersona: (id) =>
    set((estado) => ({ persona: estado.personas.find((p) => p.id === id) ?? estado.persona })),

  filtros: filtrosIniciais,
  setFiltro: (chave, valor) => set((estado) => ({ filtros: { ...estado.filtros, [chave]: valor } })),
  resetFiltros: () => set({ filtros: filtrosIniciais }),

  sidebarRecolhida: false,
  alternarSidebar: () => set((estado) => ({ sidebarRecolhida: !estado.sidebarRecolhida })),
  copilotoAberto: true,
  alternarCopiloto: () => set((estado) => ({ copilotoAberto: !estado.copilotoAberto })),

  pendencias: 12,
  setPendencias: (valor) => set({ pendencias: Math.max(0, valor) }),
  aprovacoes: {},
  registrarAprovacao: (id, status) =>
    set((estado) => {
      const anterior = estado.aprovacoes[id] ?? 'pendente'
      const resolvia = anterior === 'pendente' && status !== 'pendente'
      return {
        aprovacoes: { ...estado.aprovacoes, [id]: status },
        pendencias: resolvia ? Math.max(0, estado.pendencias - 1) : estado.pendencias,
      }
    }),

  cenarioAtivo: 'cenario-base',
  setCenarioAtivo: (id) => set({ cenarioAtivo: id }),

  toasts: [],
  mostrarToast: (toast) =>
    set((estado) => ({ toasts: [...estado.toasts, { ...toast, id: ++sequenciaToast }] })),
  descartarToast: (id) => set((estado) => ({ toasts: estado.toasts.filter((t) => t.id !== id) })),
}))
