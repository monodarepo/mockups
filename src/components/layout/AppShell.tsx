import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from './CommandPalette'
import { ToastHost } from '@/components/ui/Toast'
import { SimuladorCenarios } from '@/components/shared/SimuladorCenarios'
import { FichaUniversal } from '@/features/fichas/FichaUniversal'
import { itemPorRota } from '@/data/navigation'

/** Esqueleto exibido por ~300 ms na troca de rota — respeita reduced-motion. */
function SkeletonTela() {
  return (
    <div role="status" aria-label="Carregando tela" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-72 animate-pulse rounded-lg bg-neutral-soft motion-reduce:animate-none" />
        <div className="h-4 w-[420px] animate-pulse rounded-md bg-neutral-soft motion-reduce:animate-none" />
      </div>
      <div className="h-14 animate-pulse rounded-card bg-neutral-soft motion-reduce:animate-none" />
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }, (_, indice) => (
          <div key={indice} className="h-28 animate-pulse rounded-card bg-neutral-soft motion-reduce:animate-none" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 h-72 animate-pulse rounded-card bg-neutral-soft motion-reduce:animate-none" />
        <div className="h-72 animate-pulse rounded-card bg-neutral-soft motion-reduce:animate-none" />
      </div>
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const [carregando, setCarregando] = useState(false)
  const primeiraRota = useRef(true)

  // Título do documento por rota + skeleton curto na navegação.
  useEffect(() => {
    document.title = `${itemPorRota(location.pathname).label} · HPO`
    if (primeiraRota.current) {
      primeiraRota.current = false
      return
    }
    setCarregando(true)
    const timer = window.setTimeout(() => setCarregando(false), 300)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="flex h-screen min-w-[1280px] overflow-hidden bg-app text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        {/* relative: contém descendentes absolutos (ex.: rótulos sr-only) dentro do scroll. */}
        <main className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] px-6 py-5">
            {carregando ? (
              <SkeletonTela />
            ) : (
              // key força a remontagem com fade suave a cada troca de tela.
              <div key={location.pathname} className="flex animate-toast-in flex-col gap-5 motion-reduce:animate-none">
                <Outlet />
              </div>
            )}
          </div>
        </main>
      </div>
      <CommandPalette />
      <FichaUniversal />
      <SimuladorCenarios />
      <ToastHost />
    </div>
  )
}
