import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bot, Boxes, CornerDownLeft, FileText, Layers, Package, Search, Wrench, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAppStore } from '@/store'
import { buscar, type ItemBusca, type TipoBusca } from '@/data/busca'

const ICONE_DO_TIPO: Record<TipoBusca, LucideIcon> = {
  acao: Zap,
  tela: Layers,
  ordem: FileText,
  produto: Package,
  material: Boxes,
  lote: FileText,
  ativo: Wrench,
  ot: Wrench,
}

/**
 * Paleta de comandos da busca global — aberta pelo campo do header ou por
 * Ctrl/⌘+K. Resultados agrupados por tipo, navegação por setas e Enter
 * navega para a tela do item realçando a linha (?destaque=).
 */
export function CommandPalette() {
  const aberta = useAppStore((s) => s.paletaAberta)
  const fechar = useAppStore((s) => s.fecharPaleta)
  const abrir = useAppStore((s) => s.abrirPaleta)
  const otimizarSequencia = useAppStore((s) => s.otimizarSequencia)
  const sequenciaOtimizada = useAppStore((s) => s.sequenciaOtimizada)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)
  const navigate = useNavigate()

  const [consulta, setConsulta] = useState('')
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)

  // Ctrl/⌘+K abre (e alterna) a paleta de qualquer tela.
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
        evento.preventDefault()
        if (useAppStore.getState().paletaAberta) fechar()
        else abrir()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [abrir, fechar])

  // Estado limpo + foco no input a cada abertura.
  useEffect(() => {
    if (!aberta) return
    setConsulta('')
    setIndiceAtivo(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [aberta])

  const grupos = useMemo(() => buscar(consulta), [consulta])
  const planos = useMemo(() => grupos.flatMap((grupo) => grupo.itens), [grupos])
  const itemAtivo = planos[Math.min(indiceAtivo, planos.length - 1)]

  useEffect(() => {
    setIndiceAtivo(0)
  }, [consulta])

  // Mantém o item ativo visível durante a navegação por setas.
  useEffect(() => {
    if (!itemAtivo) return
    const elemento = listaRef.current?.querySelector(`[data-item="${CSS.escape(itemAtivo.id)}"]`)
    elemento?.scrollIntoView({ block: 'nearest' })
  }, [itemAtivo])

  const executar = (item: ItemBusca) => {
    fechar()
    if (item.tipo === 'acao') {
      if (item.id === 'acao-otimizar-sequencia') {
        navigate('/sequenciamento')
        if (!sequenciaOtimizada) otimizarSequencia()
        return
      }
      if (item.id === 'acao-abrir-simulador') {
        abrirSimulador()
        return
      }
      if (item.id === 'acao-gerar-resumo') {
        navigate('/relatorios?acao=gerar-resumo')
        return
      }
      return
    }
    navigate(item.destino)
  }

  const aoTeclarNoInput = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setIndiceAtivo((atual) => Math.min(atual + 1, planos.length - 1))
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setIndiceAtivo((atual) => Math.max(atual - 1, 0))
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      if (itemAtivo) executar(itemAtivo)
    } else if (evento.key === 'Escape') {
      evento.preventDefault()
      fechar()
    }
  }

  if (!aberta) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Fechar busca global"
        onClick={fechar}
        className="absolute inset-0 cursor-default bg-ink/30"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
        className="relative z-10 w-full max-w-xl animate-toast-in overflow-hidden rounded-card border border-line bg-card shadow-pop motion-reduce:animate-none"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search size={16} className="shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="resultados-busca-global"
            aria-activedescendant={itemAtivo ? `opcao-${itemAtivo.id}` : undefined}
            aria-label="Buscar ordens, produtos, materiais, lotes, ativos, OTs e telas"
            placeholder="Buscar ordens, produtos, materiais, lotes, ativos, telas…"
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            onKeyDown={aoTeclarNoInput}
            className="h-12 w-full bg-transparent text-body text-ink placeholder:text-muted focus:outline-none"
          />
          <kbd className="shrink-0 rounded-md border border-line bg-app px-1.5 py-0.5 text-caption text-muted">Esc</kbd>
        </div>

        <div ref={listaRef} id="resultados-busca-global" role="listbox" aria-label="Resultados" className="max-h-[52vh] overflow-y-auto p-2">
          {planos.length === 0 ? (
            <p className="px-3 py-6 text-center text-body-sm text-muted">
              Nada encontrado para “{consulta}”. Tente um ID (OF-, OT-, MAT-), produto, lote ou tela.
            </p>
          ) : (
            grupos.map((grupo) => (
              <div key={grupo.tipo} className="mb-1 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-caption font-semibold uppercase tracking-wide text-muted">
                  {grupo.rotulo}
                </p>
                {grupo.itens.map((item) => {
                  const Icone = ICONE_DO_TIPO[item.tipo]
                  const ativo = itemAtivo?.id === item.id && itemAtivo?.tipo === item.tipo
                  return (
                    <button
                      key={`${item.tipo}-${item.id}`}
                      id={`opcao-${item.id}`}
                      data-item={item.id}
                      type="button"
                      role="option"
                      aria-selected={ativo}
                      onClick={() => executar(item)}
                      onMouseMove={() => {
                        const posicao = planos.indexOf(item)
                        if (posicao >= 0 && posicao !== indiceAtivo) setIndiceAtivo(posicao)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        ativo ? 'bg-primary-soft/70' : 'hover:bg-app',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                          item.tipo === 'acao' ? 'bg-primary text-white' : 'bg-neutral-soft text-muted',
                        )}
                      >
                        {item.tipo === 'acao' ? <Zap size={14} aria-hidden="true" /> : <Icone size={14} aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className={cn('block truncate text-body-sm font-medium', ativo ? 'text-primary-strong' : 'text-ink')}>
                          {item.titulo}
                        </span>
                        <span className="block truncate text-caption text-muted">{item.subtitulo}</span>
                      </span>
                      {ativo ? (
                        <CornerDownLeft size={14} className="shrink-0 text-muted" aria-hidden="true" />
                      ) : (
                        <ArrowRight size={14} className="shrink-0 text-line" aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-app/60 px-4 py-2 text-caption text-muted">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-card px-1 py-0.5">↑</kbd>
            <kbd className="rounded border border-line bg-card px-1 py-0.5">↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-card px-1 py-0.5">Enter</kbd>
            abrir
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Bot size={12} aria-hidden="true" />
            Índice local · dados da simulação de 19/mai/2025
          </span>
        </div>
      </div>
    </div>
  )
}
