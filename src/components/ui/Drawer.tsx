import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from './Button'

interface DrawerProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  descricao?: string
  children: ReactNode
  rodape?: ReactNode
}

/** Painel lateral direito com transição suave de entrada e saída. */
export function Drawer({ aberto, onFechar, titulo, descricao, children, rodape }: DrawerProps) {
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto, onFechar])

  return (
    <div className={cn('fixed inset-0 z-40', !aberto && 'pointer-events-none')} aria-hidden={!aberto}>
      <button
        type="button"
        aria-label="Fechar painel"
        tabIndex={aberto ? 0 : -1}
        onClick={onFechar}
        className={cn(
          'absolute inset-0 cursor-default bg-ink/40 transition-opacity duration-200 motion-reduce:transition-none',
          aberto ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          'absolute right-0 top-0 flex h-full w-[460px] max-w-full flex-col border-l border-line bg-card shadow-pop',
          'transition-transform duration-200 motion-reduce:transition-none',
          aberto ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-card-title font-semibold text-ink">{titulo}</h2>
            {descricao ? <p className="mt-0.5 text-caption text-muted">{descricao}</p> : null}
          </div>
          <IconButton
            aria-label="Fechar painel"
            className="-mr-1 -mt-1 h-8 w-8"
            onClick={onFechar}
            tabIndex={aberto ? 0 : -1}
          >
            <X size={16} aria-hidden="true" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {rodape ? (
          <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">{rodape}</div>
        ) : null}
      </aside>
    </div>
  )
}
