import { NavLink } from 'react-router-dom'
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  UserCogIcon,
  UsersIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-provider'
import { useClinic } from '@/data/clinic-provider'
import { Logo } from '@/components/shared/logo'
import { InitialsAvatar } from '@/components/shared/avatar'
import { cn } from '@/lib/utils'
import { todayISO } from '@/lib/dates'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  ownerOnly?: boolean
}

const navItems: NavItem[] = [
  { to: '/app', label: 'Visão geral', icon: LayoutDashboardIcon, end: true },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDaysIcon },
  { to: '/app/pacientes', label: 'Pacientes', icon: UsersIcon },
  { to: '/app/equipe', label: 'Equipe', icon: UserCogIcon, ownerOnly: true },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { isOwner, dentist } = useAuth()
  const { clinic, patients, appointments } = useClinic()

  const items = navItems.filter((item) => !item.ownerOnly || isOwner)
  const activePatients = patients.filter(
    (patient) =>
      patient.status === 'active' &&
      (isOwner || patient.dentistId === dentist?.id),
  ).length
  const todayAppointments = appointments.filter((appointment) => {
    if (!isOwner && appointment.dentistId !== dentist?.id) return false
    return (
      appointment.status !== 'cancelled' &&
      appointment.date === todayISO()
    )
  }).length

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <NavLink to="/app" onClick={onNavigate} aria-label="Clareia — visão geral">
          <Logo />
        </NavLink>
      </div>

      <div className="mx-4 mb-4 rounded-2xl border border-sidebar-border bg-card/70 px-3.5 py-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          clínica ativa
        </p>
        <p className="mt-1 truncate text-[0.8rem] font-semibold text-ink" title={clinic.name}>{clinic.name}</p>
        <div className="mt-2 flex items-center gap-3 text-[0.7rem] text-muted-foreground">
          <span>{activePatients} pacientes</span>
          <span className="size-1 rounded-full bg-border" />
          <span>{todayAppointments} hoje</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Navegação principal">
        <p className="px-3 pb-1.5 pt-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/80">
          clínica
        </p>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] transition-colors',
                isActive
                  ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'size-[1.05rem] transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground/80',
                  )}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
                {isActive ? (
                  <span className="ml-auto size-1.5 rounded-full bg-primary" />
                ) : null}
              </>
            )}
          </NavLink>
        ))}

        <p className="px-3 pb-1.5 pt-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/80">
          conta
        </p>
        <NavLink
          to="/app/configuracoes"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] transition-colors',
              isActive
                ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-ink',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings2Icon
                className={cn(
                  'size-[1.05rem]',
                  isActive ? 'text-primary' : 'text-muted-foreground/80',
                )}
                strokeWidth={1.8}
              />
              Configurações
            </>
          )}
        </NavLink>
      </nav>

      <div className="space-y-3 border-t border-sidebar-border/70 p-3 pb-5">
        {dentist ? (
          <NavLink
            to="/app/configuracoes"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-2xl border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-card/70"
          >
            <InitialsAvatar
              name={dentist.name}
              tone={dentist.tone}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-[0.72rem] font-semibold text-ink" title={dentist.name}>{dentist.name}</p>
              <p className="truncate text-[0.7rem] text-muted-foreground" title={isOwner ? 'Dono da clínica' : dentist.specialty}>{isOwner ? 'Dono da clínica' : dentist.specialty}</p>
            </div>
          </NavLink>
        ) : null}
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh border-r border-sidebar-border bg-sidebar lg:block">
      <SidebarNav />
    </aside>
  )
}
