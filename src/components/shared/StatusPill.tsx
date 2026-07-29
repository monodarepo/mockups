import { cn } from '@/lib/cn'
import { toneForStatus, toneSoftClass, type Tone } from '@/lib/colors'

interface StatusPillProps {
  status: string
  /** Sobrescreve o tom derivado do rótulo, quando o contexto exigir. */
  tone?: Tone
  /** Pulsa o ponto — reservado a status críticos. */
  pulsar?: boolean
  className?: string
}

export function StatusPill({ status, tone, pulsar, className }: StatusPillProps) {
  const tomFinal = tone ?? toneForStatus(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption font-semibold',
        toneSoftClass[tomFinal],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full bg-current',
          pulsar && 'animate-pulse-live motion-reduce:animate-none',
        )}
      />
      {status}
    </span>
  )
}
