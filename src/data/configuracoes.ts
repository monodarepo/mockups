import type {
  CanalNotificacao,
  ConfiguracaoRapida,
  EventoAuditoria,
  IntegracaoConfig,
  ParametroSistema,
  PerfilUsuarios,
  RegraNegocio,
  ServicoSistema,
  TileResumoConfig,
} from './types'

/**
 * Dados da tela /configuracoes — administração da plataforma em 19/mai/2025.
 * Contagens coerentes com o resto do app: 12 agentes na rede (mesmo número
 * da tela /agentes) e 128 usuários somando os 5 perfis.
 */

export const resumoConfiguracoes: TileResumoConfig[] = [
  { id: 'cf-sistemas', valor: 12, rotulo: 'Sistemas Integrados', sublabel: 'Ativos' },
  { id: 'cf-agentes', valor: 12, rotulo: 'Agentes de IA', sublabel: 'Ativos na rede' },
  { id: 'cf-regras', valor: 32, rotulo: 'Regras de Negócio', sublabel: 'Ativas' },
  { id: 'cf-usuarios', valor: 128, rotulo: 'Usuários Cadastrados', sublabel: '5 perfis de acesso' },
]

export const statusSistema: ServicoSistema[] = [
  { servico: 'Banco de Dados', status: 'Operacional', detalhe: 'réplicas síncronas · 12 ms' },
  { servico: 'Armazenamento', status: 'Operacional', detalhe: '68% utilizado' },
  { servico: 'Processamento de IA', status: 'Operacional', detalhe: 'fila em 0,4 s' },
  { servico: 'Serviços de Integração', status: 'Operacional', detalhe: '22 de 24 fontes ativas' },
]

export const ULTIMA_VERIFICACAO_SISTEMA = new Date(2025, 4, 19, 9, 30)

export const ambiente = {
  atual: 'PRODUÇÃO',
  versao: 'v2.8.1',
  regiao: 'southamerica-east1',
  ultimoDeploy: new Date(2025, 4, 18, 22, 15),
}

export const integracoesConfig: IntegracaoConfig[] = [
  { id: 'int-sap', nome: 'SAP S/4HANA', detalhe: 'Ordens, materiais e custos', status: 'Ativo', ultimaSincronizacao: '10:12', latenciaMs: 240 },
  { id: 'int-mes', nome: 'MES (Wonderware)', detalhe: 'Telemetria de produção', status: 'Ativo', ultimaSincronizacao: '10:18', latenciaMs: 80 },
  { id: 'int-pi', nome: 'Historian (PI System)', detalhe: 'Séries de processo', status: 'Ativo', ultimaSincronizacao: '10:18', latenciaMs: 95 },
  { id: 'int-lims', nome: 'Quality System (LIMS)', detalhe: 'Lotes, laudos e desvios', status: 'Ativo', ultimaSincronizacao: '10:05', latenciaMs: 310 },
  { id: 'int-cmms', nome: 'CMMS (Maximo)', detalhe: 'OTs e planos de manutenção', status: 'Ativo', ultimaSincronizacao: '10:10', latenciaMs: 280 },
]

export const regrasNegocio: RegraNegocio[] = [
  { id: 'rn-01', nome: 'Regra de Alerta de Qualidade', criticidade: 'Alta', status: 'Ativa', ultimaExecucao: '10:15' },
  { id: 'rn-02', nome: 'Regra de Manutenção Preditiva', criticidade: 'Alta', status: 'Ativa', ultimaExecucao: '10:00' },
  { id: 'rn-03', nome: 'Regra de Reposição de Estoque', criticidade: 'Média', status: 'Ativa', ultimaExecucao: '09:45' },
  { id: 'rn-04', nome: 'Regra de Performance OEE', criticidade: 'Média', status: 'Ativa', ultimaExecucao: '10:10' },
  { id: 'rn-05', nome: 'Regra de Desvio de Custo', criticidade: 'Baixa', status: 'Ativa', ultimaExecucao: '09:30' },
]

export const perfisUsuarios: PerfilUsuarios[] = [
  { perfil: 'Administradores', quantidade: 8, permissao: 'Acesso total e gestão da plataforma' },
  { perfil: 'Supervisores', quantidade: 24, permissao: 'Aprovação de decisões e ajustes de plano' },
  { perfil: 'Operadores', quantidade: 72, permissao: 'Execução e apontamentos de piso' },
  { perfil: 'Analistas', quantidade: 16, permissao: 'Relatórios e análises avançadas' },
  { perfil: 'Visualizadores', quantidade: 8, permissao: 'Somente leitura de painéis' },
]

export const configuracoesRapidas: ConfiguracaoRapida[] = [
  { id: 'cr-parametros', titulo: 'Parâmetros do Sistema', descricao: 'Fuso, idioma, retenção de dados e janelas de manutenção.' },
  { id: 'cr-dashboards', titulo: 'Dashboards', descricao: 'Painéis padrão por persona e telas compartilhadas.' },
  { id: 'cr-kpis', titulo: 'KPIs e Metas', descricao: 'Metas de OEE, aderência, qualidade e custo por linha.' },
  { id: 'cr-alertas', titulo: 'Alertas', descricao: 'Limiares, SLAs de decisão e regras de escalonamento.' },
  { id: 'cr-backup', titulo: 'Backup & Recuperação', descricao: 'Cópias diárias 01:00 · retenção de 35 dias.' },
  { id: 'cr-logs', titulo: 'Logs do Sistema', descricao: 'Trilhas técnicas e exportação para o SIEM corporativo.' },
]

// ── Abas simples ─────────────────────────────────────────────────────────────

export const parametrosSistema: ParametroSistema[] = [
  { parametro: 'Fuso horário', valor: 'America/Sao_Paulo (UTC−3)' },
  { parametro: 'Idioma da plataforma', valor: 'Português (Brasil)' },
  { parametro: 'Data-base da simulação', valor: '19/05/2025 · Turno A' },
  { parametro: 'Retenção de dados operacionais', valor: '24 meses' },
  { parametro: 'Janela de manutenção do sistema', valor: 'Domingo · 02:00 – 04:00' },
  { parametro: 'Tempo de sessão', valor: '8 horas · renovação automática' },
]

export const canaisNotificacao: CanalNotificacao[] = [
  { id: 'nt-01', canal: 'E-mail', evento: 'Alertas críticos e SLAs vencendo', destinatarios: 'Supervisores e diretoria', status: 'Ativo' },
  { id: 'nt-02', canal: 'Teams', evento: 'Decisões aprovadas e cenários aplicados', destinatarios: 'Sala Torre de Controle', status: 'Ativo' },
  { id: 'nt-03', canal: 'Push (mobile)', evento: 'Paradas de linha e falhas preditas', destinatarios: 'Manutenção e PCP', status: 'Ativo' },
  { id: 'nt-04', canal: 'E-mail', evento: 'Resumo executivo diário (07:00)', destinatarios: 'Diretoria Industrial (8)', status: 'Ativo' },
  { id: 'nt-05', canal: 'Teams', evento: 'Relatórios agendados', destinatarios: 'Gerências por área', status: 'Ativo' },
]

export const eventosAuditoria: EventoAuditoria[] = [
  { id: 'aud-01', quando: '19/05 10:15', usuario: 'Sistema', acao: 'Verificação de integridade da trilha concluída', origem: 'Plataforma' },
  { id: 'aud-02', quando: '19/05 10:02', usuario: 'Camila Azevedo', acao: 'Aprovou ação do Agente de Materiais (ACA-002)', origem: 'Agentes IA' },
  { id: 'aud-03', quando: '19/05 09:41', usuario: 'Ricardo Martins', acao: 'Exportou o Resumo Executivo da Produção', origem: 'Relatórios' },
  { id: 'aud-04', quando: '19/05 08:17', usuario: 'Marcos Oliveira', acao: 'Aprovou OT corretiva na L12 (troca de rolamento)', origem: 'Manutenção' },
  { id: 'aud-05', quando: '18/05 22:15', usuario: 'Marina Oliveira', acao: 'Deploy da versão v2.8.1 concluído', origem: 'Plataforma' },
  { id: 'aud-06', quando: '18/05 18:40', usuario: 'Marina Oliveira', acao: 'Atualizou limite de alçada das ações N4', origem: 'Configurações' },
]
