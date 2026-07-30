import { colors, toneHex, type Tone } from '@/lib/colors'
import { formatPercent } from '@/lib/format'

interface ScoreDonutProps {
  /** Score em % (0–100). */
  valor: number
  /** Qualificador central; deriva do valor quando omitido (91% "Excelente", 88% "Boa"). */
  qualificador?: string
  /** Cor do anel; deriva do valor quando omitida. */
  tone?: Tone
  /** Legenda opcional abaixo do donut. */
  rotulo?: string
  tamanho?: number
}

function qualificadorPorValor(valor: number): string {
  if (valor >= 90) return 'Excelente'
  if (valor >= 80) return 'Boa'
  if (valor >= 65) return 'Regular'
  return 'Crítica'
}

function tonePorValor(valor: number): Tone {
  if (valor >= 90) return 'success'
  if (valor >= 80) return 'info'
  if (valor >= 65) return 'warning'
  return 'danger'
}

export function ScoreDonut({ valor, qualificador, tone, rotulo, tamanho = 120 }: ScoreDonutProps) {
  const limitado = Math.max(0, Math.min(100, valor))
  const texto = qualificador ?? qualificadorPorValor(limitado)
  const cor = toneHex[tone ?? tonePorValor(limitado)]

  const espessura = 10
  const raio = (tamanho - espessura) / 2
  const circunferencia = 2 * Math.PI * raio
  const preenchido = (limitado / 100) * circunferencia

  return (
    <figure className="inline-flex flex-col items-center gap-1.5">
      <div
        className="relative"
        style={{ width: tamanho, height: tamanho }}
        role="img"
        aria-label={`${formatPercent(limitado, 0)} — ${texto}${rotulo ? ` (${rotulo})` : ''}`}
      >
        <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden="true">
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke={colors.line}
            strokeWidth={espessura}
          />
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke={cor}
            strokeWidth={espessura}
            strokeLinecap="round"
            strokeDasharray={`${preenchido} ${circunferencia - preenchido}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-bold leading-none tracking-[-0.01em] text-ink">
            {formatPercent(limitado, 0)}
          </span>
          <span className="mt-1 text-caption font-medium text-muted">{texto}</span>
        </div>
      </div>
      {rotulo ? <figcaption className="text-caption text-muted">{rotulo}</figcaption> : null}
    </figure>
  )
}
