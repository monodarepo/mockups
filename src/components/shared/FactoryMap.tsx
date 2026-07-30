import { cn } from '@/lib/cn'
import { colors } from '@/lib/colors'
import { formatPercent } from '@/lib/format'

/**
 * Planta estilizada da fábrica de Anápolis (SVG pseudo-isométrico leve) com
 * camada de pins configurável. Reusada por Materiais, Manutenção e Gêmeo.
 */

export type StatusPin = 'normal' | 'atencao' | 'critico' | 'parada' | 'manutencao' | 'sem-dados'

export interface PinFabrica {
  id: string
  label: string
  valorPercent?: number
  status: StatusPin
  /** Posição em % do container (x, y) — ancore sobre o bloco desejado. */
  posicao: [number, number]
}

interface FactoryMapProps {
  pins: PinFabrica[]
  onSelecionarPin?: (pin: PinFabrica) => void
  className?: string
}

const corDoStatus: Record<StatusPin, string> = {
  normal: colors.success,
  atencao: colors.warning,
  critico: colors.danger,
  parada: colors.danger,
  manutencao: colors.info,
  'sem-dados': colors.neutral,
}

const LEGENDA: Array<{ rotulo: string; status: StatusPin }> = [
  { rotulo: 'Normal', status: 'normal' },
  { rotulo: 'Atenção', status: 'atencao' },
  { rotulo: 'Crítico / Parada', status: 'critico' },
  { rotulo: 'Manutenção Programada', status: 'manutencao' },
  { rotulo: 'Sem dados', status: 'sem-dados' },
]

interface BlocoPlanta {
  nome: string
  x: number
  y: number
  w: number
  h: number
}

/** Blocos da planta (viewBox 800×420). */
const BLOCOS: BlocoPlanta[] = [
  // Preparação (topo)
  { nome: 'Pesagem e Dispensação', x: 40, y: 42, w: 160, h: 64 },
  { nome: 'Granulação', x: 216, y: 42, w: 140, h: 64 },
  { nome: 'Revestimento', x: 372, y: 42, w: 140, h: 64 },
  { nome: 'Embalagem', x: 528, y: 42, w: 232, h: 64 },
  // Linhas de produção (centro)
  { nome: 'Compressão (L12)', x: 40, y: 136, w: 132, h: 104 },
  { nome: 'Sólidos (L08)', x: 188, y: 136, w: 132, h: 104 },
  { nome: 'Cápsulas (L03)', x: 336, y: 136, w: 132, h: 104 },
  { nome: 'Drágeas (L05)', x: 484, y: 136, w: 132, h: 104 },
  { nome: 'Pó e Sachês (L15)', x: 632, y: 136, w: 128, h: 104 },
  // Apoio (base)
  { nome: 'Armazém MP', x: 40, y: 270, w: 180, h: 72 },
  { nome: 'Utilidades', x: 236, y: 270, w: 150, h: 72 },
  { nome: 'Laboratório QA', x: 402, y: 270, w: 160, h: 72 },
  { nome: 'Armazém PA', x: 578, y: 270, w: 182, h: 72 },
]

function BlocoSvg({ bloco }: { bloco: BlocoPlanta }) {
  const producao = bloco.nome.includes('(L')
  return (
    <g>
      {/* Face lateral — dá o relevo pseudo-isométrico */}
      <rect x={bloco.x + 3} y={bloco.y + 5} width={bloco.w} height={bloco.h} rx="8" fill="#C9D6E6" />
      {/* Face superior */}
      <rect
        x={bloco.x}
        y={bloco.y}
        width={bloco.w}
        height={bloco.h}
        rx="8"
        fill={producao ? '#FFFFFF' : '#F3F7FC'}
        stroke="#D7E0EC"
        strokeWidth="1.2"
      />
      <text
        x={bloco.x + bloco.w / 2}
        y={bloco.y + bloco.h / 2 + 3}
        textAnchor="middle"
        fontSize="11"
        fontWeight={producao ? 600 : 500}
        fill={producao ? colors.ink : colors.muted}
      >
        {bloco.nome}
      </text>
    </g>
  )
}

export function FactoryMap({ pins, onSelecionarPin, className }: FactoryMapProps) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-line bg-app/60', className)}>
      {/* Container relativo próprio do SVG — as posições % dos pins mapeiam 1:1 no viewBox. */}
      <div className="relative">
      <svg viewBox="0 0 800 420" className="block h-auto w-full" aria-hidden="true">
        {/* Piso da planta */}
        <rect x="18" y="20" width="764" height="336" rx="14" fill="#E8EFF8" stroke="#CBD9EA" strokeWidth="1.5" />
        <text x="34" y="376" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#94A3B8">
          PLANTA ANÁPOLIS — VISÃO ESQUEMÁTICA
        </text>
        {/* Corredor central */}
        <rect x="30" y="116" width="740" height="12" rx="6" fill="#DBE5F1" />
        <rect x="30" y="250" width="740" height="12" rx="6" fill="#DBE5F1" />
        {BLOCOS.map((bloco) => (
          <BlocoSvg key={bloco.nome} bloco={bloco} />
        ))}
      </svg>

      {/* Camada de pins */}
      {pins.map((pin) => {
        const cor = corDoStatus[pin.status]
        const critico = pin.status === 'critico' || pin.status === 'parada'
        const conteudo = (
          <>
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              {critico ? (
                <span
                  className="absolute inline-flex h-full w-full animate-pulse-live rounded-full motion-reduce:animate-none"
                  style={{ backgroundColor: cor }}
                />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: cor }} />
            </span>
            <span className="font-semibold text-ink">{pin.label}</span>
            {pin.valorPercent !== undefined ? (
              <span className="font-bold tabular-nums" style={{ color: cor }}>
                {formatPercent(pin.valorPercent, 0)}
              </span>
            ) : null}
          </>
        )
        const classes = cn(
          'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap',
          'rounded-pill border border-line bg-card px-2 py-0.5 text-[10px] shadow-card',
          onSelecionarPin && 'cursor-pointer transition-shadow duration-150 hover:shadow-pop',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )
        const estilo = { left: `${pin.posicao[0]}%`, top: `${pin.posicao[1]}%` }
        return onSelecionarPin ? (
          <button
            key={pin.id}
            type="button"
            onClick={() => onSelecionarPin(pin)}
            aria-label={`${pin.label}${pin.valorPercent !== undefined ? ` — ${formatPercent(pin.valorPercent, 0)}` : ''}`}
            className={classes}
            style={estilo}
          >
            {conteudo}
          </button>
        ) : (
          <span key={pin.id} className={classes} style={estilo}>
            {conteudo}
          </span>
        )
      })}
      </div>

      {/* Legenda embutida */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-card/80 px-3 py-2">
        {LEGENDA.map((item) => (
          <span key={item.rotulo} className="flex items-center gap-1.5 text-caption text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: corDoStatus[item.status] }} aria-hidden="true" />
            {item.rotulo}
          </span>
        ))}
      </div>
    </div>
  )
}
