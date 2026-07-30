import type { TooltipProps } from 'recharts'
import { colors } from '@/lib/colors'
import { formatDiaMes, formatHora, formatNumeroCompacto } from '@/lib/format'

/**
 * Sistema de gráficos do HPO — tooltip, eixos e grid únicos para todo o app.
 * Nenhum gráfico usa o visual default do recharts.
 */

// ── Eixos e grid padronizados (spread nos componentes do recharts) ───────────

/** Ticks 11px na cor muted, sem linha nem tracinhos de eixo. */
export const EIXO = {
  tick: { fontSize: 11, fill: colors.muted },
  tickLine: false,
  axisLine: false,
} as const

/** Gridline apenas horizontal, na cor line. */
export const GRID = {
  vertical: false,
  stroke: colors.line,
  strokeWidth: 1,
} as const

/** Cursor do tooltip em gráficos de linha/área. */
export const CURSOR_LINHA = { stroke: colors.line, strokeWidth: 1 } as const

/** Cursor do tooltip em gráficos de barra. */
export const CURSOR_BARRA = { fill: colors.line, fillOpacity: 0.3 } as const

/** Dot de hover das séries de linha. */
export const DOT_HOVER = { r: 3.5, strokeWidth: 2, stroke: colors.card } as const

/** Eixo monetário compacto: 620 mil · 1,2 mi (sem o prefixo R$). */
export function eixoMoeda(valor: number): string {
  return formatNumeroCompacto(valor)
}

/** Eixo de hora: 06:00. */
export function eixoHora(valor: Date | string): string {
  return valor instanceof Date ? formatHora(valor) : valor
}

/** Eixo de data: 13/mai. */
export function eixoData(valor: Date | string): string {
  return valor instanceof Date ? formatDiaMes(valor) : valor
}

/** Props da ReferenceLine de meta rotulada. */
export function linhaDeMeta(rotulo: string) {
  return {
    stroke: colors.muted,
    strokeDasharray: '6 4',
    label: { value: rotulo, position: 'insideTopRight' as const, fill: colors.muted, fontSize: 11 },
  }
}

// ── Tooltip único do design system ───────────────────────────────────────────

type FormatterTooltip = NonNullable<TooltipProps<number, string>['formatter']>
type LabelFormatterTooltip = NonNullable<TooltipProps<number, string>['labelFormatter']>

/**
 * Conteúdo customizado do Tooltip do recharts: card com sombra e radius do
 * design system, ponto colorido por série e valores SEMPRE formatados —
 * reusa os formatter/labelFormatter passados ao <Tooltip /> da tela.
 */
export function TooltipHpo({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null

  const rotulo = labelFormatter
    ? (labelFormatter as LabelFormatterTooltip)(label, payload)
    : label

  return (
    <div className="rounded-card border border-line bg-card px-3 py-2.5 shadow-pop">
      {rotulo !== undefined && rotulo !== '' ? (
        <p className="mb-1.5 text-caption font-semibold text-ink">{rotulo}</p>
      ) : null}
      <ul className="flex flex-col gap-1">
        {payload.map((entrada, indice) => {
          const bruto = (formatter as FormatterTooltip | undefined)?.(
            entrada.value as number,
            entrada.name as string,
            entrada,
            indice,
            payload,
          )
          const [valor, nome] = Array.isArray(bruto)
            ? bruto
            : [bruto ?? entrada.value, entrada.name]
          return (
            <li
              key={`${String(entrada.name)}-${indice}`}
              className="flex items-center justify-between gap-4 text-caption"
            >
              <span className="flex items-center gap-1.5 text-muted">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entrada.color ?? colors.primary }}
                  aria-hidden="true"
                />
                {nome}
              </span>
              <span className="font-semibold tabular-nums text-ink">{valor}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
