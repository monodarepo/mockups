/**
 * Linha do tempo única da simulação e vocabulário base do universo de dados.
 * Nenhuma tela usa outra data-base.
 */

/** Hoje na simulação: 19/mai/2025. */
export const HOJE = new Date(2025, 4, 19)

/** Início do Turno A: 19/mai/2025 06:00. */
export const TURNO_A_INICIO = new Date(2025, 4, 19, 6, 0)

/** Fim do Turno A: 19/mai/2025 14:00. */
export const TURNO_A_FIM = new Date(2025, 4, 19, 14, 0)

/** Carimbo do rodapé: 19/05/2025 10:18. */
export const ATUALIZADO_EM = new Date(2025, 4, 19, 10, 18)

/** Semana de planejamento: 20–26/mai/2025. */
export const SEMANA_PLANEJAMENTO_INICIO = new Date(2025, 4, 20)
export const SEMANA_PLANEJAMENTO_FIM = new Date(2025, 4, 26)

export const FABRICAS = ['Anápolis', 'Goiânia', 'Jacareí'] as const
export type Fabrica = (typeof FABRICAS)[number]

export const AREAS = [
  'Todas as áreas',
  'Compressão',
  'Revestimento',
  'Embalagem',
  'Granulação',
  'Envase',
] as const
export type Area = (typeof AREAS)[number]

export const TURNOS = [
  'Turno A (06:00 – 14:00)',
  'Turno B (14:00 – 22:00)',
  'Turno C (22:00 – 06:00)',
] as const
export type Turno = (typeof TURNOS)[number]

export const PERIODOS = [
  'Turno atual',
  'Hoje',
  'Últimos 7 dias',
  'Últimos 30 dias',
  'Semana de planejamento',
] as const
export type Periodo = (typeof PERIODOS)[number]
