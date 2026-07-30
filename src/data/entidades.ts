/**
 * Roteador de entidades por prefixo de ID — base do IdLink global e da busca:
 * qualquer ID clicável abre a ficha universal correspondente.
 */

export type TipoEntidade = 'ordem' | 'material' | 'lote' | 'ativo' | 'ot'

/** Lotes seguem o padrão 2456789A (7 dígitos + letra). */
const PADRAO_LOTE = /^\d{7}[A-Z]$/

export function tipoDaEntidade(id: string): TipoEntidade | undefined {
  if (id.startsWith('OF-')) return 'ordem'
  if (id.startsWith('MAT-')) return 'material'
  if (id.startsWith('OT-')) return 'ot'
  if (id.startsWith('eq-')) return 'ativo'
  if (PADRAO_LOTE.test(id)) return 'lote'
  return undefined
}
