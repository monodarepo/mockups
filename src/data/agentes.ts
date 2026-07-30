import type { AcaoAgente, AgenteIA } from './types'

/** Os 9 agentes autônomos do HPO. */
export const agentes: AgenteIA[] = [
  {
    id: 'ag-planejamento',
    nome: 'Agente de Planejamento',
    dominio: 'Planejamento',
    descricao: 'Replaneja o plano-mestre quando demanda, capacidade ou materiais mudam.',
    status: 'Ativo',
    autonomia: 'N3',
    tarefasHoje: 24,
    slaPercent: 98.2,
    taxaAceitacao: 92,
  },
  {
    id: 'ag-sequenciamento',
    nome: 'Agente de Sequenciamento',
    dominio: 'Sequenciamento',
    descricao: 'Reordena campanhas por família para minimizar setups e limpezas.',
    status: 'Ativo',
    autonomia: 'N3',
    tarefasHoje: 18,
    slaPercent: 97.5,
    taxaAceitacao: 94,
  },
  {
    id: 'ag-gargalos',
    nome: 'Agente de Gargalos',
    dominio: 'Gargalos',
    descricao: 'Identifica restrições de capacidade e propõe realocação de carga.',
    status: 'Monitorando',
    autonomia: 'N2',
    tarefasHoje: 12,
    slaPercent: 96.8,
    taxaAceitacao: 89,
  },
  {
    id: 'ag-materiais',
    nome: 'Agente de Materiais',
    dominio: 'Materiais',
    descricao: 'Monitora cobertura de insumos e antecipa compras e transferências.',
    status: 'Ativo',
    autonomia: 'N4',
    tarefasHoje: 31,
    slaPercent: 99.1,
    taxaAceitacao: 95,
  },
  {
    id: 'ag-qualidade',
    nome: 'Agente de Qualidade',
    dominio: 'Qualidade',
    descricao: 'Prioriza a fila de liberação e sinaliza desvios com risco de bloqueio.',
    status: 'Ativo',
    autonomia: 'N2',
    tarefasHoje: 16,
    slaPercent: 95.4,
    taxaAceitacao: 88,
  },
  {
    id: 'ag-manutencao',
    nome: 'Agente de Manutenção',
    dominio: 'Manutenção',
    descricao: 'Converte sinais de telemetria em OTs preditivas com janela ótima.',
    status: 'Ativo',
    autonomia: 'N3',
    tarefasHoje: 9,
    slaPercent: 97.9,
    taxaAceitacao: 91,
  },
  {
    id: 'ag-custos',
    nome: 'Agente de Custos',
    dominio: 'Custos',
    descricao: 'Rastreia perdas e desvios de custo por lote contra o orçamento.',
    status: 'Em aprovação',
    autonomia: 'N2',
    tarefasHoje: 14,
    slaPercent: 96.2,
    taxaAceitacao: 87,
  },
  {
    id: 'ag-execucao',
    nome: 'Agente de Execução',
    dominio: 'Execução',
    descricao: 'Acompanha ordens em piso de fábrica e aciona respostas a microparadas.',
    status: 'Ativo',
    autonomia: 'N4',
    tarefasHoje: 42,
    slaPercent: 98.7,
    taxaAceitacao: 93,
  },
  {
    id: 'ag-auditoria',
    nome: 'Agente de Auditoria',
    dominio: 'Auditoria',
    descricao: 'Audita decisões dos demais agentes e registra trilhas para compliance.',
    status: 'Em treinamento',
    autonomia: 'N2',
    tarefasHoje: 7,
    slaPercent: 99.5,
    taxaAceitacao: 96,
  },
]

const dt = (dia: number, hora: number, minuto = 0) => new Date(2025, 4, dia, hora, minuto)

/** Fila de ações e aprovações dos agentes — status refletem o funil de decisão. */
export const acoesAgentes: AcaoAgente[] = [
  {
    id: 'ACA-001',
    agenteId: 'ag-sequenciamento',
    titulo: 'Transferir campanha P27 para a linha L08',
    justificativa: 'Janela livre na L08 após a corretiva; troca dentro da mesma família de sólidos.',
    impacto: '+1,2% de OEE',
    status: 'Em análise',
    criadaEm: dt(19, 8, 42),
    responsavel: 'Juliana R.',
  },
  {
    id: 'ACA-002',
    agenteId: 'ag-materiais',
    titulo: 'Antecipar compra de Ibuprofeno API',
    justificativa: 'Cobertura de 1,4 dia com consumo ▲15%; lead time do fornecedor é de 12 dias.',
    impacto: 'evita risco de R$ 780 mil',
    impactoValor: 780_000,
    status: 'Pendente',
    criadaEm: dt(19, 8, 31),
    responsavel: 'Camila A.',
  },
  {
    id: 'ACA-003',
    agenteId: 'ag-manutencao',
    titulo: 'Abrir OT corretiva na L12 (troca de rolamento)',
    justificativa: 'Vibração de 12,3 mm/s no eixo principal; janela de menor impacto na quarta.',
    impacto: 'R$ 48 mil preservados',
    impactoValor: 48_000,
    status: 'Aprovada',
    criadaEm: dt(19, 8, 17),
    responsavel: 'Marcos O.',
  },
  {
    id: 'ACA-004',
    agenteId: 'ag-qualidade',
    titulo: 'Priorizar revisão do lote na QA',
    justificativa: 'Lote 2456789A com parâmetros dentro da faixa; liberação destrava a embalagem da L12.',
    impacto: 'reduz risco de desvio',
    status: 'Executada',
    criadaEm: dt(19, 7, 58),
    responsavel: 'Beatriz Q.',
  },
]

export function agentePorId(id: string): AgenteIA | undefined {
  return agentes.find((agente) => agente.id === id)
}

// ── Dados da tela /agentes ───────────────────────────────────────────────────

import type {
  DesempenhoAgente,
  NivelAutonomiaResumo,
  NoOrquestracao,
  RamoOrquestracao,
  SeloGovernanca,
} from './types'

/** Fluxo principal da orquestração (eventos processados hoje). */
export const orquestracaoPrincipal: NoOrquestracao[] = [
  { dominio: 'Planejamento', eventos: 28 },
  { dominio: 'Sequenciamento', eventos: 32 },
  { dominio: 'Materiais', eventos: 21 },
  { dominio: 'Execução', eventos: 12 },
]

/** Ramificações do fluxo — derivam dos nós principais. */
export const orquestracaoRamos: RamoOrquestracao[] = [
  { dominio: 'Alertas', eventos: 24, origem: 'Planejamento' },
  { dominio: 'Manutenção', eventos: 29, origem: 'Sequenciamento' },
  { dominio: 'Custos', eventos: 16, origem: 'Materiais' },
  { dominio: 'Qualidade', eventos: 18, origem: 'Execução' },
]

/** Distribuição da rede de 12 agentes por nível de autonomia. */
export const niveisAutonomia: NivelAutonomiaResumo[] = [
  { nivel: 'N1', rotulo: 'Visibilidade', percent: 0, agentes: 0 },
  { nivel: 'N2', rotulo: 'Recomendação', percent: 25, agentes: 3 },
  { nivel: 'N3', rotulo: 'Execução assistida', percent: 50, agentes: 6 },
  { nivel: 'N4', rotulo: 'Autonomia controlada', percent: 25, agentes: 3 },
]

/** Desempenho dos agentes nos últimos 30 dias. */
export const desempenhoAgentes: DesempenhoAgente[] = [
  { agenteId: 'ag-sequenciamento', acoes: 221, ganho: 612_000, assertividadePercent: 96, incidentes: 1 },
  { agenteId: 'ag-materiais', acoes: 176, ganho: 498_000, assertividadePercent: 93, incidentes: 2 },
  { agenteId: 'ag-manutencao', acoes: 154, ganho: 312_000, assertividadePercent: 91, incidentes: 1 },
  { agenteId: 'ag-qualidade', acoes: 132, ganho: 165_000, assertividadePercent: 94, incidentes: 0 },
  { agenteId: 'ag-planejamento', acoes: 118, ganho: 142_000, assertividadePercent: 95, incidentes: 1 },
  { agenteId: 'ag-auditoria', acoes: 87, ganho: null, assertividadePercent: 99, incidentes: 0 },
]

export const GOVERNANCA_AGENTES_SCORE = 91

/** Distribuição das decisões por faixa de governança. */
export const distribuicaoGovernanca = [
  { rotulo: 'Excelente', percent: 91, tone: 'success' as const },
  { rotulo: 'Atenção', percent: 7, tone: 'warning' as const },
  { rotulo: 'Risco', percent: 2, tone: 'danger' as const },
]

/** Selos do rodapé "Governança e Segurança". */
export const selosGovernanca: SeloGovernanca[] = [
  { titulo: 'Trilha de auditoria', detalhe: 'Ativa e íntegra' },
  { titulo: 'Políticas aplicadas', detalhe: '12 ativas' },
  { titulo: 'Grounding em dados', detalhe: 'Conectado e validado' },
  { titulo: 'Aprovações', detalhe: 'Fluxo conforme políticas' },
  { titulo: 'Conformidade', detalhe: 'LGPD | ISO 27001 | GMP' },
  { titulo: 'Explicabilidade', detalhe: 'Decisões auditáveis' },
]

export const ULTIMA_VERIFICACAO_GOVERNANCA = new Date(2025, 4, 19, 10, 15)
