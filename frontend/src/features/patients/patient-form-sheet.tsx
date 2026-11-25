import { useEffect, useMemo } from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CalendarDaysIcon, PlusIcon, SaveIcon } from 'lucide-react'
import type { Patient } from '@/domain/types'
import {
  patientFormSchema,
  type PatientFormValues,
} from '@/domain/schemas'
import { useClinic } from '@/data/clinic-provider'
import { ApiError } from '@/data/api-client'
import { useAuth } from '@/features/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Field, FormSection } from '@/components/shared/form-field'
import { DatePickerField } from '@/components/shared/date-picker-field'
import { formatPhone } from '@/lib/format'
import { masked } from '@/lib/form'

interface PatientFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient
  defaultDentistId?: string
}

export function PatientFormSheet({
  open,
  onOpenChange,
  patient,
  defaultDentistId,
}: PatientFormSheetProps) {
  const { patients, dentists, createPatient, updatePatient } = useClinic()
  const { dentist: sessionDentist, isOwner } = useAuth()

  const defaults = useMemo<PatientFormValues>(
    () => ({
      name: patient?.name ?? '',
      email: patient?.email ?? '',
      phone: patient?.phone ?? '',
      birthDate: patient?.birthDate ?? '',
      dentistId:
        patient?.dentistId ??
        (isOwner
          ? (defaultDentistId ?? sessionDentist?.id ?? '')
          : (sessionDentist?.id ?? '')),
      notes: patient?.notes ?? '',
    }),
    [defaultDentistId, isOwner, patient, sessionDentist?.id],
  )

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema) as Resolver<PatientFormValues>,
    defaultValues: defaults,
  })
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = form

  useEffect(() => {
    if (open) reset(defaults)
  }, [defaults, open, reset])

  const dentistOptions = useMemo(() => {
    if (!isOwner) return sessionDentist ? [sessionDentist] : []
    return dentists.filter((member) => member.status === 'active')
  }, [dentists, isOwner, sessionDentist])

  const onSubmit = async (values: PatientFormValues) => {
    const duplicatedEmail = patients.find(
      (item) =>
        item.id !== patient?.id &&
        item.email.toLowerCase() === values.email.trim().toLowerCase(),
    )
    if (duplicatedEmail) {
      setError('email', {
        message: 'Já existe um paciente com este e-mail.',
      })
      return
    }

    const payload = {
      ...values,
      email: values.email.trim(),
      phone: values.phone.trim(),
      notes: values.notes?.trim() ?? '',
    }

    try {
      if (patient) {
        await updatePatient(patient.id, payload)
        toast.success('Paciente atualizado', {
          description: `${patient.name} · ${new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        })
      } else {
        await createPatient(payload)
        toast.success('Paciente cadastrado', {
          description: `${values.name} já está na ficha da clínica.`,
        })
      }
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof PatientFormValues, { message })
        }
        toast.error(error.message)
      } else {
        toast.error('Não foi possível salvar a ficha do paciente.')
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-[540px]">
        <SheetHeader className="border-b border-border px-5 py-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-primary">
            {patient ? 'Editar paciente' : 'Novo paciente'}
          </p>
          <SheetTitle className="display-title mt-1 text-[1.8rem] font-normal">
            {patient ? 'Atualize a ficha' : 'Quem vamos cuidar?'}
          </SheetTitle>
          <SheetDescription>
            Dados de contato e o dentista responsável pelo acompanhamento.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <FormSection title="Identificação">
              <Field label="Nome completo" error={errors.name?.message}>
                <Input
                  {...register('name')}
                  placeholder="Ex.: Ana Beatriz Souza"
                  autoFocus
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="E-mail" error={errors.email?.message}>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="ana@email.com"
                    aria-invalid={Boolean(errors.email)}
                  />
                </Field>
                <Field label="Telefone" error={errors.phone?.message}>
                  <Input
                    {...masked(register('phone'), formatPhone)}
                    placeholder="(11) 99999-0000"
                    inputMode="tel"
                    maxLength={15}
                    aria-invalid={Boolean(errors.phone)}
                  />
                </Field>
              </div>
              <Field
                label="Data de nascimento"
                error={errors.birthDate?.message}
              >
                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field }) => (
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      toDate={new Date()}
                      invalid={Boolean(errors.birthDate)}
                      placeholder="Selecione a data"
                    />
                  )}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Acompanhamento"
              description="Quem responde por este paciente na clínica."
            >
              <Field
                label="Dentista responsável"
                error={errors.dentistId?.message}
                hint={
                  !isOwner
                    ? 'Pacientes criados por você ficam vinculados à sua agenda.'
                    : undefined
                }
              >
                <Controller
                  control={control}
                  name="dentistId"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={!isOwner}
                    >
                      <SelectTrigger aria-invalid={Boolean(errors.dentistId)}>
                        <SelectValue placeholder="Selecione o dentista" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentistOptions.map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id}>
                            {dentist.name} · {dentist.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field
                label="Observações clínicas"
                optional
                hint="Alergias, preferências e pontos de atenção."
              >
                <Textarea
                  {...register('notes')}
                  placeholder="Ex.: alergia a látex; prefere horários pela manhã."
                  className="min-h-28"
                />
              </Field>
            </FormSection>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-[#F7FCFC] p-3.5">
              <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
                <CalendarDaysIcon className="size-4" />
              </span>
              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                O histórico de consultas é preservado mesmo quando o paciente é
                arquivado.
              </p>
            </div>
          </div>

          <SheetFooter className="border-t border-border bg-[#FBFEFE] px-5 py-4">
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </SheetClose>
              <Button type="submit" className="flex-1 gap-2">
                {patient ? (
                  <SaveIcon className="size-4" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
                {patient ? 'Salvar alterações' : 'Cadastrar paciente'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
