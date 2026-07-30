import type { Lote } from './types'

/** Fila de QA em 19/mai/2025, 10:18. */
export const lotes: Lote[] = [
  {
    id: '2456789A',
    produtoId: 'buscopan-composto',
    linhaId: 'L12',
    ordemId: 'OF-045678',
    status: 'Em análise',
    prioridade: 'Alta',
    esperaMinutos: 138, // 2h18
    analista: 'Fernanda Ribeiro',
    parametros: [
      { nome: 'Peso médio', valor: '401,2 mg', faixa: '380 – 420 mg', situacao: 'Dentro da faixa' },
      { nome: 'Dureza', valor: '9,2 Kgf', faixa: '6 – 12 Kgf', situacao: 'Dentro da faixa' },
      { nome: 'Umidade', valor: '2,8%', faixa: '≤ 3,5%', situacao: 'Dentro da faixa' },
      { nome: 'Inspeção visual', valor: 'Conforme', faixa: 'Conforme', situacao: 'Dentro da faixa' },
    ],
    documentos: [
      { nome: 'CoA', status: 'Recebido' },
      { nome: 'Laudo', status: 'Pendente' },
      { nome: 'Relatório de Produção', status: 'Recebido' },
      { nome: 'Protocolo de Limpeza', status: 'Recebido' },
    ],
  },
  {
    id: '2456790B',
    produtoId: 'dorflex',
    linhaId: 'L05',
    ordemId: 'OF-045681',
    status: 'Aguardando documentação',
    prioridade: 'Média',
    esperaMinutos: 65,
    analista: 'Otávio Sales',
    observacao: 'Relatório de produção pendente de assinatura do supervisor.',
  },
  {
    id: '2456791C',
    produtoId: 'neosaldina',
    linhaId: 'L08',
    ordemId: 'OF-045679',
    status: 'Em investigação',
    prioridade: 'Alta',
    esperaMinutos: 212, // 3h32
    analista: 'Fernanda Ribeiro',
    observacao: 'Variação de peso próxima ao limite superior — mesma causa das microparadas da L08.',
  },
  {
    id: '2456792D',
    produtoId: 'benegrip-multi',
    linhaId: 'L03',
    ordemId: 'OF-045680',
    status: 'Liberado',
    prioridade: 'Média',
    resultado: 'Aprovado',
    analista: 'Juliana Prates',
    observacao: 'Liberado às 09:40 sem desvios.',
  },
  {
    id: '2456793E',
    produtoId: 'apracur',
    linhaId: 'L03',
    status: 'Bloqueado',
    prioridade: 'Alta',
    esperaMinutos: 347, // 5h47
    resultado: 'Reprovado',
    analista: 'Otávio Sales',
    observacao: 'Teor fora da especificação — investigação de causa raiz aberta.',
  },
  {
    id: '2456794F',
    produtoId: 'addera-d3',
    linhaId: 'L03',
    status: 'Em análise',
    prioridade: 'Baixa',
    esperaMinutos: 48,
    analista: 'Juliana Prates',
  },
]

export function lotePorId(id: string): Lote | undefined {
  return lotes.find((lote) => lote.id === id)
}
