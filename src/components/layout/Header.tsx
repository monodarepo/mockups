import { useLocation } from 'react-router-dom'
import { Bell, ChevronDown, HelpCircle } from 'lucide-react'
import { itemPorRota } from '@/data/navigation'
import { useAppStore } from '@/store'
import { Button, IconButton } from '@/components/ui/Button'
import { ContadorBadge } from '@/components/ui/Badge'

const NOTIFICACOES = 8

export function Header() {
  const { pathname } = useLocation()
  const rota = itemPorRota(pathname)
  const persona = useAppStore((s) => s.persona)
  const personas = useAppStore((s) => s.personas)
  const setPersona = useAppStore((s) => s.setPersona)
  const alternarCopiloto = useAppStore((s) => s.alternarCopiloto)
  const mostrarToast = useAppStore((s) => s.mostrarToast)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-6 border-b border-line bg-card px-6">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-ink">{rota.label}</p>
        <p className="truncate text-caption text-muted">{rota.subtitulo}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variante="outline" tamanho="sm" onClick={alternarCopiloto}>
          <span aria-hidden="true" className="text-primary">
            ✦
          </span>
          Assistente IA
        </Button>

        <IconButton
          aria-label="Abrir central de ajuda"
          onClick={() =>
            mostrarToast({
              titulo: 'Central de ajuda',
              descricao: 'Documentação do HPO disponível na demo completa.',
              tone: 'info',
            })
          }
        >
          <HelpCircle size={18} aria-hidden="true" />
        </IconButton>

        <div className="relative">
          <IconButton
            aria-label={`Abrir notificações — ${NOTIFICACOES} não lidas`}
            onClick={() =>
              mostrarToast({
                titulo: `${NOTIFICACOES} notificações não lidas`,
                descricao: 'Acompanhe a fila completa em Alertas e Decisões.',
                tone: 'warning',
              })
            }
          >
            <Bell size={18} aria-hidden="true" />
          </IconButton>
          <ContadorBadge
            valor={NOTIFICACOES}
            rotulo="notificações não lidas"
            className="pointer-events-none absolute right-1 top-1 ring-2 ring-card"
          />
        </div>

        <div className="ml-1 h-8 w-px bg-line" aria-hidden="true" />

        <div className="relative flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-neutral-soft">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-body-sm font-semibold text-primary-strong">
            {persona.iniciais}
          </span>
          <div className="text-left leading-tight">
            <p className="text-body-sm font-semibold text-ink">{persona.nome}</p>
            <p className="text-caption text-muted">{persona.papel}</p>
          </div>
          <ChevronDown size={16} className="text-muted" aria-hidden="true" />
          <label className="sr-only" htmlFor="seletor-persona">
            Trocar persona
          </label>
          <select
            id="seletor-persona"
            value={persona.id}
            onChange={(evento) => setPersona(evento.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {p.papel}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
