import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from './command-palette'
import { AppointmentDialogsProvider } from '@/features/appointments/appointment-dialogs'

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <AppointmentDialogsProvider>
      <div className="min-h-svh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex min-w-0 flex-col">
          <Topbar onSearch={() => setCommandOpen(true)} />
          <main className="relative flex-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(103,232,249,0.08),transparent_75%)]"
            />
            <div className="relative mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </AppointmentDialogsProvider>
  )
}
