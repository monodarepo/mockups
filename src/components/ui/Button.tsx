import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variante = 'primary' | 'outline' | 'ghost' | 'danger'
type Tamanho = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanho?: Tamanho
  iconeEsquerda?: ReactNode
  iconeDireita?: ReactNode
}

const variantes: Record<Variante, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover border border-transparent',
  outline: 'bg-card text-ink border border-line hover:bg-app hover:border-primary/40',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-neutral-soft hover:text-ink',
  danger: 'bg-danger text-white hover:bg-danger-strong border border-transparent',
}

const tamanhos: Record<Tamanho, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-9 px-3.5 text-body gap-2',
}

export function Button({
  variante = 'primary',
  tamanho = 'md',
  iconeEsquerda,
  iconeDireita,
  className,
  children,
  type = 'button',
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-app',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantes[variante],
        tamanhos[tamanho],
        className,
      )}
      {...resto}
    >
      {iconeEsquerda}
      {children}
      {iconeDireita}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obrigatório: botões de ícone sempre anunciam a ação. */
  'aria-label': string
  children: ReactNode
}

export function IconButton({ className, children, type = 'button', ...resto }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted',
        'transition-colors duration-150 hover:bg-neutral-soft hover:text-ink',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-app',
        className,
      )}
      {...resto}
    >
      {children}
    </button>
  )
}
