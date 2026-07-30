import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAppStore } from '@/store'

export interface ColunaDataTable<T> {
  id: string
  titulo: string
  render: (linha: T) => ReactNode
  /** Acessor de ordenação — a coluna só é ordenável quando definido. */
  valor?: (linha: T) => string | number | Date
  alinhar?: 'esquerda' | 'direita'
  /** Classe de largura opcional (ex.: "w-32"). */
  largura?: string
}

interface DataTableProps<T> {
  colunas: ColunaDataTable<T>[]
  linhas: T[]
  chave: (linha: T) => string
  /** Descrição da tabela para leitores de tela. */
  rotulo: string
  /** Coluna de ação por linha (botão-texto à direita); rótulo pode variar por linha. */
  acao?: { rotulo: string | ((linha: T) => string); onClick: (linha: T) => void }
  /** Altura máxima em px — ativa scroll interno com header fixo. */
  alturaMax?: number
  ordenacaoInicial?: { coluna: string; direcao: 'asc' | 'desc' }
  /** Torna as linhas clicáveis (seleção). */
  onLinhaClick?: (linha: T) => void
  /** Chave da linha selecionada — destacada em azul suave. */
  linhaSelecionada?: string
  /** Chave da linha destacada pela busca global — pisca 2x e rola até ela. */
  linhaDestacada?: string
}

function comparar(a: string | number | Date, b: string | number | Date): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true })
}

/**
 * ID renderizado como link azul (OF-, OT-, MAT-, eq-, lotes). Sempre abre a
 * ficha universal da entidade, roteada pelo prefixo do ID; um onClick extra
 * (ex.: selecionar a linha na tela) roda junto.
 */
export function IdLink({ id, onClick }: { id: string; onClick?: (id: string) => void }) {
  const abrirFicha = useAppStore((s) => s.abrirFicha)
  return (
    <button
      type="button"
      onClick={(evento) => {
        // Dentro de tabelas com onLinhaClick, o link não dispara a seleção da linha.
        evento.stopPropagation()
        onClick?.(id)
        abrirFicha(id)
      }}
      className={cn(
        'font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline',
        'rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      )}
    >
      {id}
    </button>
  )
}

export function DataTable<T>({
  colunas,
  linhas,
  chave,
  rotulo,
  acao,
  alturaMax,
  ordenacaoInicial,
  onLinhaClick,
  linhaSelecionada,
  linhaDestacada,
}: DataTableProps<T>) {
  const rolarParaDestaque = (elemento: HTMLTableRowElement | null) => {
    if (!elemento) return
    const reduzMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    elemento.scrollIntoView({ block: 'center', behavior: reduzMotion ? 'auto' : 'smooth' })
  }
  const [ordenacao, setOrdenacao] = useState<{ coluna: string; direcao: 'asc' | 'desc' } | null>(
    ordenacaoInicial ?? null,
  )

  const ordenadas = useMemo(() => {
    if (!ordenacao) return linhas
    const coluna = colunas.find((item) => item.id === ordenacao.coluna)
    if (!coluna?.valor) return linhas
    const acessor = coluna.valor
    const fator = ordenacao.direcao === 'asc' ? 1 : -1
    return [...linhas].sort((a, b) => comparar(acessor(a), acessor(b)) * fator)
  }, [linhas, colunas, ordenacao])

  const alternarOrdenacao = (colunaId: string) => {
    setOrdenacao((atual) => {
      if (atual?.coluna !== colunaId) return { coluna: colunaId, direcao: 'asc' }
      if (atual.direcao === 'asc') return { coluna: colunaId, direcao: 'desc' }
      return null
    })
  }

  return (
    <div
      className={cn('min-w-0 overflow-x-auto', alturaMax !== undefined && 'overflow-y-auto')}
      style={alturaMax !== undefined ? { maxHeight: alturaMax } : undefined}
    >
      <table className="w-full border-collapse text-body-sm" aria-label={rotulo}>
        <thead>
          <tr>
            {colunas.map((coluna) => {
              const ordenavel = coluna.valor !== undefined
              const ativa = ordenacao?.coluna === coluna.id
              const IconeOrdem = !ativa ? ArrowUpDown : ordenacao?.direcao === 'asc' ? ArrowUp : ArrowDown
              return (
                <th
                  key={coluna.id}
                  scope="col"
                  aria-sort={ativa ? (ordenacao?.direcao === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cn(
                    'sticky top-0 z-10 h-10 whitespace-nowrap bg-card px-3 text-caption font-semibold text-muted',
                    'shadow-[inset_0_-1px_0_#E6EBF2]',
                    coluna.alinhar === 'direita' ? 'text-right' : 'text-left',
                    coluna.largura,
                  )}
                >
                  {ordenavel ? (
                    <button
                      type="button"
                      onClick={() => alternarOrdenacao(coluna.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded transition-colors duration-150 hover:text-ink',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        ativa && 'text-ink',
                      )}
                    >
                      {coluna.titulo}
                      <IconeOrdem size={12} aria-hidden="true" className={cn(!ativa && 'opacity-50')} />
                    </button>
                  ) : (
                    coluna.titulo
                  )}
                </th>
              )
            })}
            {acao ? (
              <th
                scope="col"
                className="sticky top-0 z-10 h-10 bg-card px-3 shadow-[inset_0_-1px_0_#E6EBF2]"
              >
                <span className="sr-only">Ações</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((linha) => (
            <tr
              key={chave(linha)}
              ref={chave(linha) === linhaDestacada ? rolarParaDestaque : undefined}
              onClick={onLinhaClick ? () => onLinhaClick(linha) : undefined}
              onKeyDown={
                onLinhaClick
                  ? (evento) => {
                      if (evento.key === 'Enter' || evento.key === ' ') {
                        evento.preventDefault()
                        onLinhaClick(linha)
                      }
                    }
                  : undefined
              }
              tabIndex={onLinhaClick ? 0 : undefined}
              aria-selected={onLinhaClick ? chave(linha) === linhaSelecionada : undefined}
              className={cn(
                'h-11 border-b border-line transition-colors duration-150 last:border-b-0',
                onLinhaClick &&
                  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                chave(linha) === linhaSelecionada ? 'bg-primary-soft/60 hover:bg-primary-soft' : 'hover:bg-app/70',
                chave(linha) === linhaDestacada &&
                  'animate-destaque bg-primary/[.14] motion-reduce:animate-none',
              )}
            >
              {colunas.map((coluna) => (
                <td
                  key={coluna.id}
                  className={cn(
                    'whitespace-nowrap px-3 text-ink',
                    coluna.alinhar === 'direita' && 'text-right tabular-nums',
                  )}
                >
                  {coluna.render(linha)}
                </td>
              ))}
              {acao ? (
                <td className="whitespace-nowrap px-3 text-right">
                  <button
                    type="button"
                    onClick={(evento) => {
                      // Não dispara a seleção de linha junto com a ação.
                      evento.stopPropagation()
                      acao.onClick(linha)
                    }}
                    className={cn(
                      'text-body-sm font-medium text-primary transition-colors duration-150',
                      'rounded hover:text-primary-hover hover:underline',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    )}
                  >
                    {typeof acao.rotulo === 'function' ? acao.rotulo(linha) : acao.rotulo}
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
