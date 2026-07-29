import type { ReactNode } from 'react'

interface PageHeaderProps {
  titulo: string
  descricao: string
  /** Ações à direita: exportar, criar cenário, aprovar em lote… */
  acoes?: ReactNode
}

export function PageHeader({ titulo, descricao, acoes }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="text-title font-semibold tracking-[-0.01em] text-ink">{titulo}</h1>
        <p className="mt-1 text-body text-muted">{descricao}</p>
      </div>
      {acoes ? <div className="flex shrink-0 items-center gap-2">{acoes}</div> : null}
    </div>
  )
}
