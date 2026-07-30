import { serieHoraria } from '@/lib/series'
import { TURNO_A_INICIO } from './constants'
import type {
  DetalheExecucaoOrdem,
  ExecucaoLinha,
  ItemProntidaoOperacional,
  MotivoParada,
  PontoProducaoHora,
} from './types'

/**
 * Telemetria do Turno A (19/mai, 06:00 – 14:00) em Anápolis — fonte da tela
 * /execucao. Agora simulado: 10:18; buckets a partir de 11:00 ainda não
 * decorreram (real = null).
 */

const hj = (hora: number, minuto = 0) => new Date(2025, 4, 19, hora, minuto)

/** Índice do último bucket horário já decorrido (06→10h = índices 0–4). */
const ULTIMO_BUCKET_DECORRIDO = 4

function serieProducaoHora(seed: string, base: number, meta: number, parada: boolean): PontoProducaoHora[] {
  const pontos = serieHoraria(seed, TURNO_A_INICIO, { horas: 8, base, ruido: 0.05, decimais: 0, min: 0 })
  return pontos.map((ponto, indice) => ({
    label: ponto.label,
    real: indice > ULTIMO_BUCKET_DECORRIDO ? null : parada ? 0 : ponto.valor,
    meta,
  }))
}

/** As 5 linhas de Anápolis com a ordem-âncora corrente de cada uma. */
export const linhasExecucao: ExecucaoLinha[] = [
  { linhaId: 'L12', ordemId: 'OF-045678', statusExecucao: 'Normal', oeeTurno: 81.2, terminoPrevisto: hj(13, 45), turno: 'Turno A' },
  { linhaId: 'L08', ordemId: 'OF-045679', statusExecucao: 'Atenção', oeeTurno: 52.4, terminoPrevisto: hj(13, 20), turno: 'Turno A' },
  { linhaId: 'L03', ordemId: 'OF-045680', statusExecucao: 'Normal', oeeTurno: 88.1, terminoPrevisto: hj(12, 40), turno: 'Turno A' },
  { linhaId: 'L05', ordemId: 'OF-045681', statusExecucao: 'Microparadas', oeeTurno: 68.9, terminoPrevisto: hj(13, 55), turno: 'Turno A' },
  { linhaId: 'L15', ordemId: 'OF-045682', statusExecucao: 'Parada', oeeTurno: 0, terminoPrevisto: hj(14, 0), turno: 'Turno A' },
]

/** Detalhe operacional por ordem — alimenta o card "Acompanhamento da Ordem Atual". */
export const detalhesExecucao: Record<string, DetalheExecucaoOrdem> = {
  'OF-045678': {
    ordemId: 'OF-045678',
    loteId: '2456789A',
    inicio: hj(8, 5),
    terminoPrevisto: hj(13, 45),
    eficienciaPercent: 82.3,
    eficienciaDeltaPP: 3.2,
    setupMinutos: 18,
    setupDeltaMinutos: -12,
    velocidadeRealHora: 325_000,
    velocidadeMetaHora: 360_000,
    yieldPercent: 98.6,
    yieldDeltaPP: 0.8,
    refugoPercent: 0.78,
    refugoDeltaPP: -0.18,
    producaoPorHora: serieProducaoHora('exec-of-045678', 325, 360, false),
  },
  'OF-045679': {
    ordemId: 'OF-045679',
    loteId: '2456791C',
    inicio: hj(6, 12),
    terminoPrevisto: hj(13, 20),
    eficienciaPercent: 61.4,
    eficienciaDeltaPP: -8.2,
    setupMinutos: 24,
    setupDeltaMinutos: 6,
    velocidadeRealHora: 118_000,
    velocidadeMetaHora: 160_000,
    yieldPercent: 97.2,
    yieldDeltaPP: -1.1,
    refugoPercent: 1.84,
    refugoDeltaPP: 0.6,
    producaoPorHora: serieProducaoHora('exec-of-045679', 118, 160, false),
  },
  'OF-045680': {
    ordemId: 'OF-045680',
    loteId: '2456792D',
    inicio: hj(6, 30),
    terminoPrevisto: hj(12, 40),
    eficienciaPercent: 88.9,
    eficienciaDeltaPP: 1.4,
    setupMinutos: 20,
    setupDeltaMinutos: -4,
    velocidadeRealHora: 92_000,
    velocidadeMetaHora: 100_000,
    yieldPercent: 99.1,
    yieldDeltaPP: 0.3,
    refugoPercent: 0.54,
    refugoDeltaPP: -0.1,
    producaoPorHora: serieProducaoHora('exec-of-045680', 92, 100, false),
  },
  'OF-045681': {
    ordemId: 'OF-045681',
    loteId: '2456790B',
    inicio: hj(7, 5),
    terminoPrevisto: hj(13, 55),
    eficienciaPercent: 72.6,
    eficienciaDeltaPP: -4.8,
    setupMinutos: 32,
    setupDeltaMinutos: 8,
    velocidadeRealHora: 132_000,
    velocidadeMetaHora: 170_000,
    yieldPercent: 98.2,
    yieldDeltaPP: -0.4,
    refugoPercent: 1.12,
    refugoDeltaPP: 0.22,
    producaoPorHora: serieProducaoHora('exec-of-045681', 132, 170, false),
  },
  'OF-045682': {
    ordemId: 'OF-045682',
    inicio: hj(6, 0),
    terminoPrevisto: hj(14, 0),
    eficienciaPercent: 0,
    eficienciaDeltaPP: -78,
    setupMinutos: 45,
    setupDeltaMinutos: 15,
    velocidadeRealHora: 0,
    velocidadeMetaHora: 90_000,
    yieldPercent: 0,
    yieldDeltaPP: 0,
    refugoPercent: 0,
    refugoDeltaPP: 0,
    producaoPorHora: serieProducaoHora('exec-of-045682', 0, 90, true),
  },
}

/** Pareto de paradas não planejadas das últimas 8 horas. */
export const motivosParada: MotivoParada[] = [
  { motivo: 'Falta de material', minutos: 42, percent: 28 },
  { motivo: 'Microparadas', minutos: 35, percent: 24 },
  { motivo: 'Setup prolongado', minutos: 28, percent: 19 },
  { motivo: 'Ajuste de máquina', minutos: 23, percent: 15 },
  { motivo: 'Inspeção de qualidade', minutos: 12, percent: 8 },
  { motivo: 'Outros', minutos: 10, percent: 6 },
]

/** Total do pareto — exibido no rodapé do card. */
export const TOTAL_PARADAS_MIN = 150

/** Checklist de prontidão operacional do turno. */
export const prontidaoOperacional: ItemProntidaoOperacional[] = [
  { item: 'Material disponível', situacao: 'OK', percent: 100 },
  { item: 'Lote liberado (QA)', situacao: 'OK', percent: 98 },
  { item: 'Embalagem disponível', situacao: 'OK', percent: 100 },
  { item: 'Inspeção em andamento', situacao: 'OK', percent: 100 },
  { item: 'Manutenção preventiva', situacao: 'Em dia', percent: 100 },
]

/** Tempo decorrido do Turno A ao carregar a tela: 04:27:18. */
export const TURNO_DECORRIDO_INICIAL_SEG = 4 * 3600 + 27 * 60 + 18
/** Duração total do turno em segundos (8 h). */
export const TURNO_DURACAO_SEG = 8 * 3600
