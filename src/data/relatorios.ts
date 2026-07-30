import type {
  AgendamentoRelatorio,
  CategoriaCatalogo,
  GovernancaRelatorios,
  IndicadorConsumo,
  PontoLeituras,
  Relatorio,
} from './types'

const dt = (dia: number, hora: number, minuto = 0) => new Date(2025, 4, dia, hora, minuto)

/** Biblioteca de relatórios — a primeira linha é o Resumo Executivo com preview. */
export const relatorios: Relatorio[] = [
  {
    id: 'REL-001',
    nome: 'Resumo Executivo da Produção',
    categoria: 'Executivo',
    descricao: 'Síntese diária para diretoria: KPIs, produção vs plano, riscos e recomendações.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 8, 15),
    formato: 'PDF',
    responsavel: 'Camila Azevedo',
    situacao: 'Atualizado',
    destaque: 'R$ 1,34 mi em risco mapeado para a semana.',
  },
  {
    id: 'REL-002',
    nome: 'Performance por Linha',
    categoria: 'Operacional',
    descricao: 'OEE, aderência e paradas por linha, com decomposição de perdas do dia.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 6, 30),
    formato: 'PDF',
    responsavel: 'Ricardo Martins',
    situacao: 'Atualizado',
    destaque: 'L08 opera com aderência de 45% por microparadas.',
  },
  {
    id: 'REL-003',
    nome: 'Fila de Liberação QA',
    categoria: 'Qualidade',
    descricao: 'Lotes na fila, tempo médio de liberação e desvios abertos por área.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 7, 0),
    formato: 'XLSX',
    responsavel: 'Juliana Pereira',
    situacao: 'Atualizado',
  },
  {
    id: 'REL-004',
    nome: 'Saúde dos Ativos',
    categoria: 'Manutenção',
    descricao: 'Telemetria consolidada, probabilidade de falha e carteira de OTs por ativo.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 6, 0),
    formato: 'PDF',
    responsavel: 'Marcos Oliveira',
    situacao: 'Atualizado',
    destaque: 'Compressora L12 com 78% de probabilidade de falha.',
  },
  {
    id: 'REL-005',
    nome: 'Prontidão de Materiais',
    categoria: 'Materiais',
    descricao: 'Cobertura em dias, pedidos em trânsito e ações recomendadas por material.',
    periodicidade: 'Diário',
    ultimaGeracao: dt(19, 6, 45),
    formato: 'PDF',
    responsavel: 'Patrícia Lima',
    situacao: 'Atualizado',
    destaque: 'Ibuprofeno API com 1,4 dia de cobertura.',
  },
  {
    id: 'REL-006',
    nome: 'Custos por SKU',
    categoria: 'Custos',
    descricao: 'Custo real × padrão por SKU, perdas por categoria e desvio contra o orçamento.',
    periodicidade: 'Semanal',
    ultimaGeracao: dt(18, 17, 30),
    formato: 'XLSX',
    responsavel: 'Eduardo Rocha',
    situacao: 'Atualizado',
  },
  {
    id: 'REL-007',
    nome: 'Painel Executivo — Semana 21',
    categoria: 'Executivo',
    descricao: 'Atendimento, riscos, impacto financeiro e decisões pendentes da semana.',
    periodicidade: 'Semanal',
    ultimaGeracao: dt(18, 20, 0),
    formato: 'PDF',
    responsavel: 'Camila Azevedo',
    situacao: 'Atualizado',
  },
  {
    id: 'REL-008',
    nome: 'Aderência ao Plano Semanal',
    categoria: 'Operacional',
    descricao: 'Comparativo plano × executado por linha e por SKU na semana corrente.',
    periodicidade: 'Semanal',
    ultimaGeracao: dt(18, 18, 0),
    formato: 'XLSX',
    responsavel: 'Ricardo Martins',
    situacao: 'Atualizado',
  },
  {
    id: 'REL-009',
    nome: 'Board Pack Mensal — Diretoria',
    categoria: 'Customizado',
    descricao: 'Compilado executivo mensal com produção, qualidade, custos e decisões dos agentes.',
    periodicidade: 'Mensal',
    ultimaGeracao: dt(2, 9, 0),
    formato: 'PDF',
    responsavel: 'Camila Azevedo',
    situacao: 'Atualizado',
  },
  {
    id: 'REL-010',
    nome: 'Acompanhamento de Campanhas',
    categoria: 'Customizado',
    descricao: 'Relatório customizado por campanha: avanço, materiais e janelas de manutenção.',
    periodicidade: 'Sob demanda',
    ultimaGeracao: dt(16, 14, 20),
    formato: 'XLSX',
    responsavel: 'Patrícia Lima',
    situacao: 'Sob demanda',
  },
]

export function relatorioPorId(id: string): Relatorio | undefined {
  return relatorios.find((relatorio) => relatorio.id === id)
}

// ── Distribuição e consumo ───────────────────────────────────────────────────

/** Leituras dos últimos 7 dias (13–19/mai) — cresce de 210 para 428. */
export const leiturasSemana: PontoLeituras[] = [
  { label: '13/mai', valor: 210 },
  { label: '14/mai', valor: 246 },
  { label: '15/mai', valor: 275 },
  { label: '16/mai', valor: 308 },
  { label: '17/mai', valor: 344 },
  { label: '18/mai', valor: 391 },
  { label: '19/mai', valor: 428 },
]

export const consumoRelatorios: IndicadorConsumo[] = [
  { id: 'cr-aberturas', label: 'Aberturas', valor: '2.192', delta: '+16,8%', deltaGoodWhen: 'up' },
  { id: 'cr-downloads', label: 'Downloads', valor: '842', delta: '+12,3%', deltaGoodWhen: 'up' },
  { id: 'cr-compartilhamentos', label: 'Compartilhamentos', valor: '186', delta: '+9,6%', deltaGoodWhen: 'up' },
  { id: 'cr-leitura', label: 'Taxa de leitura', valor: '68,7%', delta: '+4,7 p.p.', deltaGoodWhen: 'up' },
]

/** Envios programados. */
export const agendamentos: AgendamentoRelatorio[] = [
  { id: 'AGD-01', relatorioId: 'REL-001', destinatarios: 'Diretoria Industrial (8)', proximoEnvio: dt(20, 7, 0), canal: 'E-mail', status: 'Programado' },
  { id: 'AGD-02', relatorioId: 'REL-002', destinatarios: 'Gerência de Produção (12)', proximoEnvio: dt(20, 6, 30), canal: 'Teams', status: 'Programado' },
  { id: 'AGD-03', relatorioId: 'REL-004', destinatarios: 'Engenharia de Manutenção (9)', proximoEnvio: dt(20, 6, 0), canal: 'Teams', status: 'Programado' },
  { id: 'AGD-04', relatorioId: 'REL-003', destinatarios: 'Qualidade Anápolis (6)', proximoEnvio: dt(20, 7, 30), canal: 'E-mail', status: 'Programado' },
  { id: 'AGD-05', relatorioId: 'REL-006', destinatarios: 'Controladoria (5)', proximoEnvio: dt(23, 8, 0), canal: 'E-mail', status: 'Programado' },
]

// ── Catálogo e governança ────────────────────────────────────────────────────

export const catalogoAnalitico: CategoriaCatalogo[] = [
  { area: 'Produção', quantidade: 24 },
  { area: 'Qualidade', quantidade: 18 },
  { area: 'Manutenção', quantidade: 16 },
  { area: 'Materiais', quantidade: 20 },
  { area: 'Custos', quantidade: 14 },
  { area: 'Alertas', quantidade: 12 },
]

export const governancaRelatorios: GovernancaRelatorios[] = [
  { item: 'Atualização de dados', percent: 99.1 },
  { item: 'Fontes integradas', percent: 91.7, valorRotulo: '22/24' },
  { item: 'Aprovações', percent: 96 },
  { item: 'SLA de distribuição', percent: 97.4 },
]

export const RELATORIOS_GOVERNANCA_SCORE = 96

/** KPIs do preview do Resumo Executivo (coerentes com a Visão Geral e /agentes). */
export const resumoExecutivoKpis = [
  { label: 'OEE Global', valor: '78,6%' },
  { label: 'Aderência ao Plano', valor: '92,1%' },
  { label: 'Ganho Estimado (HPO)', valor: 'R$ 1,84 mi' },
]
