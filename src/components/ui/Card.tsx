import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Card({ children, className, ...resto }: CardProps) {
  return (
    <div className={cn('rounded-card border border-line bg-card shadow-card', className)} {...resto}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  titulo: string
  descricao?: string
  acao?: ReactNode
  className?: string
}

export function CardHeader({ titulo, descricao, acao, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-4', className)}>
      <div>
        <h2 className="text-card-title font-semibold text-ink">{titulo}</h2>
        {descricao ? <p className="mt-0.5 text-caption text-muted">{descricao}</p> : null}
      </div>
      {acao ? <div className="shrink-0">{acao}</div> : null}
    </div>
  )
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}
