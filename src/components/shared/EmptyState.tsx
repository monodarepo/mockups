import type { LucideIcon } from 'lucide-react'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  /** Ícone lucide — padrão SearchX. */
  icone?: LucideIcon
  titulo: string
  /** Mensagem honesta que orienta a próxima ação. */
  descricao?: string
  acao?: { rotulo: string; onClick: () => void }
  /** Altura mínima para não colapsar o card (px). */
  alturaMin?: number
}

/**
 * Estado vazio honesto de um recorte sem dados: nunca inventar dados para
 * preencher um filtro — orientar a próxima ação.
 */
export function EmptyState({ icone: Icone = SearchX, titulo, descricao, acao, alturaMin = 220 }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center"
      style={{ minHeight: alturaMin }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-soft text-muted">
        <Icone size={18} aria-hidden="true" />
      </span>
      <p className="text-body font-semibold text-ink">{titulo}</p>
      {descricao ? <p className="max-w-md text-body-sm text-muted">{descricao}</p> : null}
      {acao ? (
        <div className="mt-2">
          <Button variante="outline" tamanho="sm" onClick={acao.onClick}>
            {acao.rotulo}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
