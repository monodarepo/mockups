import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Check, ChevronDown, Eye, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { itemPorRota } from '@/data/navigation'
import { useAppStore } from '@/store'
import { Button, IconButton } from '@/components/ui/Button'
import { ContadorBadge } from '@/components/ui/Badge'

const NOTIFICACOES = 8

/** Chip do header que troca a visão ativa (papel funcional) da plataforma. */
function SeletorVisao() {
  const visao = useAppStore((s) => s.visao)
  const visoes = useAppStore((s) => s.visoes)
  const setVisao = useAppStore((s) => s.setVisao)
  const [aberto, setAberto] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-line bg-card py-1.5 pl-2 pr-2.5',
          'transition-colors duration-150 hover:bg-neutral-soft',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Eye size={15} aria-hidden="true" />
        </span>
        <span className="text-body-sm font-semibold text-ink">
          Visão: <span className="text-primary-strong">{visao.rotuloCurto}</span>
        </span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={cn('text-muted transition-transform duration-150', aberto && 'rotate-180')}
        />
      </button>

      {aberto ? (
        <>
          <button
            type="button"
            aria-label="Fechar seletor de visão"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setAberto(false)}
          />
          <ul
            role="listbox"
            aria-label="Trocar visão"
            className="absolute right-0 top-full z-30 mt-1 w-80 rounded-xl border border-line bg-card p-1 shadow-pop"
          >
            {visoes.map((opcao) => {
              const ativa = opcao.id === visao.id
              return (
                <li key={opcao.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={ativa}
                    onClick={() => {
                      setVisao(opcao.id)
                      setAberto(false)
                    }}
                    className={cn(
                      'flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors duration-150',
                      'hover:bg-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      ativa && 'bg-primary-soft/60',
                    )}
                  >
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className={cn('block text-body-sm font-semibold', ativa ? 'text-primary-strong' : 'text-ink')}>
                        {opcao.nome}
                      </span>
                      <span className="block text-caption text-muted">{opcao.descricao}</span>
                    </span>
                    {ativa ? <Check size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </div>
  )
}

export function Header() {
  const { pathname } = useLocation()
  const rota = itemPorRota(pathname)
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

        <SeletorVisao />
      </div>
    </header>
  )
}
