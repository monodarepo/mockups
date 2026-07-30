import { cn } from '@/lib/cn'
import { colors, toneSoftClass, type Tone } from '@/lib/colors'
import { formatPercent } from '@/lib/format'
import { statusDaFabrica } from '@/data/fabricas'
import type { Fabrica, StatusLinha } from '@/data/types'

interface MapaRedeProps {
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

/**
 * Posições fixas do desenho (viewBox 760×440): ponto no mapa e âncora do card.
 * Os pontos seguem a geografia real: Anápolis a sudoeste do DF, Goiânia logo
 * abaixo, Jacareí no Vale do Paraíba paulista.
 */
const layout: Record<string, { ponto: [number, number]; anchor: [number, number]; card: string }> = {
  anapolis: { ponto: [378, 180], anchor: [206, 90], card: 'left-2 top-2' },
  goiania: { ponto: [352, 212], anchor: [206, 330], card: 'bottom-2 left-2' },
  jacarei: { ponto: [672, 352], anchor: [600, 140], card: 'right-2 top-2' },
}

const legenda: Array<{ rotulo: string; cor: string }> = [
  { rotulo: 'Normal', cor: colors.success },
  { rotulo: 'Atenção', cor: colors.warning },
  { rotulo: 'Crítico', cor: colors.danger },
  { rotulo: 'Parada', cor: colors.neutral },
]

/**
 * Mapa estilizado da rede: silhuetas SVG de GO e SP com cards flutuantes
 * por fábrica conectados por linhas tracejadas. Sem imagens externas.
 */
export function MapaRede({ fabricas, onSelecionarFabrica }: MapaRedeProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-line bg-app/60">
      <svg viewBox="0 0 760 440" className="block h-auto w-full" aria-hidden="true">
        {/* Contorno estilizado de Goiás: Araguaia a oeste, bloco do nordeste
            goiano no alto, divisa com MG descendo até a ponta sul. */}
        <path
          d="M303 70 L373 78 L434 55 L494 59 L498 101 L486 122 L475 143 L442 158 L448 178 L455 196 L446 230 L438 260 L410 268 L392 282 L373 276 L360 288 L331 302 L300 285 L262 253 L208 200 L228 164 L249 139 L268 104 Z"
          fill="#E8EFF8"
          stroke="#CBD9EA"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text x="310" y="102" fontSize="13" fontWeight="600" letterSpacing="2" fill="#94A3B8">
          GOIÁS
        </text>
        {/* Distrito Federal — enclave a leste de Anápolis. */}
        <rect x="396" y="158" width="36" height="20" rx="2" fill="#DDE7F3" stroke="#CBD9EA" strokeWidth="1" />
        <text x="406" y="172" fontSize="8" fontWeight="600" letterSpacing="1" fill="#94A3B8">
          DF
        </text>
        {/* Contorno estilizado de São Paulo: Rio Grande ao norte, litoral em
            diagonal a sudeste, ponta oeste no Rio Paraná. */}
        <path
          d="M496 260 L546 262 L568 265 L611 267 L633 278 L654 290 L686 310 L726 331 L712 364 L694 370 L665 381 L645 392 L622 402 L586 415 L540 392 L514 382 L478 378 L460 375 L420 345 L456 315 L476 286 Z"
          fill="#E8EFF8"
          stroke="#CBD9EA"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text x="505" y="345" fontSize="12" fontWeight="600" letterSpacing="2" fill="#94A3B8">
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
