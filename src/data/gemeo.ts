import type { DetalheAreaGemeo, StatusAreaGemeo } from './types'

const hj = (hora: number, minuto = 0) => new Date(2025, 4, 19, hora, minuto)

/**
 * Estado da planta de Anápolis no gêmeo digital — 19/mai/2025, 10:18.
 * Os fios da história aparecem nas áreas: L12 (vibração da compressora),
 * L08 (aderência 45%), L15 (parada por blister) e Utilidades (preventiva).
 */

/** KPIs verticais da coluna esquerda. */
export const kpisPlantaGemeo = [
  { id: 'gm-linhas', rotulo: 'Linhas ativas', valor: '5' },
  { id: 'gm-oee', rotulo: 'OEE da planta', valor: '78,4%' },
  { id: 'gm-ordens', rotulo: 'Ordens em execução', valor: '5' },
  { id: 'gm-paradas', rotulo: 'Paradas', valor: '1' },
  { id: 'gm-manutencoes', rotulo: 'Manutenções programadas', valor: '2' },
]

/** Legenda de status da planta. */
export const legendaGemeo: Array<{ status: StatusAreaGemeo; rotulo: string }> = [
  { status: 'normal', rotulo: 'Operação normal' },
  { status: 'atencao', rotulo: 'Tendência de desvio' },
  { status: 'critico', rotulo: 'Parada ou restrição' },
  { status: 'manutencao', rotulo: 'Manutenção programada' },
  { status: 'sem-dados', rotulo: 'Indisponível' },
]

/** Estado de cada bloco da planta (chaves = nomes dos blocos do FactoryMap). */
export const estadosAreasGemeo: Record<string, StatusAreaGemeo> = {
  'Pesagem e Dispensação': 'normal',
  Granulação: 'normal',
  Revestimento: 'normal',
  Embalagem: 'normal',
  'Compressão (L12)': 'atencao',
  'Sólidos (L08)': 'atencao',
  'Cápsulas (L03)': 'normal',
  'Drágeas (L05)': 'atencao',
  'Pó e Sachês (L15)': 'parada',
  'Armazém MP': 'normal',
  Utilidades: 'manutencao',
  'Laboratório QA': 'normal',
  'Armazém PA': 'normal',
}

/** Detalhe de cada área — alimenta o drawer aberto pelo clique na planta. */
export const detalhesAreasGemeo: Record<string, DetalheAreaGemeo> = {
  'Compressão (L12)': {
    area: 'Compressão (L12)',
    tipo: 'linha',
    status: 'atencao',
    resumo: 'Produzindo Buscopan Composto com vibração da compressora acima do limite.',
    linhaId: 'L12',
    ordemId: 'OF-045678',
    loteId: '2456789A',
    perdaAcumuladaPercent: 0.78,
    parametros: [
      { nome: 'Vibração da compressora', valor: '12,3 mm/s', situacao: 'Crítico' },
      { nome: 'Peso médio', valor: '401,2 mg', situacao: 'Normal' },
      { nome: 'Dureza', valor: '9,2 Kgf', situacao: 'Normal' },
    ],
    proximaOrdem: 'Campanha Buscopan segue até 22/mai',
    previsaoTermino: hj(13, 45),
    equipamentos: [{ nome: 'Compressora L12', condicao: 'Crítico' }],
    ativoId: 'eq-compressora-l12',
    fio: 'Compressora com 78% de probabilidade de falha em 7 dias — OT-245689 aberta e janela ótima na quarta, 02:00 – 05:00.',
  },
  'Sólidos (L08)': {
    area: 'Sólidos (L08)',
    tipo: 'linha',
    status: 'atencao',
    resumo: 'Neosaldina com aderência de 45% por microparadas desde as 06:00.',
    linhaId: 'L08',
    ordemId: 'OF-045679',
    loteId: '2456791C',
    perdaAcumuladaPercent: 1.84,
    parametros: [
      { nome: 'Variação de peso', valor: 'limite superior', situacao: 'Atenção' },
      { nome: 'Corrente do motor da esteira', valor: '14,8 A (▲8%)', situacao: 'Atenção' },
      { nome: 'Microparadas no turno', valor: '23', situacao: 'Crítico' },
    ],
    proximaOrdem: 'OF-045686 · Novalgina — após a corretiva',
    previsaoTermino: hj(13, 20),
    equipamentos: [{ nome: 'Esteira Transportadora L08', condicao: 'Atenção' }],
    ativoId: 'eq-esteira-l08',
    fio: 'OT-245683 (corretiva do tensionamento) em execução com conclusão prevista para 14:00.',
  },
  'Cápsulas (L03)': {
    area: 'Cápsulas (L03)',
    tipo: 'linha',
    status: 'normal',
    resumo: 'Benegrip Multi dentro do plano — melhor OEE da planta no turno.',
    linhaId: 'L03',
    ordemId: 'OF-045680',
    loteId: '2456792D',
    perdaAcumuladaPercent: 0.54,
    parametros: [
      { nome: 'Peso da cápsula', valor: 'dentro da faixa', situacao: 'Normal' },
      { nome: 'Umidade da sala', valor: '46% UR', situacao: 'Normal' },
    ],
    proximaOrdem: 'OF-045683 · Apracur — 14:30',
    previsaoTermino: hj(12, 40),
    equipamentos: [{ nome: 'Encapsuladora L03', condicao: 'Normal' }],
    ativoId: 'eq-encapsuladora-l03',
  },
  'Drágeas (L05)': {
    area: 'Drágeas (L05)',
    tipo: 'linha',
    status: 'atencao',
    resumo: 'Dorflex com microparadas acumuladas nas últimas 2 h.',
    linhaId: 'L05',
    ordemId: 'OF-045681',
    loteId: '2456790B',
    perdaAcumuladaPercent: 1.12,
    parametros: [
      { nome: 'Velocidade do tambor', valor: '−12% vs padrão', situacao: 'Atenção' },
      { nome: 'Temperatura do leito', valor: '42,1 °C', situacao: 'Normal' },
    ],
    proximaOrdem: 'OF-045685 · Tylenol 750mg — 15:00',
    previsaoTermino: hj(13, 55),
    equipamentos: [{ nome: 'Drageadeira D-05', condicao: 'Atenção' }],
  },
  'Pó e Sachês (L15)': {
    area: 'Pó e Sachês (L15)',
    tipo: 'linha',
    status: 'parada',
    resumo: 'Linha parada — criticidade do Blister Alu/Alu 10cp (prontidão 62%).',
    linhaId: 'L15',
    ordemId: 'OF-045682',
    perdaAcumuladaPercent: 0,
    parametros: [
      { nome: 'Blister Alu/Alu 10cp', valor: 'cobertura 1,7 dia', situacao: 'Crítico' },
      { nome: 'Temperatura de selagem', valor: '168 °C (▼9%)', situacao: 'Crítico' },
    ],
    proximaOrdem: 'Retomada com blister substituto — 21/mai',
    previsaoTermino: hj(14, 0),
    equipamentos: [{ nome: 'Seladora L15', condicao: 'Crítico' }],
    ativoId: 'eq-seladora-l15',
    fio: 'Rinosoro (OF-045682) aguarda a liberação do blister substituto homologado — OT-245685 aguardando peça.',
  },
  Utilidades: {
    area: 'Utilidades',
    tipo: 'apoio',
    status: 'manutencao',
    resumo: 'Preventiva do HVAC AHU-03 reprogramada para 21/mai, 08:00.',
    indicadores: [
      { nome: 'HVAC AHU-03', valor: 'preventiva 21/mai · OT-245682' },
      { nome: 'Bomba CIP-02', valor: 'operação normal' },
      { nome: 'Torre TR-01', valor: 'consumo ▲8% na semana' },
    ],
    equipamentos: [
      { nome: 'HVAC AHU-03', condicao: 'Atenção' },
      { nome: 'Bomba CIP-02', condicao: 'Normal' },
      { nome: 'Torre de Resfriamento TR-01', condicao: 'Normal' },
    ],
    ativoId: 'eq-hvac-ahu-03',
  },
  'Pesagem e Dispensação': {
    area: 'Pesagem e Dispensação',
    tipo: 'apoio',
    status: 'normal',
    resumo: 'Fluxo normal — 8 pesagens concluídas no turno.',
    indicadores: [
      { nome: 'Pesagens concluídas', valor: '8 de 10' },
      { nome: 'Fila de dispensação', valor: '2 ordens' },
      { nome: 'Balanças calibradas', valor: '100%' },
    ],
  },
  Granulação: {
    area: 'Granulação',
    tipo: 'apoio',
    status: 'normal',
    resumo: 'Misturador M-08 em operação normal com 2 lotes em processo.',
    indicadores: [
      { nome: 'Lotes em processo', valor: '2' },
      { nome: 'Misturador M-08', valor: 'vibração 4,6 mm/s · normal' },
    ],
    equipamentos: [{ nome: 'Misturador M-08', condicao: 'Normal' }],
    ativoId: 'eq-misturador-m08',
  },
  Revestimento: {
    area: 'Revestimento',
    tipo: 'apoio',
    status: 'normal',
    resumo: 'Drageamento do Dorflex dentro dos parâmetros.',
    indicadores: [
      { nome: 'Lotes em revestimento', valor: '1' },
      { nome: 'Umidade da sala', valor: '44% UR · controlada' },
    ],
  },
  Embalagem: {
    area: 'Embalagem',
    tipo: 'apoio',
    status: 'normal',
    resumo: 'Embalagem operando — exceção: blister da L15 em criticidade.',
    indicadores: [
      { nome: 'Linhas de embalagem ativas', valor: '4 de 5' },
      { nome: 'Cartuchos', valor: 'cobertura 2,6 dias' },
      { nome: 'Blister Alu/Alu 10cp', valor: 'crítico — prontidão 62%' },
    ],
  },
  'Armazém MP': {
    area: 'Armazém MP',
    tipo: 'apoio',
    status: 'normal',
    resumo: 'Ocupação de 82% — 2 materiais críticos monitorados.',
    indicadores: [
      { nome: 'Ocupação', valor: '82%' },
      { nome: 'Recebimentos hoje', valor: '6' },
      { nome: 'Materiais críticos', valor: 'Ibuprofeno API · Blister Alu/Alu' },
    ],
  },
  'Laboratório QA': {
    area: 'Laboratório QA',
    tipo: 'apoio',
    status: 'normal',
    resumo: 'Fila de 6 lotes — 2456789A priorizado para liberar a embalagem da L12.',
    indicadores: [
      { nome: 'Lotes na fila', valor: '6' },
      { nome: 'Tempo médio de liberação', valor: '3,4 h' },
      { nome: 'Prioridade', valor: 'lote 2456789A (Buscopan)' },
    ],
  },
  'Armazém PA': {
    area: 'Armazém PA',
    tipo: 'apoio',
    status: 'normal',
    resumo: 'Ocupação de 68% — 4 expedições programadas para hoje.',
    indicadores: [
      { nome: 'Ocupação', valor: '68%' },
      { nome: 'Expedições hoje', valor: '4' },
      { nome: 'OTIF de expedição', valor: '97,1%' },
    ],
  },
}

export function detalheAreaGemeo(area: string): DetalheAreaGemeo | undefined {
  return detalhesAreasGemeo[area]
}
