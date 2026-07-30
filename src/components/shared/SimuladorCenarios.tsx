import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarPlus,
  Clock,
  PauseCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusPill } from '@/components/shared/StatusPill'
import { cn } from '@/lib/cn'
import { formatMoedaCompacta, formatNumero, formatPercent } from '@/lib/format'
import { useAppStore } from '@/store'
import { ANALISE_CENARIOS, cenarios, eventosSimulaveis, type CenarioSimulacao } from '@/data'

const iconeDoEvento: Record<string, typeof PauseCircle> = {
  'EV-001': PauseCircle,
  'EV-002': Clock,
  'EV-003': CalendarPlus,
  'EV-004': ArrowRightLeft,
  'EV-005': ShieldAlert,
}

interface MetricaComparacao {
  id: string
  rotulo: string
  formatar: (cenario: CenarioSimulacao) => string
  /** ID do cenário vencedor da linha. */
  vencedorId: string
  pill?: boolean
}

const pesoRisco = { Baixo: 0, Médio: 1, Alto: 2 } as const

/** Vencedores calculados dos próprios dados — nada decidido na mão. */
function metricas(): MetricaComparacao[] {
  const porMaior = (acessor: (c: CenarioSimulacao) => number) =>
    [...cenarios].sort((a, b) => acessor(b) - acessor(a))[0].id
  const porMenor = (acessor: (c: CenarioSimulacao) => number) =>
    [...cenarios].sort((a, b) => acessor(a) - acessor(b))[0].id

  return [
    {
      id: 'atendimento',
      rotulo: 'Atendimento da demanda',
      formatar: (c) => formatPercent(c.atendimentoPercent, 0),
      vencedorId: porMaior((c) => c.atendimentoPercent),
    },
    {
      id: 'setup',
      rotulo: 'Horas de setup',
      formatar: (c) => `${formatNumero(c.horasSetup)} h`,
      vencedorId: porMenor((c) => c.horasSetup),
    },
    {
      id: 'custo',
      rotulo: 'Custo incremental',
      formatar: (c) => (c.custoIncremental === null ? '—' : formatMoedaCompacta(c.custoIncremental)),
      vencedorId: porMenor((c) => c.custoIncremental ?? 0),
    },
    {
      id: 'ruptura',
      rotulo: 'SKUs com ruptura',
      formatar: (c) => formatNumero(c.skusComRuptura),
      vencedorId: porMenor((c) => c.skusComRuptura),
    },
    {
      id: 'oee',
      rotulo: 'OEE projetado',
      formatar: (c) => formatPercent(c.oeeProjetado, 0),
      vencedorId: porMaior((c) => c.oeeProjetado),
    },
    {
      id: 'risco',
      rotulo: 'Risco operacional',
      formatar: (c) => c.risco,
      vencedorId: porMenor((c) => pesoRisco[c.risco]),
      pill: true,
    },
  ]
}

const LINHAS_COMPARACAO = metricas()

/**
 * Simulador de Cenários — overlay global aberto por qualquer botão "Simular"
 * do app (store.abrirSimulador). Passo 1 escolhe o evento; passo 2 compara
 * Plano-base × Cenário A × Cenário B e aprova.
 */
export function SimuladorCenarios() {
  const aberto = useAppStore((s) => s.simuladorAberto)
  const eventoInicialId = useAppStore((s) => s.simuladorEventoId)
  const fecharSimulador = useAppStore((s) => s.fecharSimulador)
  const aplicarCenario = useAppStore((s) => s.aplicarCenario)

  const [eventoId, setEventoId] = useState<string | null>(null)

  // Ao abrir com um evento pré-selecionado (copiloto/alerta), pula ao passo 2.
  useEffect(() => {
    if (aberto) setEventoId(eventoInicialId)
  }, [aberto, eventoInicialId])

  const evento = eventosSimulaveis.find((item) => item.id === eventoId) ?? null
  const passo = evento ? 2 : 1

  const aprovar = (cenarioId: string) => {
    aplicarCenario(cenarioId)
    fecharSimulador()
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={fecharSimulador}
      largura="lg"
      titulo="Simulador de Cenários"
      descricao={
        passo === 1
          ? 'Passo 1 de 2 — Escolha o evento a simular sobre o plano da semana 20 – 26/mai'
          : 'Passo 2 de 2 — Comparação de cenários de resposta'
      }
      rodape={
        passo === 2 ? (
          <>
            <Button variante="ghost" tamanho="sm" onClick={fecharSimulador}>
              Descartar
            </Button>
            <Button variante="outline" tamanho="sm" onClick={() => aprovar('cenario-b')}>
              Aprovar Cenário B
            </Button>
            <Button tamanho="sm" onClick={() => aprovar('cenario-a')}>
              Aprovar Cenário A
            </Button>
          </>
        ) : undefined
      }
    >
      {passo === 1 ? (
        <div className="grid grid-cols-2 gap-3">
          {eventosSimulaveis.map((item) => {
            const Icone = iconeDoEvento[item.id] ?? PauseCircle
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setEventoId(item.id)}
                className={cn(
                  'rounded-xl border border-line bg-card p-3.5 text-left transition-all duration-150',
                  'hover:border-primary/50 hover:shadow-card',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icone size={17} aria-hidden="true" />
                  </span>
                  <span className="text-body-sm font-semibold text-ink">{item.nome}</span>
                </span>
                <span className="mt-2 block text-caption leading-snug text-muted">{item.descricao}</span>
                <span className="mt-2 block text-caption font-medium text-warning-strong">
                  {item.impactoPreliminar}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setEventoId(null)}
            className="inline-flex items-center gap-1.5 self-start rounded text-body-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Escolher outro evento
          </button>

          {evento ? (
            <div className="flex items-start gap-3 rounded-xl bg-app px-3.5 py-3">
              {(() => {
                const Icone = iconeDoEvento[evento.id] ?? PauseCircle
                return (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icone size={17} aria-hidden="true" />
                  </span>
                )
              })()}
              <div>
                <p className="text-body-sm font-semibold text-ink">Evento simulado: {evento.nome}</p>
                <p className="text-caption text-muted">{evento.impactoPreliminar}</p>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full border-collapse text-body-sm" aria-label="Comparação de cenários">
              <thead>
                <tr>
                  <th scope="col" className="h-11 bg-app/70 px-3 text-left text-caption font-semibold text-muted">
                    Indicador
                  </th>
                  {cenarios.map((cenario) => (
                    <th
                      key={cenario.id}
                      scope="col"
                      className="h-11 bg-app/70 px-3 text-center text-caption font-semibold text-ink"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {cenario.nome}
                        {cenario.recomendado ? <Badge tone="success">Recomendado</Badge> : null}
                      </span>
                    </th>
                  ))}
                  <th scope="col" className="h-11 bg-app/70 px-3 text-center text-caption font-semibold text-muted">
                    Melhor
                  </th>
                </tr>
              </thead>
              <tbody>
                {LINHAS_COMPARACAO.map((linha) => (
                  <tr key={linha.id} className="border-t border-line">
                    <th scope="row" className="h-11 px-3 text-left font-medium text-muted">
                      {linha.rotulo}
                    </th>
                    {cenarios.map((cenario) => {
                      const vencedor = cenario.id === linha.vencedorId
                      return (
                        <td
                          key={cenario.id}
                          className={cn(
                            'h-11 px-3 text-center tabular-nums',
                            vencedor ? 'bg-success-soft font-bold text-success-strong' : 'text-ink',
                          )}
                        >
                          {linha.pill ? <StatusPill status={linha.formatar(cenario)} /> : linha.formatar(cenario)}
                        </td>
                      )
                    })}
                    <td className="h-11 px-3 text-center text-caption font-semibold text-success-strong">
                      {cenarios.find((cenario) => cenario.id === linha.vencedorId)?.nome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-line bg-app/50 p-4">
            <p className="flex items-center gap-2 text-caption font-bold uppercase tracking-[0.07em] text-primary">
              <Sparkles size={13} aria-hidden="true" />
              Análise do copiloto
              <Badge tone="clean">IA</Badge>
            </p>
            {ANALISE_CENARIOS.map((paragrafo) => (
              <p key={paragrafo.slice(0, 24)} className="mt-2 text-body-sm leading-relaxed text-ink">
                {paragrafo}
              </p>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
