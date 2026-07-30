/**
 * Tipos do universo de dados do HPO. Todos os mocks em src/data usam estes
 * contratos — as telas nunca definem tipos de dados próprios.
 */
import type { Tone } from '@/lib/colors'

// ── Vocabulário comum ────────────────────────────────────────────────────────

export type Prioridade = 'Alta' | 'Média' | 'Baixa'
export type UnidadeProduto = 'COMP' | 'CAPS' | 'DRG' | 'FR'

// ── Fábricas e linhas ────────────────────────────────────────────────────────

export type StatusLinha = 'normal' | 'atencao' | 'critico' | 'parada'

export interface Linha {
  id: string
  /** Rótulo completo: "L03 — Cápsulas". */
  nome: string
  /** Tipo de processo: Cápsulas, Drágeas, Sólidos… */
  tipo: string
  fabricaId: string
  /** Capacidade utilizada em %. */
  capacidadeUtilizada: number
  /** OEE da linha em % (0 quando parada). */
  oee: number
  status: StatusLinha
}

export interface Fabrica {
  id: string
  nome: string
  uf: string
  linhas: Linha[]
}

// ── Produtos ─────────────────────────────────────────────────────────────────

export type FamiliaProduto = 'Analgésicos' | 'Antigripais' | 'Antitérmicos' | 'Vitaminas' | 'Outros'

export interface Produto {
  id: string
  nome: string
  familia: FamiliaProduto
  formaFarmaceutica: string
  /** Apresentação comercial: "CP 400/500mg". */
  apresentacao: string
  unidade: UnidadeProduto
}

// ── Ordens de produção ───────────────────────────────────────────────────────

export type StatusOrdem = 'Em execução' | 'Planejada' | 'Parada' | 'Concluída'
export type SituacaoOrdem = 'No prazo' | 'Atenção' | 'Em risco' | 'Bloqueada'

export interface OrdemProducao {
  /** ID no formato OF-045678. */
  id: string
  produtoId: string
  fabricaId: string
  linhaId: string
  inicio: Date
  fim: Date
  quantidade: number
  unidade: UnidadeProduto
  prioridade: Prioridade
  status: StatusOrdem
  /** Leitura de risco exibida na StatusPill, complementar ao status. */
  situacao: SituacaoOrdem
  /** Progresso em % (0–100). */
  progresso: number
  produzido: number
  /** Prontidão de materiais em %. */
  prontidaoMateriais: number
  operador: string
  observacao?: string
}

// ── Sequenciamento (blocos de Gantt) ─────────────────────────────────────────

export type TipoBloco = 'producao' | 'setup' | 'limpeza' | 'manutencao' | 'parada'

export interface BlocoSequencia {
  id: string
  linhaId: string
  tipo: TipoBloco
  /** Presente apenas em blocos de produção. */
  ordemId?: string
  rotulo: string
  inicio: Date
  fim: Date
}

// ── Materiais ────────────────────────────────────────────────────────────────

export type CategoriaMaterial = 'API' | 'Excipiente' | 'Embalagem' | 'Insumo'
export type StatusMaterial = 'Crítico' | 'Atenção' | 'Normal' | 'Bloqueado'
export type StatusCoA = 'Recebido' | 'Pendente'

export interface Material {
  /** ID no formato MAT-API-001. */
  id: string
  nome: string
  categoria: CategoriaMaterial
  unidade: string
  estoque: number
  coberturaDias: number
  /** Consumo médio diário, na mesma unidade do estoque. */
  consumoDia?: number
  /** Variação do consumo em % vs semana anterior. */
  variacaoConsumoPercent?: number
  estoqueSeguranca?: number
  leadTimeDias: number
  fornecedor: string
  loteAtual?: string
  validadeLote?: Date
  coa?: StatusCoA
  status: StatusMaterial
  /** Prontidão para as ordens da semana, em % (visão executiva). */
  prontidaoPercent: number
  proximaAcao: string
  linhasAfetadas?: string[]
  ordensAfetadas?: string[]
}

// ── Qualidade (lotes) ────────────────────────────────────────────────────────

export type StatusLote =
  | 'Em análise'
  | 'Aguardando documentação'
  | 'Em investigação'
  | 'Liberado'
  | 'Bloqueado'

export interface ParametroLote {
  nome: string
  valor: string
  faixa: string
  situacao: 'Dentro da faixa' | 'Fora da faixa'
}

export interface DocumentoLote {
  nome: string
  status: StatusCoA
}

export interface Lote {
  /** ID no formato 2456789A. */
  id: string
  produtoId: string
  linhaId: string
  ordemId?: string
  status: StatusLote
  prioridade: Prioridade
  /** Tempo na fila de QA, em minutos. */
  esperaMinutos?: number
  resultado?: 'Aprovado' | 'Reprovado'
  analista: string
  parametros?: ParametroLote[]
  documentos?: DocumentoLote[]
  observacao?: string
}

// ── Manutenção ───────────────────────────────────────────────────────────────

export type StatusEquipamento = 'Normal' | 'Atenção' | 'Crítico'
export type TipoManutencao = 'Preventiva' | 'Corretiva' | 'Preditiva' | 'Inspeção'

export interface IndicadorEquipamento {
  nome: string
  valor: number
  unidade: string
  /** Variação em % vs baseline; positiva = subiu. */
  variacaoPercent?: number
  situacao: StatusEquipamento
}

export interface Equipamento {
  id: string
  nome: string
  tipo: string
  fabricaId: string
  /** Ausente em ativos de utilidades (HVAC, torre…). */
  linhaId?: string
  area?: string
  status: StatusEquipamento
  /** Disponibilidade em %. */
  disponibilidade: number
  /** Variação da disponibilidade em p.p. vs última semana. */
  variacaoDisponibilidade?: number
  indicadores: IndicadorEquipamento[]
  ultimaManutencaoData: Date
  ultimaManutencaoTipo: TipoManutencao
  proximaPreventiva: Date
  /** Probabilidade de falha em 7 dias, em %. */
  probabilidadeFalha?: number
  nivelRiscoFalha?: Prioridade
  pecasCriticasEstoque?: number
  /** OT vinculada, formato OT-245689. */
  otVinculada?: string
}

export type StatusOT =
  | 'Aberta'
  | 'Planejada'
  | 'Em execução'
  | 'Aguardando peça'
  | 'Atrasada'
  | 'Concluída'

export interface OrdemManutencao {
  /** ID no formato OT-245689. */
  id: string
  ativoId: string
  tipo: TipoManutencao
  prioridade: Prioridade
  status: StatusOT
  janelaInicio: Date
  janelaFim: Date
  responsavel: string
  descricao: string
}

// ── Alertas e decisões ───────────────────────────────────────────────────────

export const AREAS_ALERTA = [
  'Materiais',
  'Manutenção',
  'Qualidade',
  'Performance',
  'Produção',
  'Energia',
] as const
export type AreaAlerta = (typeof AREAS_ALERTA)[number]

export type SeveridadeAlerta = 'Crítica' | 'Alta' | 'Média' | 'Baixa'
export type StatusAlerta = 'Aberto' | 'Em análise' | 'Pendente' | 'Monitorando' | 'Escalado' | 'Resolvido'

export interface Alerta {
  /** ID no formato AL-001. */
  id: string
  titulo: string
  descricao: string
  fabricaId: string
  linhaId?: string
  area: AreaAlerta
  severidade: SeveridadeAlerta
  /** Impacto financeiro estimado em R$. */
  impactoEstimado: number
  /** SLA para decisão, em horas. */
  slaHoras: number
  responsavel: string
  status: StatusAlerta
  acaoRecomendada: string
  ordemId?: string
  materialId?: string
  ativoId?: string
  loteId?: string
}

// ── Agentes IA ───────────────────────────────────────────────────────────────

export type NivelAutonomia = 'N2' | 'N3' | 'N4'
export type StatusAgente = 'Ativo' | 'Pausado' | 'Em treinamento'
export type StatusAcaoAgente = 'Pendente' | 'Aprovada' | 'Executada' | 'Rejeitada'

export interface AgenteIA {
  id: string
  nome: string
  /** Domínio de atuação: Planejamento, Materiais… */
  dominio: string
  descricao: string
  status: StatusAgente
  autonomia: NivelAutonomia
  tarefasHoje: number
  /** Cumprimento de SLA em %. */
  slaPercent: number
  /** Taxa de aceitação das propostas em %. */
  taxaAceitacao: number
}

export interface AcaoAgente {
  /** ID no formato ACA-001. */
  id: string
  agenteId: string
  titulo: string
  justificativa: string
  /** Leitura executiva do impacto: "evita risco de R$ 780 mil". */
  impacto: string
  impactoValor?: number
  status: StatusAcaoAgente
  criadaEm: Date
}

// ── Gêmeo da fábrica (simulação) ─────────────────────────────────────────────

export interface EventoSimulavel {
  /** ID no formato EV-001. */
  id: string
  nome: string
  descricao: string
}

export type RiscoCenario = 'Baixo' | 'Médio' | 'Alto'

export interface CenarioSimulacao {
  id: string
  nome: string
  descricao: string
  /** Eventos simulados que compõem o cenário. */
  eventos: string[]
  atendimentoPercent: number
  horasSetup: number
  /** null no plano-base (sem custo incremental). */
  custoIncremental: number | null
  skusComRuptura: number
  oeeProjetado: number
  risco: RiscoCenario
  recomendado: boolean
}

// ── Relatórios ───────────────────────────────────────────────────────────────

export type CategoriaRelatorio = 'Operacional' | 'Executivo' | 'Qualidade' | 'Manutenção' | 'Custos'
export type PeriodicidadeRelatorio = 'Diário' | 'Semanal' | 'Mensal' | 'Sob demanda'

export interface Relatorio {
  /** ID no formato REL-001. */
  id: string
  nome: string
  categoria: CategoriaRelatorio
  descricao: string
  periodicidade: PeriodicidadeRelatorio
  ultimaGeracao: Date
  formato: 'PDF' | 'XLSX'
  destaque?: string
}

// ── Copiloto Gemini ──────────────────────────────────────────────────────────

export interface ConteudoCopilot {
  /** Rota da tela: '/', '/planejamento'… */
  tela: string
  /** Saudação com o marcador {nome}, substituído pela persona atual. */
  saudacao: string
  resumo: string
  riscos: string[]
  causas: string[]
  acoes: string[]
  /** Bloco opcional "IMPACTO ESPERADO" (azul) — usado na visão executiva. */
  impactos?: string[]
  /** Rótulos dos 2–3 botões de ação contextuais. */
  botoes: string[]
}

export interface ParQA {
  id: string
  palavrasChave: string[]
  resposta: string
  fontes: string[]
}

// ── KPIs por tela ────────────────────────────────────────────────────────────

export interface KpiCardData {
  id: string
  label: string
  /** Valor final já formatado em pt-BR. */
  valor: string
  /** Delta já formatado, com sinal: "+3,4%", "-2,1 p.p.". */
  delta?: string
  /** Direção em que o delta é bom — a cor é contextual. */
  deltaGoodWhen?: 'up' | 'down'
  sublabel?: string
  tone?: Tone
  sparkline: number[]
}
