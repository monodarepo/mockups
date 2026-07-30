import { useState, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

export interface ItemMenuAcoes {
  rotulo: string
  onClick: () => void
  /** Marca o item com um check (ex.: painel ativo). */
  ativo?: boolean
}

/** Menu suspenso do PageHeader — todo item executa uma ação real. */
export function MenuAcoes({ rotulo, icone, itens }: { rotulo: string; icone: ReactNode; itens: ItemMenuAcoes[] }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="relative">
      <Button variante="outline" tamanho="sm" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
        {icone}
        {rotulo}
        <ChevronDown size={14} aria-hidden="true" className={cn('transition-transform duration-150', aberto && 'rotate-180')} />
      </Button>
      {aberto ? (
        <>
          <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-20 cursor-default" onClick={() => setAberto(false)} />
          <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-line bg-card p-1 shadow-pop">
            {itens.map((item) => (
              <button
                key={item.rotulo}
                type="button"
                onClick={() => {
                  setAberto(false)
                  item.onClick()
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-body-sm text-ink',
                  'transition-colors duration-150 hover:bg-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  item.ativo && 'bg-primary-soft/50 font-medium text-primary-strong',
                )}
              >
                {item.rotulo}
                {item.ativo ? <Check size={14} className="shrink-0 text-primary" aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
