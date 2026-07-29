import { colors } from '@/lib/colors'

/**
 * Símbolo em cruz farmacêutica multicolorida.
 * SVG inline — o produto não carrega imagens externas.
 */
export function LogoSimbolo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Hypera Production Optimizer"
    >
      <rect width="32" height="32" rx="9" fill={colors.primary} fillOpacity="0.07" />
      {/* Braço superior */}
      <rect x="13" y="5" width="6" height="9" rx="2" fill={colors.primary} />
      {/* Braço direito */}
      <rect x="18" y="13" width="9" height="6" rx="2" fill={colors.info} />
      {/* Braço inferior */}
      <rect x="13" y="18" width="6" height="9" rx="2" fill={colors.success} />
      {/* Braço esquerdo */}
      <rect x="5" y="13" width="9" height="6" rx="2" fill={colors.warning} />
      {/* Núcleo */}
      <rect x="13" y="13" width="6" height="6" rx="1.5" fill={colors.primaryHover} />
    </svg>
  )
}

export function LogoCompleto() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoSimbolo />
      <div className="min-w-0">
        <p className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-ink">Hypera</p>
        <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.09em] text-muted">
          Production Optimizer
        </p>
      </div>
    </div>
  )
}
