import type { OrdemManutencao } from './types'

const dt = (dia: number, hora = 0) => new Date(2025, 4, dia, hora)

/** Carteira de OTs — uma por ativo monitorado, IDs OT-245682..OT-245689. */
export const ordensManutencao: OrdemManutencao[] = [
  {
    id: 'OT-245682',
    ativoId: 'eq-hvac-ahu-03',
    tipo: 'Preventiva',
    prioridade: 'Média',
    status: 'Atrasada',
    janelaInicio: dt(21, 8),
    janelaFim: dt(21, 16),
    responsavel: 'Utilidades',
    descricao: 'Preventiva vencida em 12/mai — troca de filtros e aferição do diferencial de pressão. Reprogramada para 21/mai.',
  },
  {
    id: 'OT-245683',
    ativoId: 'eq-esteira-l08',
    tipo: 'Corretiva',
    prioridade: 'Alta',
    status: 'Em execução',
    janelaInicio: dt(19, 10),
    janelaFim: dt(19, 14),
    responsavel: 'Mecânica',
    descricao: 'Ajuste do tensionamento e troca de roletes — origem das microparadas da L08.',
  },
  {
    id: 'OT-245684',
    ativoId: 'eq-bomba-cip-02',
    tipo: 'Inspeção',
    prioridade: 'Baixa',
    status: 'Planejada',
    janelaInicio: dt(23, 8),
    janelaFim: dt(23, 10),
    responsavel: 'Utilidades',
    descricao: 'Inspeção de selo mecânico e verificação de vazão do circuito CIP.',
  },
  {
    id: 'OT-245685',
    ativoId: 'eq-seladora-l15',
    tipo: 'Corretiva',
    prioridade: 'Alta',
    status: 'Aguardando peça',
    janelaInicio: dt(20, 6),
    janelaFim: dt(20, 14),
    responsavel: 'Elétrica',
    descricao: 'Substituição da resistência de selagem — peça com chegada prevista para 20/mai, 06:00.',
  },
  {
    id: 'OT-245686',
    ativoId: 'eq-misturador-m08',
    tipo: 'Preventiva',
    prioridade: 'Média',
    status: 'Planejada',
    janelaInicio: dt(24, 8),
    janelaFim: dt(24, 12),
    responsavel: 'Mecânica',
    descricao: 'Lubrificação dos mancais e verificação de torque do acionamento.',
  },
  {
    id: 'OT-245687',
    ativoId: 'eq-torre-resfriamento',
    tipo: 'Inspeção',
    prioridade: 'Baixa',
    status: 'Concluída',
    janelaInicio: dt(18, 8),
    janelaFim: dt(18, 10),
    responsavel: 'Utilidades',
    descricao: 'Inspeção trimestral de enchimento e ventiladores — sem desvios.',
  },
  {
    id: 'OT-245688',
    ativoId: 'eq-encapsuladora-l03',
    tipo: 'Preditiva',
    prioridade: 'Média',
    status: 'Planejada',
    janelaInicio: dt(25, 6),
    janelaFim: dt(25, 9),
    responsavel: 'Preditiva',
    descricao: 'Análise de vibração dos discos dosadores conforme plano preditivo.',
  },
  {
    id: 'OT-245689',
    ativoId: 'eq-compressora-l12',
    tipo: 'Preditiva',
    prioridade: 'Alta',
    status: 'Aberta',
    janelaInicio: dt(21, 22),
    janelaFim: dt(22, 4),
    responsavel: 'Preditiva',
    descricao: 'Troca do rolamento do eixo principal — vibração em 12,3 mm/s e probabilidade de falha de 78% em 7 dias.',
  },
]

export function otPorId(id: string): OrdemManutencao | undefined {
  return ordensManutencao.find((ot) => ot.id === id)
}

// ── Dados da tela /manutencao ────────────────────────────────────────────────

import { serieDiaria, serieHoraria } from '@/lib/series'
import { equipamentoPorId } from './equipamentos'
import type { AlertaPreditivo, JanelaCondicao, PontoCondicao } from './types'

/** Alertas preditivos e eventos do turno, por severidade. */
export const alertasPreditivos: AlertaPreditivo[] = [
  {
    id: 'ALP-01',
    severidade: 'Crítica',
    evento: 'Vibração da Compressora L12 em 12,3 mm/s — limite de norma é 8,0',
    causaProvavel: 'Desgaste no mancal traseiro do eixo principal',
    proximaAcao: 'Intervir nas próximas 2 h',
    ativoId: 'eq-compressora-l12',
  },
  {
    id: 'ALP-02',
    severidade: 'Alta',
    evento: 'Preventiva do HVAC AHU-03 vencida em 12/mai',
    causaProvavel: 'Filtro de ar saturado — diferencial de pressão ▲6%',
    proximaAcao: 'Reprogramar preventiva para hoje',
    ativoId: 'eq-hvac-ahu-03',
  },
  {
    id: 'ALP-03',
    severidade: 'Alta',
    evento: 'Consumo anômalo de energia na Embalagem L15',
    causaProvavel: 'Aumento de atrito na esteira de saída',
    proximaAcao: 'Inspecionar esteira no fim do Turno A',
    ativoId: 'eq-seladora-l15',
  },
  {
    id: 'ALP-04',
    severidade: 'Média',
    evento: 'Corrente do motor da Esteira L08 8% acima do padrão',
    causaProvavel: 'Tensionamento irregular dos roletes',
    proximaAcao: 'Acompanhar OT-245683 em execução',
    ativoId: 'eq-esteira-l08',
  },
  {
    id: 'ALP-05',
    severidade: 'Baixa',
    evento: 'Consumo elétrico da Torre TR-01 ▲8% na semana',
    causaProvavel: 'Incrustação no enchimento da torre',
    proximaAcao: 'Manter monitoramento semanal',
    ativoId: 'eq-torre-resfriamento',
  },
]

/** Checklist de prontidão da manutenção. */
export const prontidaoManutencao = [
  { item: 'Preventiva', percent: 91 },
  { item: 'Preditiva', percent: 82 },
  { item: 'Corretiva', percent: 87 },
  { item: 'Peças', percent: 93 },
]

export const TECNICOS_DISPONIVEIS = 18
export const TECNICOS_TOTAL = 22
export const SLA_OTS_PERCENT = 92
export const PRONTIDAO_MANUTENCAO_SCORE = 89

/**
 * OT recomendada pelo Agente de Manutenção para a Compressora L12 —
 * criada pela ação "Acionar manutenção" na janela de menor impacto.
 */
export const otRecomendadaCompressora: OrdemManutencao = {
  id: 'OT-245690',
  ativoId: 'eq-compressora-l12',
  tipo: 'Preditiva',
  prioridade: 'Alta',
  status: 'Programada',
  janelaInicio: dt(21, 2),
  janelaFim: dt(21, 5),
  responsavel: 'Preditiva',
  descricao:
    'Substituição do rolamento do eixo principal na janela de menor impacto (quarta, 02:00 – 05:00) — recomendação do Agente de Manutenção.',
}

const JANELAS_CONDICAO: Record<JanelaCondicao, { pontos: number }> = {
  '6h': { pontos: 6 },
  '24h': { pontos: 24 },
  '7d': { pontos: 7 },
}

/**
 * Tendência de condição do ativo (vibração, temperatura e energia),
 * determinística por ativo e janela. Ativos críticos tendem a subir
 * até o valor atual dos indicadores.
 */
export function tendenciaCondicao(equipamentoId: string, janela: JanelaCondicao): PontoCondicao[] {
  const equipamento = equipamentoPorId(equipamentoId)
  const vibracaoAtual = equipamento?.indicadores.find((i) => i.nome.includes('Vibração'))?.valor ?? 4.2
  const temperaturaAtual = equipamento?.indicadores.find((i) => i.nome.includes('Temperatura'))?.valor ?? 48
  const energiaAtual = 96 + Math.round(100 - (equipamento?.disponibilidade ?? 90)) * 1.5
  const critico = equipamento?.status === 'Crítico'
  const { pontos } = JANELAS_CONDICAO[janela]

  const serie = (metrica: string, base: number, atual: number, decimais: number) => {
    const opcoes = {
      base: critico ? base : atual,
      tendencia: critico ? atual - base : 0,
      ruido: 0.05,
      decimais,
      min: 0,
    }
    if (janela === '7d') return serieDiaria(`cond-${equipamentoId}-${metrica}-7d`, new Date(2025, 4, 19), pontos, opcoes)
    const inicio = janela === '6h' ? new Date(2025, 4, 19, 5, 0) : new Date(2025, 4, 18, 11, 0)
    return serieHoraria(`cond-${equipamentoId}-${metrica}-${janela}`, inicio, { horas: pontos, ...opcoes })
  }

  const vibracao = serie('vibracao', vibracaoAtual * 0.72, vibracaoAtual, 1)
  const temperatura = serie('temperatura', temperaturaAtual * 0.88, temperaturaAtual, 1)
  const energia = serie('energia', energiaAtual * 0.85, energiaAtual, 0)

  return vibracao.map((ponto, indice) => ({
    label: ponto.label,
    vibracao: ponto.valor,
    temperatura: temperatura[indice].valor,
    energia: energia[indice].valor,
  }))
}
