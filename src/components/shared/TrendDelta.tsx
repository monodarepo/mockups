import { cn } from '@/lib/cn'

interface TrendDeltaProps {
  /** Delta já formatado com sinal: "+3,4%", "-2,1 p.p.", "+2". */
  delta: string
  /**
   * Direção em que a variação é boa — a cor é contextual:
   * aumento de perdas fica vermelho mesmo com seta ▲.
   */
  deltaGoodWhen?: 'up' | 'down'
  className?: string
}

export function TrendDelta({ delta, deltaGoodWhen = 'up', className }: TrendDeltaProps) {
  const desce = delta.trim().startsWith('-')
  const bom = desce ? deltaGoodWhen === 'down' : deltaGoodWhen === 'up'
  const magnitude = delta.trim().replace(/^[+-]\s*/, '')

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1 whitespace-nowrap text-caption font-semibold',
        bom ? 'text-success' : 'text-danger',
        className,
      )}
      aria-label={`${desce ? 'queda' : 'aumento'} de ${magnitude}`}
    >
      <span aria-hidden="true" className="text-[9px]">
        {desce ? '▼' : '▲'}
      </span>
      {magnitude}
    </span>
  )
}
