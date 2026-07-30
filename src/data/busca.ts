import { navegacao } from './navigation'
import { ordens } from './ordens'
import { produtoPorId, produtos } from './produtos'
import { materiais } from './materiais'
import { lotes } from './lotes'
import { equipamentos } from './equipamentos'
import { ordensManutencao } from './manutencao'
import { linhaPorId } from './fabricas'

/**
 * Índice em memória da busca global (paleta de comandos). Construído a partir
 * dos dados centralizados de src/data — nunca de dados locais de tela.
 */

export type TipoBusca = 'acao' | 'tela' | 'ordem' | 'produto' | 'material' | 'lote' | 'ativo' | 'ot'

export interface ItemBusca {
  id: string
  tipo: TipoBusca
  titulo: string
  subtitulo: string
  /** Rota de destino (com ?destaque= quando a tela realça a linha). */
  destino: string
  /** Texto normalizado usado no casamento da consulta. */
  chaves: string
}

/** Ordem e rótulo dos grupos exibidos na paleta. */
export const GRUPOS_BUSCA: Array<{ tipo: TipoBusca; rotulo: string }> = [
  { tipo: 'acao', rotulo: 'Ações rápidas' },
  { tipo: 'tela', rotulo: 'Telas' },
  { tipo: 'ordem', rotulo: 'Ordens de produção' },
  { tipo: 'produto', rotulo: 'Produtos' },
  { tipo: 'material', rotulo: 'Materiais' },
  { tipo: 'lote', rotulo: 'Lotes' },
  { tipo: 'ativo', rotulo: 'Ativos' },
  { tipo: 'ot', rotulo: 'Ordens de manutenção' },
]

/** Remove acentos e baixa a caixa — busca tolerante a acentuação. */
export function normalizarBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/** Ações rápidas: executam o fluxo real do store ao serem escolhidas. */
export const ACOES_RAPIDAS = [
  {
    id: 'acao-otimizar-sequencia',
    titulo: 'Otimizar sequência',
    subtitulo: '−3 setups · +10,7 h de capacidade na semana',
  },
  {
    id: 'acao-abrir-simulador',
    titulo: 'Abrir simulador',
    subtitulo: 'Comparar cenários de recuperação',
  },
  {
    id: 'acao-gerar-resumo',
    titulo: 'Gerar resumo executivo',
    subtitulo: 'Preview com os KPIs do dia em Relatórios',
  },
] as const

function item(
  tipo: TipoBusca,
  id: string,
  titulo: string,
  subtitulo: string,
  destino: string,
  chavesExtras = '',
): ItemBusca {
  return { id, tipo, titulo, subtitulo, destino, chaves: normalizarBusca(`${id} ${titulo} ${subtitulo} ${chavesExtras}`) }
}

/** Primeira ordem da semana que produz o produto — destino do grupo Produtos. */
function ordemDoProduto(produtoId: string): string | undefined {
  return ordens.find((ordem) => ordem.produtoId === produtoId)?.id
}

export const indiceBusca: ItemBusca[] = [
  ...ACOES_RAPIDAS.map((acao) => item('acao', acao.id, acao.titulo, acao.subtitulo, '')),
  ...navegacao.map((tela) => item('tela', tela.path, tela.label, tela.subtitulo, tela.path)),
  ...ordens.map((ordem) => {
    const produto = produtoPorId(ordem.produtoId)
    return item(
      'ordem',
      ordem.id,
      ordem.id,
      `${produto?.nome ?? ordem.produtoId} · ${ordem.linhaId} · ${ordem.status}`,
      `/sequenciamento?destaque=${ordem.id}`,
      produto?.nome ?? '',
    )
  }),
  ...produtos.map((produto) => {
    const ordemId = ordemDoProduto(produto.id)
    return item(
      'produto',
      produto.id,
      produto.nome,
      `${produto.familia} · ${produto.apresentacao}`,
      ordemId ? `/planejamento?destaque=${ordemId}` : '/planejamento',
    )
  }),
  ...materiais.map((material) =>
    item(
      'material',
      material.id,
      material.nome,
      `${material.id} · cobertura ${String(material.coberturaDias).replace('.', ',')} dias · ${material.status}`,
      `/materiais?destaque=${material.id}`,
    ),
  ),
  ...lotes.map((lote) => {
    const produto = produtoPorId(lote.produtoId)
    return item(
      'lote',
      lote.id,
      `Lote ${lote.id}`,
      `${produto?.nome ?? lote.produtoId} · ${lote.linhaId} · ${lote.status}`,
      `/qualidade?destaque=${lote.id}`,
      produto?.nome ?? '',
    )
  }),
  ...equipamentos.map((ativo) =>
    item(
      'ativo',
      ativo.id,
      ativo.nome,
      `${ativo.tipo} · ${ativo.linhaId ? (linhaPorId(ativo.linhaId)?.nome ?? ativo.linhaId) : (ativo.area ?? 'Anápolis')} · ${ativo.status}`,
      `/manutencao?ativo=${ativo.id}${ativo.otVinculada ? `&destaque=${ativo.otVinculada}` : ''}`,
    ),
  ),
  ...ordensManutencao.map((ot) =>
    item('ot', ot.id, ot.id, `${ot.tipo} · ${ot.status} · ${ot.responsavel}`, `/manutencao?destaque=${ot.id}`),
  ),
]

export interface GrupoResultados {
  tipo: TipoBusca
  rotulo: string
  itens: ItemBusca[]
}

/**
 * Busca por substring normalizada, agrupada por tipo. Consulta vazia devolve
 * ações rápidas + telas (atalhos de navegação).
 */
export function buscar(consulta: string, limitePorGrupo = 5): GrupoResultados[] {
  const termo = normalizarBusca(consulta.trim())
  const base = termo
    ? indiceBusca.filter((entrada) => entrada.chaves.includes(termo))
    : indiceBusca.filter((entrada) => entrada.tipo === 'acao' || entrada.tipo === 'tela')

  return GRUPOS_BUSCA.map(({ tipo, rotulo }) => ({
    tipo,
    rotulo,
    itens: base.filter((entrada) => entrada.tipo === tipo).slice(0, limitePorGrupo),
  })).filter((grupo) => grupo.itens.length > 0)
}
