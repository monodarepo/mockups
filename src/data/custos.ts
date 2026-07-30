import type {
  ComposicaoCusto,
  DriverCusto,
  ItemProntidaoFinanceira,
  OrdemImpactoFinanceiro,
  PerformanceLinha,
  PontoFinanceiroHora,
} from './types'

/**
 * Dados da tela /custos — visão financeira do Turno A (06:00 – 14:00) de
 * 19/mai/2025. Valores horários em R$ mil; acumulados: custo real R$ 2,48 mi,
 * orçado R$ 2,56 mi (diferença −R$ 78 mil), margem R$ 790 mil (31,8%).
 */
export const visaoFinanceiraTurno: PontoFinanceiroHora[] = [
  { label: '06:00', custoReal: 285, custoOrcado: 320, margem: 92 },
  { label: '07:00', custoReal: 296, custoOrcado: 320, margem: 95 },
  { label: '08:00', custoReal: 310, custoOrcado: 320, margem: 99 },
  { label: '09:00', custoReal: 342, custoOrcado: 320, margem: 108 },
  { label: '10:00', custoReal: 328, custoOrcado: 320, margem: 104 },
  { label: '11:00', custoReal: 316, custoOrcado: 320, margem: 101 },
  { label: '12:00', custoReal: 303, custoOrcado: 320, margem: 97 },
  { label: '13:00', custoReal: 302, custoOrcado: 320, margem: 94 },
]

/** Composição do custo industrial do turno (R$ 2,48 mi). */
export const composicaoCustos: ComposicaoCusto[] = [
  { id: 'cc-mp', categoria: 'Matéria-prima', percent: 40.2, valor: 997_000 },
  { id: 'cc-emb', categoria: 'Embalagem', percent: 18.9, valor: 469_000 },
  { id: 'cc-mo', categoria: 'Mão de obra', percent: 15.3, valor: 379_000 },
  { id: 'cc-energia', categoria: 'Energia', percent: 9.8, valor: 243_000 },
  { id: 'cc-manutencao', categoria: 'Manutenção', percent: 6.7, valor: 166_000 },
  { id: 'cc-perdas', categoria: 'Perdas e Refugo', percent: 5.9, valor: 146_000 },
  { id: 'cc-logistica', categoria: 'Logística interna', percent: 3.2, valor: 79_000 },
]

/** Top 6 drivers de custo e desvios do turno. */
export const driversCusto: DriverCusto[] = [
  { id: 'dc-refugo', driver: 'Perdas por refugo', valor: 146_000, percent: 24 },
  { id: 'dc-setup', driver: 'Setup prolongado', valor: 118_000, percent: 19 },
  { id: 'dc-energia', driver: 'Consumo de energia', valor: 98_000, percent: 16 },
  { id: 'dc-microparadas', driver: 'Microparadas', valor: 71_000, percent: 12 },
  { id: 'dc-retrabalho', driver: 'Retrabalho', valor: 42_000, percent: 7 },
  { id: 'dc-especificacao', driver: 'Material fora de especificação', valor: 23_000, percent: 4 },
]

/** Performance financeira por linha — média dos últimos 7 dias. */
export const performancePorLinha: PerformanceLinha[] = [
  { linhaId: 'L12', custoUnidade: 1.96, oee: 78.2, yieldPercent: 97.1, refugoPercent: 1.82, situacao: 'Crítico', impactoFinanceiro: -210_000 },
  { linhaId: 'L08', custoUnidade: 1.73, oee: 72.1, yieldPercent: 96.3, refugoPercent: 2.18, situacao: 'Atenção', impactoFinanceiro: -168_000 },
  { linhaId: 'L03', custoUnidade: 1.65, oee: 85.6, yieldPercent: 98.7, refugoPercent: 1.05, situacao: 'Normal', impactoFinanceiro: 96_000 },
  { linhaId: 'L05', custoUnidade: 1.58, oee: 68.9, yieldPercent: 97.9, refugoPercent: 1.42, situacao: 'Atenção', impactoFinanceiro: -82_000 },
  { linhaId: 'L15', custoUnidade: 1.41, oee: 88.4, yieldPercent: 99.1, refugoPercent: 0.72, situacao: 'Normal', impactoFinanceiro: 64_000 },
]

/** Prontidão financeira do turno. */
export const prontidaoFinanceira: ItemProntidaoFinanceira[] = [
  { item: 'Orçamento do Turno', valor: 'R$ 2,56 mi' },
  { item: 'Custos Variáveis', valor: 'R$ 1,78 mi' },
  { item: 'Custos Fixos', valor: 'R$ 0,70 mi' },
  { item: 'Energia (consumo)', valor: 'R$ 243 mil' },
  { item: 'Produtividade (unid.)', valor: '1.256.840' },
]

export const PRONTIDAO_FINANCEIRA_SCORE = 84
export const PRONTIDAO_FINANCEIRA_DELTA_PP = 5

/**
 * Ordens-âncora com maior impacto financeiro no turno. A aderência reproduz
 * aderenciaPorOrdem (planejamento) — mesma leitura em todas as telas.
 */
export const ordensImpactoFinanceiro: OrdemImpactoFinanceiro[] = [
  { ordemId: 'OF-045678', custoReal: 512_000, custoOrcado: 468_000, margemPercent: 24.6, impactoFinanceiro: -118_000, aderenciaPercent: 96, aderenciaDeltaPP: -2 },
  { ordemId: 'OF-045682', custoReal: 148_000, custoOrcado: 121_000, margemPercent: 12.8, impactoFinanceiro: -96_000, aderenciaPercent: 0, aderenciaDeltaPP: -76 },
  { ordemId: 'OF-045679', custoReal: 396_000, custoOrcado: 358_000, margemPercent: 22.4, impactoFinanceiro: -74_000, aderenciaPercent: 45, aderenciaDeltaPP: -22 },
  { ordemId: 'OF-045680', custoReal: 289_000, custoOrcado: 301_000, margemPercent: 34.2, impactoFinanceiro: 52_000, aderenciaPercent: 98, aderenciaDeltaPP: 2 },
  { ordemId: 'OF-045681', custoReal: 246_000, custoOrcado: 232_000, margemPercent: 27.5, impactoFinanceiro: -38_000, aderenciaPercent: 72, aderenciaDeltaPP: -8 },
]
