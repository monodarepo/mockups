import { cn } from '@/lib/cn'
import { chartPalette } from '@/lib/colors'
import { formatPercent } from '@/lib/format'

export interface MiniBarItem {
  id: string
  label: string
  /** Valor exibido à direita, já formatado ("R$ 510 mil", "12,3 mm/s"). */
  valor: string
  /** Participação em % — dimensiona a barra e aparece à direita. */
  percent: number
}

interface MiniBarListProps {
  itens: MiniBarItem[]
  className?: string
}

/** Ranking horizontal 1–6 com barra proporcional, valor e % à direita. */
export function MiniBarList({ itens, className }: MiniBarListProps) {
  const maiorPercent = Math.max(...itens.map((item) => item.percent), 1)

  return (
    <ol className={cn('flex flex-col gap-3', className)}>
      {itens.map((item, indice) => {
        const cor = chartPalette[indice % chartPalette.length]
        return (
          <li key={item.id} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: cor }}
            >
              {indice + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1 truncate text-body-sm text-ink" title={item.label}>
                {item.label}
              </p>
              <div className="h-1.5 overflow-hidden rounded-pill bg-neutral-soft">
                <div
                  className="h-full rounded-pill"
                  style={{ width: `${(item.percent / maiorPercent) * 100}%`, backgroundColor: cor }}
                />
              </div>
            </div>
            <span className="shrink-0 text-body-sm font-semibold tabular-nums text-ink">{item.valor}</span>
            <span className="w-12 shrink-0 text-right text-caption tabular-nums text-muted">
              {formatPercent(item.percent, 1)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
