import { linhas } from './fabricas'
import type { CampanhaCalendario, CoberturaFabrica, PlanoLinha, SemanaCarga, SkuRisco } from './types'

/**
 * Dados do horizonte de planejamento (semanas W21–W25, 20/mai – 23/jun).
 * A sobrecarga da W24 vem da L12 — mesmo fio da compressora/Ibuprofeno.
 */

export const SEMANAS_PLANEJAMENTO = ['W21', 'W22', 'W23', 'W24', 'W25'] as const

/** Capacidade disponível semanal em horas (linha tracejada do gráfico). */
export const CAPACIDADE_DISPONIVEL_H = 1_800

export const cargaVsCapacidade: SemanaCarga[] = [
  { semana: 'W21', faixa: '20 – 26/mai', carga: 1_620, adicional: 120, excedente: 0 },
  { semana: 'W22', faixa: '27/mai – 02/jun', carga: 1_665, adicional: 135, excedente: 0 },
  { semana: 'W23', faixa: '03 – 09/jun', carga: 1_730, adicional: 70, excedente: 0 },
  { semana: 'W24', faixa: '10 – 16/jun', carga: 1_700, adicional: 100, excedente: 120 },
  { semana: 'W25', faixa: '17 – 23/jun', carga: 1_540, adicional: 110, excedente: 0 },
]

/** Cobertura de estoque projetada (dias) por fábrica × semana. */
export const coberturaEstoque: CoberturaFabrica[] = [
  { fabrica: 'Anápolis', valores: [28.7, 27.3, 25.1, 21.4, 19.8] },
  { fabrica: 'Itapecerica', valores: [26.2, 25.8, 24.0, 22.7, 21.2] },
  { fabrica: 'Pouso Alegre', valores: [31.3, 30.4, 28.6, 25.0, 22.3] },
  { fabrica: 'Goiânia', valores: [22.5, 21.7, 19.1, 16.8, 15.2] },
  { fabrica: 'Total', valores: [27.2, 26.1, 24.2, 21.5, 19.6], total: true },
]

const dt = (dia: number) => new Date(2025, 4, dia)

/** Amostra dos 18 SKUs em risco de ruptura nas próximas 2 semanas. */
export const skusRisco: SkuRisco[] = [
  { codigo: '101.123', produto: 'Buscopan Composto', fabrica: 'Anápolis', risco: 'Alto', ruptura: dt(25) },
  { codigo: '105.456', produto: 'Neosaldina', fabrica: 'Goiânia', risco: 'Alto', ruptura: dt(26) },
  { codigo: '202.789', produto: 'Benegrip Multi', fabrica: 'Pouso Alegre', risco: 'Médio', ruptura: dt(27) },
  { codigo: '303.246', produto: 'Dorflex', fabrica: 'Itapecerica', risco: 'Médio', ruptura: dt(28) },
  { codigo: '404.135', produto: 'Benegripe', fabrica: 'Anápolis', risco: 'Médio', ruptura: dt(29) },
]

/** Total de SKUs em risco no horizonte — o card mostra os 5 primeiros. */
export const TOTAL_SKUS_RISCO = 18

/** Fatores semanais fixos — horas por linha derivadas da capacidade utilizada. */
const FATORES_SEMANA = [0.98, 1.0, 1.02, 1.06, 0.94] as const

/** Plano de horas por linha × semana (tab "Plano por Linha"). */
export const planoPorLinha: PlanoLinha[] = linhas.map((linha) => ({
  linhaId: linha.id,
  horas: FATORES_SEMANA.map((fator) => Math.round(1.68 * linha.capacidadeUtilizada * fator)),
}))

/** Aderência ao plano por ordem em execução; ordens planejadas ainda não medem. */
export const aderenciaPorOrdem: Record<string, number> = {
  'OF-045678': 96,
  'OF-045679': 45,
  'OF-045680': 98,
  'OF-045681': 72,
  'OF-045682': 0,
}

/** Calendário de campanhas por família × semana (tab "Calendário de Campanhas"). */
export const calendarioCampanhas: CampanhaCalendario[] = [
  { familia: 'Analgésicos', semana: 'W21', rotulo: 'Buscopan — L12' },
  { familia: 'Analgésicos', semana: 'W21', rotulo: 'Neosaldina — L08' },
  { familia: 'Analgésicos', semana: 'W22', rotulo: 'Novalgina — L08' },
  { familia: 'Analgésicos', semana: 'W23', rotulo: 'Dorflex — P28' },
  { familia: 'Analgésicos', semana: 'W24', rotulo: 'Buscopan — P30' },
  { familia: 'Analgésicos', semana: 'W25', rotulo: 'Neosaldina — L08' },
  { familia: 'Antigripais', semana: 'W21', rotulo: 'Benegrip Multi — L03' },
  { familia: 'Antigripais', semana: 'W21', rotulo: 'Benegripe — P23' },
  { familia: 'Antigripais', semana: 'W22', rotulo: 'Apracur — L03' },
  { familia: 'Antigripais', semana: 'W24', rotulo: 'Benegrip Multi — P23' },
  { familia: 'Antitérmicos', semana: 'W21', rotulo: 'Tylenol — L05' },
  { familia: 'Antitérmicos', semana: 'W21', rotulo: 'Advil — L08' },
  { familia: 'Antitérmicos', semana: 'W23', rotulo: 'Tylenol — P26' },
  { familia: 'Antitérmicos', semana: 'W25', rotulo: 'Advil — L08' },
  { familia: 'Vitaminas', semana: 'W21', rotulo: 'Addera D3 — L03' },
  { familia: 'Vitaminas', semana: 'W23', rotulo: 'Addera D3 — L03' },
  { familia: 'Vitaminas', semana: 'W25', rotulo: 'Addera D3 — P25' },
  { familia: 'Outros', semana: 'W21', rotulo: 'Rinosoro — L15' },
  { familia: 'Outros', semana: 'W22', rotulo: 'Rinosoro — L15' },
  { familia: 'Outros', semana: 'W24', rotulo: 'Rinosoro — P29' },
]

/** Total exibido no título do card de ordens — a tabela mostra a amostra de 14. */
export const TOTAL_ORDENS_PLANEJADAS = 142
