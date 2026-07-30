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
    responsavel: 'Cláudio Ferreira',
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
    responsavel: 'André Souza',
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
    responsavel: 'Beatriz Nunes',
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
    responsavel: 'Marcos Vieira',
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
    responsavel: 'Beatriz Nunes',
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
    responsavel: 'Cláudio Ferreira',
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
    responsavel: 'André Souza',
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
    responsavel: 'Renata Dias',
    descricao: 'Troca do rolamento do eixo principal — vibração em 12,3 mm/s e probabilidade de falha de 78% em 7 dias.',
  },
]

export function otPorId(id: string): OrdemManutencao | undefined {
  return ordensManutencao.find((ot) => ot.id === id)
}
