import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'

interface SectionCardProps {
  titulo: string
  /** Texto do tooltip no ícone de info. */
  info?: string
  /** Ação à direita, padrão "Ver todos →". */
  acao?: { rotulo?: string; onClick: () => void }
  children: ReactNode
  className?: string
  /** Remove o padding do corpo — para tabelas coladas nas bordas. */
  corpoSemPadding?: boolean
}

export function SectionCard({ titulo, info, acao, children, className, corpoSemPadding }: SectionCardProps) {
  return (
    <Card className={cn('flex min-w-0 flex-col', className)}>
      <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="truncate text-card-title font-semibold text-ink">{titulo}</h2>
          {info ? (
            <Tooltip conteudo={info}>
              <button
                type="button"
                aria-label={`Sobre ${titulo}`}
                className="rounded-full text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Info size={14} aria-hidden="true" />
              </button>
            </Tooltip>
          ) : null}
        </div>
        {acao ? (
          <button
            type="button"
            onClick={acao.onClick}
            className={cn(
              'shrink-0 text-body-sm font-medium text-primary transition-colors duration-150',
              'rounded hover:text-primary-hover hover:underline',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
          >
            {acao.rotulo ?? 'Ver todos'} →
          </button>
        ) : null}
      </div>
      <div className={cn('min-w-0 flex-1', corpoSemPadding ? 'pb-0' : 'px-5 pb-4')}>{children}</div>
    </Card>
  )
}
