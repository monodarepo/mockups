import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { toneHex, type Tone } from '@/lib/colors'

interface SparklineProps {
  data: number[]
  tone?: Tone
  altura?: number
}

/** Mini gráfico de área com gradiente suave na cor do tone. */
export function Sparkline({ data, tone = 'primary', altura = 40 }: SparklineProps) {
  const cor = toneHex[tone]
  const gradienteId = `spark-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const pontos = data.map((valor, indice) => ({ indice, valor }))

  return (
    <div style={{ height: altura }} className="w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pontos} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={cor}
            strokeWidth={1.6}
            fill={`url(#${gradienteId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
