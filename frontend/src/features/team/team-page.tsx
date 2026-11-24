import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  CrownIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  UserCogIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Dentist } from '@/domain/types'
import { useClinic } from '@/data/clinic-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { DentistFormSheet } from './dentist-form-sheet'
import { startOfWeekISO, addDaysISO, todayISO } from '@/lib/dates'
import { formatPhone } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { InitialsAvatar } from '@/components/shared/avatar'
import { RoleBadge, DentistStatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'

type StatusFilter = 'all' | 'active' | 'inactive'

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function TeamPage() {
  const { dentists, patients, appointments, setDentistStatus } = useClinic()
  const { dentist: sessionDentist } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingDentist, setEditingDentist] = useState<Dentist | undefined>()
  const [pendingToggle, setPendingToggle] = useState<Dentist | undefined>()

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditingDentist(undefined)
      setFormOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('novo')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const today = todayISO()
  const weekStart = startOfWeekISO(today)
  const weekEnd = addDaysISO(weekStart, 6)

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query.trim())
    return dentists
      .filter(
        (member) => statusFilter === 'all' || member.status === statusFilter,
      )
      .filter((member) => {
        if (!normalizedQuery) return true
        return [member.name, member.email, member.specialty, member.cro].some(
          (value) => normalize(value).includes(normalizedQuery),
        )
      })
      .sort((a, b) => {
        if (a.role !== b.role) return a.role === 'owner' ? -1 : 1
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1
        return a.name.localeCompare(b.name, 'pt-BR')
      })
  }, [dentists, query, statusFilter])

  const activeCount = dentists.filter(
    (member) => member.status === 'active',
  ).length
  const inactiveCount = dentists.length - activeCount
  const openSlots = activeCount * 8 * 60
  const bookedMinutes = appointments
    .filter(
      (appointment) =>
        appointment.date === today && appointment.status !== 'cancelled',
    )
    .reduce((total, appointment) => total + appointment.durationMinutes, 0)

  const openNew = () => {
    setEditingDentist(undefined)
    setFormOpen(true)
  }

  const openEdit = (member: Dentist) => {
    setEditingDentist(member)
    setFormOpen(true)
  }

  const confirmToggle = () => {
    if (!pendingToggle) return
    const nextStatus =
      pendingToggle.status === 'active' ? 'inactive' : 'active'
    setDentistStatus(pendingToggle.id, nextStatus)
    toast.success(
      nextStatus === 'active' ? 'Dentista reativado' : 'Dentista desativado',
      {
        description:
          nextStatus === 'active'
            ? `${pendingToggle.name} volta a acessar a clínica.`
            : `${pendingToggle.name} não consegue mais entrar, mas o histórico fica preservado.`,
      },
    )
    setPendingToggle(undefined)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Equipe"
        title="Quem cuida da clínica."
        description={`${activeCount} profissionais ativos e ${inactiveCount} inativos. Cadastre dentistas e controle o acesso de cada um.`}
        actions={
          <Button onClick={openNew} className="gap-1.5 rounded-full">
            <UserPlusIcon className="size-4" />
            Novo dentista
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile
          icon={UsersIcon}
          label="Na equipe"
          value={dentists.length}
          hint={`${activeCount} ativos`}
        />
        <SummaryTile
          icon={CalendarDaysIcon}
          label="Consultas hoje"
          value={
            appointments.filter(
              (appointment) =>
                appointment.date === today &&
                appointment.status !== 'cancelled',
            ).length
          }
          hint="em toda a clínica"
        />
        <SummaryTile
          icon={UserCogIcon}
          label="Pacientes"
          value={patients.filter((patient) => patient.status === 'active').length}
          hint="ativos sob cuidado"
        />
        <SummaryTile
          icon={ShieldCheckIcon}
          label="Ocupação hoje"
          value={`${Math.min(Math.round((bookedMinutes / Math.max(openSlots, 1)) * 100), 100)}%`}
          hint={`${Math.round(bookedMinutes / 60)}h reservadas`}
        />
      </div>

      <div className="surface-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-full border border-border bg-[#F7FCFC] p-1">
            {(
              [
                { value: 'all', label: `Todos · ${dentists.length}` },
                { value: 'active', label: `Ativos · ${activeCount}` },
                { value: 'inactive', label: `Inativos · ${inactiveCount}` },
              ] as { value: StatusFilter; label: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-[0.68rem] font-medium transition-colors',
                  statusFilter === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-ink',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-[280px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome ou especialidade"
              className="rounded-full pl-9 pr-8"
              aria-label="Buscar dentistas"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
                aria-label="Limpar busca"
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={UserCogIcon}
              title="Nenhum dentista encontrado"
              description="Ajuste a busca ou os filtros para encontrar outro profissional."
            />
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((member) => {
              const memberPatients = patients.filter(
                (patient) =>
                  patient.dentistId === member.id &&
                  patient.status === 'active',
              )
              const todaysAppointments = appointments.filter(
                (appointment) =>
                  appointment.dentistId === member.id &&
                  appointment.date === today &&
                  appointment.status !== 'cancelled',
              )
              const weekAppointments = appointments.filter(
                (appointment) =>
                  appointment.dentistId === member.id &&
                  appointment.date >= weekStart &&
                  appointment.date <= weekEnd &&
                  appointment.status !== 'cancelled',
              )
              const isSelf = sessionDentist?.id === member.id

              return (
                <article
                  key={member.id}
                  className={cn(
                    'flex flex-col rounded-2xl border border-border bg-[#FCFEFE] p-4 transition-colors hover:bg-card',
                    member.status === 'inactive' && 'opacity-80',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <InitialsAvatar
                      name={member.name}
                      tone={member.tone}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[0.82rem] font-semibold text-ink" title={member.name}>{member.name}</p>
                        {member.role === 'owner' ? (
                          <CrownIcon className="size-3.5 shrink-0 text-[#DDA05F]" />
                        ) : null}
                        {isSelf ? (
                          <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[0.46rem] uppercase tracking-wider text-[#0B565E]">
                            você
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-[0.7rem] text-muted-foreground" title={member.specialty}>{member.specialty}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <RoleBadge role={member.role} />
                        <DentistStatusBadge status={member.status} />
                      </div>
                    </div>
                  </div>

                  {member.bio ? (
                    <p className="mt-3 line-clamp-2 text-[0.72rem] leading-relaxed text-muted-foreground">
                      {member.bio}
                    </p>
                  ) : null}

                  <div className="mt-3 space-y-1.5 text-[0.72rem] text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <MailIcon className="size-3 shrink-0" />
                      <span className="truncate" title={member.email}>{member.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <PhoneIcon className="size-3 shrink-0" />
                      {formatPhone(member.phone)}
                      <span className="ml-auto font-mono text-[0.7rem] uppercase tracking-wider">
                        {member.cro}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <MiniStat label="pacientes" value={memberPatients.length} />
                    <MiniStat label="hoje" value={todaysAppointments.length} />
                    <MiniStat label="semana" value={weekAppointments.length} />
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-3">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 text-primary"
                    >
                      <Link
                        to={`/app/pacientes?dentista=${member.id}`}
                        className="gap-1"
                      >
                        Pacientes
                        <ChevronRightIcon className="size-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 text-muted-foreground"
                      onClick={() => openEdit(member)}
                    >
                      <PencilIcon className="size-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'ml-auto gap-1 px-2',
                        member.status === 'active'
                          ? 'text-muted-foreground hover:text-[#7A5327]'
                          : 'text-[#27634D]',
                      )}
                      onClick={() => setPendingToggle(member)}
                      disabled={member.role === 'owner'}
                      title={
                        member.role === 'owner'
                          ? 'O dono da clínica não pode ser desativado.'
                          : undefined
                      }
                    >
                      {member.status === 'active' ? (
                        <ToggleRightIcon className="size-3.5" />
                      ) : (
                        <ToggleLeftIcon className="size-3.5" />
                      )}
                      {member.status === 'active' ? 'Desativar' : 'Reativar'}
                    </Button>
                  </div>

                  {member.status === 'inactive' &&
                  memberPatients.length > 0 ? (
                    <p className="mt-2 rounded-lg bg-[#FEF8F2] px-2.5 py-1.5 text-[0.65rem] leading-relaxed text-[#7A5327]">
                      {memberPatients.length} paciente(s) ainda vinculados. Ao
                      reativar, o acesso volta imediatamente.
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card/70 px-4 py-3 text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <PlusIcon className="size-3" />
          Novos dentistas entram com a senha demo e acesso restrito.
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-3" />
          Apenas o dono da clínica vê esta página.
        </span>
      </div>

      <DentistFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        dentist={editingDentist}
      />

      <AlertDialog
        open={Boolean(pendingToggle)}
        onOpenChange={(open) => {
          if (!open) setPendingToggle(undefined)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.status === 'active'
                ? 'Desativar este dentista?'
                : 'Reativar este dentista?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.status === 'active'
                ? `${pendingToggle?.name} perde o acesso à clínica, mas pacientes e consultas permanecem no histórico. Você pode reativar quando quiser.`
                : `${pendingToggle?.name} volta a entrar na clínica e a acessar os próprios pacientes e a própria agenda.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle}
              variant={
                pendingToggle?.status === 'active'
                  ? 'destructive-solid'
                  : 'default'
              }
            >
              {pendingToggle?.status === 'active'
                ? 'Desativar acesso'
                : 'Reativar acesso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[1.15rem] font-semibold leading-none text-ink">
          {value}
        </p>
        <p className="mt-1 truncate text-[0.7rem] text-muted-foreground">
          {label} · {hint}
        </p>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-2 py-1.5 text-center">
      <p className="font-mono text-[0.72rem] font-medium leading-none text-ink">
        {value}
      </p>
      <p className="mt-1 font-mono text-[0.44rem] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
