import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from './Button'

interface ModalProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  descricao?: string
  children: ReactNode
  /** Ações do rodapé (botões). */
  rodape?: ReactNode
  largura?: 'md' | 'lg'
}

export function Modal({ aberto, onFechar, titulo, descricao, children, rodape, largura = 'md' }: ModalProps) {
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Fechar janela"
        onClick={onFechar}
        className="absolute inset-0 cursor-default bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          'relative flex max-h-[82vh] w-full flex-col rounded-card border border-line bg-card shadow-pop',
          'animate-toast-in motion-reduce:animate-none',
          largura === 'md' ? 'max-w-[560px]' : 'max-w-[760px]',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-card-title font-semibold text-ink">{titulo}</h2>
            {descricao ? <p className="mt-0.5 text-caption text-muted">{descricao}</p> : null}
          </div>
          <IconButton aria-label="Fechar janela" className="-mr-1 -mt-1 h-8 w-8" onClick={onFechar}>
            <X size={16} aria-hidden="true" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {rodape ? (
          <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">{rodape}</div>
        ) : null}
      </div>
    </div>
  )
}
