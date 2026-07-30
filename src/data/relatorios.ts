import type { Relatorio } from './types'

const dt = (dia: number, hora: number, minuto = 0) => new Date(2025, 4, dia, hora, minuto)

/** Catálogo de relatórios operacionais e executivos. */
export const relatorios: Relatorio[] = [
  {
    id: 'REL-001',
    nome: 'Resumo diário de produção',
    categoria: 'Operacional',
    descricao: 'Produção, aderência e paradas por linha do dia anterior, com destaques do turno.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 6, 15),
    formato: 'PDF',
    destaque: 'L08 encerrou 18/mai com aderência de 47%.',
  },
  {
    id: 'REL-002',
    nome: 'Aderência ao plano semanal',
    categoria: 'Operacional',
    descricao: 'Comparativo plano × executado por linha e por SKU na semana corrente.',
    periodicidade: 'Semanal',
    ultimaGeracao: dt(18, 18, 0),
    formato: 'XLSX',
  },
  {
    id: 'REL-003',
    nome: 'OEE por linha',
    categoria: 'Operacional',
    descricao: 'Disponibilidade, performance e qualidade por linha, com decomposição de perdas.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 6, 30),
    formato: 'PDF',
    destaque: 'OEE global em 68,4% (▼2,1 p.p.).',
  },
  {
    id: 'REL-004',
    nome: 'Painel executivo — semana 21',
    categoria: 'Executivo',
    descricao: 'Síntese para diretoria: atendimento, riscos, impacto financeiro e decisões pendentes.',
    periodicidade: 'Semanal',
    ultimaGeracao: dt(18, 20, 0),
    formato: 'PDF',
    destaque: 'R$ 1,34 mi em risco mapeado para a semana.',
  },
  {
    id: 'REL-005',
    nome: 'Fila e tempo de liberação QA',
    categoria: 'Qualidade',
    descricao: 'Lotes na fila, tempo médio de liberação e desvios abertos por área.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 7, 0),
    formato: 'XLSX',
  },
  {
    id: 'REL-006',
    nome: 'Saúde de ativos e preditiva',
    categoria: 'Manutenção',
    descricao: 'Telemetria consolidada, probabilidade de falha e carteira de OTs por ativo.',
    periodicidade: 'Semanal',
    ultimaGeracao: dt(18, 19, 0),
    formato: 'PDF',
    destaque: 'Compressora L12 com 78% de probabilidade de falha.',
  },
  {
    id: 'REL-007',
    nome: 'Custo por lote e perdas',
    categoria: 'Custos',
    descricao: 'Custo real × padrão por lote, perdas por categoria e desvio contra o orçamento.',
    periodicidade: 'Semanal',
    ultimaGeracao: dt(18, 17, 30),
    formato: 'XLSX',
  },
  {
    id: 'REL-008',
    nome: 'Cobertura de materiais críticos',
    categoria: 'Operacional',
    descricao: 'Cobertura em dias, pedidos em trânsito e ações recomendadas por material.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 6, 45),
    formato: 'XLSX',
    destaque: 'Ibuprofeno API com 1,4 dia de cobertura.',
  },
]

export function relatorioPorId(id: string): Relatorio | undefined {
  return relatorios.find((relatorio) => relatorio.id === id)
}
