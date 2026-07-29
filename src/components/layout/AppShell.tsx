import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastHost } from '@/components/ui/Toast'

export function AppShell() {
  return (
    <div className="flex h-screen min-w-[1280px] overflow-hidden bg-app text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-6 py-5">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastHost />
    </div>
  )
}
