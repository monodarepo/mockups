import { useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, ListFilter, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDataHora, formatNumero } from '@/lib/format'
import { useDestaque } from '@/lib/useDestaque'
import { useAppStore } from '@/store'

export interface ColunaDataTable<T> {
  id: string
  titulo: string
  render: (linha: T) => ReactNode
  /** Acessor de ordenação — a coluna só é ordenável quando definido. */
  valor?: (linha: T) => string | number | Date
  /**
   * Texto legível da célula para busca, filtro e CSV — use quando `valor` é um
   * peso de ordenação (ex.: status ordenado por criticidade). Fallback: `valor`.
   */
  valorTexto?: (linha: T) => string
  alinhar?: 'esquerda' | 'direita'
  /** Classe de largura opcional (ex.: "w-32"). */
  largura?: string
  /** Popover de filtro por valores únicos (exige `valor` ou `valorTexto`). */
  filtravel?: boolean
}

interface DataTableProps<T> {
  colunas: ColunaDataTable<T>[]
  linhas: T[]
  chave: (linha: T) => string
  /** Descrição da tabela para leitores de tela (e nome do CSV). */
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
  /** Chave da linha destacada pela busca global; sem a prop, lê ?destaque= da URL. */
  linhaDestacada?: string
  /** Campo de busca interna da tabela. */
  busca?: boolean
  /** Desliga o botão de CSV (ligado por padrão em tabelas com mais de 5 linhas). */
  semExportacao?: boolean
}

/** Corte inicial do "Mostrar mais": listas acima de 12 linhas paginam de 10 em 10. */
const CORTE_INICIAL = 12
const INCREMENTO = 10

function comparar(a: string | number | Date, b: string | number | Date): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true })
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/** Valor de célula no CSV pt-BR: vírgula decimal, datas formatadas, aspas quando preciso. */
function celulaCsv(valor: string | number | Date): string {
  if (valor instanceof Date) return formatDataHora(valor)
  if (typeof valor === 'number') return String(valor).replace('.', ',')
  const texto = String(valor)
  return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

function slug(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
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
  busca = false,
  semExportacao = false,
}: DataTableProps<T>) {
  const { pathname } = useLocation()
  const destaqueUrl = useDestaque()
  const destaque = linhaDestacada ?? destaqueUrl

  const [ordenacao, setOrdenacao] = useState<{ coluna: string; direcao: 'asc' | 'desc' } | null>(
    ordenacaoInicial ?? null,
  )
  const [termoBusca, setTermoBusca] = useState('')
  const [filtros, setFiltros] = useState<Record<string, string[]>>({})
  // Popover em position:fixed ancorado no gatilho — escapa do overflow da tabela.
  const [filtroAberto, setFiltroAberto] = useState<{ coluna: string; x: number; y: number } | null>(null)
  const [visiveis, setVisiveis] = useState(CORTE_INICIAL)

  const rolarParaDestaque = (elemento: HTMLTableRowElement | null) => {
    if (!elemento) return
    const reduzMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    elemento.scrollIntoView({ block: 'center', behavior: reduzMotion ? 'auto' : 'smooth' })
  }

  // Texto legível da célula (busca, filtro por coluna e CSV).
  const textoDaCelula = (coluna: ColunaDataTable<T>, linha: T): string | number | Date =>
    coluna.valorTexto ? coluna.valorTexto(linha) : coluna.valor!(linha)

  const colunasComValor = useMemo(
    () => colunas.filter((coluna) => coluna.valor || coluna.valorTexto),
    [colunas],
  )

  // Busca interna + filtros por coluna + ordenação (nesta ordem).
  const processadas = useMemo(() => {
    let resultado = linhas
    if (busca && termoBusca.trim()) {
      const termo = normalizar(termoBusca.trim())
      resultado = resultado.filter((linha) =>
        colunasComValor.some((coluna) => normalizar(String(textoDaCelula(coluna, linha))).includes(termo)),
      )
    }
    for (const [colunaId, valores] of Object.entries(filtros)) {
      if (valores.length === 0) continue
      const coluna = colunas.find((item) => item.id === colunaId)
      if (!coluna?.valor && !coluna?.valorTexto) continue
      resultado = resultado.filter((linha) => valores.includes(String(textoDaCelula(coluna, linha))))
    }
    if (ordenacao) {
      const coluna = colunas.find((item) => item.id === ordenacao.coluna)
      if (coluna?.valor) {
        const acessor = coluna.valor
        const fator = ordenacao.direcao === 'asc' ? 1 : -1
        resultado = [...resultado].sort((a, b) => comparar(acessor(a), acessor(b)) * fator)
      }
    }
    return resultado
  }, [linhas, busca, termoBusca, filtros, ordenacao, colunas, colunasComValor])

  // "Mostrar mais": corta em 12 e cresce de 10 em 10 — o destaque fura o corte.
  const paginadas = useMemo(() => {
    if (processadas.length <= CORTE_INICIAL) return processadas
    const corte = processadas.slice(0, visiveis)
    if (destaque && !corte.some((linha) => chave(linha) === destaque)) {
      const alvo = processadas.find((linha) => chave(linha) === destaque)
      if (alvo) return [...corte, alvo]
    }
    return corte
  }, [processadas, visiveis, destaque, chave])

  const restantes = Math.max(0, processadas.length - visiveis)
  const temFiltroInterno = termoBusca.trim() !== '' || Object.values(filtros).some((v) => v.length > 0)

  const alternarOrdenacao = (colunaId: string) => {
    setOrdenacao((atual) => {
      if (atual?.coluna !== colunaId) return { coluna: colunaId, direcao: 'asc' }
      if (atual.direcao === 'asc') return { coluna: colunaId, direcao: 'desc' }
      return null
    })
  }

  const alternarValorFiltro = (colunaId: string, valor: string) => {
    setFiltros((atual) => {
      const valores = atual[colunaId] ?? []
      return {
        ...atual,
        [colunaId]: valores.includes(valor) ? valores.filter((v) => v !== valor) : [...valores, valor],
      }
    })
    setVisiveis(CORTE_INICIAL)
  }

  const limparFiltrosInternos = () => {
    setTermoBusca('')
    setFiltros({})
    setVisiveis(CORTE_INICIAL)
  }

  /** CSV client-side com separador ';' e BOM UTF-8 — abre correto no Excel pt-BR. */
  const exportarCsv = () => {
    const cabecalho = colunasComValor.map((coluna) => celulaCsv(coluna.titulo)).join(';')
    const corpo = processadas.map((linha) =>
      colunasComValor.map((coluna) => celulaCsv(textoDaCelula(coluna, linha))).join(';'),
    )
    const conteudo = `\uFEFF${[cabecalho, ...corpo].join('\r\n')}`
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const ancora = document.createElement('a')
    const tela = pathname === '/' ? 'visao-geral' : slug(pathname)
    ancora.href = url
    ancora.download = `hpo-${tela}-${slug(rotulo)}-2025-05-19.csv`
    ancora.click()
    URL.revokeObjectURL(url)
  }

  const exportavel = !semExportacao && linhas.length > 5
  const mostrarBarra = busca || exportavel

  const valoresUnicos = (coluna: ColunaDataTable<T>): Array<{ valor: string; contagem: number }> => {
    const contagens = new Map<string, number>()
    for (const linha of linhas) {
      const valor = String(textoDaCelula(coluna, linha))
      contagens.set(valor, (contagens.get(valor) ?? 0) + 1)
    }
    return [...contagens.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR', { numeric: true }))
      .map(([valor, contagem]) => ({ valor, contagem }))
  }

  return (
    <div className="min-w-0">
      {mostrarBarra ? (
        <div className="flex items-center justify-between gap-3 px-3 pb-2">
          {busca ? (
            <label className="flex items-center gap-2 rounded-lg border border-line bg-app/60 px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-primary">
              <Search size={13} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={termoBusca}
                onChange={(evento) => {
                  setTermoBusca(evento.target.value)
                  setVisiveis(CORTE_INICIAL)
                }}
                placeholder="Buscar na tabela…"
                aria-label={`Buscar em ${rotulo}`}
                className="w-44 bg-transparent text-body-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </label>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {temFiltroInterno ? (
              <button
                type="button"
                onClick={limparFiltrosInternos}
                className="flex items-center gap-1 rounded text-caption font-medium text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X size={12} aria-hidden="true" />
                Limpar filtros da tabela
              </button>
            ) : null}
            {exportavel ? (
              <button
                type="button"
                onClick={exportarCsv}
                aria-label={`Exportar ${rotulo} em CSV`}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1 text-caption font-medium text-muted transition-colors duration-150 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Download size={12} aria-hidden="true" />
                CSV
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

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
                const filtroDaColuna = filtros[coluna.id] ?? []
                const filtravel = coluna.filtravel && (coluna.valor || coluna.valorTexto)
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
                    <span className="inline-flex items-center gap-1">
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
                      {filtravel ? (
                        <span>
                          <button
                            type="button"
                            aria-label={`Filtrar por ${coluna.titulo}`}
                            aria-expanded={filtroAberto?.coluna === coluna.id}
                            onClick={(evento) => {
                              const caixa = evento.currentTarget.getBoundingClientRect()
                              setFiltroAberto((atual) =>
                                atual?.coluna === coluna.id
                                  ? null
                                  : { coluna: coluna.id, x: caixa.left, y: caixa.bottom + 4 },
                              )
                            }}
                            className={cn(
                              'rounded p-0.5 transition-colors duration-150 hover:text-ink',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                              filtroDaColuna.length > 0 && 'text-primary',
                            )}
                          >
                            <ListFilter size={12} aria-hidden="true" />
                          </button>
                          {filtroAberto?.coluna === coluna.id ? (
                            <>
                              <button
                                type="button"
                                aria-label="Fechar filtro"
                                className="fixed inset-0 z-20 cursor-default"
                                onClick={() => setFiltroAberto(null)}
                              />
                              <div
                                style={{ left: Math.min(filtroAberto.x, window.innerWidth - 240), top: filtroAberto.y }}
                                className="fixed z-30 max-h-64 w-56 overflow-y-auto rounded-xl border border-line bg-card p-1.5 text-left shadow-pop"
                              >
                                {valoresUnicos(coluna).map(({ valor, contagem }) => {
                                  const marcado = filtroDaColuna.includes(valor)
                                  return (
                                    <label
                                      key={valor}
                                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-body-sm font-normal text-ink transition-colors duration-150 hover:bg-app"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={marcado}
                                        onChange={() => alternarValorFiltro(coluna.id, valor)}
                                        className="h-3.5 w-3.5 accent-[#2563EB]"
                                      />
                                      <span className="min-w-0 flex-1 truncate" title={valor}>
                                        {valor}
                                      </span>
                                      <span className="shrink-0 text-caption text-muted">{formatNumero(contagem)}</span>
                                    </label>
                                  )
                                })}
                                {filtroDaColuna.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFiltros((atual) => ({ ...atual, [coluna.id]: [] }))
                                      setVisiveis(CORTE_INICIAL)
                                    }}
                                    className="mt-1 w-full rounded-lg border-t border-line px-2 py-1.5 text-left text-caption font-medium text-primary transition-colors duration-150 hover:bg-app"
                                  >
                                    Limpar este filtro
                                  </button>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                        </span>
                      ) : null}
                    </span>
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
            {paginadas.map((linha) => (
              <tr
                key={chave(linha)}
                ref={chave(linha) === destaque ? rolarParaDestaque : undefined}
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
                  'group h-11 border-b border-line transition-colors duration-150 last:border-b-0',
                  onLinhaClick &&
                    'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  chave(linha) === linhaSelecionada ? 'bg-primary-soft/60 hover:bg-primary-soft' : 'hover:bg-app/70',
                  chave(linha) === destaque && 'animate-destaque bg-primary/[.14] motion-reduce:animate-none',
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
                        'text-body-sm font-medium text-primary/80 transition-all duration-150',
                        'rounded group-hover:text-primary hover:!text-primary-hover hover:underline',
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

        {processadas.length === 0 && linhas.length > 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <p className="text-body-sm font-medium text-ink">Nenhuma linha corresponde aos filtros da tabela.</p>
            <button
              type="button"
              onClick={limparFiltrosInternos}
              className="rounded text-body-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Limpar filtros da tabela
            </button>
          </div>
        ) : null}
      </div>

      {restantes > 0 ? (
        <div className="border-t border-line px-3 py-2 text-center">
          <button
            type="button"
            onClick={() => setVisiveis((atual) => atual + INCREMENTO)}
            className="rounded text-body-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Mostrar mais {formatNumero(Math.min(INCREMENTO, restantes))} ({formatNumero(restantes)}{' '}
            {restantes === 1 ? 'restante' : 'restantes'})
          </button>
        </div>
      ) : null}
    </div>
  )
}
