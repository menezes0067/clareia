import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
} from 'lucide-react'
import type { Appointment } from '@/domain/types'
import {
  appointmentStatusLabels,
  appointmentTypeLabels,
} from '@/domain/labels'
import { useClinic } from '@/data/clinic-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { useAppointmentDialogs } from '@/features/appointments/appointment-dialogs'
import {
  endTimeOf,
  layoutOverlappingAppointments,
  minutesToTime,
  sortByStart,
  timeToMinutes,
} from '@/domain/appointments'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { InitialsAvatar } from '@/components/shared/avatar'
import { AppointmentStatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { AvatarStack } from '@/components/shared/avatar-stack'
import { statusDotStyles } from '@/components/shared/status-badge'
import {
  addDaysISO,
  formatDateShort,
  formatDayNumber,
  formatWeekdayShort,
  formatWeekRange,
  isToday,
  parseISODate,
  relativeDayLabel,
  startOfWeekISO,
  todayISO,
  weekDates,
} from '@/lib/dates'
import { firstName } from '@/lib/format'
import { toneForDentist } from '@/lib/tone'
import { cn } from '@/lib/utils'

const START_HOUR = 7
const END_HOUR = 19
const HOUR_HEIGHT = 88

export function AgendaPage() {
  const { appointments, dentists } = useClinic()
  const { dentist: sessionDentist, isOwner } = useAuth()
  const { openNew } = useAppointmentDialogs()
  const [anchorDate, setAnchorDate] = useState(todayISO())
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [dentistFilter, setDentistFilter] = useState<string>('all')
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const selectedDayRef = useRef<HTMLButtonElement | null>(null)

  const weekStart = startOfWeekISO(anchorDate)
  const week = weekDates(anchorDate)
  const today = todayISO()

  const effectiveDentistFilter = isOwner ? dentistFilter : sessionDentist?.id
  const defaultDentistId =
    effectiveDentistFilter === 'all'
      ? sessionDentist?.id
      : effectiveDentistFilter
  const visibleAppointments = appointments.filter(
    (appointment) =>
      (isOwner || appointment.dentistId === sessionDentist?.id) &&
      (effectiveDentistFilter === 'all' ||
        appointment.dentistId === effectiveDentistFilter),
  )
  const weekAppointments = visibleAppointments.filter(
    (appointment) =>
      appointment.date >= weekStart &&
      appointment.date <= addDaysISO(weekStart, 6),
  )
  const confirmedCount = weekAppointments.filter(
    (appointment) => appointment.status === 'confirmed',
  ).length
  const cancelledCount = weekAppointments.filter(
    (appointment) => appointment.status === 'cancelled',
  ).length

  const filterDentists = useMemo(
    () =>
      [...dentists].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1
        return a.name.localeCompare(b.name, 'pt-BR')
      }),
    [dentists],
  )

  const selectedAppointments = sortByStart(
    weekAppointments.filter(
      (appointment) => appointment.date === selectedDate,
    ),
  )
  const selectedDayLabel = isToday(selectedDate)
    ? `Hoje · ${formatDateShort(selectedDate)}`
    : relativeDayLabel(selectedDate)

  // Centraliza o dia escolhido apenas dentro do carrossel, sem mover a página.
  useEffect(() => {
    const carousel = carouselRef.current
    const button = selectedDayRef.current
    if (!carousel || !button || typeof carousel.scrollTo !== 'function') return
    const carouselRect = carousel.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    const target =
      carousel.scrollLeft +
      (buttonRect.left - carouselRect.left) -
      (carouselRect.width - buttonRect.width) / 2
    carousel.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [selectedDate])

  const goToWeek = (delta: number) => {
    setAnchorDate((current) => addDaysISO(current, delta * 7))
    setSelectedDate((current) => addDaysISO(current, delta * 7))
  }

  const goToToday = () => {
    setAnchorDate(today)
    setSelectedDate(today)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Agenda"
        title="A semana, em perspectiva."
        description={`${weekAppointments.length} consultas na semana · ${confirmedCount} confirmadas · ${cancelledCount} canceladas.`}
        actions={
          <>
            <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => goToWeek(-1)}
                aria-label="Semana anterior"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <button
                type="button"
                onClick={goToToday}
                className="rounded-full px-3 py-1 text-[0.7rem] font-medium text-ink transition-colors hover:bg-secondary"
              >
                Hoje
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => goToWeek(1)}
                aria-label="Próxima semana"
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
            <Button
              onClick={() =>
                openNew({ date: selectedDate, dentistId: defaultDentistId })
              }
              className="gap-1.5 rounded-full"
            >
              <PlusIcon className="size-4" />
              Nova consulta
            </Button>
          </>
        }
      />

      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <CalendarDaysIcon className="size-[1.1rem]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {formatWeekRange(weekStart)}
              </p>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {parseISODate(weekStart).getFullYear()} · semana completa
              </p>
            </div>
          </div>

          {isOwner ? (
            <div
              role="group"
              aria-label="Filtrar por dentista"
              className="no-scrollbar -mx-0.5 flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto px-0.5 sm:flex-wrap sm:overflow-visible sm:px-0"
            >
              <button
                type="button"
                onClick={() => setDentistFilter('all')}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-[0.72rem] font-medium transition-colors',
                  dentistFilter === 'all'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-ink',
                )}
              >
                Toda a equipe
              </button>
              {filterDentists.map((member) => {
                const tone = toneForDentist(member.tone)
                const active = dentistFilter === member.id
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setDentistFilter(member.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.72rem] font-medium transition-colors',
                      active
                        ? 'border-primary bg-secondary text-ink'
                        : 'border-border bg-card text-muted-foreground hover:text-ink',
                      member.status === 'inactive' && 'opacity-55',
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', tone.dot)} />
                    {firstName(member.name)}
                    {member.status === 'inactive' ? ' · inativo' : ''}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[0.72rem] text-[#0B565E]">
              <AvatarStack />
              Minha agenda · acesso somente aos meus pacientes
            </div>
          )}
        </div>

        <div
          ref={carouselRef}
          role="group"
          aria-label="Dias da semana"
          className="no-scrollbar -mx-1 mt-5 flex snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-2 sm:px-0 sm:pb-0"
        >
          {week.map((date) => {
            const count = weekAppointments.filter(
              (appointment) =>
                appointment.date === date &&
                appointment.status !== 'cancelled',
            ).length
            const isSelected = date === selectedDate
            return (
              <button
                key={date}
                ref={isSelected ? selectedDayRef : undefined}
                data-date={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                aria-current={isToday(date) ? 'date' : undefined}
                aria-pressed={isSelected}
                className={cn(
                  'group relative flex min-h-[76px] min-w-[72px] shrink-0 snap-center flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 transition-all sm:min-h-0 sm:min-w-0 sm:flex-1 sm:py-3',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(13,124,134,0.6)]'
                    : 'border-transparent bg-[#F7FCFC] text-ink hover:border-border hover:bg-card',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[0.7rem] uppercase tracking-[0.12em]',
                    isSelected
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {formatWeekdayShort(date)}
                </span>
                <span className="text-base font-semibold leading-none">
                  {formatDayNumber(date)}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex items-center gap-1 font-mono text-[0.72rem]',
                    isSelected
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground',
                  )}
                >
                  {count > 0 ? (
                    <>
                      <span
                        className={cn(
                          'size-1 rounded-full',
                          isSelected ? 'bg-card' : 'bg-primary',
                        )}
                      />
                      {count} consultas
                    </>
                  ) : (
                    'livre'
                  )}
                </span>
                {isToday(date) && !isSelected ? (
                  <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="surface-card hidden overflow-x-auto xl:block">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))] border-b border-border bg-[#FBFEFE]">
            <div className="px-2 py-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
              hora
            </div>
            {week.map((date) => {
              const isSelected = date === selectedDate
              return (
                <button
                  key={date}
                  data-date={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  aria-pressed={isSelected}
                  className={cn(
                    'border-l border-border/70 px-2 py-2.5 text-center transition-colors hover:bg-secondary/60',
                    isToday(date) && 'bg-[#F1FAF9]',
                    isSelected &&
                      'bg-primary/10 shadow-[inset_0_0_0_1px_rgba(13,124,134,0.28)]',
                  )}
                >
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {formatWeekdayShort(date)}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 text-[0.82rem] font-semibold',
                      isSelected || isToday(date) ? 'text-primary' : 'text-ink',
                    )}
                  >
                    {formatDayNumber(date)}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))]">
            <div className="relative border-r border-border/70">
              {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => (
                <div
                  key={index}
                  className="relative border-b border-border/40"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <span className="absolute -top-2 right-2 font-mono text-[0.7rem] text-muted-foreground">
                    {String(START_HOUR + index).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {week.map((date) => (
              <DayColumn
                key={date}
                date={date}
                appointments={weekAppointments.filter(
                  (appointment) => appointment.date === date,
                )}
                isOwner={isOwner}
                isSelected={date === selectedDate}
                defaultDentistId={defaultDentistId}
                onAdd={openNew}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">
              {selectedDayLabel}
            </p>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {selectedAppointments.length} consultas
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {selectedAppointments.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarDaysIcon}
                title="Dia livre"
                description="Nenhuma consulta para este dia."
                action={
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      openNew({
                        date: selectedDate,
                        dentistId: defaultDentistId,
                      })
                    }
                  >
                    <PlusIcon className="size-3.5" />
                    Agendar
                  </Button>
                }
              />
            ) : (
              selectedAppointments.map((appointment) => (
                <MobileAppointment
                  key={appointment.id}
                  appointment={appointment}
                  showDentist={isOwner}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] as const).map(
            (status) => (
              <span
                key={status}
                className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground"
              >
                <span
                  className={cn('size-1.5 rounded-full', statusDotStyles[status])}
                />
                {appointmentStatusLabels[status]}
              </span>
            ),
          )}
        </div>
        <p className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
          <ClockIcon className="size-3.5" />
          <span className="hidden xl:inline">
            Clique em um horário vago para agendar
          </span>
          <span className="xl:hidden">Toque em um dia para ver a agenda</span>
        </p>
      </div>
    </div>
  )
}

function DayColumn({
  date,
  appointments,
  isOwner,
  isSelected,
  defaultDentistId,
  onAdd,
}: {
  date: string
  appointments: Appointment[]
  isOwner: boolean
  isSelected: boolean
  defaultDentistId?: string
  onAdd: (prefill: {
    date: string
    startTime: string
    dentistId?: string
  }) => void
}) {
  const { patients, dentists } = useClinic()
  const { openDetails } = useAppointmentDialogs()
  const laidOut = layoutOverlappingAppointments(sortByStart(appointments))

  return (
    <div
      className={cn(
        'relative border-l border-border/70',
        isSelected
          ? 'bg-primary/[0.06] shadow-[inset_0_0_0_1px_rgba(13,124,134,0.18)]'
          : isToday(date) && 'bg-[#F8FDFC]',
      )}
    >
      <div className="absolute inset-0 flex flex-col">
        {Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, index) => {
          const minutes = START_HOUR * 60 + index * 30
          const isHour = minutes % 60 === 0
          return (
            <button
              key={index}
              type="button"
              onClick={() =>
                onAdd({
                  date,
                  startTime: minutesToTime(minutes),
                  dentistId: defaultDentistId,
                })
              }
              className={cn(
                'group flex-1 border-b transition-colors hover:bg-[#EFFAF8]',
                isHour ? 'border-border/50' : 'border-border/20',
              )}
              aria-label={`Agendar em ${date} às ${minutesToTime(minutes)}`}
            >
              <span className="hidden text-[0.7rem] text-primary group-hover:block">
                + {minutesToTime(minutes)}
              </span>
            </button>
          )
        })}
      </div>

      {laidOut.map(({ appointment, lane, laneCount }) => {
        const patient = patients.find(
          (item) => item.id === appointment.patientId,
        )
        const dentist = dentists.find(
          (item) => item.id === appointment.dentistId,
        )
        const tone = toneForDentist(dentist?.tone)
        const startMinutes = timeToMinutes(appointment.startTime)
        const top =
          ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT + 2
        const height = Math.max(
          (appointment.durationMinutes / 60) * HOUR_HEIGHT - 4,
          40,
        )
        const width = 100 / laneCount
        return (
          <button
            key={appointment.id}
            type="button"
            onClick={() => openDetails(appointment.id)}
            className={cn(
              'absolute z-10 min-h-10 overflow-hidden rounded-lg border px-1.5 py-1 text-left shadow-sm transition-all hover:z-20 hover:shadow-md',
              tone.bg,
              tone.border,
              tone.text,
              appointment.status === 'cancelled' &&
                'opacity-55 [&_.appointment-name]:line-through',
              appointment.status === 'completed' && 'opacity-75',
            )}
            style={{
              top,
              height,
              left: `calc(${lane * width}% + 2px)`,
              width: `calc(${width}% - 4px)`,
            }}
            title={`${appointment.startTime}–${endTimeOf(appointment)} · ${patient?.name ?? ''} · ${appointmentTypeLabels[appointment.type]}`}
          >
            <p className="font-mono text-[0.72rem] font-medium leading-none opacity-80">
              {appointment.startTime}
            </p>
            <p className="appointment-name mt-0.5 truncate text-[0.7rem] font-semibold leading-tight" title={patient ? firstName(patient.name) : 'Paciente'}>{patient ? firstName(patient.name) : 'Paciente'}</p>
            {height > 68 ? (
              <p
                className="mt-0.5 truncate text-[0.72rem] leading-tight opacity-75"
                title={`${appointmentTypeLabels[appointment.type]}${isOwner ? ` · ${dentist?.name ?? ''}` : ''}`}
              >
                {appointmentTypeLabels[appointment.type]}
                {isOwner ? ` · ${firstName(dentist?.name ?? '')}` : ''}
              </p>
            ) : null}
            {height > 100 ? (
              <span className="mt-1 inline-block size-1.5 rounded-full bg-current opacity-70" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function MobileAppointment({
  appointment,
  showDentist,
}: {
  appointment: Appointment
  showDentist: boolean
}) {
  const { patients, dentists } = useClinic()
  const { openDetails } = useAppointmentDialogs()
  const patient = patients.find((item) => item.id === appointment.patientId)
  const dentist = dentists.find((item) => item.id === appointment.dentistId)
  const detail = `${appointmentTypeLabels[appointment.type]}${
    showDentist ? ` · ${dentist?.name ?? ''}` : ''
  }`
  return (
    <button
      type="button"
      onClick={() => openDetails(appointment.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border border-border bg-[#FAFDFD] px-3 py-3 text-left',
        appointment.status === 'cancelled' && 'opacity-60',
      )}
    >
      <div className="w-10 shrink-0 text-center">
        <p className="font-mono text-[0.72rem] font-medium text-ink">
          {appointment.startTime}
        </p>
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          {appointment.durationMinutes} min
        </p>
      </div>
      <InitialsAvatar name={patient?.name ?? 'Paciente'} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.76rem] font-medium text-ink" title={patient?.name}>{patient?.name}</p>
        <p className="truncate text-[0.72rem] text-muted-foreground" title={detail}>
          {detail}
        </p>
        <div className="mt-1">
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>
    </button>
  )
}
