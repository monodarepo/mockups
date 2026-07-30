import logoHypera from '@/assets/hypera-pharma.png'
import simboloHypera from '@/assets/hypera-simbolo.png'

/**
 * Logo oficial da Hypera Pharma (PNG embutido no bundle — exceção aprovada
 * pelo cliente à regra de "sem imagens externas" do CLAUDE.md).
 */
export function LogoSimbolo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={simboloHypera}
      alt="Hypera Pharma"
      style={{ height: size }}
      className="w-auto select-none"
      draggable={false}
    />
  )
}

export function LogoCompleto() {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <img
        src={logoHypera}
        alt="Hypera Pharma"
        className="h-10 w-auto select-none self-start"
        draggable={false}
      />
      <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.09em] text-muted">
        Production Optimizer
      </p>
    </div>
  )
}
