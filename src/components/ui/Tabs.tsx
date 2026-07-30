import { cn } from '@/lib/cn'

export interface Aba {
  id: string
  rotulo: string
  /** Contagem opcional exibida ao lado do rótulo. */
  badge?: number
}

interface TabsProps {
  abas: Aba[]
  ativa: string
  onChange: (id: string) => void
  className?: string
}

/** Abas com sublinhado azul no item ativo. */
export function Tabs({ abas, ativa, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn('flex items-end gap-1 border-b border-line', className)}>
      {abas.map((aba) => {
        const ativo = aba.id === ativa
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => onChange(aba.id)}
            className={cn(
              '-mb-px inline-flex h-9 items-center gap-1.5 border-b-2 px-3 text-body-sm font-medium',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              ativo
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:border-line hover:text-ink',
            )}
          >
            {aba.rotulo}
            {aba.badge !== undefined ? (
              <span
                className={cn(
                  'rounded-pill px-1.5 py-0.5 text-[11px] font-semibold leading-none',
                  ativo ? 'bg-primary-soft text-primary-strong' : 'bg-neutral-soft text-neutral-strong',
                )}
              >
                {aba.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
