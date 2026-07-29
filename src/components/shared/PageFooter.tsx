import { ATUALIZADO_EM } from '@/data/constants'
import { formatDataHora } from '@/lib/format'

/** Rodapé padrão de todas as telas. */
export function PageFooter() {
  return (
    <p className="pt-1 text-caption text-muted">
      Dados atualizados em {formatDataHora(ATUALIZADO_EM)}
    </p>
  )
}
