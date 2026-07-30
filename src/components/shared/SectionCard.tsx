import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'

interface SectionCardProps {
  titulo: string
  /** Contagem do recorte atual — renderiza "· 6 de 14" ao lado do título. */
  contagem?: { visiveis: number; total: number }
  /** Texto do tooltip no ícone de info. */
  info?: string
  /** Ação à direita, padrão "Ver todos →". */
  acao?: { rotulo?: string; onClick: () => void }
  /** Conteúdo customizado à direita do título (ex.: toggle Mapa/Lista). Tem precedência sobre acao. */
  direita?: ReactNode
  children: ReactNode
  className?: string
  /** Remove o padding do corpo — para tabelas coladas nas bordas. */
  corpoSemPadding?: boolean
}

export function SectionCard({ titulo, contagem, info, acao, direita, children, className, corpoSemPadding }: SectionCardProps) {
  return (
    <Card className={cn('flex min-w-0 flex-col', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="truncate text-card-title font-semibold text-ink">{titulo}</h2>
          {contagem ? (
            <span className="shrink-0 whitespace-nowrap text-body-sm font-normal text-muted">
              · {contagem.visiveis === contagem.total ? contagem.total : `${contagem.visiveis} de ${contagem.total}`}
            </span>
          ) : null}
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
        {direita ? (
          <div className="shrink-0">{direita}</div>
        ) : acao ? (
          <button
            type="button"
            onClick={acao.onClick}
            className={cn(
              'ml-auto shrink-0 whitespace-nowrap text-body-sm font-medium text-primary transition-colors duration-150',
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
