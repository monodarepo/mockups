import type { Lote } from './types'

const hj = (hora: number, minuto = 0) => new Date(2025, 4, 19, hora, minuto)

/** Fila de QA em 19/mai/2025, 10:18. */
export const lotes: Lote[] = [
  {
    id: '2456789A',
    produtoId: 'buscopan-composto',
    linhaId: 'L12',
    ordemId: 'OF-045678',
    status: 'Em análise',
    prioridade: 'Alta',
    esperaMinutos: 138, // 2h18
    inicio: hj(6, 15),
    proximaAcao: 'Revisar resultados',
    analista: 'QA Físico-químico',
    parametros: [
      { nome: 'Peso médio', valor: '401,2 mg', faixa: '380 – 420 mg', situacao: 'Dentro da faixa' },
      { nome: 'Dureza', valor: '9,2 Kgf', faixa: '6 – 12 Kgf', situacao: 'Dentro da faixa' },
      { nome: 'Umidade', valor: '2,8%', faixa: '≤ 3,5%', situacao: 'Dentro da faixa' },
      { nome: 'Inspeção visual', valor: 'Conforme', faixa: 'Conforme', situacao: 'Dentro da faixa' },
    ],
    documentos: [
      { nome: 'CoA', status: 'Recebido' },
      { nome: 'Laudo', status: 'Pendente' },
      { nome: 'Relatório de Produção', status: 'Recebido' },
      { nome: 'Protocolo de Limpeza', status: 'Recebido' },
    ],
  },
  {
    id: '2456790B',
    produtoId: 'dorflex',
    linhaId: 'L05',
    ordemId: 'OF-045681',
    status: 'Aguardando documentação',
    prioridade: 'Média',
    esperaMinutos: 65,
    inicio: hj(7, 5),
    proximaAcao: 'Enviar CoA',
    analista: 'QA Documentação',
    observacao: 'Relatório de produção pendente de assinatura do supervisor.',
  },
  {
    id: '2456791C',
    produtoId: 'neosaldina',
    linhaId: 'L08',
    ordemId: 'OF-045679',
    status: 'Em investigação',
    prioridade: 'Alta',
    esperaMinutos: 212, // 3h32
    inicio: hj(6, 12),
    proximaAcao: 'Investigar desvio',
    analista: 'QA Investigação',
    observacao: 'Variação de peso próxima ao limite superior — mesma causa das microparadas da L08.',
  },
  {
    id: '2456792D',
    produtoId: 'benegrip-multi',
    linhaId: 'L03',
    ordemId: 'OF-045680',
    status: 'Liberado',
    prioridade: 'Média',
    resultado: 'Aprovado',
    inicio: hj(6, 30),
    proximaAcao: 'Liberar lote',
    analista: 'QA Liberação',
    observacao: 'Liberado às 09:40 sem desvios.',
  },
  {
    id: '2456793E',
    produtoId: 'apracur',
    linhaId: 'L03',
    status: 'Bloqueado',
    prioridade: 'Alta',
    esperaMinutos: 347, // 5h47
    resultado: 'Reprovado',
    inicio: hj(4, 40),
    proximaAcao: 'Tratar desvio',
    analista: 'QA Investigação',
    observacao: 'Teor fora da especificação — investigação de causa raiz aberta.',
  },
  {
    id: '2456794F',
    produtoId: 'addera-d3',
    linhaId: 'L03',
    status: 'Em análise',
    prioridade: 'Baixa',
    esperaMinutos: 48,
    inicio: hj(8, 20),
    proximaAcao: 'Revisar resultados',
    analista: 'QA Liberação',
  },
]

export function lotePorId(id: string): Lote | undefined {
  return lotes.find((lote) => lote.id === id)
}

// ── Dados da tela /qualidade ─────────────────────────────────────────────────

import { serieHoraria } from '@/lib/series'
import type { AreaQualidade, DesvioRanking, PontoTendenciaQualidade } from './types'

/** Índice de qualidade por área — Normal ≥90 · Atenção 80–89 · Crítico <80. */
export const mapaQualidadeAreas: AreaQualidade[] = [
  { area: 'Compressão L12', percent: 92 },
  { area: 'Sólidos L08', percent: 86 },
  { area: 'Cápsulas L03', percent: 94 },
  { area: 'Revestimento L05', percent: 78 },
  { area: 'Embalagem L15', percent: 91 },
  { area: 'Laboratório QA', percent: 95 },
]

export function statusDaAreaQualidade(percent: number): 'Normal' | 'Atenção' | 'Crítico' {
  if (percent >= 90) return 'Normal'
  if (percent >= 80) return 'Atenção'
  return 'Crítico'
}

/** Ranking de desvios e não conformidades dos últimos 7 dias. */
export const desviosRanking: DesvioRanking[] = [
  { id: 'DSV-01', desvio: 'Peso fora da faixa', severidade: 'Alta', quantidade: 27, percent: 28 },
  { id: 'DSV-02', desvio: 'Atraso de liberação', severidade: 'Média', quantidade: 19, percent: 20 },
  { id: 'DSV-03', desvio: 'Falha de inspeção visual', severidade: 'Alta', quantidade: 16, percent: 17 },
  { id: 'DSV-04', desvio: 'Variação de dureza', severidade: 'Média', quantidade: 12, percent: 13 },
  { id: 'DSV-05', desvio: 'Documentação incompleta', severidade: 'Média', quantidade: 9, percent: 9 },
  { id: 'DSV-06', desvio: 'Microparadas com impacto em qualidade', severidade: 'Baixa', quantidade: 6, percent: 6 },
]

/** Checklist de prontidão de qualidade. */
export const prontidaoQualidade = [
  { item: 'Laboratório', percent: 98 },
  { item: 'Documentação', percent: 96 },
  { item: 'Materiais', percent: 88 },
  { item: 'Calibração', percent: 93 },
  { item: 'Limpeza', percent: 94 },
  { item: 'Treinamento', percent: 90 },
]

export const PRONTIDAO_QUALIDADE_SCORE = 92

const serieAprovacao = serieHoraria('qualidade-aprovacao-24h', new Date(2025, 4, 18, 11, 0), {
  horas: 24,
  base: 97.4,
  ruido: 0.008,
  decimais: 1,
  min: 95,
  max: 99.5,
})
const serieDesvios = serieHoraria('qualidade-desvios-24h', new Date(2025, 4, 18, 11, 0), {
  horas: 24,
  base: 1.4,
  ruido: 0.6,
  decimais: 0,
  min: 0,
  max: 4,
})
const serieLiberados = serieHoraria('qualidade-liberados-24h', new Date(2025, 4, 18, 11, 0), {
  horas: 24,
  base: 1.8,
  ruido: 0.5,
  decimais: 0,
  min: 0,
  max: 4,
})

/** Tendência da qualidade nas últimas 24 h. */
export const tendenciaQualidade24h: PontoTendenciaQualidade[] = serieAprovacao.map((ponto, indice) => ({
  label: ponto.label,
  aprovacao: ponto.valor,
  desvios: serieDesvios[indice].valor,
  liberados: serieLiberados[indice].valor,
}))
