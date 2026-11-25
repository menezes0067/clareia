import { useEffect, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Building2Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CrownIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SaveIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StethoscopeIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clinicFormSchema, type ClinicFormValues } from '@/domain/schemas'
import { useClinic } from '@/data/clinic-provider'
import { ApiError } from '@/data/api-client'
import { useAuth } from '@/features/auth/auth-provider'
import { dentistRoleLabels, dentistToneLabels } from '@/domain/labels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { Field, FormSection } from '@/components/shared/form-field'
import { InitialsAvatar } from '@/components/shared/avatar'
import { RoleBadge } from '@/components/shared/status-badge'
import { formatCnpj, formatPhone } from '@/lib/format'
import { masked } from '@/lib/form'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { clinic, patients, dentists, appointments, updateClinic } = useClinic()
  const { dentist, isOwner, logout } = useAuth()
  const navigate = useNavigate()

  const defaults = useMemo<ClinicFormValues>(
    () => ({
      name: clinic.name,
      address: clinic.address,
      cnpj: clinic.cnpj,
      phone: clinic.phone,
      email: clinic.email,
    }),
    [clinic.address, clinic.cnpj, clinic.email, clinic.name, clinic.phone],
  )

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema) as Resolver<ClinicFormValues>,
    defaultValues: defaults,
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form

  useEffect(() => {
    reset(defaults)
  }, [defaults, reset])

  const onSubmit = async (values: ClinicFormValues) => {
    try {
      await updateClinic({
        name: values.name.trim(),
        address: values.address.trim(),
        cnpj: values.cnpj.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      })
      toast.success('Dados da clínica atualizados', {
        description: 'As alterações já aparecem em todo o sistema.',
      })
      reset(values)
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          form.setError(field as keyof ClinicFormValues, { message })
        }
        toast.error(error.message)
      } else {
        toast.error('Não foi possível atualizar os dados da clínica.')
      }
    }
  }

  if (!dentist) return null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configurações"
        title="Onde a clínica se organiza."
        description="Dados da clínica, resumo do espaço e detalhes da sua conta."
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="surface-card">
            <div className="flex items-start justify-between gap-3 border-b border-border p-5">
              <div>
                <p className="eyebrow">Clínica</p>
                <h2 className="mt-1 text-base font-semibold text-ink">
                  Identidade da clínica
                </h2>
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  {isOwner
                    ? 'Essas informações aparecem para toda a equipe.'
                    : 'Somente o dono da clínica pode alterar estes dados.'}
                </p>
              </div>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <Building2Icon className="size-4" />
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
              <FormSection title="Contato e endereço">
                <Field label="Nome da clínica" error={errors.name?.message}>
                  <Input
                    {...register('name')}
                    disabled={!isOwner}
                    aria-invalid={Boolean(errors.name)}
                  />
                </Field>
                <Field label="Endereço" error={errors.address?.message}>
                  <Input
                    {...register('address')}
                    disabled={!isOwner}
                    aria-invalid={Boolean(errors.address)}
                  />
                </Field>
                <Field label="CNPJ" error={errors.cnpj?.message}>
                  <Input
                    {...masked(register('cnpj'), formatCnpj)}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={18}
                    placeholder="12.345.678/0001-95"
                    disabled={!isOwner}
                    aria-invalid={Boolean(errors.cnpj)}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Telefone" error={errors.phone?.message}>
                    <Input
                      {...masked(register('phone'), formatPhone)}
                      inputMode="tel"
                      maxLength={15}
                      disabled={!isOwner}
                      aria-invalid={Boolean(errors.phone)}
                    />
                  </Field>
                  <Field label="E-mail" error={errors.email?.message}>
                    <Input
                      {...register('email')}
                      type="email"
                      disabled={!isOwner}
                      aria-invalid={Boolean(errors.email)}
                    />
                  </Field>
                </div>
              </FormSection>

              {isOwner ? (
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-[0.7rem] text-muted-foreground">
                    Alterações ficam disponíveis imediatamente para toda a equipe.
                  </p>
                  <Button
                    type="submit"
                    className="gap-1.5 rounded-full"
                    disabled={!isDirty}
                  >
                    <SaveIcon className="size-4" />
                    Salvar dados
                  </Button>
                </div>
              ) : null}
            </form>
          </div>

          <div className="surface-card">
            <div className="flex items-start justify-between gap-3 border-b border-border p-5">
              <div>
                <p className="eyebrow">Resumo</p>
                <h2 className="mt-1 text-base font-semibold text-ink">
                  Volume do seu espaço
                </h2>
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  Totais sincronizados com o servidor da clínica conforme o seu
                  perfil de acesso.
                </p>
              </div>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <ShieldCheckIcon className="size-4" />
              </span>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <SummaryStat
                icon={StethoscopeIcon}
                label="Dentistas"
                value={dentists.length}
              />
              <SummaryStat
                icon={CalendarClockIcon}
                label="Consultas"
                value={appointments.length}
              />
              <SummaryStat
                icon={CheckCircle2Icon}
                label="Pacientes"
                value={patients.length}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="surface-card p-5">
            <p className="eyebrow">Sua conta</p>
            <div className="mt-3 flex items-center gap-3">
              <InitialsAvatar
                name={dentist.name}
                tone={dentist.tone}
                size="lg"
              />
              <div className="min-w-0">
                <p
                  className="truncate text-[0.82rem] font-semibold text-ink"
                  title={dentist.name}
                >
                  {dentist.name}
                </p>
                <p
                  className="truncate text-[0.7rem] text-muted-foreground"
                  title={dentist.specialty}
                >
                  {dentist.specialty}
                </p>
                <div className="mt-1.5">
                  <RoleBadge role={dentist.role} />
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5">
              <AccountRow icon={MailIcon} label="E-mail" value={dentist.email} />
              <AccountRow
                icon={PhoneIcon}
                label="Telefone"
                value={formatPhone(dentist.phone)}
              />
              <AccountRow
                icon={ShieldCheckIcon}
                label="CRO"
                value={dentist.cro}
              />
              <AccountRow
                icon={Building2Icon}
                label="Perfil"
                value={dentistRoleLabels[dentist.role]}
              />
              {dentist.tone ? (
                <AccountRow
                  icon={SparklesIcon}
                  label="Cor na agenda"
                  value={dentistToneLabels[dentist.tone]}
                />
              ) : null}
            </dl>

            <Button
              variant="outline"
              className="mt-5 w-full gap-1.5 rounded-full"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              <LogOutIcon className="size-4" />
              Sair da conta
            </Button>
          </div>

          {isOwner ? (
            <div className="rounded-3xl border border-border bg-[linear-gradient(150deg,#F4FCFB,#EAF8F6)] p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-card text-[#DDA05F] shadow-sm">
                <CrownIcon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">
                Você é dono da clínica
              </p>
              <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
                Pode gerenciar toda a equipe, todos os pacientes e a agenda
                completa. Os dentistas veem apenas o próprio universo.
              </p>
            </div>
          ) : (
            <div className="surface-card p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-secondary text-primary">
                <MapPinIcon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">
                Endereço da clínica
              </p>
              <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
                {clinic.address}
              </p>
              <p className="mt-2 text-[0.72rem] text-muted-foreground">
                {formatCnpj(clinic.cnpj)}
              </p>
              <p className="mt-1 text-[0.72rem] text-muted-foreground">
                {formatPhone(clinic.phone)} · {clinic.email}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-[#FBFEFE] px-3.5 py-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-lg font-semibold leading-none text-ink">{value}</p>
      <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function AccountRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd
          className={cn('truncate text-[0.72rem] text-ink', className)}
          title={value}
        >
          {value}
        </dd>
      </div>
    </div>
  )
}
