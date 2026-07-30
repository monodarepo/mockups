import { useMemo } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type Modifier,
} from '@dnd-kit/core'
import { addDays } from 'date-fns'
import { AlertTriangle, Wrench } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDataNumerica, formatDiaSemana, formatPercent } from '@/lib/format'
import { GANTT_INICIO } from '@/data/sequencia'
import { rotuloStatusLinha } from '@/data/fabricas'
import type { BlocoSequencia, Linha } from '@/data/types'

export type ZoomGantt = 'dia' | 'semana' | 'turno'

const PX_POR_HORA: Record<ZoomGantt, number> = { semana: 5.6, dia: 9, turno: 16 }
const ALTURA_LINHA = 60
const LARGURA_ROTULOS = 168
const TOTAL_HORAS = 168 // Seg 20/mai 00:00 → Dom 26/mai 24:00

const corDoStatusLinha: Record<Linha['status'], string> = {
  normal: 'bg-success',
  atencao: 'bg-warning',
  critico: 'bg-danger',
  parada: 'bg-neutral',
}

function horasDesdeInicio(data: Date): number {
  return (data.getTime() - GANTT_INICIO.getTime()) / 3_600_000
}

/** Mantém o drag estritamente horizontal — blocos não trocam de linha. */
const somenteHorizontal: Modifier = ({ transform }) => ({ ...transform, y: 0 })

interface EstiloBloco {
  container: string
  texto?: string
}

function estiloDoBloco(bloco: BlocoSequencia, emExecucao: boolean): EstiloBloco {
  switch (bloco.tipo) {
    case 'producao':
      if (bloco.risco) {
        // Borda de risco substitui a borda padrão — evita disputa de especificidade.
        return {
          container: emExecucao
            ? 'bg-success-soft border-2 border-danger text-success-strong'
            : 'bg-primary-soft border-2 border-danger text-primary-strong',
        }
      }
      return {
        container: emExecucao
          ? 'bg-success-soft border border-success/50 text-success-strong'
          : 'bg-primary-soft border border-primary/40 text-primary-strong',
      }
    case 'setup':
      return { container: 'bg-setup-soft border border-setup/50 text-setup-strong' }
    case 'limpeza':
      return { container: 'bg-clean-soft border border-clean/50 text-clean-strong' }
    case 'manutencao':
      return { container: 'bg-neutral-soft border border-neutral/40 text-neutral-strong' }
    case 'parada':
      return { container: 'bg-danger-soft border-2 border-danger text-danger-strong' }
    case 'folga':
      return { container: 'border border-dashed border-line bg-transparent text-muted' }
  }
}

interface BlocoGanttProps {
  bloco: BlocoSequencia
  pxPorHora: number
  deslocamentoHoras: number
  pendente: boolean
  emExecucao: boolean
  arrastavel: boolean
}

function BlocoGantt({ bloco, pxPorHora, deslocamentoHoras, pendente, emExecucao, arrastavel }: BlocoGanttProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: bloco.id,
    disabled: !arrastavel,
  })

  const inicio = horasDesdeInicio(bloco.inicio) + deslocamentoHoras
  const duracao = horasDesdeInicio(bloco.fim) - horasDesdeInicio(bloco.inicio)
  const left = inicio * pxPorHora
  const width = Math.max(duracao * pxPorHora, bloco.tipo === 'setup' ? 12 : 16)
  const estilo = estiloDoBloco(bloco, emExecucao)
  const estreito = width < 56

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`${bloco.rotulo}${bloco.ordemId ? ` (${bloco.ordemId})` : ''}${bloco.risco ? ' — em risco' : ''}`}
      title={bloco.motivoRisco ?? `${bloco.rotulo}${bloco.ordemId ? ` · ${bloco.ordemId}` : ''}`}
      className={cn(
        'absolute top-2 flex h-11 select-none items-center overflow-hidden rounded-lg px-1.5',
        estilo.container,
        arrastavel && 'cursor-grab active:cursor-grabbing',
        pendente && 'ring-2 ring-primary ring-offset-1',
        isDragging ? 'z-20 shadow-pop transition-none' : 'transition-[left,width] duration-500 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
      )}
      style={{
        left,
        width,
        transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
      }}
    >
      {bloco.tipo === 'manutencao' ? (
        <Wrench size={12} className="mr-1 shrink-0" aria-hidden="true" />
      ) : null}
      {bloco.risco ? <AlertTriangle size={12} className="mr-1 shrink-0 text-danger" aria-hidden="true" /> : null}
      {bloco.tipo === 'setup' ? (
        <span className="w-full text-center text-[10px] font-bold">S</span>
      ) : bloco.tipo === 'limpeza' ? (
        <span className="w-full text-center text-[10px] font-bold">L</span>
      ) : (
        <span className="min-w-0 leading-tight">
          <span className={cn('block truncate font-semibold', estreito ? 'text-[10px]' : 'text-[11px]')}>
            {bloco.rotulo}
          </span>
          {bloco.ordemId && !estreito ? (
            <span className="block truncate text-[10px] opacity-80">{bloco.ordemId}</span>
          ) : null}
        </span>
      )}
    </div>
  )
}

interface GanttSequenciaProps {
  linhas: Linha[]
  blocos: BlocoSequencia[]
  zoom: ZoomGantt
  /** IDs das ordens em execução — pinta a produção de verde suave. */
  ordensEmExecucao: Set<string>
  deslocamentos: Record<string, number>
  movimentoPendente: { blocoId: string; deltaHoras: number } | null
  onSoltarBloco: (blocoId: string, deltaHoras: number) => void
  otimizando: boolean
  scrollRef: React.RefObject<HTMLDivElement>
}

export function GanttSequencia({
  linhas,
  blocos,
  zoom,
  ordensEmExecucao,
  deslocamentos,
  movimentoPendente,
  onSoltarBloco,
  otimizando,
  scrollRef,
}: GanttSequenciaProps) {
  const pxPorHora = PX_POR_HORA[zoom]
  const larguraTimeline = TOTAL_HORAS * pxPorHora

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  )

  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, indice) => addDays(GANTT_INICIO, indice)),
    [],
  )

  const blocosPorLinha = useMemo(() => {
    const mapa = new Map<string, BlocoSequencia[]>()
    for (const bloco of blocos) {
      const lista = mapa.get(bloco.linhaId) ?? []
      lista.push(bloco)
      mapa.set(bloco.linhaId, lista)
    }
    return mapa
  }, [blocos])

  // Evita reordenação com movimento pendente aberto — um ajuste por vez.
  const arrastavel = !otimizando && movimentoPendente === null

  return (
    <div className="relative">
      <DndContext
        sensors={sensores}
        modifiers={[somenteHorizontal]}
        onDragEnd={(evento) => {
          const deltaHoras = Math.round(((evento.delta.x ?? 0) / pxPorHora) * 2) / 2
          if (Math.abs(deltaHoras) < 0.5) return
          onSoltarBloco(String(evento.active.id), deltaHoras)
        }}
      >
        <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-line">
          <div style={{ width: LARGURA_ROTULOS + larguraTimeline }} className="relative">
            {/* Cabeçalho: dias + turnos M/T/N */}
            <div className="flex border-b border-line bg-app/70" style={{ height: 44 }}>
              <div
                className="sticky left-0 z-20 shrink-0 border-r border-line bg-card px-3 py-2 text-caption font-semibold text-muted"
                style={{ width: LARGURA_ROTULOS }}
              >
                Linha
              </div>
              <div className="relative" style={{ width: larguraTimeline }}>
                {dias.map((dia, indice) => (
                  <div
                    key={dia.getTime()}
                    className={cn('absolute top-0 h-full border-line', indice > 0 && 'border-l')}
                    style={{ left: indice * 24 * pxPorHora, width: 24 * pxPorHora }}
                  >
                    <p className="truncate px-2 pt-1 text-caption font-semibold capitalize text-ink">
                      {formatDiaSemana(dia)} {formatDataNumerica(dia).slice(0, 5)}
                    </p>
                    <div className="flex text-[10px] text-muted">
                      {(['M', 'T', 'N'] as const).map((turno, turnoIndice) => (
                        <span
                          key={turno}
                          className="text-center"
                          style={{ width: 8 * pxPorHora, marginLeft: turnoIndice === 0 ? 6 * pxPorHora : 0 }}
                        >
                          {turno}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corpo: uma faixa por linha de produção */}
            {linhas.map((linha) => (
              <div key={linha.id} className="flex border-b border-line last:border-b-0" style={{ height: ALTURA_LINHA }}>
                <div
                  className="sticky left-0 z-20 flex shrink-0 flex-col justify-center gap-0.5 border-r border-line bg-card px-3"
                  style={{ width: LARGURA_ROTULOS }}
                >
                  <span className="flex items-center gap-1.5 text-body-sm font-semibold text-ink">
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        corDoStatusLinha[linha.status],
                        linha.status === 'critico' && 'animate-pulse-live motion-reduce:animate-none',
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{linha.nome}</span>
                  </span>
                  <span className="pl-3.5 text-caption text-muted">
                    {formatPercent(linha.capacidadeUtilizada, 0)} capacidade · {rotuloStatusLinha[linha.status]}
                  </span>
                </div>

                <div className="relative" style={{ width: larguraTimeline }}>
                  {/* Grade: divisões de dia (fortes) e de turno (suaves) */}
                  {dias.map((dia, indice) => (
                    <div key={dia.getTime()} aria-hidden="true">
                      {indice > 0 ? (
                        <div
                          className="absolute top-0 h-full border-l border-line"
                          style={{ left: indice * 24 * pxPorHora }}
                        />
                      ) : null}
                      {[6, 14, 22].map((hora) => (
                        <div
                          key={hora}
                          className="absolute top-0 h-full border-l border-line/50"
                          style={{ left: (indice * 24 + hora) * pxPorHora }}
                        />
                      ))}
                    </div>
                  ))}

                  {(blocosPorLinha.get(linha.id) ?? []).map((bloco) => {
                    const deslocamento =
                      (deslocamentos[bloco.id] ?? 0) +
                      (movimentoPendente?.blocoId === bloco.id ? movimentoPendente.deltaHoras : 0)
                    return (
                      <BlocoGantt
                        key={bloco.id}
                        bloco={bloco}
                        pxPorHora={pxPorHora}
                        deslocamentoHoras={deslocamento}
                        pendente={movimentoPendente?.blocoId === bloco.id}
                        emExecucao={bloco.ordemId ? ordensEmExecucao.has(bloco.ordemId) : false}
                        arrastavel={arrastavel && bloco.tipo === 'producao'}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DndContext>

      {otimizando ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-card/75 backdrop-blur-[2px]">
          <span className="flex items-center gap-3 rounded-pill border border-line bg-card px-4 py-2 shadow-pop">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none"
            />
            <span className="text-body-sm font-medium text-ink">Otimizando sequência…</span>
          </span>
        </div>
      ) : null}
    </div>
  )
}

/** Legenda dos tipos de bloco do Gantt. */
export function LegendaGantt() {
  const itens: Array<{ rotulo: string; classe: string; extra?: React.ReactNode }> = [
    { rotulo: 'Produção planejada', classe: 'bg-primary-soft border border-primary/40' },
    { rotulo: 'Produção em execução', classe: 'bg-success-soft border border-success/50' },
    { rotulo: 'Setup', classe: 'bg-setup-soft border border-setup/50' },
    { rotulo: 'Limpeza', classe: 'bg-clean-soft border border-clean/50' },
    { rotulo: 'Manutenção', classe: 'bg-neutral-soft border border-neutral/40' },
    { rotulo: 'Risco', classe: 'bg-danger-soft border-2 border-danger' },
    { rotulo: 'Folga', classe: 'border border-dashed border-line' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3">
      {itens.map((item) => (
        <span key={item.rotulo} className="flex items-center gap-1.5 text-caption text-muted">
          <span className={cn('h-3 w-5 rounded', item.classe)} aria-hidden="true" />
          {item.rotulo}
        </span>
      ))}
    </div>
  )
}

