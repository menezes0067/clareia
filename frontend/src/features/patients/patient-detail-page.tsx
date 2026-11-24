import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CakeSliceIcon,
  CheckCircle2Icon,
  ClockIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  UserRoundIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Patient } from '@/domain/types'
import { useClinic } from '@/data/clinic-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { PatientFormSheet } from '@/features/patients/patient-form-sheet'
import { useAppointmentDialogs } from '@/features/appointments/appointment-dialogs'
import { canManagePatient } from '@/domain/permissions'
import {
  endTimeOf,
  isPast,
  nextAppointment,
  sortByStart,
} from '@/domain/appointments'
import {
  appointmentStatusLabels,
  appointmentTypeLabels,
} from '@/domain/labels'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { InitialsAvatar } from '@/components/shared/avatar'
import {
  AppointmentStatusBadge,
  statusDotStyles,
} from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { formatPhone, firstName } from '@/lib/format'
import {
  formatDateCompact,
  formatDateLong,
  parseISODate,
  relativeDayLabel,
  todayISO,
} from '@/lib/dates'
import { cn } from '@/lib/utils'

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { patients, dentists, appointments, archivePatient, restorePatient } =
    useClinic()
  const { dentist, isOwner } = useAuth()
  const { openNew, openDetails } = useAppointmentDialogs()
  const [formOpen, setFormOpen] = useState(false)
  const [pendingArchive, setPendingArchive] = useState<Patient | undefined>()

  const patient = patients.find((item) => item.id === patientId)
  const patientBirthDate = patient?.birthDate

  const age = useMemo(() => {
    if (!patientBirthDate) return null
    const birth = parseISODate(patientBirthDate)
    const today = parseISODate(todayISO())
    let years = today.getFullYear() - birth.getFullYear()
    const beforeBirthday =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    if (beforeBirthday) years -= 1
    return years >= 0 ? years : null
  }, [patientBirthDate])

  const patientAppointments = useMemo(
    () =>
      patient
        ? appointments.filter(
            (appointment) => appointment.patientId === patient.id,
          )
        : [],
    [appointments, patient],
  )

  if (!patient) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          icon={UserRoundIcon}
          title="Paciente não encontrado"
          description="A ficha pode ter sido removida ou não pertence à sua lista de pacientes."
          action={
            <Button asChild className="rounded-full">
              <Link to="/app/pacientes">
                <ArrowLeftIcon className="size-4" />
                Voltar para pacientes
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (!canManagePatient(patient, dentist)) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          icon={ShieldCheckIcon}
          title="Ficha fora do seu acesso"
          description="Cada dentista acompanha apenas os próprios pacientes. Esta ficha pertence a outro profissional da clínica."
          action={
            <Button asChild className="rounded-full">
              <Link to="/app/pacientes">
                <ArrowLeftIcon className="size-4" />
                Ver meus pacientes
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const responsible = dentists.find(
    (member) => member.id === patient.dentistId,
  )
  const next = nextAppointment(patientAppointments)
  const sortedHistory = sortByStart(patientAppointments).reverse()
  const completed = patientAppointments.filter(
    (appointment) => appointment.status === 'completed',
  ).length
  const missed = patientAppointments.filter(
    (appointment) => appointment.status === 'no_show',
  ).length
  const cancelled = patientAppointments.filter(
    (appointment) => appointment.status === 'cancelled',
  ).length
  const pastAppointments = patientAppointments.filter(
    (appointment) =>
      isPast(appointment) && appointment.status !== 'cancelled',
  )
  const attendance = pastAppointments.length
    ? Math.round(
        (pastAppointments.filter(
          (appointment) => appointment.status !== 'no_show',
        ).length /
          pastAppointments.length) *
          100,
      )
    : 100

  const confirmArchive = () => {
    if (!pendingArchive) return
    archivePatient(pendingArchive.id)
    toast.success('Paciente arquivado', {
      description: `${pendingArchive.name} continua no histórico da clínica.`,
    })
    setPendingArchive(undefined)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/pacientes"
        className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="size-3.5" />
        Todos os pacientes
      </Link>

      <header className="relative overflow-hidden surface-card p-5 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.14),transparent_70%)]"
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <InitialsAvatar name={patient.name} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow">Ficha do paciente</p>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider',
                    patient.status === 'active'
                      ? 'bg-[#E8F7EF] text-[#27634D]'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {patient.status === 'active' ? 'ativo' : 'arquivado'}
                </span>
              </div>
              <h1 className="display-title mt-1.5 text-[2.2rem] text-ink sm:text-[2.6rem]">
                {patient.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MailIcon className="size-3.5" />
                  {patient.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <PhoneIcon className="size-3.5" />
                  {formatPhone(patient.phone)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CakeSliceIcon className="size-3.5" />
                  {formatDateCompact(patient.birthDate)}
                  {age !== null ? ` · ${age} anos` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() =>
                openNew({
                  patientId: patient.id,
                  dentistId: patient.dentistId,
                })
              }
              className="gap-1.5 rounded-full"
            >
              <CalendarPlusIcon className="size-4" />
              Agendar consulta
            </Button>
            <Button
              variant="outline"
              onClick={() => setFormOpen(true)}
              className="gap-1.5 rounded-full"
            >
              <PencilIcon className="size-4" />
              Editar
            </Button>
            {patient.status === 'active' ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-destructive"
                aria-label="Arquivar paciente"
                onClick={() => setPendingArchive(patient)}
              >
                <ArchiveIcon className="size-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Reativar paciente"
                onClick={() => {
                  restorePatient(patient.id)
                  toast.success('Paciente reativado', {
                    description: `${patient.name} voltou para a lista de ativos.`,
                  })
                }}
              >
                <RotateCcwIcon className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {responsible ? (
          <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-border/70 bg-[#FAFDFD] px-3.5 py-2.5">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-secondary text-primary">
              <StethoscopeIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.72rem] font-medium text-ink">
                {responsible.name}
              </p>
              <p className="text-[0.7rem] text-muted-foreground">
                {responsible.specialty} · {responsible.cro}
                {isOwner && responsible.status === 'inactive'
                  ? ' · profissional inativo'
                  : ''}
              </p>
            </div>
            <span className="ml-auto font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
              responsável
            </span>
          </div>
        ) : null}
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          icon={CalendarDaysIcon}
          value={next ? relativeDayLabel(next.date) : '—'}
          label="Próxima consulta"
          hint={next ? `${next.startTime} · ${next.durationMinutes} min` : 'sem retorno'}
          tone="teal"
        />
        <MetricTile
          icon={CheckCircle2Icon}
          value={completed}
          label="Concluídas"
          hint="atendimentos realizados"
          tone="mint"
        />
        <MetricTile
          icon={ClockIcon}
          value={`${attendance}%`}
          label="Comparecimento"
          hint={`${missed} falta(s) registrada(s)`}
          tone="sand"
        />
        <MetricTile
          icon={UserRoundIcon}
          value={patientAppointments.length}
          label="Histórico"
          hint={`${cancelled} cancelada(s)`}
          tone="sky"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="surface-card">
            <Tabs defaultValue="history">
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Prontuário</p>
                  <h2 className="mt-1 text-base font-semibold text-ink">
                    Acompanhamento
                  </h2>
                </div>
                <TabsList>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="notes">Observações</TabsTrigger>
                  <TabsTrigger value="data">Dados</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="history" className="p-4">
                {sortedHistory.length === 0 ? (
                  <EmptyState
                    compact
                    icon={CalendarDaysIcon}
                    title="Sem consultas registradas"
                    description="Agende a primeira consulta para começar o histórico deste paciente."
                    action={
                      <Button
                        size="sm"
                        className="gap-1.5 rounded-full"
                        onClick={() =>
                          openNew({
                            patientId: patient.id,
                            dentistId: patient.dentistId,
                          })
                        }
                      >
                        <CalendarPlusIcon className="size-3.5" />
                        Agendar consulta
                      </Button>
                    }
                  />
                ) : (
                  <ol className="relative space-y-2 border-l border-border/70 pl-4">
                    {sortedHistory.map((appointment) => {
                      const appointmentDentist = dentists.find(
                        (member) => member.id === appointment.dentistId,
                      )
                      return (
                        <li key={appointment.id} className="relative">
                          <span
                            className={cn(
                              'absolute -left-[1.36rem] top-4 size-2 rounded-full ring-4 ring-card',
                              statusDotStyles[appointment.status],
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => openDetails(appointment.id)}
                            className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-[#FAFDFD]"
                          >
                            <div className="w-16 shrink-0">
                              <p className="text-[0.7rem] font-medium text-ink">
                                {relativeDayLabel(appointment.date)}
                              </p>
                              <p className="font-mono text-[0.7rem] text-muted-foreground">
                                {formatDateCompact(appointment.date)}
                              </p>
                            </div>
                            <span className="h-8 w-px bg-border" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[0.76rem] font-medium text-ink" title={appointmentTypeLabels[appointment.type]}>{appointmentTypeLabels[appointment.type]}</p>
                              <p className="truncate text-[0.7rem] text-muted-foreground">
                                {appointment.startTime}–{endTimeOf(appointment)} ·{' '}
                                {appointment.durationMinutes} min
                                {isOwner && appointmentDentist
                                  ? ` · ${firstName(appointmentDentist.name)}`
                                  : ''}
                              </p>
                            </div>
                            <AppointmentStatusBadge
                              status={appointment.status}
                              showDot={false}
                              className="hidden sm:inline-flex"
                            />
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </TabsContent>

              <TabsContent value="notes" className="p-4">
                {patient.notes ? (
                  <div className="rounded-2xl border border-border bg-[#FBFEFE] p-4">
                    <p className="eyebrow">Observações clínicas</p>
                    <p className="mt-2 whitespace-pre-line text-[0.82rem] leading-relaxed text-ink">
                      {patient.notes}
                    </p>
                  </div>
                ) : (
                  <EmptyState
                    compact
                    icon={StethoscopeIcon}
                    title="Nenhuma observação"
                    description="Alergias, preferências e pontos de atenção ficam registrados aqui."
                    action={
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setFormOpen(true)}
                      >
                        <PencilIcon className="size-3.5" />
                        Adicionar observação
                      </Button>
                    }
                  />
                )}
              </TabsContent>

              <TabsContent value="data" className="p-4">
                <dl className="grid gap-2 sm:grid-cols-2">
                  <DataRow label="Nome completo" value={patient.name} />
                  <DataRow label="E-mail" value={patient.email} />
                  <DataRow label="Telefone" value={formatPhone(patient.phone)} />
                  <DataRow
                    label="Nascimento"
                    value={formatDateLong(patient.birthDate)}
                  />
                  <DataRow
                    label="Responsável"
                    value={responsible?.name ?? 'Sem responsável'}
                  />
                  <DataRow
                    label="Paciente desde"
                    value={formatDateCompact(patient.createdAt.slice(0, 10))}
                  />
                </dl>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="rounded-3xl border border-border bg-[linear-gradient(150deg,#F4FCFB,#EAF8F6)] p-5">
            <p className="eyebrow">Próximo passo</p>
            <p className="mt-2 font-display text-[1.7rem] leading-none text-ink">
              {next ? 'Retorno já marcado.' : 'Que tal um retorno?'}
            </p>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
              {next
                ? `${firstName(patient.name)} tem ${appointmentTypeLabels[next.type].toLowerCase()} ${
                    relativeDayLabel(next.date).toLowerCase()
                  } às ${next.startTime}.`
                : 'Sem consulta futura para este paciente. Agende um retorno para manter o acompanhamento.'}
            </p>
            <Button
              onClick={() =>
                openNew({
                  patientId: patient.id,
                  dentistId: patient.dentistId,
                })
              }
              variant={next ? 'outline' : 'default'}
              size="sm"
              className="mt-4 gap-1.5 rounded-full"
            >
              <CalendarPlusIcon className="size-3.5" />
              {next ? 'Agendar outra' : 'Agendar retorno'}
            </Button>
          </div>

          <div className="surface-card p-5">
            <p className="eyebrow">Resumo clínico</p>
            <ul className="mt-3 space-y-2.5">
              <SummaryRow label="Consultas concluídas" value={completed} />
              <SummaryRow label="Cancelamentos" value={cancelled} />
              <SummaryRow label="Faltas" value={missed} />
              <SummaryRow
                label="Status"
                value={patient.status === 'active' ? 'Ativo' : 'Arquivado'}
              />
            </ul>
            <p className="mt-4 rounded-xl bg-[#FAFDFD] px-3 py-2 text-[0.7rem] leading-relaxed text-muted-foreground">
              {appointmentStatusLabels.completed}: atendimentos preservados no
              histórico mesmo após arquivar a ficha.
            </p>
          </div>
        </aside>
      </div>

      <PatientFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={patient}
        defaultDentistId={patient.dentistId}
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

function MetricTile({
  icon: Icon,
  value,
  label,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string
  hint: string
  tone: 'teal' | 'mint' | 'sand' | 'sky'
}) {
  const toneClass = {
    teal: 'bg-[#E4F6F5] text-[#0B565E]',
    mint: 'bg-[#E8F7EF] text-[#27634D]',
    sand: 'bg-[#FDF1E4] text-[#7A5327]',
    sky: 'bg-[#E2F5F9] text-[#0E5D6B]',
  }[tone]

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-xl',
          toneClass,
        )}
      >
        <Icon className="size-4" />
      </span>
      <p className="mt-3 truncate text-[1.2rem] font-semibold leading-none text-ink" title={String(value)}>{value}</p>
      <p className="mt-1 text-[0.72rem] font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-[0.72rem] text-muted-foreground">{hint}</p>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-[#FBFEFE] px-3 py-2.5">
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[0.74rem] text-ink" title={value}>{value}</dd>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-[0.68rem] text-muted-foreground">{label}</span>
      <span className="font-mono text-[0.72rem] font-medium text-ink">
        {value}
      </span>
    </li>
  )
}
