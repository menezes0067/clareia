import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarPlusIcon,
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  Settings2Icon,
} from 'lucide-react'
import { useAuth } from '@/features/auth/auth-provider'
import { useClinic } from '@/data/clinic-provider'
import { useAppointmentDialogs } from '@/features/appointments/appointment-dialogs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { SidebarNav } from './sidebar'
import { InitialsAvatar } from '@/components/shared/avatar'
import { Logo } from '@/components/shared/logo'
import { longTodayLabel } from '@/lib/dates'

interface TopbarProps {
  onSearch: () => void
}

export function Topbar({ onSearch }: TopbarProps) {
  const { dentist, isOwner, logout } = useAuth()
  const { clinic } = useClinic()
  const { openNew } = useAppointmentDialogs()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon className="size-5" />
        </Button>

        <Link to="/app" className="lg:hidden" aria-label="Clareia — visão geral">
          <Logo showWordmark={false} />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          <p className="truncate text-[0.72rem] text-muted-foreground">
            <span className="font-medium text-ink">{clinic.name}</span>
            <span className="mx-1.5 text-border">/</span>
            {longTodayLabel()}
          </p>
        </div>

        <button
          type="button"
          onClick={onSearch}
          className="group flex h-9 w-full max-w-[300px] items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 text-left text-[0.75rem] text-muted-foreground transition-colors hover:border-[#B9E9DC] hover:bg-card lg:ml-auto"
          aria-label="Buscar pacientes e páginas"
        >
          <SearchIcon className="size-4 shrink-0 text-muted-foreground/80" />
          <span className="hidden flex-1 truncate sm:block">
            Buscar paciente ou página
          </span>
          <kbd className="hidden rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.72rem] text-muted-foreground sm:inline-block">
            {typeof navigator !== 'undefined' &&
            /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
              ? '⌘K'
              : 'Ctrl K'}
          </kbd>
        </button>

        <div className="hidden h-6 w-px bg-border sm:block" />

        <Button
          onClick={() => openNew()}
          className="hidden gap-1.5 rounded-full px-4 sm:inline-flex"
        >
          <CalendarPlusIcon className="size-4" />
          Nova consulta
        </Button>
        <Button
          onClick={() => openNew()}
          size="icon"
          className="rounded-full sm:hidden"
          aria-label="Nova consulta"
        >
          <CalendarPlusIcon className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-1.5 transition-colors hover:border-border hover:bg-card/70"
              aria-label="Abrir menu da conta"
            >
              {dentist ? (
                <InitialsAvatar
                  name={dentist.name}
                  tone={dentist.tone}
                  size="sm"
                />
              ) : null}
              <span className="hidden text-left md:block">
                <span className="block max-w-28 truncate text-[0.7rem] font-semibold leading-tight text-ink" title={dentist?.name}>{dentist?.name}</span>
                <span className="block text-[0.72rem] leading-tight text-muted-foreground">
                  {isOwner ? 'Dono' : 'Dentista'}
                </span>
              </span>
              <ChevronDownIcon className="hidden size-3.5 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-[0.7rem] font-semibold text-ink">
                {dentist?.name}
              </span>
              <span className="block truncate text-[0.65rem] font-normal text-muted-foreground" title={dentist?.email}>{dentist?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/configuracoes" className="gap-2">
                <Settings2Icon className="size-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="gap-2"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              <LogOutIcon className="size-4" />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[290px] gap-0 p-0">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
