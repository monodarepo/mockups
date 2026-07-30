import { cn } from '@/lib/cn'
import { colors, toneSoftClass, type Tone } from '@/lib/colors'
import { formatPercent } from '@/lib/format'
import { statusDaFabrica } from '@/data/fabricas'
import type { Fabrica, StatusLinha } from '@/data/types'

interface FactoryMapProps {
  fabricas: Fabrica[]
  /** Clique em uma fábrica — grava filtro global na tela. */
  onSelecionarFabrica?: (nome: string) => void
}

const toneDoStatus: Record<StatusLinha, Tone> = {
  normal: 'success',
  atencao: 'warning',
  critico: 'danger',
  parada: 'neutral',
}

/** Posições fixas do desenho (viewBox 760×440): ponto no mapa e âncora do card. */
const layout: Record<string, { ponto: [number, number]; anchor: [number, number]; card: string }> = {
  anapolis: { ponto: [330, 138], anchor: [206, 90], card: 'left-2 top-2' },
  goiania: { ponto: [298, 210], anchor: [206, 330], card: 'bottom-2 left-2' },
  jacarei: { ponto: [618, 342], anchor: [556, 120], card: 'right-2 top-2' },
}

const legenda: Array<{ rotulo: string; cor: string }> = [
  { rotulo: 'Normal', cor: colors.success },
  { rotulo: 'Atenção', cor: colors.warning },
  { rotulo: 'Crítico', cor: colors.danger },
  { rotulo: 'Parada', cor: colors.neutral },
]

/**
 * Mapa estilizado das plantas: silhuetas SVG de GO e SP com cards flutuantes
 * por fábrica conectados por linhas tracejadas. Sem imagens externas.
 */
export function FactoryMap({ fabricas, onSelecionarFabrica }: FactoryMapProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-line bg-app/60">
      <svg viewBox="0 0 760 440" className="block h-auto w-full" aria-hidden="true">
        {/* Silhueta estilizada de Goiás */}
        <path
          d="M238 66 L362 50 L442 88 L468 160 L434 240 L360 300 L268 290 L198 224 L188 138 Z"
          fill="#E8EFF8"
          stroke="#CBD9EA"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text x="300" y="186" fontSize="13" fontWeight="600" letterSpacing="2" fill="#94A3B8">
          GOIÁS
        </text>
        {/* Silhueta estilizada de São Paulo */}
        <path
          d="M484 322 L562 276 L658 282 L730 322 L712 376 L606 400 L506 378 Z"
          fill="#E8EFF8"
          stroke="#CBD9EA"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text x="554" y="356" fontSize="12" fontWeight="600" letterSpacing="2" fill="#94A3B8">
          SÃO PAULO
        </text>

        {fabricas.map((fabrica) => {
          const posicao = layout[fabrica.id]
          if (!posicao) return null
          const critica = statusDaFabrica(fabrica) === 'Atenção necessária'
          const cor = critica ? colors.warning : colors.success
          return (
            <g key={fabrica.id}>
              <line
                x1={posicao.ponto[0]}
                y1={posicao.ponto[1]}
                x2={posicao.anchor[0]}
                y2={posicao.anchor[1]}
                stroke="#94A3B8"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <circle cx={posicao.ponto[0]} cy={posicao.ponto[1]} r="9" fill={cor} fillOpacity="0.18" />
              <circle cx={posicao.ponto[0]} cy={posicao.ponto[1]} r="4" fill={cor} />
            </g>
          )
        })}
      </svg>

      {fabricas.map((fabrica) => {
        const posicao = layout[fabrica.id]
        if (!posicao) return null
        const statusFabrica = statusDaFabrica(fabrica)
        const critica = statusFabrica === 'Atenção necessária'
        return (
          <button
            key={fabrica.id}
            type="button"
            onClick={() => onSelecionarFabrica?.(fabrica.nome)}
            aria-label={`Filtrar por ${fabrica.nome} — ${statusFabrica}`}
            className={cn(
              'absolute w-[196px] rounded-xl border border-line bg-card p-2.5 text-left shadow-card',
              'transition-shadow duration-150 hover:shadow-pop',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              posicao.card,
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-body-sm font-semibold text-ink">{fabrica.nome}</span>
              <span
                className={cn(
                  'flex items-center gap-1 text-[11px] font-medium',
                  critica ? 'text-warning-strong' : 'text-success',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full bg-current',
                    critica && 'animate-pulse-live motion-reduce:animate-none',
                  )}
                  aria-hidden="true"
                />
                {statusFabrica}
              </span>
            </span>
            <span className="mt-2 grid grid-cols-2 gap-1">
              {fabrica.linhas.map((linha) => (
                <span
                  key={linha.id}
                  className={cn(
                    'flex items-center justify-between rounded-md px-1.5 py-1 text-[11px] font-semibold',
                    toneSoftClass[toneDoStatus[linha.status]],
                  )}
                >
                  {linha.id}
                  <span className="font-bold tabular-nums">{formatPercent(linha.capacidadeUtilizada, 0)}</span>
                </span>
              ))}
            </span>
          </button>
        )
      })}

      <div className="absolute bottom-2.5 right-3 flex items-center gap-3 rounded-lg bg-card/90 px-2.5 py-1.5">
        {legenda.map((item) => (
          <span key={item.rotulo} className="flex items-center gap-1.5 text-caption text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.cor }} aria-hidden="true" />
            {item.rotulo}
          </span>
        ))}
      </div>
    </div>
  )
}
