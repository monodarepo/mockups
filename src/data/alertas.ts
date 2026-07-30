import type {
  Alerta,
  AprovacaoAgendada,
  EtapaFluxoDecisao,
  ItemProntidaoDecisao,
  QuadranteMatriz,
  RiscoCategoria,
} from './types'

/**
 * Central de alertas em 19/mai/2025. Os impactos somados alimentam o KPI
 * "Impacto em risco" — mantenha os valores coerentes com as telas.
 */
export const alertas: Alerta[] = [
  {
    id: 'AL-001',
    titulo: 'Falta de Ibuprofeno API',
    descricao: 'Cobertura de 1,4 dia contra consumo de 220 kg/dia (▲15%). Sem reposição, a OF-045678 para em 21/mai.',
    fabricaId: 'anapolis',
    linhaId: 'L12',
    area: 'Materiais',
    severidade: 'Crítica',
    impactoEstimado: 420_000,
    slaHoras: 2,
    responsavel: 'Suprimentos',
    status: 'Aberto',
    acaoRecomendada: 'Priorizar transferência',
    causaProvavel: 'Atraso do fornecedor PharmaQuímica na reposição programada de 15/mai.',
    impactoOperacional: 'L12 para em 21/mai por falta de API; OF-045678 atrasa 14 h.',
    alternativas: ['Transferir 400 kg de Goiânia (chega em 24 h)', 'Reduzir a velocidade da L12 em 20% para esticar a cobertura'],
    ordemId: 'OF-045678',
    materialId: 'MAT-API-001',
  },
  {
    id: 'AL-002',
    titulo: 'Vibração acima do limite',
    descricao: 'Compressora L12 em 12,3 mm/s (▲35%) com probabilidade de falha de 78% em 7 dias.',
    fabricaId: 'anapolis',
    linhaId: 'L12',
    area: 'Manutenção',
    severidade: 'Alta',
    impactoEstimado: 180_000,
    slaHoras: 4,
    responsavel: 'Manutenção',
    status: 'Em análise',
    acaoRecomendada: 'Acionar manutenção',
    causaProvavel: 'Desgaste do rolamento do eixo principal sem preditiva desde 14/mai.',
    impactoOperacional: 'Falha imprevista pararia a L12 por até 8 h em plena campanha do Buscopan.',
    alternativas: ['Antecipar a OT-245689 para a janela noturna de 21/mai', 'Reduzir RPM em 10% até a preventiva de 26/mai'],
    ativoId: 'eq-compressora-l12',
  },
  {
    id: 'AL-003',
    titulo: 'Lote aguardando liberação QA',
    descricao: 'Lote 2456794F (Addera D3) em análise há 48 min; fila da L03 pressiona o plano de embalagem.',
    fabricaId: 'anapolis',
    linhaId: 'L03',
    area: 'Qualidade',
    severidade: 'Média',
    impactoEstimado: 95_000,
    slaHoras: 6,
    responsavel: 'Qualidade',
    status: 'Pendente',
    acaoRecomendada: 'Priorizar lote',
    causaProvavel: 'Laudo analítico na fila do laboratório desde 08:00.',
    impactoOperacional: 'Embalagem da L03 aguarda liberação para não gerar estoque intermediário.',
    alternativas: ['Priorizar o lote na fila do LIMS', 'Remanejar analista da bancada de estabilidade'],
    loteId: '2456794F',
  },
  {
    id: 'AL-004',
    titulo: 'Setup acima do padrão',
    descricao: 'Setups da L08 28% acima do padrão na semana — sequência atual troca de família duas vezes.',
    fabricaId: 'anapolis',
    linhaId: 'L08',
    area: 'Performance',
    severidade: 'Média',
    impactoEstimado: 60_000,
    slaHoras: 3,
    responsavel: 'Operação L08',
    status: 'Aberto',
    acaoRecomendada: 'Replanejar sequência',
    causaProvavel: 'Sequência atual alterna famílias e adiciona duas limpezas completas.',
    impactoOperacional: 'L08 perde 45 h de capacidade na semana com setups acima do padrão.',
    alternativas: ['Aplicar a sequência otimizada do Agente de Sequenciamento', 'Negociar janela de hora extra no sábado'],
  },
  {
    id: 'AL-005',
    titulo: 'Estoque baixo de blister Alu/Alu',
    descricao: 'Blister Alu/Alu 10cp com cobertura de 1,7 dia mantém a L15 parada — prontidão da OF-045682 em 62%.',
    fabricaId: 'anapolis',
    linhaId: 'L15',
    area: 'Materiais',
    severidade: 'Média',
    impactoEstimado: 55_000,
    slaHoras: 8,
    responsavel: 'Embalagem',
    status: 'Monitorando',
    acaoRecomendada: 'Liberar substituto',
    causaProvavel: 'Atraso recorrente do fornecedor Alumipack nas últimas 3 entregas.',
    impactoOperacional: 'L15 segue parada; OF-045682 (Rinosoro) sem janela de retomada firme.',
    alternativas: ['Liberar o blister substituto homologado', 'Transferir o envase para a P29 de Jacareí'],
    ordemId: 'OF-045682',
    materialId: 'MAT-EMB-021',
  },
  {
    id: 'AL-006',
    titulo: 'Risco de atraso da OF-045678',
    descricao: 'Combinação de falta de API e risco de falha da compressora ameaça a entrega de 22/mai, 16:00.',
    fabricaId: 'anapolis',
    linhaId: 'L12',
    area: 'Produção',
    severidade: 'Crítica',
    impactoEstimado: 510_000,
    slaHoras: 1,
    responsavel: 'PCP',
    status: 'Escalado',
    acaoRecomendada: 'Simular recuperação',
    causaProvavel: 'Convergência de falta de API e risco de falha da compressora na mesma linha.',
    impactoOperacional: 'Entrega de 22/mai, 16:00 da OF-045678 em risco direto — cliente prioritário.',
    alternativas: ['Aprovar o plano de recuperação combinado (transferência + preditiva)', 'Replanejar a entrega com o comercial para 23/mai'],
    ordemId: 'OF-045678',
  },
  {
    id: 'AL-007',
    titulo: 'Consumo de energia acima do baseline',
    descricao: 'Torre de Resfriamento TR-01 com consumo 8% acima do baseline desde 17/mai.',
    fabricaId: 'anapolis',
    area: 'Energia',
    severidade: 'Baixa',
    impactoEstimado: 18_000,
    slaHoras: 24,
    responsavel: 'Produção',
    status: 'Aberto',
    acaoRecomendada: 'Ajustar setpoint do chiller',
    causaProvavel: 'Setpoint do chiller desajustado após a inspeção de 18/mai.',
    impactoOperacional: 'Custo adicional de energia de R$ 750/dia sem impacto direto na produção.',
    alternativas: ['Ajustar o setpoint para 7 °C', 'Programar recalibração na próxima parada'],
    ativoId: 'eq-torre-resfriamento',
  },
]

export function alertaPorId(id: string): Alerta | undefined {
  return alertas.find((alerta) => alerta.id === id)
}

// ── Fluxo de decisão (funil) ─────────────────────────────────────────────────

/**
 * Contagens-base do funil. A tela soma os aprovados/rejeitados da sessão:
 * aprovar move um item de Recomendado → Aprovado; rejeitar devolve para
 * Analisando.
 */
export const fluxoDecisao: EtapaFluxoDecisao[] = [
  { id: 'detectado', rotulo: 'Detectado', valor: 14, deltaHora: '+3', deltaGoodWhen: 'down' },
  { id: 'analisando', rotulo: 'Analisando', valor: 9, deltaHora: '+2', deltaGoodWhen: 'down' },
  { id: 'recomendado', rotulo: 'Recomendado', valor: 7, deltaHora: '+1', deltaGoodWhen: 'up' },
  { id: 'aprovado', rotulo: 'Aprovado', valor: 5, deltaHora: '+2', deltaGoodWhen: 'up' },
  { id: 'executando', rotulo: 'Executando', valor: 6, deltaHora: '-1', deltaGoodWhen: 'up' },
  { id: 'resolvido', rotulo: 'Resolvido', valor: 18, deltaHora: '+8', deltaGoodWhen: 'up' },
]

/** Top riscos por categoria (rede, 24 h) — soma R$ 1,82 mi. */
export const topRiscosCategorias: RiscoCategoria[] = [
  { id: 'risco-materiais', categoria: 'Materiais', valor: 720_000, percent: 39 },
  { id: 'risco-manutencao', categoria: 'Manutenção', valor: 420_000, percent: 23 },
  { id: 'risco-qualidade', categoria: 'Qualidade', valor: 280_000, percent: 15 },
  { id: 'risco-producao', categoria: 'Produção', valor: 210_000, percent: 11 },
  { id: 'risco-custos', categoria: 'Custos', valor: 120_000, percent: 6 },
  { id: 'risco-logistica', categoria: 'Logística', valor: 70_000, percent: 4 },
]

/** Matriz Prioridade × Urgência — 32 alertas monitorados na rede. */
export const matrizPrioridadeUrgencia: QuadranteMatriz[] = [
  { id: 'alta-baixa', rotulo: 'Alta prioridade / Baixa urgência', quantidade: 6, tone: 'info' },
  { id: 'critico', rotulo: 'Crítico / Ação imediata', quantidade: 11, tone: 'danger' },
  { id: 'monitorar', rotulo: 'Monitorar / Baixo risco', quantidade: 8, tone: 'success' },
  { id: 'breve', rotulo: 'Resolver em breve', quantidade: 7, tone: 'warning' },
]

/** Checklist de prontidão para decisão — média de 88% ("Boa"). */
export const prontidaoDecisao: ItemProntidaoDecisao[] = [
  { item: 'Dados', percent: 90 },
  { item: 'Responsáveis', percent: 95 },
  { item: 'Regras', percent: 85 },
  { item: 'Aprovações', percent: 80 },
  { item: 'SLAs', percent: 88 },
]

/** Score consolidado exibido no ScoreDonut. */
export const PRONTIDAO_DECISAO_SCORE = 88

/** Agenda de aprovações das próximas 24 h. */
export const proximasAprovacoes: AprovacaoAgendada[] = [
  {
    id: 'AP-01',
    decisao: 'Transferência de Ibuprofeno API — Goiânia → Anápolis',
    responsavel: 'Alçada: Suprimentos',
    prazoRotulo: 'Hoje 15:00',
  },
  {
    id: 'AP-02',
    decisao: 'Antecipação da preditiva da Compressora L12',
    responsavel: 'Alçada: Manutenção',
    prazoRotulo: 'Hoje 16:00',
  },
  {
    id: 'AP-03',
    decisao: 'Liberação do blister substituto — L15',
    responsavel: 'Alçada: Suprimentos',
    prazoRotulo: 'Hoje 17:00',
  },
  {
    id: 'AP-04',
    decisao: 'Hora extra de sábado — L08 e L12',
    responsavel: 'Alçada: PCP',
    prazoRotulo: 'Amanhã 08:00',
  },
  {
    id: 'AP-05',
    decisao: 'Reprocesso do lote 2456793E (Apracur)',
    responsavel: 'Alçada: Qualidade',
    prazoRotulo: 'Amanhã 09:00',
  },
]
