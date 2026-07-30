import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, Search, SendHorizontal, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import { RESPOSTA_PADRAO_QA, buscarResposta } from '@/data/copilot'
import type { ConteudoCopilot, MensagemCopilot } from '@/data/types'

/** Velocidade do efeito de digitação da resposta (~25 ms por caractere). */
const MS_POR_CARACTERE = 25

interface CopilotPanelProps {
  conteudo: ConteudoCopilot
  /** Callback dos botões contextuais — recebe o rótulo acionado. */
  onAcao?: (rotulo: string) => void
  /** Quando presente, cada ação recomendada ganha um botão "Aceitar". */
  onAceitarAcao?: (acao: string) => void
  /** Ações já aceitas — exibidas com selo "Aplicada". */
  acoesAceitas?: string[]
}

function BlocoCopilot({
  titulo,
  icone,
  corTitulo,
  itens,
}: {
  titulo: string
  icone: ReactNode
  corTitulo: string
  itens: string[]
}) {
  return (
    <section>
      <h3 className={cn('flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em]', corTitulo)}>
        {icone}
        {titulo}
      </h3>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {itens.map((item) => (
          <li key={item} className="flex gap-2 text-body-sm leading-snug text-ink">
            <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-current opacity-40" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Bolha de mensagem do chat, com digitação progressiva nas respostas novas. */
function MensagemChat({
  mensagem,
  digitando,
  onAbrirSimulador,
}: {
  mensagem: MensagemCopilot
  digitando: number | null
  onAbrirSimulador: (eventoId: string) => void
}) {
  const doUsuario = mensagem.autor === 'usuario'
  const completa = digitando === null
  const texto = completa ? mensagem.texto : mensagem.texto.slice(0, digitando)

  return (
    <div className={cn('flex', doUsuario ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[92%] rounded-xl px-3 py-2 text-body-sm leading-snug',
          doUsuario ? 'bg-primary text-white' : 'bg-app text-ink',
        )}
      >
        {texto}
        {!completa ? <span aria-hidden="true" className="animate-pulse-live">▌</span> : null}
        {completa && mensagem.fontes?.length ? (
          <p className="mt-1.5 border-t border-line pt-1.5 text-caption text-muted">
            Fontes: {mensagem.fontes.join(' · ')}
          </p>
        ) : null}
        {completa && mensagem.acao ? (
          <Button
            variante="outline"
            tamanho="sm"
            className="mt-2 h-7 w-full bg-card px-2.5"
            onClick={() => onAbrirSimulador(mensagem.acao?.eventoId ?? '')}
          >
            {mensagem.acao.rotulo}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function CopilotPanel({ conteudo, onAcao, onAceitarAcao, acoesAceitas = [] }: CopilotPanelProps) {
  const visao = useAppStore((s) => s.visao)
  const aberto = useAppStore((s) => s.copilotoAberto)
  const alternarCopiloto = useAppStore((s) => s.alternarCopiloto)
  const conversa = useAppStore((s) => s.conversas[conteudo.tela] ?? [])
  const registrarMensagem = useAppStore((s) => s.registrarMensagem)
  const abrirSimulador = useAppStore((s) => s.abrirSimulador)

  const [pergunta, setPergunta] = useState('')
  // Digitação progressiva da resposta mais recente: {id da mensagem, nº de caracteres}.
  const [digitacao, setDigitacao] = useState<{ id: number; chars: number } | null>(null)
  const fimConversaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!digitacao) return
    const alvo = conversa.find((mensagem) => mensagem.id === digitacao.id)
    if (!alvo || digitacao.chars >= alvo.texto.length) {
      setDigitacao(null)
      return
    }
    const timer = window.setTimeout(
      () => setDigitacao({ id: digitacao.id, chars: digitacao.chars + 1 }),
      MS_POR_CARACTERE,
    )
    return () => window.clearTimeout(timer)
  }, [digitacao, conversa])

  // Mantém a conversa rolada para o fim enquanto a resposta é digitada.
  useEffect(() => {
    fimConversaRef.current?.scrollIntoView({ block: 'nearest' })
  }, [conversa.length, digitacao?.chars])

  const enviar = (texto: string) => {
    const perguntaLimpa = texto.trim()
    if (!perguntaLimpa || digitacao) return
    registrarMensagem(conteudo.tela, { autor: 'usuario', texto: perguntaLimpa })
    const par = buscarResposta(perguntaLimpa)
    const resposta = registrarMensagem(conteudo.tela, {
      autor: 'copiloto',
      texto: par?.resposta ?? RESPOSTA_PADRAO_QA,
      fontes: par?.fontes,
      acao: par?.acao,
    })
    const reduzMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduzMotion) setDigitacao({ id: resposta.id, chars: 0 })
    setPergunta('')
  }

  const aoPerguntar = (evento: FormEvent) => {
    evento.preventDefault()
    enviar(pergunta)
  }

  return (
    <Card className="flex min-w-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <h2 className="truncate text-card-title font-semibold text-ink">Copiloto Gemini</h2>
          <Badge tone="clean">IA</Badge>
        </div>
        <IconButton
          aria-label={aberto ? 'Recolher assistente' : 'Expandir assistente'}
          aria-expanded={aberto}
          className="h-8 w-8 shrink-0"
          onClick={alternarCopiloto}
        >
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn('transition-transform duration-200 motion-reduce:transition-none', !aberto && '-rotate-90')}
          />
        </IconButton>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none',
          aberto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 border-t border-line px-4 pb-4 pt-3.5">
            <div>
              {/* Contexto do painel: acompanha a visão ativa escolhida no header. */}
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted">
                Resumo — {visao.nome}
              </p>
              <p className="mt-1 text-body-sm leading-snug text-ink">{conteudo.resumo}</p>
            </div>

            <BlocoCopilot
              titulo="Riscos detectados"
              corTitulo="text-danger"
              icone={<AlertTriangle size={12} aria-hidden="true" />}
              itens={conteudo.riscos}
            />
            <BlocoCopilot
              titulo="Causas prováveis"
              corTitulo="text-warning-strong"
              icone={<Search size={12} aria-hidden="true" />}
              itens={conteudo.causas}
            />
            {onAceitarAcao ? (
              <section>
                <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-success">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  Ações recomendadas
                </h3>
                <ul className="mt-1.5 flex flex-col gap-2">
                  {conteudo.acoes.map((acao) => {
                    const aceita = acoesAceitas.includes(acao)
                    return (
                      <li key={acao} className="flex items-start justify-between gap-2">
                        <span className="flex min-w-0 gap-2 text-body-sm leading-snug text-ink">
                          <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-current opacity-40" />
                          {acao}
                        </span>
                        {aceita ? (
                          <Badge tone="success" className="mt-0.5 shrink-0">
                            Aplicada
                          </Badge>
                        ) : (
                          <Button
                            variante="outline"
                            tamanho="sm"
                            className="h-7 shrink-0 px-2.5"
                            onClick={() => onAceitarAcao(acao)}
                          >
                            Aceitar
                          </Button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ) : (
              <BlocoCopilot
                titulo="Ações recomendadas"
                corTitulo="text-success"
                icone={<CheckCircle2 size={12} aria-hidden="true" />}
                itens={conteudo.acoes}
              />
            )}
            {conteudo.impactos?.length ? (
              <BlocoCopilot
                titulo="Impacto esperado"
                corTitulo="text-info-strong"
                icone={<TrendingUp size={12} aria-hidden="true" />}
                itens={conteudo.impactos}
              />
            ) : null}

            <div className="flex flex-col gap-2">
              {conteudo.botoes.map((rotulo, indice) => (
                <Button
                  key={rotulo}
                  variante={indice === 0 ? 'primary' : 'outline'}
                  tamanho="sm"
                  className="w-full"
                  onClick={() => onAcao?.(rotulo)}
                >
                  {rotulo}
                </Button>
              ))}
            </div>

            {conversa.length > 0 ? (
              <div
                role="log"
                aria-label="Conversa com o assistente"
                className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-xl border border-line p-2.5"
              >
                {conversa.map((mensagem) => (
                  <MensagemChat
                    key={mensagem.id}
                    mensagem={mensagem}
                    digitando={digitacao?.id === mensagem.id ? digitacao.chars : null}
                    onAbrirSimulador={(eventoId) => abrirSimulador(eventoId)}
                  />
                ))}
                <div ref={fimConversaRef} />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-1.5">
              {conteudo.perguntasSugeridas.map((sugestao) => (
                <button
                  key={sugestao}
                  type="button"
                  onClick={() => enviar(sugestao)}
                  disabled={digitacao !== null}
                  className={cn(
                    'rounded-pill border border-line bg-app px-2.5 py-1 text-caption text-muted',
                    'transition-colors duration-150 hover:border-primary/50 hover:text-primary',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {sugestao}
                </button>
              ))}
            </div>

            <form onSubmit={aoPerguntar} className="flex items-center gap-2">
              <label className="sr-only" htmlFor="pergunta-copiloto">
                Pergunte ao assistente
              </label>
              <input
                id="pergunta-copiloto"
                type="text"
                value={pergunta}
                onChange={(evento) => setPergunta(evento.target.value)}
                placeholder="Pergunte ao assistente…"
                className={cn(
                  'h-9 min-w-0 flex-1 rounded-lg border border-line bg-app px-3 text-body-sm text-ink',
                  'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                )}
              />
              <IconButton aria-label="Enviar pergunta" type="submit" className="h-9 w-9 shrink-0 text-primary">
                <SendHorizontal size={16} aria-hidden="true" />
              </IconButton>
            </form>
          </div>
        </div>
      </div>
    </Card>
  )
}
