import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import type { Tone } from '@/lib/colors'
import type { KpiCardData } from '@/data/types'
import { glossarioKpis } from '@/data/glossario'
import { itemPorRota } from '@/data/navigation'
import { TrendDelta } from './TrendDelta'
import { Sparkline } from './Sparkline'

export interface KpiCardProps {
  /** ID do indicador — chave do glossário (definição, escopo e rota). */
  id?: string
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

/** Primeiro número pt-BR do valor formatado ("R$ 2,48 mi" → "2,48"). */
const PADRAO_NUMERO = /\d{1,3}(?:\.\d{3})*(?:,\d+)?/

/**
 * Count-up de ~400 ms no mount: anima só a parte numérica do valor formatado
 * e termina exatamente no texto final. Desligado sob prefers-reduced-motion
 * e em ambiente de teste (determinismo).
 */
function useCountUp(valorFinal: string): string {
  const [exibido, setExibido] = useState(() => {
    if (import.meta.env.MODE === 'test') return valorFinal
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? valorFinal
      : valorFinal.replace(PADRAO_NUMERO, '0')
  })

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setExibido(valorFinal)
      return
    }
    const casado = valorFinal.match(PADRAO_NUMERO)
    if (!casado) {
      setExibido(valorFinal)
      return
    }
    const bruto = casado[0]
    const alvo = parseFloat(bruto.replace(/\./g, '').replace(',', '.'))
    const decimais = bruto.includes(',') ? bruto.split(',')[1].length : 0
    const inicio = performance.now()
    let quadro = 0
    const passo = (agora: number) => {
      const progresso = Math.min(1, (agora - inicio) / 400)
      const suavizado = 1 - Math.pow(1 - progresso, 3)
      if (progresso >= 1) {
        setExibido(valorFinal)
        return
      }
      const parcial = (alvo * suavizado).toLocaleString('pt-BR', {
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais,
      })
      setExibido(valorFinal.replace(bruto, parcial))
      quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [valorFinal])

  return exibido
}

export function KpiCard({
  id,
  label,
  value,
  delta,
  deltaGoodWhen = 'up',
  sublabel,
  sparklineData,
  tone = 'primary',
}: KpiCardProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const valorAnimado = useCountUp(value)

  const glossario = id ? glossarioKpis[id] : undefined
  const rota = glossario?.rota
  const clicavel = Boolean(rota && rota !== pathname)
  const destino = rota ? itemPorRota(rota).label : undefined

  const abrir = () => {
    if (clicavel && rota) navigate(rota)
  }

  return (
    <Card
      role={clicavel ? 'link' : undefined}
      tabIndex={clicavel ? 0 : undefined}
      aria-label={clicavel ? `${label} — abrir ${destino}` : undefined}
      onClick={clicavel ? abrir : undefined}
      onKeyDown={
        clicavel
          ? (evento: React.KeyboardEvent) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault()
                abrir()
              }
            }
          : undefined
      }
      className={cn(
        'flex min-w-0 flex-col gap-1 px-3.5 py-3',
        clicavel &&
          'cursor-pointer transition-shadow duration-150 hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      )}
    >
      <p className="flex min-w-0 items-center gap-1 text-caption font-medium text-muted">
        <span className="truncate" title={label}>
          {label}
        </span>
        {glossario ? (
          <Tooltip
            conteudo={
              <span className="block w-max max-w-[240px] text-left">
                <span className="block">{glossario.definicao}</span>
                <span className="mt-1 block border-t border-white/25 pt-1 opacity-80">
                  Escopo: {glossario.escopo}
                </span>
              </span>
            }
            className="shrink-0"
          >
            <span
              tabIndex={0}
              role="note"
              aria-label={`Sobre ${label}: ${glossario.definicao} Escopo: ${glossario.escopo}`}
              onClick={(evento) => evento.stopPropagation()}
              className="rounded-full text-muted/70 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Info size={12} aria-hidden="true" />
            </span>
          </Tooltip>
        ) : null}
      </p>
      <p className={`whitespace-nowrap font-bold tracking-[-0.02em] text-ink ${classeDoValor(value)}`}>
        {valorAnimado}
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
          id={kpi.id}
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
