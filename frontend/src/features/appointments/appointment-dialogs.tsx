import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  CheckIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import type { Appointment } from '@/domain/types'
import {
  appointmentDurationByType,
  appointmentStatusDescriptions,
  appointmentStatusLabels,
  appointmentTypeLabels,
  appointmentTypes,
} from '@/domain/labels'
import {
  endTimeOf,
  findDentistConflict,
  findPatientConflict,
  minutesToTime,
} from '@/domain/appointments'
import {
  appointmentFormSchema,
  type AppointmentFormValues,
} from '@/domain/schemas'
import { useClinic } from '@/data/clinic-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Field, FormSection } from '@/components/shared/form-field'
import { DatePickerField } from '@/components/shared/date-picker-field'
import { InitialsAvatar } from '@/components/shared/avatar'
import { AppointmentStatusBadge } from '@/components/shared/status-badge'
import { addDaysISO, formatDateLong, todayISO } from '@/lib/dates'
import { useMediaQuery } from '@/lib/use-media-query'
import { cn } from '@/lib/utils'

interface NewAppointmentPrefill {
  patientId?: string
  dentistId?: string
  date?: string
  startTime?: string
}

interface AppointmentDialogsContextValue {
  openNew: (prefill?: NewAppointmentPrefill) => void
  openDetails: (appointmentId: string) => void
  openEdit: (appointment: Appointment) => void
}

const AppointmentDialogsContext =
  createContext<AppointmentDialogsContextValue | null>(null)

export function AppointmentDialogsProvider({ children }: { children: ReactNode }) {
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [formState, setFormState] = useState<{
    open: boolean
    appointment?: Appointment
    prefill?: NewAppointmentPrefill
  }>({ open: false })

  const openNew = useCallback((prefill?: NewAppointmentPrefill) => {
    setDetailsId(null)
    setFormState({ open: true, prefill })
  }, [])

  const openDetails = useCallback((appointmentId: string) => {
    setDetailsId(appointmentId)
  }, [])

  const openEdit = useCallback((appointment: Appointment) => {
    setDetailsId(null)
    setFormState({ open: true, appointment })
  }, [])

  const closeForm = useCallback(() => {
    setFormState((current) => ({ ...current, open: false }))
  }, [])

  const value = useMemo(
    () => ({ openNew, openDetails, openEdit }),
    [openDetails, openEdit, openNew],
  )

  return (
    <AppointmentDialogsContext.Provider value={value}>
      {children}
      <AppointmentFormSheet
        open={formState.open}
        onOpenChange={(open) => {
          if (!open) closeForm()
        }}
        appointment={formState.appointment}
        prefill={formState.prefill}
      />
      <AppointmentDetailsSheet
        appointmentId={detailsId}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null)
        }}
        onEdit={openEdit}
      />
    </AppointmentDialogsContext.Provider>
  )
}

export function useAppointmentDialogs(): AppointmentDialogsContextValue {
  const context = useContext(AppointmentDialogsContext)
  if (!context) {
    throw new Error(
      'useAppointmentDialogs deve ser usado dentro de AppointmentDialogsProvider',
    )
  }
  return context
}

function AppointmentFormSheet({
  open,
  onOpenChange,
  appointment,
  prefill,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: Appointment
  prefill?: NewAppointmentPrefill
}) {
  const { patients, dentists, appointments, createAppointment, updateAppointment } =
    useClinic()
  const { dentist: sessionDentist, isOwner } = useAuth()
  const isEditing = Boolean(appointment)
  const isDesktop = useMediaQuery('(min-width: 640px)')

  const buildDefaults = useCallback((): AppointmentFormValues => {
    if (appointment) {
      return {
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        date: appointment.date,
        startTime: appointment.startTime,
        durationMinutes: appointment.durationMinutes,
        type: appointment.type,
        notes: appointment.notes ?? '',
      }
    }

    const prefillPatient = patients.find(
      (patient) => patient.id === prefill?.patientId,
    )
    const defaultDentistId =
      (isOwner ? prefill?.dentistId : sessionDentist?.id) ??
      prefillPatient?.dentistId ??
      sessionDentist?.id ??
      dentists.find((member) => member.status === 'active')?.id ??
      ''

    const nextSlot = getNextSlot()
    return {
      patientId: prefillPatient?.id ?? '',
      dentistId: defaultDentistId,
      date: prefill?.date ?? nextSlot.date,
      startTime: prefill?.startTime ?? nextSlot.startTime,
      durationMinutes: 30,
      type: 'evaluation',
      notes: '',
    }
  }, [appointment, dentists, isOwner, patients, prefill, sessionDentist?.id])

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema) as Resolver<AppointmentFormValues>,
    defaultValues: buildDefaults(),
  })
  const { control, handleSubmit, reset, setValue, setError, watch } = form

  useEffect(() => {
    if (open) reset(buildDefaults())
  }, [open, appointment?.id, reset, buildDefaults])

  const selectedDentistId = useWatch({ control, name: 'dentistId' })
  const selectedPatientId = useWatch({ control, name: 'patientId' })
  const selectedType = useWatch({ control, name: 'type' })

  const dentistOptions = useMemo(() => {
    if (!isOwner) {
      return sessionDentist ? [sessionDentist] : []
    }
    const active = dentists.filter((member) => member.status === 'active')
    const editingDentist = appointment
      ? dentists.find((member) => member.id === appointment.dentistId)
      : undefined
    if (editingDentist && !active.some((member) => member.id === editingDentist.id)) {
      return [...active, editingDentist]
    }
    return active
  }, [appointment, dentists, isOwner, sessionDentist])

  const patientOptions = useMemo(() => {
    const ownPatients = patients.filter(
      (patient) =>
        patient.dentistId === selectedDentistId && patient.status === 'active',
    )
    const editingPatient = appointment
      ? patients.find((patient) => patient.id === appointment.patientId)
      : undefined
    if (
      editingPatient &&
      !ownPatients.some((patient) => patient.id === editingPatient.id)
    ) {
      return [...ownPatients, editingPatient]
    }
    return ownPatients
  }, [appointment, patients, selectedDentistId])

  const onSubmit = (values: AppointmentFormValues) => {
    const candidate = {
      patientId: values.patientId,
      dentistId: values.dentistId,
      date: values.date,
      startTime: values.startTime,
      durationMinutes: values.durationMinutes,
    }

    const originalSlotUnchanged =
      appointment &&
      appointment.date === values.date &&
      appointment.startTime === values.startTime

    if (!originalSlotUnchanged) {
      const start =
        new Date(`${values.date}T${values.startTime}:00`).getTime() +
        values.durationMinutes * 60_000
      if (start < Date.now()) {
        setError('date', {
          message: 'Escolha uma data e um horário que ainda não passaram.',
        })
        return
      }
    }

    const dentistConflict = findDentistConflict(
      appointments,
      candidate,
      appointment?.id,
    )
    if (dentistConflict) {
      setError('startTime', {
        message: `O dentista já tem consulta das ${dentistConflict.startTime} às ${endTimeOf(
          dentistConflict,
        )}.`,
      })
      return
    }

    const patientConflict = findPatientConflict(
      appointments,
      candidate,
      appointment?.id,
    )
    if (patientConflict) {
      setError('patientId', {
        message: `Este paciente já tem consulta das ${patientConflict.startTime} às ${endTimeOf(
          patientConflict,
        )}.`,
      })
      return
    }

    const payload = {
      ...values,
      notes: values.notes?.trim() || undefined,
    }

    if (appointment) {
      updateAppointment(appointment.id, payload)
      toast.success('Consulta atualizada', {
        description: `${values.date} · ${values.startTime} com ${
          patients.find((patient) => patient.id === values.patientId)?.name ??
          'paciente'
        }`,
      })
    } else {
      createAppointment(payload)
      toast.success('Consulta agendada', {
        description: `${formatDateLong(values.date)} · ${values.startTime}`,
      })
    }
    onOpenChange(false)
  }

  const patient = patients.find((item) => item.id === selectedPatientId)
  const hasPatients = patientOptions.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        side={isDesktop ? 'right' : 'bottom'}
        className={cn(
          'w-full gap-0 overflow-hidden p-0',
          isDesktop ? 'sm:max-w-[540px]' : 'h-[92dvh] rounded-t-3xl',
        )}
      >
        {!isDesktop ? (
          <div className="flex shrink-0 justify-center pt-3" aria-hidden="true">
            <span className="h-1.5 w-10 rounded-full bg-border" />
          </div>
        ) : null}
        <SheetHeader className="border-b border-border px-5 py-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-primary">
            {isEditing ? 'Editar consulta' : 'Nova consulta'}
          </p>
          <SheetTitle className="display-title mt-1 text-[1.8rem] font-normal">
            {isEditing ? 'Ajuste os detalhes' : 'Reserve um horário'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Atualize paciente, horário ou procedimento.'
              : 'A agenda bloqueia conflitos automaticamente.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <FormSection title="Quem e quando">
              <Field label="Paciente" error={form.formState.errors.patientId?.message}>
                <Controller
                  control={control}
                  name="patientId"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={!hasPatients}
                    >
                      <SelectTrigger aria-invalid={Boolean(form.formState.errors.patientId)}>
                        <SelectValue
                          placeholder={
                            hasPatients
                              ? 'Selecione o paciente'
                              : 'Nenhum paciente para este dentista'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {patientOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {!hasPatients ? (
                  <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                    Cadastre um paciente para este dentista antes de agendar.
                  </p>
                ) : null}
              </Field>

              <Field
                label="Dentista"
                error={form.formState.errors.dentistId?.message}
                hint={!isOwner ? 'Você só pode agendar na própria agenda.' : undefined}
              >
                <Controller
                  control={control}
                  name="dentistId"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(next) => {
                        field.onChange(next)
                        setValue('patientId', '')
                      }}
                      disabled={!isOwner}
                    >
                      <SelectTrigger aria-invalid={Boolean(form.formState.errors.dentistId)}>
                        <SelectValue placeholder="Selecione o dentista" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentistOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                            {option.status === 'inactive' ? ' · inativo' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Data" error={form.formState.errors.date?.message}>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
                        invalid={Boolean(form.formState.errors.date)}
                        fromDate={!appointment ? new Date() : undefined}
                      />
                    )}
                  />
                </Field>
                <Field
                  label="Início"
                  error={form.formState.errors.startTime?.message}
                >
                  <Controller
                    control={control}
                    name="startTime"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={Boolean(form.formState.errors.startTime)}>
                          <SelectValue placeholder="Horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Procedimento">
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(next) => {
                          field.onChange(next)
                          setValue(
                            'durationMinutes',
                            appointmentDurationByType[
                              next as keyof typeof appointmentDurationByType
                            ],
                          )
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Procedimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {appointmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {appointmentTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field
                  label="Duração"
                  error={form.formState.errors.durationMinutes?.message}
                >
                  <Controller
                    control={control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <Select
                        value={String(field.value)}
                        onValueChange={(next) => field.onChange(Number(next))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Duração" />
                        </SelectTrigger>
                        <SelectContent>
                          {[30, 45, 60, 90, 120].map((duration) => (
                            <SelectItem key={duration} value={String(duration)}>
                              {duration} min
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>

              {patient ? (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-[#FAFDFD] p-3">
                  <InitialsAvatar name={patient.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink" title={patient.name}>{patient.name}</p>
                    <p className="truncate text-[0.68rem] text-muted-foreground">
                      {patient.phone} · {patient.email}
                    </p>
                  </div>
                </div>
              ) : null}
            </FormSection>

            <FormSection
              title="Observações"
              description="Informações que ajudam o dentista no atendimento."
            >
              <Field label="Notas da consulta" optional>
                <Textarea
                  {...form.register('notes')}
                  placeholder="Ex.: paciente pediu confirmação por WhatsApp."
                  className="min-h-24"
                />
              </Field>
            </FormSection>
          </div>

          <SheetFooter className="border-t border-border bg-[#FBFEFE] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </SheetClose>
              <Button type="submit" className="flex-1 gap-2">
                {isEditing ? (
                  <RefreshCwIcon className="size-4" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
                {isEditing ? 'Salvar alterações' : 'Agendar consulta'}
              </Button>
            </div>
            <p className="text-center font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
              {selectedType ? appointmentTypeLabels[selectedType] : ''}
              {selectedType ? ' · ' : ''}
              {watch('durationMinutes')} min
            </p>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

const timeOptions = Array.from({ length: 24 }, (_, index) =>
  minutesToTime(7 * 60 + index * 30),
)

function getNextSlot(): { date: string; startTime: string } {
  const now = new Date()
  const totalMinutes = now.getHours() * 60 + now.getMinutes() + 30
  const rounded = Math.ceil(totalMinutes / 30) * 30
  if (rounded >= 8 * 60 && rounded <= 18 * 60) {
    return { date: todayISO(), startTime: minutesToTime(rounded) }
  }
  let date = addDaysISO(todayISO(), 1)
  while (new Date(`${date}T12:00:00`).getDay() === 0) {
    date = addDaysISO(date, 1)
  }
  return { date, startTime: '09:00' }
}

function AppointmentDetailsSheet({
  appointmentId,
  onOpenChange,
  onEdit,
}: {
  appointmentId: string | null
  onOpenChange: (open: boolean) => void
  onEdit: (appointment: Appointment) => void
}) {
  const {
    appointments,
    patients,
    dentists,
    setAppointmentStatus,
  } = useClinic()
  const { dentist: sessionDentist, isOwner } = useAuth()
  const [cancelOpen, setCancelOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 640px)')

  const appointment = appointments.find((item) => item.id === appointmentId)
  const canSee =
    appointment &&
    (isOwner || appointment.dentistId === sessionDentist?.id)
  const patient = patients.find((item) => item.id === appointment?.patientId)
  const dentist = dentists.find((item) => item.id === appointment?.dentistId)

  const updateStatus = (status: Appointment['status']) => {
    if (!appointment) return
    setAppointmentStatus(appointment.id, status)
    toast.success(`Consulta marcada como ${appointmentStatusLabels[status].toLowerCase()}.`)
    if (status === 'cancelled') setCancelOpen(false)
  }

  return (
    <Sheet open={Boolean(appointment && canSee)} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        side={isDesktop ? 'right' : 'bottom'}
        className={cn(
          'w-full gap-0 overflow-hidden p-0',
          isDesktop ? 'sm:max-w-[480px]' : 'h-[88dvh] rounded-t-3xl',
        )}
      >
        {!isDesktop ? (
          <div className="flex shrink-0 justify-center pt-3" aria-hidden="true">
            <span className="h-1.5 w-10 rounded-full bg-border" />
          </div>
        ) : null}
        {appointment && patient ? (
          <>
            <SheetHeader className="border-b border-border px-5 py-5">
              <div className="flex flex-wrap items-start gap-3">
                <InitialsAvatar name={patient.name} size="md" />
                <div className="min-w-[120px] flex-1">
                  <SheetTitle className="truncate text-base">{patient.name}</SheetTitle>
                  <SheetDescription className="mt-0.5 truncate font-mono text-[0.68rem] uppercase tracking-wider">
                    {appointmentTypeLabels[appointment.type]}
                  </SheetDescription>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  <AppointmentStatusBadge status={appointment.status} />
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Fechar detalhes da consulta"
                      className="-mr-2 -mt-1 rounded-full"
                    >
                      <XIcon />
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="rounded-2xl border border-border bg-[#F7FCFC] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <ClockIcon className="size-5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                        Início
                      </p>
                      <p className="mt-0.5 text-2xl font-semibold leading-none tracking-tight text-ink">
                        {appointment.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="h-px w-full shrink-0 bg-border/80 sm:h-10 sm:w-px" />
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                        Término
                      </p>
                      <p className="mt-0.5 text-xl font-semibold leading-none tracking-tight text-ink">
                        {endTimeOf(appointment)}
                      </p>
                    </div>
                    <p className="pb-0.5 text-[0.72rem] text-muted-foreground">
                      {appointment.durationMinutes} min
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-border/70 pt-3">
                  <p className="text-sm font-medium text-ink">
                    {formatDateLong(appointment.date)}
                  </p>
                  <p className="mt-0.5 truncate text-[0.72rem] text-muted-foreground" title={`${dentist?.name ?? 'Dentista'} · ${appointmentTypeLabels[appointment.type]}`}>
                    {dentist?.name ?? 'Dentista'} ·{' '}
                    {appointmentTypeLabels[appointment.type]}
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5">
                <DetailRow icon={UserIcon} label="Paciente" value={patient.name} />
                <DetailRow
                  icon={UserIcon}
                  label="Responsável"
                  value={`${dentist?.name ?? '—'} · ${dentist?.specialty ?? ''}`}
                />
              </div>

              <div className="rounded-2xl border border-border p-4">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-1.5 text-sm text-ink">
                  {appointmentStatusDescriptions[appointment.status]}
                </p>
              </div>

              {appointment.notes ? (
                <div>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Observações
                  </p>
                  <p className="mt-2 rounded-2xl bg-secondary/70 p-3.5 text-sm leading-relaxed text-ink">
                    {appointment.notes}
                  </p>
                </div>
              ) : null}

              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to={`/app/pacientes/${patient.id}`} onClick={() => onOpenChange(false)}>
                  <UserIcon className="size-4" />
                  Abrir ficha do paciente
                </Link>
              </Button>
            </div>

            <SheetFooter className="border-t border-border bg-[#FBFEFE] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {appointment.status === 'scheduled' ? (
                  <Button
                    className="col-span-2 w-full gap-1.5 sm:col-span-1 sm:w-auto sm:min-w-[130px] sm:flex-1"
                    onClick={() => updateStatus('confirmed')}
                  >
                    <CheckIcon className="size-4" />
                    Confirmar
                  </Button>
                ) : null}
                {appointment.status !== 'completed' &&
                appointment.status !== 'cancelled' ? (
                  <Button
                    variant="success"
                    className="col-span-2 w-full gap-1.5 sm:col-span-1 sm:w-auto sm:min-w-[130px] sm:flex-1"
                    onClick={() => updateStatus('completed')}
                  >
                    <CheckIcon className="size-4" />
                    Concluir
                  </Button>
                ) : null}
                {appointment.status === 'cancelled' ? (
                  <Button
                    variant="success"
                    className="col-span-2 w-full gap-1.5 sm:col-span-1 sm:w-auto sm:min-w-[130px] sm:flex-1"
                    onClick={() => updateStatus('scheduled')}
                  >
                    <RotateCcwIcon className="size-4" />
                    Reativar
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  className="col-span-2 w-full gap-1.5 sm:col-span-1 sm:w-auto sm:min-w-[130px] sm:flex-1"
                  onClick={() => onEdit(appointment)}
                >
                  <PencilIcon className="size-4" />
                  Reagendar
                </Button>
              </div>

              {appointment.status !== 'cancelled' &&
              appointment.status !== 'completed' ? (
                <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full gap-1.5 border-destructive/20"
                    >
                      <XIcon className="size-4" />
                      Cancelar consulta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar esta consulta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O horário ficará livre na agenda de {dentist?.name}. Você
                        pode reativar a consulta depois.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => updateStatus('cancelled')}
                        variant="destructive-solid"
                      >
                        Cancelar consulta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 px-3.5 py-2.5">
      <span className="flex shrink-0 items-center gap-2 text-[0.72rem] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span
        className="min-w-0 flex-1 truncate text-right text-[0.75rem] font-medium text-ink"
        title={value}
      >
        {value}
      </span>
    </div>
  )
}
