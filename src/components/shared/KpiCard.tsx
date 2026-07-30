import { Card } from '@/components/ui/Card'
import type { Tone } from '@/lib/colors'
import type { KpiCardData } from '@/data/types'
import { TrendDelta } from './TrendDelta'
import { Sparkline } from './Sparkline'

export interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaGoodWhen?: 'up' | 'down'
  /** Contexto do delta: "vs última semana/hora/turno". */
  sublabel?: string
  sparklineData?: number[]
  tone?: Tone
}

/** Reduz a fonte de valores longos para que "1.256.840" caiba em 7 cards por fileira. */
function classeDoValor(value: string): string {
  if (value.length >= 10) return 'text-[20px] leading-[28px]'
  if (value.length >= 8) return 'text-[23px] leading-[30px]'
  return 'text-kpi'
}

export function KpiCard({
  label,
  value,
  delta,
  deltaGoodWhen = 'up',
  sublabel,
  sparklineData,
  tone = 'primary',
}: KpiCardProps) {
  return (
    <Card className="flex min-w-0 flex-col gap-1 px-3.5 py-3">
      <p className="truncate text-caption font-medium text-muted" title={label}>
        {label}
      </p>
      <p className={`whitespace-nowrap font-bold tracking-[-0.02em] text-ink ${classeDoValor(value)}`}>
        {value}
      </p>
      {delta || sublabel ? (
        <p className="flex min-w-0 items-baseline gap-1.5">
          {delta ? <TrendDelta delta={delta} deltaGoodWhen={deltaGoodWhen} /> : null}
          {sublabel ? (
            <span className="truncate text-caption text-muted" title={sublabel}>
              {sublabel}
            </span>
          ) : null}
        </p>
      ) : null}
      {sparklineData?.length ? (
        <div className="-mx-1 mt-auto pt-1">
          <Sparkline data={sparklineData} tone={tone} />
        </div>
      ) : null}
    </Card>
  )
}

/** Fileira padrão de 6–7 KPIs de uma tela, a partir de src/data/kpis.ts. */
export function KpiRow({ kpis }: { kpis: KpiCardData[] }) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr))` }}
    >
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.valor}
          delta={kpi.delta}
          deltaGoodWhen={kpi.deltaGoodWhen}
          sublabel={kpi.sublabel}
          sparklineData={kpi.sparkline}
          tone={kpi.tone}
        />
      ))}
    </div>
  )
}
