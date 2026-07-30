import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TooltipProps {
  conteudo: ReactNode
  children: ReactNode
  className?: string
}

/** Tooltip por hover/foco — leve o bastante para o mockup, sem posicionamento JS. */
export function Tooltip({ conteudo, children, className }: TooltipProps) {
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-[260px] -translate-x-1/2',
          'rounded-lg bg-ink px-2.5 py-1.5 text-caption leading-snug text-white shadow-pop',
          'opacity-0 transition-opacity duration-150',
          'group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
        )}
      >
        {conteudo}
      </span>
    </span>
  )
}
