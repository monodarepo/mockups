import type { CenarioSimulacao, EventoSimulavel } from './types'

/** Eventos que o Gêmeo da Fábrica sabe simular. */
export const eventosSimulaveis: EventoSimulavel[] = [
  {
    id: 'EV-001',
    nome: 'Parada da L12 por 8 h',
    descricao: 'Falha da compressora interrompe a L12 por um turno inteiro durante a OF-045678.',
    impactoPreliminar: 'Atendimento cai para 91% e a OF-045678 atrasa 6 h.',
  },
  {
    id: 'EV-002',
    nome: 'Atraso do Ibuprofeno API em 48 h',
    descricao: 'A reposição do MAT-API-001 chega 48 h depois do previsto.',
    impactoPreliminar: 'L12 para em 21/mai; 3 SKUs entram em ruptura imediata.',
  },
  {
    id: 'EV-003',
    nome: 'Hora extra no sábado',
    descricao: 'Turno adicional de 8 h em 24/mai nas linhas L08 e L12.',
    impactoPreliminar: '+8 h de capacidade na L08 e L12 por R$ 95 mil.',
  },
  {
    id: 'EV-004',
    nome: 'Transferência de campanha para Goiânia',
    descricao: 'Advil (OF-045687) migra da L08 para a P26, liberando capacidade em Anápolis.',
    impactoPreliminar: 'Libera 45 h na L08; atendimento sobe até 97%.',
  },
  {
    id: 'EV-005',
    nome: 'Reprovação do lote 2456793E',
    descricao: 'Confirmação da reprovação do Apracur exige reprocesso e nova janela na L03.',
    impactoPreliminar: 'Reprocesso exige nova janela na L03 (+18 h de fila).',
  },
]

/**
 * Comparação de cenários da semana 20–26/mai.
 * O Cenário A é o recomendado pelo otimizador.
 */
export const cenarios: CenarioSimulacao[] = [
  {
    id: 'cenario-base',
    nome: 'Plano-base',
    descricao: 'Sequência vigente, sem eventos adicionais.',
    eventos: [],
    atendimentoPercent: 94,
    horasSetup: 320,
    custoIncremental: null,
    skusComRuptura: 12,
    oeeProjetado: 68,
    risco: 'Médio',
    recomendado: false,
  },
  {
    id: 'cenario-a',
    nome: 'Cenário A',
    descricao: 'Transferência de campanha para Goiânia combinada com hora extra no sábado.',
    eventos: ['EV-003', 'EV-004'],
    atendimentoPercent: 97,
    horasSetup: 275,
    custoIncremental: 180_000,
    skusComRuptura: 4,
    oeeProjetado: 73,
    risco: 'Baixo',
    recomendado: true,
  },
  {
    id: 'cenario-b',
    nome: 'Cenário B',
    descricao: 'Somente hora extra no sábado, sem transferência de campanha.',
    eventos: ['EV-003'],
    atendimentoPercent: 96,
    horasSetup: 290,
    custoIncremental: 95_000,
    skusComRuptura: 6,
    oeeProjetado: 71,
    risco: 'Médio',
    recomendado: false,
  },
]

/** ID do cenário recomendado pelo otimizador. */
export const MELHOR_CENARIO_ID = 'cenario-a'

export function cenarioPorId(id: string): CenarioSimulacao | undefined {
  return cenarios.find((cenario) => cenario.id === id)
}
