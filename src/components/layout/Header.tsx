import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, BellOff, Check, ChevronDown, Eye, HelpCircle, Search as SearchIcon } from 'lucide-react'
import { formatDistanceStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/cn'
import { itemPorRota } from '@/data/navigation'
import { NOTIFICACOES_AGORA, notificacoes } from '@/data/notificacoes'
import { toneHex } from '@/lib/colors'
import { formatData, formatHora } from '@/lib/format'
import { useAppStore } from '@/store'
import { Button, IconButton } from '@/components/ui/Button'
import { ContadorBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

/** Tempo relativo ao agora da simulação (19/mai, 10:18): "há 12 minutos". */
function tempoRelativo(hora: Date): string {
  return formatDistanceStrict(hora, NOTIFICACOES_AGORA, { addSuffix: true, locale: ptBR })
}

const COR_DA_SEVERIDADE = {
  Crítica: toneHex.danger,
  Alta: toneHex.danger,
  Média: toneHex.warning,
  Baixa: toneHex.info,
} as const

/** Sino do header: eventos do dia com clique que navega ao contexto. */
function SinoNotificacoes() {
  const navigate = useNavigate()
  const lidas = useAppStore((s) => s.notificacoesLidas)
  const marcarLidas = useAppStore((s) => s.marcarNotificacoesLidas)
  const [aberto, setAberto] = useState(false)
  const naoLidas = lidas ? 0 : notificacoes.length

  return (
    <div className="relative">
      <IconButton
        aria-label={
          naoLidas > 0 ? `Abrir notificações — ${naoLidas} não lidas` : 'Abrir notificações — tudo lido'
        }
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        <Bell size={18} aria-hidden="true" />
      </IconButton>
      {naoLidas > 0 ? (
        <ContadorBadge
          valor={naoLidas}
          rotulo="notificações não lidas"
          className="pointer-events-none absolute right-1 top-1 ring-2 ring-card"
        />
      ) : null}

      {aberto ? (
        <>
          <button
            type="button"
            aria-label="Fechar notificações"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setAberto(false)}
          />
          <div
            role="region"
            aria-label="Notificações do dia"
            onKeyDown={(evento) => {
              if (evento.key === 'Escape') setAberto(false)
            }}
            className="absolute right-0 top-full z-30 mt-1 w-[380px] rounded-xl border border-line bg-card shadow-pop"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
              <p className="text-body-sm font-semibold text-ink">
                Notificações {naoLidas > 0 ? `· ${naoLidas} não lidas` : '· tudo lido'}
              </p>
              {naoLidas > 0 ? (
                <button
                  type="button"
                  onClick={marcarLidas}
                  className="rounded text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Marcar todas como lidas
                </button>
              ) : (
                <BellOff size={14} className="text-muted" aria-hidden="true" />
              )}
            </div>
            <ul className="max-h-[380px] overflow-y-auto p-1.5">
              {notificacoes.map((notificacao) => (
                <li key={notificacao.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setAberto(false)
                      navigate(notificacao.destino)
                    }}
                    className={cn(
                      'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150',
                      'hover:bg-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      lidas && 'opacity-70',
                    )}
                  >
                    <span
                      className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ backgroundColor: COR_DA_SEVERIDADE[notificacao.severidade] }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-body-sm font-medium text-ink" title={notificacao.titulo}>
                        {notificacao.titulo}
                      </span>
                      <span className="block truncate text-caption text-muted">{notificacao.descricao}</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-caption text-muted">
                      {tempoRelativo(notificacao.hora)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  setAberto(false)
                  navigate('/alertas')
                }}
                className="rounded text-body-sm font-medium text-primary transition-colors duration-150 hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Ver central de Alertas e Decisões →
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

const ATALHOS_TECLADO = [
  { teclas: ['Ctrl', 'K'], acao: 'Abrir a busca global (⌘+K no Mac)' },
  { teclas: ['↑', '↓'], acao: 'Navegar pelos resultados da busca' },
  { teclas: ['Enter'], acao: 'Abrir o item selecionado na tela de origem' },
  { teclas: ['Esc'], acao: 'Fechar busca, modais e gavetas' },
  { teclas: ['Tab'], acao: 'Percorrer os controles com foco visível' },
]

/** Modal "Sobre este mockup" — aberto pelo botão "?" do header. */
function SobreMockup({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Sobre este mockup"
      descricao="HPO — Hypera Production Optimizer · demonstração navegável"
      rodape={
        <Button tamanho="sm" onClick={onFechar}>
          Entendi
        </Button>
      }
    >
      <div className="flex flex-col gap-4 text-body text-ink">
        <p>
          Todos os dados são <strong>fictícios e determinísticos</strong>: vêm de uma simulação embutida,
          sem backend — recarregar a página nunca muda um número. A linha do tempo é única:{' '}
          <strong>{formatData(NOTIFICACOES_AGORA)}, Turno A (06:00 – 14:00)</strong>, atualizado às{' '}
          {formatHora(NOTIFICACOES_AGORA)}, com semana de planejamento de 20 – 26/mai/2025.
        </p>
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Atalhos de teclado</p>
          <ul className="flex flex-col gap-1.5">
            {ATALHOS_TECLADO.map((atalho) => (
              <li key={atalho.acao} className="flex items-center justify-between gap-3 text-body-sm">
                <span className="text-ink">{atalho.acao}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {atalho.teclas.map((tecla) => (
                    <kbd
                      key={tecla}
                      className="rounded-md border border-line bg-app px-1.5 py-0.5 text-caption font-medium text-muted"
                    >
                      {tecla}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="border-t border-line pt-3 text-body-sm text-muted">
          Os filtros globais (fábrica, área, turno e período) recortam as tabelas de todas as telas; um
          recorte sem dados mostra um estado vazio honesto — o mockup nunca inventa dados para preencher
          um filtro.
        </p>
      </div>
    </Modal>
  )
}

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
  const abrirPaleta = useAppStore((s) => s.abrirPaleta)
  const [sobreAberto, setSobreAberto] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-6 border-b border-line bg-card px-6">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-ink">{rota.label}</p>
        <p className="truncate text-caption text-muted">{rota.subtitulo}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={abrirPaleta}
          className={cn(
            'flex h-9 w-[240px] items-center gap-2 rounded-lg border border-line bg-app/70 px-3 text-body-sm text-muted',
            'transition-colors duration-150 hover:border-primary/40 hover:text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          <SearchIcon size={15} aria-hidden="true" />
          <span className="flex-1 truncate text-left">Buscar…</span>
          <kbd className="rounded-md border border-line bg-card px-1.5 py-0.5 text-caption">Ctrl K</kbd>
        </button>

        <Button variante="outline" tamanho="sm" onClick={alternarCopiloto}>
          <span aria-hidden="true" className="text-primary">
            ✦
          </span>
          Assistente IA
        </Button>

        <IconButton aria-label="Sobre este mockup" onClick={() => setSobreAberto(true)}>
          <HelpCircle size={18} aria-hidden="true" />
        </IconButton>

        <SinoNotificacoes />

        <div className="ml-1 h-8 w-px bg-line" aria-hidden="true" />

        <SeletorVisao />
      </div>

      <SobreMockup aberto={sobreAberto} onFechar={() => setSobreAberto(false)} />
    </header>
  )
}
