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

/** "Agora" da simulação — referência da hora relativa do rodapé ("há 2 min"). */
export const AGORA = new Date(2025, 4, 19, 10, 20)

/** Semana de planejamento: 20–26/mai/2025. */
export const SEMANA_PLANEJAMENTO_INICIO = new Date(2025, 4, 20)
export const SEMANA_PLANEJAMENTO_FIM = new Date(2025, 4, 26)

export const FABRICAS = ['Anápolis', 'Goiânia', 'Jacareí'] as const
/** Nome de fábrica usado nos filtros globais (a entidade Fabrica vive em types.ts). */
export type NomeFabrica = (typeof FABRICAS)[number]

export const AREAS = [
  'Todas as áreas',
  'Compressão',
  'Revestimento',
  'Embalagem',
  'Granulação',
  'Envase',
] as const
export type Area = (typeof AREAS)[number]

/** Área de produção concreta (sem o agregador "Todas as áreas"). */
export type AreaProducao = Exclude<Area, 'Todas as áreas'>

/**
 * Área de produção de cada linha — base do filtro de área dos seletores.
 * Derivada do tipo da linha: Comprimidos → Compressão · Drágeas → Revestimento ·
 * Sólidos → Granulação · Cápsulas/Semissólidos/Líquidos → Envase ·
 * Pó/Sachês → Embalagem.
 */
export const AREA_POR_LINHA: Record<string, AreaProducao> = {
  L03: 'Envase',
  L05: 'Revestimento',
  L08: 'Granulação',
  L12: 'Compressão',
  L15: 'Embalagem',
  P23: 'Granulação',
  P24: 'Envase',
  P25: 'Envase',
  P26: 'Granulação',
  P27: 'Envase',
  P28: 'Granulação',
  P29: 'Embalagem',
  P30: 'Compressão',
}

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

/** Faixa de datas de cada opção de período, ancorada em 19/mai/2025. */
export function faixaDoPeriodo(periodo: Periodo): { inicio: Date; fim: Date } {
  switch (periodo) {
    case 'Turno atual':
      return { inicio: TURNO_A_INICIO, fim: TURNO_A_FIM }
    case 'Hoje':
      return { inicio: new Date(2025, 4, 19, 0, 0), fim: new Date(2025, 4, 19, 23, 59) }
    case 'Últimos 7 dias':
      return { inicio: new Date(2025, 4, 13, 0, 0), fim: new Date(2025, 4, 19, 23, 59) }
    case 'Últimos 30 dias':
      return { inicio: new Date(2025, 3, 20, 0, 0), fim: new Date(2025, 4, 19, 23, 59) }
    case 'Semana de planejamento':
      return { inicio: SEMANA_PLANEJAMENTO_INICIO, fim: new Date(2025, 4, 26, 23, 59) }
  }
}
