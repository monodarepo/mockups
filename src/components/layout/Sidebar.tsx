import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { navegacao } from '@/data/navigation'
import { useAppStore } from '@/store'
import { cn } from '@/lib/cn'
import { ContadorBadge } from '@/components/ui/Badge'
import { LogoCompleto, LogoSimbolo } from './Logo'

export function Sidebar() {
  const recolhida = useAppStore((s) => s.sidebarRecolhida)
  const alternarSidebar = useAppStore((s) => s.alternarSidebar)
  const pendencias = useAppStore((s) => s.pendencias)

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-line bg-card transition-[width] duration-200 motion-reduce:transition-none',
        recolhida ? 'w-[72px]' : 'w-[248px]',
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-line',
          recolhida ? 'justify-center px-3' : 'px-4',
        )}
      >
        {recolhida ? <LogoSimbolo /> : <LogoCompleto />}
      </div>

      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="flex flex-col gap-0.5">
          {navegacao.map((item) => {
            const Icone = item.icon
            const mostrarBadge = item.badgePendencias && pendencias > 0

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  title={recolhida ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-9 items-center rounded-lg text-body-sm font-medium transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                      recolhida ? 'justify-center px-0' : 'gap-2.5 px-3',
                      isActive
                        ? 'bg-primary text-white shadow-pill hover:bg-primary-hover'
                        : 'text-muted hover:bg-neutral-soft hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icone size={17} className="shrink-0" aria-hidden="true" />
                      {recolhida ? (
                        <span className="sr-only">{item.label}</span>
                      ) : (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {mostrarBadge ? (
                        recolhida ? (
                          <span
                            aria-label={`${pendencias} decisões pendentes`}
                            className="absolute right-2.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card"
                          />
                        ) : (
                          <ContadorBadge
                            valor={pendencias}
                            rotulo="decisões pendentes"
                            className={cn(isActive && 'bg-white text-danger')}
                          />
                        )
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={alternarSidebar}
          aria-label={recolhida ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-expanded={!recolhida}
          className={cn(
            'flex h-9 w-full items-center rounded-lg text-body-sm font-medium text-muted',
            'transition-colors duration-150 hover:bg-neutral-soft hover:text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            recolhida ? 'justify-center' : 'gap-2.5 px-3',
          )}
        >
          {recolhida ? (
            <PanelLeftOpen size={17} aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose size={17} aria-hidden="true" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
