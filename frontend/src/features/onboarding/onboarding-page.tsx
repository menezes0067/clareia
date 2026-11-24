import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Building2Icon,
  CheckIcon,
  KeyRoundIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StethoscopeIcon,
  UserRoundIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DEMO_PASSWORD,
  onboardingSchema,
  type OnboardingFormValues,
} from '@/domain/schemas'
import { useClinic } from '@/data/clinic-provider'
import { useAuth } from '@/features/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FormSection } from '@/components/shared/form-field'
import { Logo } from '@/components/shared/logo'
import { formatCnpj, formatCro, formatPhone } from '@/lib/format'
import { masked } from '@/lib/form'
import { cn } from '@/lib/utils'

const OWNER_FIELDS = [
  'owner.name',
  'owner.email',
  'owner.phone',
  'owner.cro',
  'owner.specialty',
] as const

export function OnboardingPage() {
  const { dentist, signIn } = useAuth()
  const { createClinic } = useClinic()
  const navigate = useNavigate()
  const [step, setStep] = useState<0 | 1>(0)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema) as Resolver<OnboardingFormValues>,
    mode: 'onBlur',
    defaultValues: {
      owner: { name: '', email: '', phone: '', cro: '', specialty: '' },
      clinic: { name: '', address: '', cnpj: '', phone: '', email: '' },
    },
  })

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = form
  const watched = useWatch({ control: form.control })

  if (dentist) return <Navigate to="/app" replace />

  const goToClinic = async () => {
    const valid = await trigger(OWNER_FIELDS)
    if (valid) setStep(1)
  }

  const onSubmit = (values: OnboardingFormValues) => {
    const owner = createClinic({
      owner: {
        name: values.owner.name.trim(),
        email: values.owner.email.trim(),
        phone: values.owner.phone.trim(),
        cro: values.owner.cro.trim(),
        specialty: values.owner.specialty.trim(),
        bio: '',
      },
      clinic: {
        name: values.clinic.name.trim(),
        address: values.clinic.address.trim(),
        cnpj: values.clinic.cnpj.trim(),
        phone: values.clinic.phone.trim(),
        email: values.clinic.email.trim(),
      },
    })
    signIn(owner.id)
    toast.success('Clínica criada com sucesso', {
      description: 'Seu espaço já está pronto. Bem-vinda à Clareia!',
    })
    navigate('/app', { replace: true })
  }

  const owner = watched.owner ?? {}
  const clinic = watched.clinic ?? {}

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative flex min-h-svh flex-col overflow-hidden px-5 py-6 sm:px-10 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 landing-halo opacity-70"
        />
        <div className="relative flex items-center justify-between gap-4">
          <Link to="/" aria-label="Voltar para o site da Clareia">
            <Logo />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Já tem clínica? Entrar
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <div className="relative mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center py-10 sm:py-12">
          <div className="flex items-center gap-3" aria-label="Etapas do cadastro">
            {[
              { label: 'Sua conta', icon: UserRoundIcon },
              { label: 'Sua clínica', icon: Building2Icon },
            ].map((item, index) => {
              const active = step === index
              const done = step > index
              return (
                <div key={item.label} className="flex flex-1 items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      aria-current={active ? 'step' : undefined}
                      className={cn(
                        'inline-flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[0.7rem] transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : done
                            ? 'border-[#B9E9DC] bg-[#E8F8F4] text-[#0B766F]'
                            : 'border-border bg-white text-muted-foreground',
                      )}
                    >
                      {done ? (
                        <CheckIcon className="size-3.5" />
                      ) : (
                        <item.icon className="size-3.5" />
                      )}
                    </span>
                    <span
                      className={cn(
                        'whitespace-nowrap text-[0.7rem] font-medium',
                        active ? 'text-ink' : 'text-muted-foreground',
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {index === 0 ? (
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  ) : null}
                </div>
              )
            })}
          </div>

          {step === 0 ? (
            <div className="mt-8">
              <p className="eyebrow">Etapa 1 de 2</p>
              <h1 className="display-title mt-2 text-[2.6rem] leading-[1.05] text-ink sm:text-[3.2rem]">
                Primeiro, <span className="italic text-primary">você.</span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Cadastre a dona da clínica. Depois você informa os dados da
                clínica e entra direto no sistema.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void goToClinic()
                }}
                noValidate
                className="mt-7 surface-card p-5 shadow-[0_18px_50px_-40px_rgba(13,124,134,0.45)] sm:p-6"
              >
                <FormSection
                  title="Seus dados profissionais"
                  description="Aparecem na equipe e na identificação da sua conta."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Nome completo"
                      htmlFor="owner-name"
                      error={errors.owner?.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="owner-name"
                        autoComplete="name"
                        placeholder="Dra. Marina Prado"
                        aria-invalid={Boolean(errors.owner?.name)}
                        {...register('owner.name')}
                      />
                    </Field>
                    <Field
                      label="E-mail"
                      htmlFor="owner-email"
                      error={errors.owner?.email?.message}
                      className="sm:col-span-2"
                    >
                      <div className="relative">
                        <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="owner-email"
                          type="email"
                          autoComplete="email"
                          placeholder="voce@clareia.app"
                          className="pl-9"
                          aria-invalid={Boolean(errors.owner?.email)}
                          {...register('owner.email')}
                        />
                      </div>
                    </Field>
                    <Field
                      label="Telefone"
                      htmlFor="owner-phone"
                      error={errors.owner?.phone?.message}
                    >
                      <div className="relative">
                        <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="owner-phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="(11) 99812-4401"
                          className="pl-9"
                          inputMode="tel"
                          maxLength={15}
                          aria-invalid={Boolean(errors.owner?.phone)}
                          {...masked(register('owner.phone'), formatPhone)}
                        />
                      </div>
                    </Field>
                    <Field
                      label="CRO"
                      htmlFor="owner-cro"
                      error={errors.owner?.cro?.message}
                    >
                      <Input
                        id="owner-cro"
                        placeholder="CRO-SP 48.210"
                        aria-invalid={Boolean(errors.owner?.cro)}
                        {...masked(register('owner.cro'), formatCro)}
                      />
                    </Field>
                    <Field
                      label="Especialidade"
                      htmlFor="owner-specialty"
                      error={errors.owner?.specialty?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="owner-specialty"
                        placeholder="Clínica geral & estética"
                        aria-invalid={Boolean(errors.owner?.specialty)}
                        {...register('owner.specialty')}
                      />
                    </Field>
                  </div>
                </FormSection>

                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-border bg-[#FBFEFE] p-3">
                  <KeyRoundIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
                    Como esta é uma demonstração, sua senha de acesso será{' '}
                    <span className="font-mono font-semibold text-ink">
                      {DEMO_PASSWORD}
                    </span>
                    . Sem autenticação real ou dados de pacientes reais.
                  </p>
                </div>

                <Button type="submit" size="lg" className="mt-5 w-full rounded-full">
                  Cadastrar dona e continuar
                  <ArrowRightIcon className="size-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="mt-8">
              <p className="eyebrow">Etapa 2 de 2</p>
              <h1 className="display-title mt-2 text-[2.6rem] leading-[1.05] text-ink sm:text-[3.2rem]">
                Agora, sua{' '}
                <span className="italic text-primary">clínica.</span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {owner.name
                  ? `${owner.name.split(' ')[0]}, falta pouco. `
                  : ''}
                Os dados abaixo identificam a clínica em toda a aplicação e
                podem ser editados depois em Configurações.
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="mt-7 surface-card p-5 shadow-[0_18px_50px_-40px_rgba(13,124,134,0.45)] sm:p-6"
              >
                <FormSection
                  title="Identidade da clínica"
                  description="Usada na barra lateral, no dashboard e nos formulários."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Nome da clínica"
                      htmlFor="clinic-name"
                      error={errors.clinic?.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="clinic-name"
                        placeholder="Clareia Odontologia"
                        aria-invalid={Boolean(errors.clinic?.name)}
                        {...register('clinic.name')}
                      />
                    </Field>
                    <Field
                      label="CNPJ"
                      htmlFor="clinic-cnpj"
                      error={errors.clinic?.cnpj?.message}
                      hint="Dígitos verificadores são conferidos."
                    >
                      <Input
                        id="clinic-cnpj"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={18}
                        placeholder="12.345.678/0001-95"
                        aria-invalid={Boolean(errors.clinic?.cnpj)}
                        {...masked(register('clinic.cnpj'), formatCnpj)}
                      />
                    </Field>
                    <Field
                      label="Endereço"
                      htmlFor="clinic-address"
                      error={errors.clinic?.address?.message}
                      className="sm:col-span-2"
                    >
                      <div className="relative">
                        <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="clinic-address"
                          autoComplete="street-address"
                          placeholder="Rua das Acácias, 128 — São Paulo"
                          className="pl-9"
                          aria-invalid={Boolean(errors.clinic?.address)}
                          {...register('clinic.address')}
                        />
                      </div>
                    </Field>
                    <Field
                      label="Telefone da clínica"
                      htmlFor="clinic-phone"
                      error={errors.clinic?.phone?.message}
                    >
                      <Input
                        id="clinic-phone"
                        type="tel"
                        placeholder="(11) 3082-4410"
                        inputMode="tel"
                        maxLength={15}
                        aria-invalid={Boolean(errors.clinic?.phone)}
                        {...masked(register('clinic.phone'), formatPhone)}
                      />
                    </Field>
                    <Field
                      label="E-mail de contato"
                      htmlFor="clinic-email"
                      error={errors.clinic?.email?.message}
                    >
                      <Input
                        id="clinic-email"
                        type="email"
                        placeholder="ola@clareia.app"
                        aria-invalid={Boolean(errors.clinic?.email)}
                        {...register('clinic.email')}
                      />
                    </Field>
                  </div>
                </FormSection>

                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-border bg-[#FBFEFE] p-3">
                  <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
                    Tudo fica salvo apenas neste navegador. Você poderá
                    cadastrar dentistas, pacientes e consultas em seguida.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                  <Button type="submit" size="lg" className="flex-1 rounded-full">
                    Criar clínica e entrar
                    <ArrowRightIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="rounded-full"
                    onClick={() => setStep(0)}
                  >
                    <ArrowLeftIcon className="size-4" />
                    Voltar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-[#0B3034] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 dot-grid opacity-[0.12]" />
        <div className="absolute -right-40 -top-40 size-[32rem] rounded-full bg-[#0D7C86]/40 blur-3xl" />
        <div className="absolute -bottom-52 -left-32 size-[30rem] rounded-full bg-[#67E8F9]/10 blur-3xl" />
        <svg
          viewBox="0 0 600 600"
          className="absolute -right-24 top-1/2 size-[34rem] -translate-y-1/2 text-[#67E8F9]/20"
          aria-hidden="true"
        >
          <path
            d="M90 210c40 130 120 196 210 196s170-66 210-196"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="505" cy="205" r="7" fill="currentColor" />
          <circle cx="95" cy="205" r="4" fill="currentColor" />
        </svg>

        <div className="relative z-10 flex items-center justify-between px-10 pt-8">
          <span className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#CFF7FA]/70">
            <SparklesIcon className="size-3.5" />
            clareia · novo começo
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-white/60">
            2026
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
          <p className="max-w-md font-display text-[2.6rem] leading-[1.05] tracking-[-0.02em] text-white xl:text-[3.2rem]">
            Sua clínica ganha forma
            <br />
            <span className="italic text-[#67E8F9]">em dois passos.</span>
          </p>

          <div className="mt-9 max-w-md rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/50">
                prévia da ficha
              </p>
              <span className="flex items-center gap-1 rounded-full bg-[#67E8F9]/15 px-2 py-0.5 text-[0.55rem] text-[#CFF7FA]">
                <span className="size-1 rounded-full bg-[#67E8F9]" />
                ao vivo
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#67E8F9]">
                <UserRoundIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.78rem] font-medium text-white" title={owner.name || 'Nome da dona'}>{owner.name || 'Nome da dona'}</p>
                <p className="truncate text-[0.7rem] text-white/45">
                  {owner.specialty || 'Especialidade'} · {owner.cro || 'CRO'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#67E8F9]">
                <Building2Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.82rem] font-semibold text-white" title={clinic.name || 'Nome da clínica'}>{clinic.name || 'Nome da clínica'}</p>
                <p className="mt-0.5 flex items-start gap-1.5 text-[0.72rem] leading-relaxed text-white/50">
                  <MapPinIcon className="mt-0.5 size-3 shrink-0" />
                  <span>
                    {clinic.address || 'Endereço da clínica'}
                  </span>
                </p>
                <p className="mt-1 font-mono text-[0.7rem] text-white/45">
                  CNPJ {clinic.cnpj ? formatCnpj(clinic.cnpj) : '—'}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-white/45">
                  <span className="inline-flex items-center gap-1">
                    <PhoneIcon className="size-3" />
                    {clinic.phone ? formatPhone(clinic.phone) : 'Telefone'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MailIcon className="size-3" />
                    <span className="max-w-[10rem] truncate" title={clinic.email || 'E-mail'}>{clinic.email || 'E-mail'}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/[0.055] px-3 py-2.5 text-[0.7rem] text-white/55">
              <StethoscopeIcon className="size-3.5 shrink-0 text-[#67E8F9]" />
              <span>
                Pacientes, agenda e equipe entram vazios — prontos para o seu
                cadastro.
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-8">
          <p className="max-w-sm text-[0.7rem] leading-relaxed text-white/45">
            Um projeto de demonstração com dados fictícios. Nenhum paciente real
            foi convidado para esta clínica.
          </p>
        </div>
      </aside>
    </div>
  )
}
