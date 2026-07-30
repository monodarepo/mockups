import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useAppStore, type Toast as ToastData } from '@/store'
import { toneHex, type Tone } from '@/lib/colors'
import { IconButton } from './Button'

const DURACAO_MS = 4000

function iconePorTom(tone: Tone) {
  if (tone === 'danger' || tone === 'warning') return AlertTriangle
  if (tone === 'success') return CheckCircle2
  return Info
}

function Toast({ toast }: { toast: ToastData }) {
  const descartarToast = useAppStore((s) => s.descartarToast)
  const Icone = iconePorTom(toast.tone)

  useEffect(() => {
    const timer = window.setTimeout(() => descartarToast(toast.id), DURACAO_MS)
    return () => window.clearTimeout(timer)
  }, [toast.id, descartarToast])

  return (
    <div
      role="status"
      className="flex w-80 animate-toast-in items-start gap-3 rounded-card border border-line bg-card p-3.5 shadow-pop motion-reduce:animate-none"
    >
      <Icone size={18} color={toneHex[toast.tone]} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-ink">{toast.titulo}</p>
        {toast.descricao ? <p className="mt-0.5 text-caption text-muted">{toast.descricao}</p> : null}
      </div>
      <IconButton
        aria-label="Fechar notificação"
        className="h-6 w-6 shrink-0"
        onClick={() => descartarToast(toast.id)}
      >
        <X size={14} aria-hidden="true" />
      </IconButton>
    </div>
  )
}

/** Pilha de toasts do app — montada uma única vez no AppShell. */
export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  )
}
