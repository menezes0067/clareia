import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CheckCircle2Icon,
  Clock3Icon,
  PlusIcon,
  SparklesIcon,
  StethoscopeIcon,
  TrendingUpIcon,
  UserRoundCheckIcon,
  UsersIcon,
} from 'lucide-react'
import type { Appointment, Dentist } from '@/domain/types'
import { useClinic } from '@/data/clinic-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { useAppointmentDialogs } from '@/features/appointments/appointment-dialogs'
import {
  appointmentStatusLabels,
  appointmentTypeLabels,
} from '@/domain/labels'
import {
  isUpcoming,
  nextAppointment,
  sortByStart,
  totalBookedMinutes,
} from '@/domain/appointments'
import { Button } from '@/components/ui/button'
import { InitialsAvatar } from '@/components/shared/avatar'
import {
  AppointmentStatusBadge,
  statusDotStyles,
} from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { OccupancyRing, WeeklyBars } from '@/components/shared/charts'
import { firstName, percent } from '@/lib/format'
import {
  addDaysISO,
  formatDateShort,
  formatWeekdayShort,
  greetingFor,
  longTodayLabel,
  relativeDayLabel,
  startOfWeekISO,
  todayISO,
  weekDates,
} from '@/lib/dates'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { isOwner } = useAuth()
  return isOwner ? <OwnerDashboard /> : <DentistDashboard />
}

function OwnerDashboard() {
  const { patients, dentists, appointments } = useClinic()
  const { dentist } = useAuth()
  const { openNew } = useAppointmentDialogs()
  const today = todayISO()

  const activePatients = patients.filter((patient) => patient.status === 'active')
  const activeDentists = dentists.filter((member) => member.status === 'active')
  const todaysAppointments = sortByStart(
    appointments.filter(
      (appointment) =>
        appointment.date === today && appointment.status !== 'cancelled',
    ),
  )
  const todayMinutes = totalBookedMinutes(todaysAppointments)
  const occupancy = Math.min(
    Math.round((todayMinutes / (activeDentists.length * 8 * 60)) * 100),
    100,
  )
  const confirmedToday = todaysAppointments.filter(
    (appointment) =>
      appointment.status === 'confirmed' || appointment.status === 'completed',
  ).length

  const weekStart = startOfWeekISO(today)
  const week = weekDates(today)
  const weekAppointments = appointments.filter(
    (appointment) =>
      appointment.date >= weekStart &&
      appointment.date <= addDaysISO(weekStart, 6) &&
      appointment.status !== 'cancelled',
  )
  const weeklyData = week.map((date) => ({
    label: formatWeekdayShort(date),
    value: appointments.filter(
      (appointment) =>
        appointment.date === date && appointment.status !== 'cancelled',
    ).length,
    highlight: date === today,
  }))

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDaysISO(today, index - 6)
    return appointments.filter(
      (appointment) =>
        appointment.date === date && appointment.status !== 'cancelled',
    ).length
  })

  const pendingReturns = appointments.filter(
    (appointment) =>
      appointment.type === 'return' &&
      isUpcoming(appointment) &&
      appointment.date <= addDaysISO(today, 21),
  ).length

  const cancelledThisWeek = appointments.filter(
    (appointment) =>
      appointment.status === 'cancelled' &&
      appointment.date >= weekStart &&
      appointment.date <= addDaysISO(weekStart, 6),
  )
  const inactiveDentistsWithPatients = dentists.filter(
    (member) =>
      member.status === 'inactive' &&
      patients.some(
        (patient) =>
          patient.dentistId === member.id && patient.status === 'active',
      ),
  )

  return (
    <div className="space-y-7">
      <DashboardGreeting
        name={firstName(dentist?.name ?? 'dona')}
        subtitle={`A clínica tem ${todaysAppointments.length} consultas hoje. ${
          confirmedToday > 0
            ? `${confirmedToday} já confirmadas.`
            : 'Bom momento para revisar a agenda.'
        }`}
        actions={
          <>
            <Button asChild variant="outline" className="w-full gap-1.5 rounded-full sm:w-auto">
              <Link to="/app/agenda">
                <CalendarDaysIcon className="size-4" />
                Ver agenda
              </Link>
            </Button>
            <Button
              onClick={() => openNew()}
              className="w-full gap-1.5 rounded-full sm:w-auto"
            >
              <PlusIcon className="size-4" />
              Nova consulta
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Pacientes ativos"
          value={activePatients.length}
          hint={`${activeDentists.length} dentistas na equipe`}
          icon={UsersIcon}
          spark={lastSevenDays.map((value, index) => value + index * 0.4)}
          trendLabel="Pacientes ativos nos últimos 7 dias"
        />
        <StatCard
          label="Consultas hoje"
          value={todaysAppointments.length}
          hint={`${confirmedToday} confirmadas`}
          icon={CalendarDaysIcon}
          tone="mint"
          spark={lastSevenDays}
          trendLabel="Consultas na clínica nos últimos 7 dias"
        />
        <StatCard
          label="Ocupação hoje"
          value={`${occupancy}%`}
          hint={`${Math.round(todayMinutes / 60)}h reservadas`}
          icon={Clock3Icon}
          tone="sand"
        />
        <StatCard
          label="Retornos próximos"
          value={pendingReturns}
          hint="Nas próximas 3 semanas"
          icon={TrendingUpIcon}
          tone="rose"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <TodayAgendaCard
          className="xl:col-span-7"
          appointments={todaysAppointments}
          dentists={dentists}
          title="Hoje na clínica"
          showDentist
        />

        <div className="flex flex-col gap-4 xl:col-span-5">
          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">Sua semana</p>
                <p className="mt-1.5 font-display text-[1.8rem] leading-none text-ink">
                  {weekAppointments.length} consultas
                </p>
                <p className="mt-1 text-[0.75rem] text-muted-foreground">
                  {formatDateShort(weekStart)} – {formatDateShort(addDaysISO(weekStart, 6))}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F7EF] px-2.5 py-1 text-[0.7rem] font-medium text-[#27634D]">
                <span className="size-1.5 rounded-full bg-[#66B894]" />
                no ritmo
              </span>
            </div>
            <WeeklyBars
              data={weeklyData}
              className="mt-5 h-32"
              unit="consultas"
            />
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                  confirmação hoje
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {percent(confirmedToday, todaysAppointments.length)}%
                </p>
              </div>
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                  cancelamentos
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {cancelledThisWeek.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border border-border bg-[linear-gradient(140deg,#F4FCFB,#EAF8F6)] p-5">
            <OccupancyRing value={occupancy} size={96} stroke={8} label="hoje" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <SparklesIcon className="size-3.5 text-primary" />
                Dia sob controle
              </p>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">
                {todaysAppointments.length} consultas distribuídas entre{' '}
                {activeDentists.length} dentistas. A agenda ainda tem espaços
                livres.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <TeamPulseCard
          className="xl:col-span-7"
          dentists={activeDentists}
          allDentists={dentists}
          appointments={appointments}
          today={today}
          patients={patients}
        />

        <div className="surface-card p-5 xl:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Precisa de atenção</p>
              <h3 className="mt-1 text-base font-semibold text-ink">
                Pontos para revisar
              </h3>
            </div>
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-rose-soft text-[#7D3441]">
              <Clock3Icon className="size-4" />
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {cancelledThisWeek.slice(0, 3).map((appointment) => {
              const patient = patients.find(
                (item) => item.id === appointment.patientId,
              )
              return (
                <Link
                  key={appointment.id}
                  to="/app/agenda"
                  className="flex items-center gap-2.5 rounded-xl border border-border/70 px-3 py-2.5 transition-colors hover:bg-[#FAFDFD]"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-lg bg-rose-soft text-[#7D3441]">
                    <CalendarPlusIcon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.72rem] font-medium text-ink">
                      {patient?.name ?? 'Paciente'} cancelou
                    </p>
                    <p className="text-[0.72rem] text-muted-foreground">
                      {relativeDayLabel(appointment.date)} · {appointment.startTime}
                    </p>
                  </div>
                  <ArrowRightIcon className="size-3.5 text-muted-foreground/60" />
                </Link>
              )
            })}

            {inactiveDentistsWithPatients.map((member) => (
              <Link
                key={member.id}
                to="/app/equipe"
                className="flex items-center gap-2.5 rounded-xl border border-[#F4D9BC] bg-[#FEF8F2] px-3 py-2.5 transition-colors hover:bg-[#FDF1E4]"
              >
                <InitialsAvatar name={member.name} tone={member.tone} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.72rem] font-medium text-ink">
                    {firstName(member.name)} está inativo
                  </p>
                  <p className="text-[0.72rem] text-muted-foreground">
                    Ainda tem pacientes vinculados
                  </p>
                </div>
                <ArrowRightIcon className="size-3.5 text-muted-foreground/60" />
              </Link>
            ))}

            {cancelledThisWeek.length === 0 &&
            inactiveDentistsWithPatients.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-[#FAFDFD] px-5 py-8 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#E8F7EF] text-[#27634D]">
                  <CheckCircle2Icon className="size-5" />
                </span>
                <p className="mt-3 text-xs font-semibold text-ink">
                  Nenhum ponto crítico
                </p>
                <p className="mt-1 max-w-[220px] text-[0.75rem] leading-relaxed text-muted-foreground">
                  A agenda e a equipe estão em dia. Respire e siga cuidando.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function DentistDashboard() {
  const { patients, appointments } = useClinic()
  const { dentist } = useAuth()
  const { openNew } = useAppointmentDialogs()
  const today = todayISO()
  if (!dentist) return null

  const ownPatients = patients.filter(
    (patient) =>
      patient.dentistId === dentist.id && patient.status === 'active',
  )
  const ownAppointments = appointments.filter(
    (appointment) => appointment.dentistId === dentist.id,
  )
  const todaysAppointments = sortByStart(
    ownAppointments.filter(
      (appointment) =>
        appointment.date === today && appointment.status !== 'cancelled',
    ),
  )
  const next = nextAppointment(ownAppointments)
  const completedThisMonth = ownAppointments.filter(
    (appointment) =>
      appointment.status === 'completed' &&
      appointment.date.slice(0, 7) === today.slice(0, 7),
  ).length
  const weekStart = startOfWeekISO(today)
  const week = weekDates(today)
  const weeklyData = week.map((date) => ({
    label: formatWeekdayShort(date),
    value: ownAppointments.filter(
      (appointment) =>
        appointment.date === date && appointment.status !== 'cancelled',
    ).length,
    highlight: date === today,
  }))
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDaysISO(today, index - 6)
    return ownAppointments.filter(
      (appointment) =>
        appointment.date === date && appointment.status !== 'cancelled',
    ).length
  })
  const confirmedToday = todaysAppointments.filter(
    (appointment) =>
      appointment.status === 'confirmed' || appointment.status === 'completed',
  ).length
  const nextPatient = next
    ? patients.find((patient) => patient.id === next.patientId)
    : undefined

  return (
    <div className="space-y-7">
      <DashboardGreeting
        name={firstName(dentist.name)}
        subtitle={
          next
            ? `Sua próxima consulta é ${relativeDayLabel(next.date).toLowerCase()} às ${
                next.startTime
              }, com ${firstName(nextPatient?.name ?? 'seu paciente')}.`
            : 'Sua agenda está livre. Um bom momento para revisar os pacientes.'
        }
        actions={
          <>
            <Button asChild variant="outline" className="w-full gap-1.5 rounded-full sm:w-auto">
              <Link to="/app/agenda">
                <CalendarDaysIcon className="size-4" />
                Minha agenda
              </Link>
            </Button>
            <Button
              onClick={() => openNew()}
              className="w-full gap-1.5 rounded-full sm:w-auto"
            >
              <PlusIcon className="size-4" />
              Nova consulta
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Consultas hoje"
          value={todaysAppointments.length}
          hint={`${confirmedToday} confirmadas`}
          icon={CalendarDaysIcon}
          spark={lastSevenDays}
          trendLabel="Consultas nos últimos 7 dias"
        />
        <StatCard
          label="Meus pacientes"
          value={ownPatients.length}
          hint="Sob seu acompanhamento"
          icon={UsersIcon}
          tone="mint"
        />
        <StatCard
          label="Próxima consulta"
          value={next ? next.startTime : '—'}
          hint={next ? relativeDayLabel(next.date) : 'Agenda livre'}
          icon={Clock3Icon}
          tone="sand"
        />
        <StatCard
          label="Concluídas no mês"
          value={completedThisMonth}
          hint="Atendimentos realizados"
          icon={UserRoundCheckIcon}
          tone="rose"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <TodayAgendaCard
          className="xl:col-span-7"
          appointments={todaysAppointments}
          title="Seu dia"
          emptyDescription="Nenhuma consulta marcada para hoje. Aproveite para revisar os retornos."
        />
        <div className="flex flex-col gap-4 xl:col-span-5">
          <div className="surface-card p-5">
            <p className="eyebrow">Sua semana</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="font-display text-[1.9rem] leading-none text-ink">
                {weeklyData.reduce((total, item) => total + item.value, 0)}{' '}
                consultas
              </p>
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                {formatDateShort(weekStart)}
              </span>
            </div>
            <WeeklyBars data={weeklyData} className="mt-5 h-32" />
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                  confirmação hoje
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {percent(confirmedToday, todaysAppointments.length)}%
                </p>
              </div>
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                  pacientes ativos
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {ownPatients.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-[linear-gradient(140deg,#F4FCFB,#EAF8F6)] p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                <StethoscopeIcon className="size-4" />
              </span>
              <p className="text-sm font-semibold text-ink">
                Seu espaço, seu ritmo
              </p>
            </div>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              Você só enxerga os seus pacientes e a sua agenda. O restante da
              clínica permanece privado.
            </p>
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-card/70 px-3 py-2.5">
              <OccupancyRing
                value={percent(ownPatients.length, 8)}
                size={58}
                stroke={6}
                label="agenda"
              />
              <p className="min-w-0 text-[0.75rem] leading-relaxed text-muted-foreground">
                {ownPatients.length} pacientes ativos sob seus cuidados.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="surface-card p-5 xl:col-span-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Seus pacientes</p>
              <h3 className="mt-1 text-base font-semibold text-ink">
                Acompanhamento recente
              </h3>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
              <Link to="/app/pacientes">
                Ver todos
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="mt-3 divide-y divide-border/70">
            {ownPatients.slice(0, 4).map((patient) => {
              const upcoming = nextAppointment(
                ownAppointments.filter(
                  (appointment) => appointment.patientId === patient.id,
                ),
              )
              return (
                <Link
                  key={patient.id}
                  to={`/app/pacientes/${patient.id}`}
                  className="flex items-center gap-3 py-2.5 transition-colors hover:bg-[#FAFDFD]"
                >
                  <InitialsAvatar name={patient.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.78rem] font-medium text-ink" title={patient.name}>{patient.name}</p>
                    <p className="truncate text-[0.75rem] text-muted-foreground">
                      {patient.phone} · {patient.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[0.72rem] uppercase tracking-wider text-muted-foreground">
                      {upcoming ? relativeDayLabel(upcoming.date) : 'sem retorno'}
                    </p>
                    <p className="text-[0.75rem] text-muted-foreground">
                      {upcoming ? upcoming.startTime : 'a agendar'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
          {ownPatients.length === 0 ? (
            <EmptyState
              compact
              icon={UsersIcon}
              title="Nenhum paciente por aqui"
              description="Cadastre seu primeiro paciente para começar a organizar a agenda."
              className="mt-3"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-5 surface-card p-5 xl:col-span-5">
          <OccupancyRing
            value={percent(completedThisMonth, Math.max(completedThisMonth + 6, 1))}
            size={96}
            stroke={8}
            label="concluídas"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <CheckCircle2Icon className="size-4 text-[#66B894]" />
              {completedThisMonth} atendimentos no mês
            </p>
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">
              Cada consulta concluída mantém o histórico do paciente atualizado
              e a clínica em movimento.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-3 gap-1 rounded-full"
            >
              <Link to="/app/pacientes">
                Ver pacientes
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardGreeting({
  name,
  subtitle,
  actions,
}: {
  name: string
  subtitle: string
  actions: ReactNode
}) {
  return (
    <PageHeader
      eyebrow={longTodayLabel()}
      title={
        <>
          {greetingFor()}, {name}.
          <br />
          <span className="italic text-primary">Vamos cuidar?</span>
        </>
      }
      description={subtitle}
      actions={actions}
    />
  )
}

function TodayAgendaCard({
  appointments,
  dentists,
  title,
  showDentist = false,
  className,
  emptyDescription,
}: {
  appointments: Appointment[]
  dentists?: Dentist[]
  title: string
  showDentist?: boolean
  className?: string
  emptyDescription?: string
}) {
  const { openDetails } = useAppointmentDialogs()
  const { patients } = useClinic()

  return (
    <div className={cn('surface-card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Agenda</p>
          <h3 className="mt-1 text-base font-semibold text-ink">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[0.72rem] text-[#0B565E]">
            {appointments.length} consultas
          </span>
          <Button asChild variant="ghost" size="icon-sm" aria-label="Abrir agenda">
            <Link to="/app/agenda">
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3">
        {appointments.length === 0 ? (
          <EmptyState
            compact
            icon={CalendarDaysIcon}
            title="Nenhuma consulta hoje"
            description={
              emptyDescription ??
              'A agenda está livre. Que tal adiantar os retornos da semana?'
            }
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/app/agenda">Abrir agenda</Link>
              </Button>
            }
          />
        ) : (
          <div className="-mx-2 max-h-[420px] space-y-0.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
            {appointments.map((appointment) => {
              const patient = patients.find(
                (item) => item.id === appointment.patientId,
              )
              const dentist = dentists?.find(
                (item) => item.id === appointment.dentistId,
              )
              return (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => openDetails(appointment.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2.5 text-left transition-colors hover:border-border hover:bg-[#FAFDFD]"
                >
                  <div className="w-10 shrink-0 text-center">
                    <p className="font-mono text-[0.72rem] font-medium text-ink">
                      {appointment.startTime}
                    </p>
                    <p className="font-mono text-[0.75rem] text-muted-foreground">
                      {appointment.durationMinutes} min
                    </p>
                  </div>
                  <InitialsAvatar name={patient?.name ?? 'Paciente'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.78rem] font-medium text-ink" title={patient?.name ?? 'Paciente'}>{patient?.name ?? 'Paciente'}</p>
                    <p className="truncate text-[0.75rem] text-muted-foreground">
                      {appointmentTypeLabels[appointment.type]}
                      {showDentist && dentist ? ` · ${dentist.name}` : ''}
                    </p>
                  </div>
                  <AppointmentStatusBadge
                    status={appointment.status}
                    showDot={false}
                    className="hidden px-2 py-0.5 text-[0.7rem] sm:inline-flex"
                  />
                  <span className="sm:hidden">
                    <span
                      className={cn(
                        'block size-2 rounded-full',
                        statusDotStyles[appointment.status],
                      )}
                    >
                      <span className="sr-only">
                        {appointmentStatusLabels[appointment.status]}
                      </span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <p className="text-[0.75rem] text-muted-foreground">
          {appointments.length > 0
            ? `${appointmentStatusLabels[appointments[0].status]} · ${appointments[0].startTime} é o primeiro`
            : 'Dia livre por enquanto'}
        </p>
        <Link
          to="/app/agenda"
          className="flex items-center gap-1 text-[0.7rem] font-medium text-primary hover:underline"
        >
          Agenda completa
          <ArrowRightIcon className="size-3" />
        </Link>
      </div>
    </div>
  )
}

function TeamPulseCard({
  dentists,
  allDentists,
  appointments,
  patients,
  today,
  className,
}: {
  dentists: Dentist[]
  allDentists: Dentist[]
  appointments: Appointment[]
  patients: ReturnType<typeof useClinic>['patients']
  today: string
  className?: string
}) {
  const weekStart = startOfWeekISO(today)
  const weekEnd = addDaysISO(weekStart, 6)
  const weekCounts = dentists.map(
    (member) =>
      appointments.filter(
        (appointment) =>
          appointment.dentistId === member.id &&
          appointment.date >= weekStart &&
          appointment.date <= weekEnd &&
          appointment.status !== 'cancelled',
      ).length,
  )
  const maxCount = Math.max(...weekCounts, 1)

  return (
    <div className={cn('surface-card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Equipe</p>
          <h3 className="mt-1 text-base font-semibold text-ink">
            Pulso da clínica
          </h3>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
          <Link to="/app/equipe">
            Gerenciar
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {dentists.map((member, index) => {
          const memberPatients = patients.filter(
            (patient) =>
              patient.dentistId === member.id && patient.status === 'active',
          ).length
          const todaysCount = appointments.filter(
            (appointment) =>
              appointment.dentistId === member.id &&
              appointment.date === today &&
              appointment.status !== 'cancelled',
          ).length
          return (
            <Link
              key={member.id}
              to="/app/equipe"
              className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2.5 transition-colors hover:bg-[#FAFDFD]"
            >
              <InitialsAvatar name={member.name} tone={member.tone} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[0.74rem] font-medium text-ink" title={member.name}>{member.name}</p>
                  <span className="font-mono text-[0.75rem] text-muted-foreground">
                    {todaysCount} hoje
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={`${weekCounts[index]} consultas na semana`}
                  className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    aria-hidden="true"
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.round(
                        (weekCounts[index] / maxCount) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[0.72rem] text-muted-foreground">
                  {member.specialty} · {memberPatients} pacientes
                </p>
              </div>
              <ArrowRightIcon className="size-3.5 text-muted-foreground/60" />
            </Link>
          )
        })}
      </div>

      {allDentists.length > dentists.length ? (
        <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-[0.75rem] text-muted-foreground">
          {allDentists.length - dentists.length} dentista inativo não aparece na
          operação.
        </p>
      ) : null}
    </div>
  )
}
