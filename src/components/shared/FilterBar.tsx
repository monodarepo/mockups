import { useId } from 'react'
import { CalendarRange, ChevronDown, FilterX, X } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { filtrosIniciais, useAppStore, type Filtros } from '@/store'
import {
  AREAS,
  FABRICAS,
  PERIODOS,
  TURNOS,
  faixaDoPeriodo,
  type Area,
  type NomeFabrica,
  type Periodo,
  type Turno,
} from '@/data/constants'
import { formatData, formatHora } from '@/lib/format'

function rotuloDaFaixa(inicio: Date, fim: Date): string {
  const mesmoDia = inicio.toDateString() === fim.toDateString()
  if (mesmoDia) return `${formatData(inicio)} ${formatHora(inicio)} – ${formatHora(fim)}`
  return `${formatData(inicio)} – ${formatData(fim)}`
}

/** Filtros que geram chip quando saem do padrão. */
const CHIPS_FILTRO: Array<{ chave: 'fabrica' | 'area' | 'turno' | 'periodo'; rotulo: string }> = [
  { chave: 'fabrica', rotulo: 'Fábrica' },
  { chave: 'area', rotulo: 'Área' },
  { chave: 'turno', rotulo: 'Turno' },
  { chave: 'periodo', rotulo: 'Período' },
]

/**
 * Chips dos filtros fora do padrão, com remoção individual e "Limpar filtros".
 * Renderizado pela FilterBar e por telas com barra de contexto própria.
 */
export function FiltroChips() {
  const filtros = useAppStore((s) => s.filtros)
  const setFiltro = useAppStore((s) => s.setFiltro)
  const resetFiltros = useAppStore((s) => s.resetFiltros)

  const removerFiltro = (chave: 'fabrica' | 'area' | 'turno' | 'periodo') => {
    if (chave === 'periodo') {
      const faixa = faixaDoPeriodo(filtrosIniciais.periodo)
      setFiltro('periodo', filtrosIniciais.periodo)
      setFiltro('periodoInicio', faixa.inicio)
      setFiltro('periodoFim', faixa.fim)
      return
    }
    setFiltro(chave, filtrosIniciais[chave] as Filtros[typeof chave])
  }

  const chipsAtivos = CHIPS_FILTRO.filter(({ chave }) => filtros[chave] !== filtrosIniciais[chave])
  if (chipsAtivos.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption font-medium text-muted">Filtros ativos:</span>
      {chipsAtivos.map(({ chave, rotulo }) => (
        <span
          key={chave}
          className="inline-flex items-center gap-1 rounded-pill border border-primary/25 bg-primary-soft py-1 pl-2.5 pr-1 text-caption font-medium text-primary-strong"
        >
          {rotulo}: {String(filtros[chave])}
          <button
            type="button"
            aria-label={`Remover filtro ${rotulo}: ${String(filtros[chave])}`}
            onClick={() => removerFiltro(chave)}
            className="rounded-full p-0.5 text-primary-strong/70 transition-colors duration-150 hover:bg-primary/15 hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={resetFiltros}
        className="inline-flex items-center gap-1 rounded-pill px-2 py-1 text-caption font-medium text-muted transition-colors duration-150 hover:bg-neutral-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <FilterX size={12} aria-hidden="true" />
        Limpar filtros
      </button>
    </div>
  )
}

/** Barra de filtros globais — lê e grava no store; presente em todas as telas. */
export function FilterBar() {
  const filtros = useAppStore((s) => s.filtros)
  const setFiltro = useAppStore((s) => s.setFiltro)
  const idPeriodo = useId()

  const aoMudarPeriodo = (valor: string) => {
    const periodo = valor as Periodo
    const faixa = faixaDoPeriodo(periodo)
    setFiltro('periodo', periodo)
    setFiltro('periodoInicio', faixa.inicio)
    setFiltro('periodoFim', faixa.fim)
  }

  return (
    <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-card px-3 py-2.5 shadow-card">
      <Select
        rotulo="Fábrica"
        valor={filtros.fabrica}
        opcoes={FABRICAS}
        onChange={(valor) => setFiltro('fabrica', valor as NomeFabrica)}
      />
      <Select
        rotulo="Área"
        valor={filtros.area}
        opcoes={AREAS}
        onChange={(valor) => setFiltro('area', valor as Area)}
      />
      <Select
        rotulo="Turno"
        valor={filtros.turno}
        opcoes={TURNOS}
        onChange={(valor) => setFiltro('turno', valor as Turno)}
      />

      <div
        className="relative flex h-9 items-center gap-2 rounded-lg border border-line bg-card pl-3 pr-2 transition-colors duration-150 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1"
      >
        <CalendarRange size={14} className="shrink-0 text-muted" aria-hidden="true" />
        <span className="text-body-sm font-medium text-ink">
          {rotuloDaFaixa(filtros.periodoInicio, filtros.periodoFim)}
        </span>
        <ChevronDown size={14} className="text-muted" aria-hidden="true" />
        <label className="sr-only" htmlFor={idPeriodo}>
          Período
        </label>
        <select
          id={idPeriodo}
          value={filtros.periodo}
          onChange={(evento) => aoMudarPeriodo(evento.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {PERIODOS.map((periodo) => (
            <option key={periodo} value={periodo}>
              {periodo}
            </option>
          ))}
        </select>
      </div>

      <span className="ml-auto flex shrink-0 items-center gap-2 text-caption text-muted">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-success motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Atualizado em tempo real · Dados ao vivo
      </span>
    </div>

    <FiltroChips />
    </div>
  )
}
