/**
 * Visões do HPO — papéis funcionais que ajustam o contexto do usuário.
 * Nenhum dado do mockup exibe nome de pessoa: operadores, responsáveis e
 * aprovadores são sempre papéis funcionais.
 */
export interface Visao {
  id: string
  /** Nome completo: "Visão PCP". */
  nome: string
  /** Rótulo curto do chip do header: "PCP". */
  rotuloCurto: string
  /** Descrição de 1 linha exibida no seletor. */
  descricao: string
}

export const visoes: Visao[] = [
  {
    id: 'executiva',
    nome: 'Visão Executiva',
    rotuloCurto: 'Executiva',
    descricao: 'Diretoria industrial — panorama da rede, riscos e decisões.',
  },
  {
    id: 'pcp',
    nome: 'Visão PCP',
    rotuloCurto: 'PCP',
    descricao: 'Planejamento e sequenciamento da produção.',
  },
  {
    id: 'operacoes',
    nome: 'Visão Operações',
    rotuloCurto: 'Operações',
    descricao: 'Execução, qualidade, manutenção e materiais.',
  },
  {
    id: 'administracao',
    nome: 'Visão Administração',
    rotuloCurto: 'Administração',
    descricao: 'Configurações, integrações e governança da plataforma.',
  },
]

/** Visão padrão da demo. */
export const visaoPadrao = visoes[1]
