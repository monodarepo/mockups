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

export type TipoBloco = 'producao' | 'setup' | 'limpeza' | 'manutencao' | 'parada' | 'folga'

export interface BlocoSequencia {
  id: string
  linhaId: string
  tipo: TipoBloco
  /** Presente apenas em blocos de produção. */
  ordemId?: string
  rotulo: string
  inicio: Date
  fim: Date
  /** Bloco sob risco — borda vermelha e ícone no Gantt. */
  risco?: boolean
  motivoRisco?: string
}

// ── Execução (piso de fábrica) ───────────────────────────────────────────────

export type StatusExecucaoLinha = 'Normal' | 'Atenção' | 'Microparadas' | 'Parada'

export interface ExecucaoLinha {
  linhaId: string
  ordemId: string
  statusExecucao: StatusExecucaoLinha
  /** OEE do turno corrente, em %. */
  oeeTurno: number
  terminoPrevisto: Date
  turno: string
}

export interface PontoProducaoHora {
  label: string
  /** Produção real no bucket; null para horas ainda não decorridas. */
  real: number | null
  meta: number
}

export interface DetalheExecucaoOrdem {
  ordemId: string
  loteId?: string
  inicio: Date
  terminoPrevisto: Date
  eficienciaPercent: number
  eficienciaDeltaPP: number
  setupMinutos: number
  /** Δ vs plano em minutos — negativo = melhor que o plano. */
  setupDeltaMinutos: number
  velocidadeRealHora: number
  velocidadeMetaHora: number
  yieldPercent: number
  yieldDeltaPP: number
  refugoPercent: number
  refugoDeltaPP: number
  producaoPorHora: PontoProducaoHora[]
}

export interface MotivoParada {
  motivo: string
  minutos: number
  percent: number
}

export interface ItemProntidaoOperacional {
  item: string
  situacao: string
  percent: number
}

// ── Restrições do sequenciamento ─────────────────────────────────────────────

export type TipoRestricao = 'material' | 'manutencao' | 'qualidade' | 'capacidade' | 'setup' | 'folga'

export interface Restricao {
  id: string
  tipo: TipoRestricao
  titulo: string
  detalhe: string
  severidade: SeveridadeAlerta
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
  /** Quantidade em pedidos abertos, na unidade do material. */
  pedidosAbertos: number
  /** Variação do estoque vs semana anterior, em %. */
  variacaoEstoquePercent: number
  proximaAcao: string
  linhasAfetadas?: string[]
  ordensAfetadas?: string[]
}

export interface EventoMaterial {
  id: string
  /** Hora do evento: "09:58". */
  hora: string
  titulo: string
  severidade: SeveridadeAlerta
}

export interface OrdemImpactada {
  ordemId: string
  materialId: string
  impacto: 'Atraso de 6 h' | 'Atraso de 4 h' | 'Sem impacto'
  risco: 'Alto' | 'Médio' | 'Baixo'
}

export interface PontoTendenciaMaterial {
  label: string
  /** Consumo acumulado nas últimas 24 h (kg ou unidade do material). */
  consumo: number
  /** Estoque projetado (unidade do material). */
  estoque: number
  /** Cobertura em dias. */
  cobertura: number
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
  /** Início da produção do lote. */
  inicio?: Date
  /** Próxima ação da fila: "Revisar resultados", "Enviar CoA"… */
  proximaAcao: string
  parametros?: ParametroLote[]
  documentos?: DocumentoLote[]
  observacao?: string
}

export interface AreaQualidade {
  area: string
  percent: number
}

export interface DesvioRanking {
  id: string
  desvio: string
  severidade: 'Alta' | 'Média' | 'Baixa'
  quantidade: number
  percent: number
}

export interface PontoTendenciaQualidade {
  label: string
  /** Taxa de aprovação em %. */
  aprovacao: number
  /** Desvios abertos no bucket. */
  desvios: number
  /** Lotes liberados no bucket. */
  liberados: number
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
  | 'Programada'
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

/** Alerta preditivo exibido na tela /manutencao. */
export interface AlertaPreditivo {
  id: string
  severidade: SeveridadeAlerta
  evento: string
  causaProvavel: string
  proximaAcao: string
  ativoId?: string
}

export type JanelaCondicao = '6h' | '24h' | '7d'

/** Ponto da tendência de condição do ativo (vibração, temperatura, energia). */
export interface PontoCondicao {
  label: string
  vibracao: number
  temperatura: number
  energia: number
}

// ── Custos e performance ─────────────────────────────────────────────────────

/** Ponto horário da visão financeira do turno, em R$ mil. */
export interface PontoFinanceiroHora {
  label: string
  custoReal: number
  custoOrcado: number
  margem: number
}

export interface ComposicaoCusto {
  id: string
  categoria: string
  percent: number
  /** Valor no turno, em R$. */
  valor: number
}

export interface DriverCusto {
  id: string
  driver: string
  /** Desvio no turno, em R$. */
  valor: number
  percent: number
}

export interface PerformanceLinha {
  linhaId: string
  /** Custo por unidade, em R$. */
  custoUnidade: number
  oee: number
  yieldPercent: number
  refugoPercent: number
  situacao: 'Crítico' | 'Atenção' | 'Normal'
  /** Impacto financeiro vs padrão, em R$ (negativo = perda). */
  impactoFinanceiro: number
}

export interface ItemProntidaoFinanceira {
  item: string
  /** Valor já formatado em pt-BR. */
  valor: string
}

export interface OrdemImpactoFinanceiro {
  ordemId: string
  /** Custos em R$. */
  custoReal: number
  custoOrcado: number
  margemPercent: number
  /** Impacto financeiro em R$ (negativo = perda). */
  impactoFinanceiro: number
  aderenciaPercent: number
  aderenciaDeltaPP: number
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
  causaProvavel: string
  impactoOperacional: string
  /** Alternativas à recomendação principal. */
  alternativas: string[]
  ordemId?: string
  materialId?: string
  ativoId?: string
  loteId?: string
}

/** Etapa do funil "Fluxo de Decisão" da central de alertas. */
export interface EtapaFluxoDecisao {
  id: 'detectado' | 'analisando' | 'recomendado' | 'aprovado' | 'executando' | 'resolvido'
  rotulo: string
  valor: number
  /** Variação vs 1 h atrás, com sinal. */
  deltaHora: string
  deltaGoodWhen: 'up' | 'down'
}

export interface RiscoCategoria {
  id: string
  categoria: string
  valor: number
  percent: number
}

export interface QuadranteMatriz {
  id: string
  rotulo: string
  quantidade: number
  tone: 'danger' | 'warning' | 'success' | 'info'
}

export interface ItemProntidaoDecisao {
  item: string
  percent: number
}

export interface AprovacaoAgendada {
  id: string
  decisao: string
  responsavel: string
  prazoRotulo: string
}

// ── Agentes IA ───────────────────────────────────────────────────────────────

export type NivelAutonomia = 'N2' | 'N3' | 'N4'
export type StatusAgente = 'Ativo' | 'Monitorando' | 'Em aprovação' | 'Pausado' | 'Em treinamento'
export type StatusAcaoAgente = 'Em análise' | 'Pendente' | 'Aprovada' | 'Executada' | 'Rejeitada'

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
  /** Alçada humana responsável pela decisão: "Alçada: Suprimentos". */
  responsavel: string
}

/** Nó do diagrama de orquestração dos agentes. */
export interface NoOrquestracao {
  dominio: string
  /** Eventos processados hoje. */
  eventos: number
}

export interface RamoOrquestracao extends NoOrquestracao {
  /** Domínio do fluxo principal de onde o ramo deriva. */
  origem: string
}

export interface NivelAutonomiaResumo {
  nivel: 'N1' | 'N2' | 'N3' | 'N4'
  rotulo: string
  /** Participação dos agentes da rede neste nível, em %. */
  percent: number
  agentes: number
}

export interface DesempenhoAgente {
  agenteId: string
  /** Ações executadas nos últimos 30 dias. */
  acoes: number
  /** Ganho gerado em R$; null para agentes de suporte (Auditoria). */
  ganho: number | null
  assertividadePercent: number
  incidentes: number
}

export interface SeloGovernanca {
  titulo: string
  detalhe: string
}

// ── Planejamento (horizonte semanal W21–W25) ─────────────────────────────────

export interface SemanaCarga {
  semana: string
  /** Faixa de datas exibida no tooltip: "20 – 26/mai". */
  faixa: string
  /** Carga planejada em horas (barra azul). */
  carga: number
  /** Capacidade adicional aprovada em horas (barra verde). */
  adicional: number
  /** Horas acima da capacidade disponível (barra vermelha). */
  excedente: number
}

export interface CoberturaFabrica {
  fabrica: string
  /** Dias de cobertura por semana (W21–W25). */
  valores: number[]
  total?: boolean
}

export interface SkuRisco {
  /** Código SKU no formato 101.123. */
  codigo: string
  produto: string
  fabrica: string
  risco: 'Alto' | 'Médio' | 'Baixo'
  ruptura: Date
}

export interface PlanoLinha {
  linhaId: string
  /** Horas planejadas por semana (W21–W25). */
  horas: number[]
}

export interface CampanhaCalendario {
  familia: FamiliaProduto
  semana: string
  rotulo: string
}

// ── Gêmeo da fábrica (simulação) ─────────────────────────────────────────────

export interface EventoSimulavel {
  /** ID no formato EV-001. */
  id: string
  nome: string
  descricao: string
  /** Impacto preliminar em 1 linha — exibido no card do simulador. */
  impactoPreliminar: string
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

export type CategoriaRelatorio =
  | 'Operacional'
  | 'Executivo'
  | 'Qualidade'
  | 'Manutenção'
  | 'Materiais'
  | 'Custos'
  | 'Customizado'
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
  responsavel: string
  situacao: 'Atualizado' | 'Sob demanda'
  destaque?: string
}

/** Ponto da linha de leituras dos últimos 7 dias. */
export interface PontoLeituras {
  label: string
  valor: number
}

/** Mini-indicador do bloco "Distribuição e Consumo". */
export interface IndicadorConsumo {
  id: string
  label: string
  valor: string
  delta: string
  deltaGoodWhen: 'up' | 'down'
}

export interface AgendamentoRelatorio {
  id: string
  relatorioId: string
  destinatarios: string
  proximoEnvio: Date
  canal: 'E-mail' | 'Teams'
  status: 'Programado'
}

export interface CategoriaCatalogo {
  area: string
  quantidade: number
}

export interface GovernancaRelatorios {
  item: string
  percent: number
  /** Rótulo exibido à direita quando não é um percentual puro: "22/24". */
  valorRotulo?: string
}

// ── Gêmeo da fábrica (planta interativa) ─────────────────────────────────────

export type StatusAreaGemeo = 'normal' | 'atencao' | 'critico' | 'parada' | 'manutencao' | 'sem-dados'

export interface ParametroArea {
  nome: string
  valor: string
  situacao: 'Normal' | 'Atenção' | 'Crítico'
}

export interface EquipamentoArea {
  nome: string
  condicao: 'Normal' | 'Atenção' | 'Crítico'
}

export interface DetalheAreaGemeo {
  /** Nome do bloco na planta: "Compressão (L12)", "Armazém MP"… */
  area: string
  tipo: 'linha' | 'apoio'
  status: StatusAreaGemeo
  /** Leitura de 1 linha exibida no pin/tooltip e no topo do drawer. */
  resumo: string
  linhaId?: string
  ordemId?: string
  loteId?: string
  /** Perda acumulada do turno, em %. */
  perdaAcumuladaPercent?: number
  parametros?: ParametroArea[]
  /** Rótulo da próxima ordem: "OF-045686 · Novalgina — 14:30". */
  proximaOrdem?: string
  previsaoTermino?: Date
  equipamentos?: EquipamentoArea[]
  /** Indicadores simples das áreas de apoio. */
  indicadores?: Array<{ nome: string; valor: string }>
  /** Ativo de manutenção associado — habilita "Ver Manutenção" com contexto. */
  ativoId?: string
  /** Nota do fio da história exibida em destaque no drawer. */
  fio?: string
}

// ── Configurações ────────────────────────────────────────────────────────────

export interface TileResumoConfig {
  id: string
  valor: number
  rotulo: string
  sublabel: string
}

export interface ServicoSistema {
  servico: string
  status: 'Operacional'
  detalhe: string
}

export interface IntegracaoConfig {
  id: string
  nome: string
  detalhe: string
  status: 'Ativo'
  ultimaSincronizacao: string
  latenciaMs: number
}

export interface RegraNegocio {
  id: string
  nome: string
  criticidade: 'Alta' | 'Média' | 'Baixa'
  status: 'Ativa'
  ultimaExecucao: string
}

export interface PerfilUsuarios {
  perfil: string
  quantidade: number
  permissao: string
}

export interface ConfiguracaoRapida {
  id: string
  titulo: string
  descricao: string
}

export interface ParametroSistema {
  parametro: string
  valor: string
}

export interface CanalNotificacao {
  id: string
  canal: string
  evento: string
  destinatarios: string
  status: 'Ativo' | 'Pausado'
}

export interface EventoAuditoria {
  id: string
  quando: string
  usuario: string
  acao: string
  origem: string
}

// ── Copiloto Gemini ──────────────────────────────────────────────────────────

export interface ConteudoCopilot {
  /** Rota da tela: '/', '/planejamento'… */
  tela: string
  /** Resumo da situação — o cabeçalho de contexto vem da visão ativa do store. */
  resumo: string
  riscos: string[]
  causas: string[]
  acoes: string[]
  /** Bloco opcional "IMPACTO ESPERADO" (azul) — usado na visão executiva. */
  impactos?: string[]
  /** Rótulos dos 2–3 botões de ação contextuais. */
  botoes: string[]
  /** 3 chips de perguntas sugeridas acima do input — todas com match no banco Q&A. */
  perguntasSugeridas: string[]
}

/** Ação opcional oferecida junto com uma resposta do assistente. */
export interface AcaoRespostaQA {
  rotulo: string
  tipo: 'abrir-simulador'
  eventoId: string
}

export interface ParQA {
  id: string
  palavrasChave: string[]
  resposta: string
  fontes: string[]
  acao?: AcaoRespostaQA
}

/** Mensagem do chat do copiloto — o histórico por tela vive no store. */
export interface MensagemCopilot {
  id: number
  autor: 'usuario' | 'copiloto'
  texto: string
  fontes?: string[]
  acao?: AcaoRespostaQA
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
