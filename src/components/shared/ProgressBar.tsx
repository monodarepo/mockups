import { cn } from '@/lib/cn'
import { toneHex, type Tone } from '@/lib/colors'
import { formatPercent } from '@/lib/format'

interface ProgressBarProps {
  /** Progresso em % (0–100). */
  valor: number
  tone?: Tone
  /** Exibe o rótulo percentual à direita. */
  mostrarRotulo?: boolean
  className?: string
}

export function ProgressBar({ valor, tone = 'primary', mostrarRotulo = true, className }: ProgressBarProps) {
  const limitado = Math.max(0, Math.min(100, valor))

  return (
    <div className={cn('flex w-full min-w-0 items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={limitado}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-pill bg-neutral-soft"
      >
        <div
          className="h-full rounded-pill transition-[width] duration-200 motion-reduce:transition-none"
          style={{ width: `${limitado}%`, backgroundColor: toneHex[tone] }}
        />
      </div>
      {mostrarRotulo ? (
        <span className="w-9 shrink-0 text-right text-caption font-semibold tabular-nums text-ink">
          {formatPercent(limitado, 0)}
        </span>
      ) : null}
    </div>
  )
}
