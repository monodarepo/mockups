import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { toneSoftClass, type Tone } from '@/lib/colors'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  className?: string
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-caption font-semibold',
        toneSoftClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

interface ContadorBadgeProps {
  valor: number
  /** Anuncia o significado do número para leitores de tela. */
  rotulo: string
  className?: string
}

/** Badge numérico vermelho — usado em Alertas e Decisões e no sino do Header. */
export function ContadorBadge({ valor, rotulo, className }: ContadorBadgeProps) {
  return (
    <span
      aria-label={`${valor} ${rotulo}`}
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1',
        'text-[11px] font-semibold leading-none text-white',
        className,
      )}
    >
      {valor}
    </span>
  )
}
