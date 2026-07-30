import { cn } from '@/lib/cn'
import { FAMILIAS_SETUP, matrizSetup } from '@/data/sequencia'

/** Escala verde → vermelho por minutos de troca (45–70). */
function classeDaCelula(minutos: number): string {
  if (minutos <= 48) return 'bg-success-soft text-success-strong'
  if (minutos <= 55) return 'bg-[#F3FAE8] text-[#4D7C0F]'
  if (minutos <= 60) return 'bg-warning-soft text-warning-strong'
  if (minutos <= 66) return 'bg-setup-soft text-setup-strong'
  return 'bg-danger-soft text-danger-strong'
}

const ABREVIACOES: Record<string, string> = {
  Analgésicos: 'Analg.',
  Vitaminas: 'Vitam.',
  Antitérmicos: 'Antit.',
  Antigripais: 'Antig.',
  Outros: 'Outros',
}

/** Heatmap 5×5 de minutos de troca entre famílias (de → para). */
export function MatrizSetup() {
  return (
    <div>
      <table className="w-full border-separate border-spacing-1 text-caption" aria-label="Matriz de minutos de troca entre famílias">
        <thead>
          <tr>
            <th scope="col" className="w-16 pb-1 text-left align-bottom font-medium text-muted">
              de \ para
            </th>
            {FAMILIAS_SETUP.map((familia) => (
              <th key={familia} scope="col" title={familia} className="pb-1 text-center font-semibold text-muted">
                {ABREVIACOES[familia]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FAMILIAS_SETUP.map((de) => (
            <tr key={de}>
              <th scope="row" title={de} className="pr-1 text-left font-semibold text-muted">
                {ABREVIACOES[de]}
              </th>
              {FAMILIAS_SETUP.map((para) => {
                const minutos = matrizSetup[de][para]
                return (
                  <td
                    key={para}
                    title={`${de} → ${para}: ${minutos} min`}
                    className={cn(
                      'h-9 rounded-md text-center font-bold tabular-nums',
                      classeDaCelula(minutos),
                    )}
                  >
                    {minutos}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center gap-2 text-caption text-muted">
        <span>45 min</span>
        <span aria-hidden="true" className="h-1.5 flex-1 rounded-pill bg-gradient-to-r from-success via-warning to-danger" />
        <span>70 min</span>
      </div>
    </div>
  )
}
