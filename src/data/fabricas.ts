import type { Fabrica, Linha, StatusLinha } from './types'

/**
 * Fábricas e linhas da Hypera. Os IDs de linha (L03, P23…) são referenciados
 * por ordens, blocos de sequência, materiais, lotes, equipamentos e alertas.
 */
export const fabricas: Fabrica[] = [
  {
    id: 'anapolis',
    nome: 'Anápolis',
    uf: 'GO',
    linhas: [
      { id: 'L03', nome: 'L03 — Cápsulas', tipo: 'Cápsulas', fabricaId: 'anapolis', capacidadeUtilizada: 85, oee: 82, status: 'normal' },
      { id: 'L05', nome: 'L05 — Drágeas', tipo: 'Drágeas', fabricaId: 'anapolis', capacidadeUtilizada: 90, oee: 85, status: 'normal' },
      { id: 'L08', nome: 'L08 — Sólidos', tipo: 'Sólidos', fabricaId: 'anapolis', capacidadeUtilizada: 88, oee: 52, status: 'atencao' },
      { id: 'L12', nome: 'L12 — Comprimidos', tipo: 'Comprimidos', fabricaId: 'anapolis', capacidadeUtilizada: 92, oee: 71, status: 'critico' },
      { id: 'L15', nome: 'L15 — Pó', tipo: 'Pó', fabricaId: 'anapolis', capacidadeUtilizada: 78, oee: 0, status: 'parada' },
    ],
  },
  {
    id: 'goiania',
    nome: 'Goiânia',
    uf: 'GO',
    linhas: [
      { id: 'P23', nome: 'P23 — Sólidos', tipo: 'Sólidos', fabricaId: 'goiania', capacidadeUtilizada: 88, oee: 84, status: 'normal' },
      { id: 'P24', nome: 'P24 — Semissólidos', tipo: 'Semissólidos', fabricaId: 'goiania', capacidadeUtilizada: 74, oee: 69, status: 'atencao' },
      { id: 'P25', nome: 'P25 — Cápsulas', tipo: 'Cápsulas', fabricaId: 'goiania', capacidadeUtilizada: 85, oee: 81, status: 'normal' },
      { id: 'P26', nome: 'P26 — Sólidos', tipo: 'Sólidos', fabricaId: 'goiania', capacidadeUtilizada: 90, oee: 86, status: 'normal' },
    ],
  },
  {
    id: 'jacarei',
    nome: 'Jacareí',
    uf: 'SP',
    linhas: [
      { id: 'P27', nome: 'P27 — Líquidos', tipo: 'Líquidos', fabricaId: 'jacarei', capacidadeUtilizada: 45, oee: 41, status: 'critico' },
      { id: 'P28', nome: 'P28 — Sólidos', tipo: 'Sólidos', fabricaId: 'jacarei', capacidadeUtilizada: 62, oee: 58, status: 'atencao' },
      { id: 'P29', nome: 'P29 — Sachês', tipo: 'Sachês', fabricaId: 'jacarei', capacidadeUtilizada: 70, oee: 66, status: 'normal' },
      { id: 'P30', nome: 'P30 — Comprimidos', tipo: 'Comprimidos', fabricaId: 'jacarei', capacidadeUtilizada: 76, oee: 72, status: 'normal' },
    ],
  },
]

/** Todas as linhas, em lista plana. */
export const linhas: Linha[] = fabricas.flatMap((fabrica) => fabrica.linhas)

/** Rótulo de exibição de cada status de linha. */
export const rotuloStatusLinha: Record<StatusLinha, string> = {
  normal: 'Normal',
  atencao: 'Atenção',
  critico: 'Crítico',
  parada: 'Parada',
}

/** Status agregado exibido no card da fábrica no mapa. */
export function statusDaFabrica(fabrica: Fabrica): 'Operação normal' | 'Atenção necessária' {
  const temProblema = fabrica.linhas.some((linha) => linha.status === 'critico' || linha.status === 'parada')
  return temProblema ? 'Atenção necessária' : 'Operação normal'
}

export function fabricaPorId(id: string): Fabrica | undefined {
  return fabricas.find((fabrica) => fabrica.id === id)
}

export function linhaPorId(id: string): Linha | undefined {
  return linhas.find((linha) => linha.id === id)
}
