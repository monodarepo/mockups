import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SelectProps {
  /** Rótulo visível embutido no controle; omita e informe ariaLabel para um select "solto". */
  rotulo?: string
  ariaLabel?: string
  valor: string
  opcoes: readonly string[]
  onChange: (valor: string) => void
  className?: string
}

/** Select compacto com rótulo embutido — padrão da FilterBar. */
export function Select({ rotulo, ariaLabel, valor, opcoes, onChange, className }: SelectProps) {
  const id = useId()

  return (
    <div
      className={cn(
        'flex h-9 items-center gap-2 rounded-lg border border-line bg-card pl-3 pr-2',
        'transition-colors duration-150 hover:border-primary/40',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1',
        className,
      )}
    >
      {rotulo ? (
        <label htmlFor={id} className="shrink-0 text-caption text-muted">
          {rotulo}
        </label>
      ) : null}
      <div className="relative flex min-w-0 items-center">
        <select
          id={id}
          value={valor}
          aria-label={rotulo ? undefined : ariaLabel}
          onChange={(evento) => onChange(evento.target.value)}
          className="w-full appearance-none truncate bg-transparent pr-5 text-body-sm font-medium text-ink focus-visible:outline-none"
        >
          {opcoes.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-0 text-muted" aria-hidden="true" />
      </div>
    </div>
  )
}
