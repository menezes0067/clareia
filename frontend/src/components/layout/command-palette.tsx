import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  LayoutDashboardIcon,
  PlusIcon,
  Settings2Icon,
  UserCogIcon,
  UsersIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-provider'
import { useClinic } from '@/data/clinic-provider'
import { useAppointmentDialogs } from '@/features/appointments/appointment-dialogs'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { InitialsAvatar } from '@/components/shared/avatar'

interface PageItem {
  label: string
  to: string
  icon: LucideIcon
  shortcut: string
  ownerOnly?: boolean
}

const pages: PageItem[] = [
  { label: 'Visão geral', to: '/app', icon: LayoutDashboardIcon, shortcut: 'G D' },
  { label: 'Agenda', to: '/app/agenda', icon: CalendarDaysIcon, shortcut: 'G A' },
  { label: 'Pacientes', to: '/app/pacientes', icon: UsersIcon, shortcut: 'G P' },
  {
    label: 'Equipe',
    to: '/app/equipe',
    icon: UserCogIcon,
    shortcut: 'G E',
    ownerOnly: true,
  },
  {
    label: 'Configurações',
    to: '/app/configuracoes',
    icon: Settings2Icon,
    shortcut: 'G C',
  },
]

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { dentist, isOwner } = useAuth()
  const { patients } = useClinic()
  const { openNew } = useAppointmentDialogs()
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange, open])

  const visiblePatients = patients
    .filter(
      (patient) =>
        patient.status === 'active' &&
        (isOwner || patient.dentistId === dentist?.id),
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const go = (to: string) => {
    onOpenChange(false)
    navigate(to)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Busca rápida"
      description="Busque pacientes, páginas e ações da clínica."
      className="sm:max-w-[580px]"
    >
      <CommandInput placeholder="Buscar paciente, página ou ação..." />
      <CommandList>
        <CommandEmpty>Nada encontrado por aqui.</CommandEmpty>

        <CommandGroup heading="Ações rápidas">
          <CommandItem
            value="nova consulta agendar"
            onSelect={() => {
              onOpenChange(false)
              openNew()
            }}
          >
            <CalendarPlusIcon className="size-4 text-primary" />
            Nova consulta
          </CommandItem>
          <CommandItem
            value="novo paciente cadastrar"
            onSelect={() => go('/app/pacientes?novo=1')}
          >
            <PlusIcon className="size-4 text-primary" />
            Novo paciente
          </CommandItem>
          {isOwner ? (
            <CommandItem
              value="novo dentista equipe cadastrar"
              onSelect={() => go('/app/equipe?novo=1')}
            >
              <UserCogIcon className="size-4 text-primary" />
              Cadastrar dentista
            </CommandItem>
          ) : null}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Páginas">
          {pages
            .filter((page) => !page.ownerOnly || isOwner)
            .map((page) => (
              <CommandItem
                key={page.to}
                value={`${page.label} ${page.to}`}
                onSelect={() => go(page.to)}
              >
                <page.icon className="size-4 text-muted-foreground" />
                {page.label}
                <CommandShortcut>{page.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
        </CommandGroup>

        {visiblePatients.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Pacientes · ${visiblePatients.length}`}>
              {visiblePatients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={`${patient.name} ${patient.email} ${patient.phone}`}
                  onSelect={() => go(`/app/pacientes/${patient.id}`)}
                >
                  <InitialsAvatar name={patient.name} size="xs" />
                  <span className="min-w-0 flex-1 truncate" title={patient.name}>{patient.name}</span>
                  <span className="truncate font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground" title={patient.phone}>{patient.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  )
}
