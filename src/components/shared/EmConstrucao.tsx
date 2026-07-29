import { itemPorRota } from '@/data/navigation'
import { useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { PageHeader } from './PageHeader'
import { PageFooter } from './PageFooter'
import { Badge } from '@/components/ui/Badge'

/**
 * Página placeholder das telas ainda não construídas.
 * Mantém o layout padrão — PageHeader, conteúdo, rodapé — para que a
 * navegação já tenha o enquadramento definitivo.
 */
export function EmConstrucao() {
  const { pathname } = useLocation()
  const rota = itemPorRota(pathname)
  const Icone = rota.icon

  return (
    <>
      <PageHeader titulo={rota.label} descricao={rota.subtitulo} />

      <Card className="p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-primary-soft text-primary">
            <Icone size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-card-title font-semibold text-ink">
                Em construção — Prompt {rota.prompt}
              </h2>
              <Badge tone="info">Planejada</Badge>
            </div>
            <p className="mt-1.5 max-w-2xl text-body text-muted">
              A tela {rota.label} entra na etapa {rota.prompt} da construção. A navegação, o design
              system e os filtros globais já estão ativos — escolha outra tela no menu lateral para
              continuar a demonstração.
            </p>
          </div>
        </div>
      </Card>

      <PageFooter />
    </>
  )
}
