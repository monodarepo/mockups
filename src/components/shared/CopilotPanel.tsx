import { useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, Search, SendHorizontal, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import type { ConteudoCopilot } from '@/data/types'

/** Resposta provisória do assistente até a integração do banco de Q&A. */
const ECO_PROVISORIO = 'Disponível no Prompt 8'

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

export function CopilotPanel({ conteudo, onAcao, onAceitarAcao, acoesAceitas = [] }: CopilotPanelProps) {
  const persona = useAppStore((s) => s.persona)
  const aberto = useAppStore((s) => s.copilotoAberto)
  const alternarCopiloto = useAppStore((s) => s.alternarCopiloto)
  const [pergunta, setPergunta] = useState('')
  const [eco, setEco] = useState<string | null>(null)

  const saudacao = conteudo.saudacao.replace('{nome}', persona.tratamento)

  const aoPerguntar = (evento: FormEvent) => {
    evento.preventDefault()
    if (!pergunta.trim()) return
    setEco(ECO_PROVISORIO)
    setPergunta('')
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
              <p className="text-body-sm font-medium text-ink">{saudacao}</p>
              <p className="mt-1 text-body-sm leading-snug text-muted">{conteudo.resumo}</p>
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

            {eco ? (
              <p role="status" className="rounded-lg bg-primary-soft px-3 py-2 text-caption font-medium text-primary-strong">
                {eco}
              </p>
            ) : null}

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
