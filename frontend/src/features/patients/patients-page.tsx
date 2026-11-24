import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArchiveIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  MailIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  UserRoundIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Patient } from '@/domain/types'
import { useClinic } from '@/data/clinic-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { PatientFormSheet } from './patient-form-sheet'
import { visiblePatients } from '@/domain/permissions'
import { nextAppointment } from '@/domain/appointments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { PatientStatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import {
  formatDateCompact,
  formatDateShort,
  relativeDayLabel,
} from '@/lib/dates'
import { firstName } from '@/lib/format'
import { cn } from '@/lib/utils'

type StatusFilter = 'active' | 'archived'

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function PatientsPage() {
  const { patients, dentists, appointments, archivePatient, restorePatient } =
    useClinic()
  const { dentist, isOwner } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [dentistFilter, setDentistFilter] = useState(
    searchParams.get('dentista') ?? 'all',
  )
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>()
  const [pendingArchive, setPendingArchive] = useState<Patient | undefined>()

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditingPatient(undefined)
      setFormOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('novo')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const scopedPatients = visiblePatients({ patients }, dentist)

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query.trim())
    return scopedPatients
      .filter((patient) => patient.status === statusFilter)
      .filter(
        (patient) =>
          dentistFilter === 'all' || patient.dentistId === dentistFilter,
      )
      .filter((patient) => {
        if (!normalizedQuery) return true
        return [
          patient.name,
          patient.email,
          patient.phone,
          patient.notes,
        ].some((value) => normalize(value).includes(normalizedQuery))
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [dentistFilter, query, scopedPatients, statusFilter])

  const activeCount = scopedPatients.filter(
    (patient) => patient.status === 'active',
  ).length
  const archivedCount = scopedPatients.length - activeCount
  const withUpcoming = scopedPatients.filter((patient) => {
    if (patient.status !== 'active') return false
    return Boolean(
      nextAppointment(
        appointments.filter(
          (appointment) => appointment.patientId === patient.id,
        ),
      ),
    )
  }).length

  const openNewPatient = () => {
    setEditingPatient(undefined)
    setFormOpen(true)
  }

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormOpen(true)
  }

  const confirmArchive = () => {
    if (!pendingArchive) return
    archivePatient(pendingArchive.id)
    toast.success('Paciente arquivado', {
      description: `${pendingArchive.name} continua no histórico da clínica.`,
    })
    setPendingArchive(undefined)
  }

  const restore = (patient: Patient) => {
    restorePatient(patient.id)
    toast.success('Paciente reativado', {
      description: `${patient.name} voltou para a lista de ativos.`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pacientes"
        title="Cada história, no lugar."
        description={
          isOwner
            ? `${activeCount} pacientes ativos em toda a clínica. Gerencie responsáveis e acompanhe os retornos.`
            : `${activeCount} pacientes ativos sob o seu cuidado. Você vê apenas as suas fichas.`
        }
        actions={
          <Button onClick={openNewPatient} className="gap-1.5 rounded-full">
            <PlusIcon className="size-4" />
            Novo paciente
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <SummaryChip
          icon={UsersIcon}
          label="Ativos"
          value={activeCount}
          hint="em acompanhamento"
        />
        <SummaryChip
          icon={CalendarDaysIcon}
          label="Com retorno"
          value={withUpcoming}
          hint="consultas futuras"
        />
        <SummaryChip
          icon={ArchiveIcon}
          label="Arquivados"
          value={archivedCount}
          hint="histórico preservado"
          className="col-span-2 md:col-span-1"
        />
      </div>

      <div className="surface-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-full border border-border bg-[#F7FCFC] p-1">
            <StatusTab
              active={statusFilter === 'active'}
              onClick={() => setStatusFilter('active')}
              label={`Ativos · ${activeCount}`}
            />
            <StatusTab
              active={statusFilter === 'archived'}
              onClick={() => setStatusFilter('archived')}
              label={`Arquivados · ${archivedCount}`}
            />
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center sm:justify-end">
            <div className="relative flex-1 sm:max-w-[300px]">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone"
                className="rounded-full pl-9 pr-8"
                aria-label="Buscar pacientes"
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

            {isOwner ? (
              <Select
                value={dentistFilter}
                onValueChange={setDentistFilter}
              >
                <SelectTrigger className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Dentista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os dentistas</SelectItem>
                  {dentists.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                      {member.status === 'inactive' ? ' · inativo' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={UserRoundIcon}
              title={
                query || dentistFilter !== 'all'
                  ? 'Nenhum paciente encontrado'
                  : statusFilter === 'active'
                    ? 'Nenhum paciente ativo ainda'
                    : 'Nenhum paciente arquivado'
              }
              description={
                query || dentistFilter !== 'all'
                  ? 'Ajuste a busca ou os filtros para encontrar outra ficha.'
                  : statusFilter === 'active'
                    ? 'Cadastre o primeiro paciente e comece a organizar o cuidado.'
                    : 'Pacientes arquivados continuam guardados aqui, com todo o histórico.'
              }
              action={
                statusFilter === 'active' && !query ? (
                  <Button
                    onClick={openNewPatient}
                    className="gap-1.5 rounded-full"
                  >
                    <PlusIcon className="size-4" />
                    Cadastrar paciente
                  </Button>
                ) : null
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-[#FBFEFE]">
                    <th className="px-5 py-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Paciente
                    </th>
                    {isOwner ? (
                      <th className="px-3 py-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Responsável
                      </th>
                    ) : null}
                    <th className="px-3 py-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Próxima consulta
                    </th>
                    <th className="px-3 py-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Histórico
                    </th>
                    <th className="px-3 py-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Status
                    </th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((patient) => {
                    const responsible = dentists.find(
                      (member) => member.id === patient.dentistId,
                    )
                    const patientAppointments = appointments.filter(
                      (appointment) => appointment.patientId === patient.id,
                    )
                    const next = nextAppointment(patientAppointments)
                    const completed = patientAppointments.filter(
                      (appointment) => appointment.status === 'completed',
                    ).length
                    return (
                      <tr
                        key={patient.id}
                        className="group border-b border-border/60 transition-colors last:border-0 hover:bg-[#FAFDFD]"
                      >
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/app/pacientes/${patient.id}`}
                            className="flex items-center gap-3"
                          >
                            <InitialsAvatar name={patient.name} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-[0.78rem] font-semibold text-ink group-hover:text-primary" title={patient.name}>{patient.name}</p>
                              <p className="truncate text-[0.7rem] text-muted-foreground" title={patient.email}>{patient.email}</p>
                            </div>
                          </Link>
                        </td>
                        {isOwner ? (
                          <td className="px-3 py-3.5">
                            {responsible ? (
                              <div className="flex items-center gap-2">
                                <InitialsAvatar
                                  name={responsible.name}
                                  tone={responsible.tone}
                                  size="xs"
                                />
                                <span className="text-[0.68rem] text-ink">
                                  {firstName(responsible.name)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[0.68rem] text-muted-foreground">
                                Sem responsável
                              </span>
                            )}
                          </td>
                        ) : null}
                        <td className="px-3 py-3.5">
                          {next ? (
                            <div>
                              <p className="text-[0.68rem] font-medium text-ink">
                                {relativeDayLabel(next.date)}
                              </p>
                              <p className="font-mono text-[0.65rem] text-muted-foreground">
                                {next.startTime} · {formatDateShort(next.date)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[0.72rem] text-muted-foreground">
                              Sem retorno
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="text-[0.68rem] text-ink">
                            {completed} concluídas
                          </p>
                          <p className="font-mono text-[0.65rem] text-muted-foreground">
                            desde {formatDateCompact(patient.createdAt.slice(0, 10))}
                          </p>
                        </td>
                        <td className="px-3 py-3.5">
                          <PatientStatusBadge status={patient.status} />
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Ações de ${patient.name}`}
                              >
                                <MoreHorizontalIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/app/pacientes/${patient.id}`}
                                  className="gap-2"
                                >
                                  <UserRoundIcon className="size-4" />
                                  Abrir ficha
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(patient)}
                                className="gap-2"
                              >
                                <PencilIcon className="size-4" />
                                Editar paciente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {patient.status === 'active' ? (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setPendingArchive(patient)}
                                  className="gap-2"
                                >
                                  <ArchiveIcon className="size-4" />
                                  Arquivar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => restore(patient)}
                                  className="gap-2"
                                >
                                  <RotateCcwIcon className="size-4" />
                                  Reativar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border/70 md:hidden">
              {filtered.map((patient) => {
                const responsible = dentists.find(
                  (member) => member.id === patient.dentistId,
                )
                const next = nextAppointment(
                  appointments.filter(
                    (appointment) => appointment.patientId === patient.id,
                  ),
                )
                return (
                  <div key={patient.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Link to={`/app/pacientes/${patient.id}`}>
                        <InitialsAvatar name={patient.name} size="sm" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/app/pacientes/${patient.id}`}
                          className="text-[0.78rem] font-semibold text-ink"
                        >
                          {patient.name}
                        </Link>
                        <p className="truncate text-[0.7rem] text-muted-foreground" title={patient.email}>{patient.email}</p>
                        {isOwner && responsible ? (
                          <p className="mt-1 text-[0.7rem] text-muted-foreground">
                            Responsável: {responsible.name}
                          </p>
                        ) : null}
                      </div>
                      <PatientStatusBadge status={patient.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#FAFDFD] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                        <CalendarDaysIcon className="size-3.5" />
                        {next
                          ? `${relativeDayLabel(next.date)} · ${next.startTime}`
                          : 'Sem próxima consulta'}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Abrir ficha"
                        >
                          <Link to={`/app/pacientes/${patient.id}`}>
                            <ArrowRightIcon className="size-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(patient)}
                          aria-label="Editar paciente"
                        >
                          <PencilIcon className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 px-1 text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MailIcon className="size-3" />
          O e-mail é único por paciente na clínica.
        </span>
        <span className="flex items-center gap-1.5">
          <PhoneIcon className="size-3" />
          Mantenha o telefone atualizado para confirmações.
        </span>
      </div>

      <PatientFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editingPatient}
        defaultDentistId={
          dentistFilter !== 'all' ? dentistFilter : undefined
        }
      />

      <AlertDialog
        open={Boolean(pendingArchive)}
        onOpenChange={(open) => {
          if (!open) setPendingArchive(undefined)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar este paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingArchive?.name} sai da lista de ativos, mas o histórico de
              consultas e as observações continuam guardados. Você pode reativar
              depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter ativo</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchive}
              variant="destructive-solid"
            >
              Arquivar paciente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatusTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-[0.68rem] font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-ink',
      )}
    >
      {label}
    </button>
  )
}

function SummaryChip({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  hint: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3',
        className,
      )}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[1.1rem] font-semibold leading-none text-ink">
          {value}
        </p>
        <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
          {label} · {hint}
        </p>
      </div>
    </div>
  )
}
