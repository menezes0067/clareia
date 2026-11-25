import { useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarCheck2Icon,
  LockKeyholeIcon,
  MailIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/domain/schemas'
import { useAuth } from '@/features/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/shared/logo'

export function LoginPage() {
  const { dentist, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const contaSugerida = searchParams.get('conta') ?? ''
  const from =
    (location.state as { from?: string } | null)?.from ?? '/app'
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: { email: contaSugerida, password: '' },
  })

  if (dentist) return <Navigate to={from} replace />

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    try {
      const result = await login(values.email, values.password)
      if (!result.ok) {
        setServerError(result.error ?? 'Não foi possível entrar.')
        return
      }
      setServerError(null)
      navigate(from, { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative flex min-h-svh flex-col overflow-hidden px-5 py-6 sm:px-10 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 landing-halo opacity-70"
        />
        <div className="relative flex items-center justify-between">
          <Link to="/" aria-label="Voltar para o site da Clareia">
            <Logo />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="size-3.5" />
            Voltar ao site
          </Link>
        </div>

        <div className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <p className="eyebrow">Bem-vindo de volta</p>
          <h1 className="display-title mt-2 text-[3rem] text-ink sm:text-[3.5rem]">
            Entre na sua <span className="italic text-primary">clínica</span>.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sua agenda, seus pacientes e sua equipe no mesmo lugar. Informe seu
            e-mail e senha cadastrados para acessar.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[0.78rem]">
                E-mail
              </Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@suaclinica.com.br"
                  className="pl-9"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email ? (
                <p className="text-[0.72rem] text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[0.78rem]">
                Senha
              </Label>
              <div className="relative">
                <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  {...form.register('password')}
                />
              </div>
              {form.formState.errors.password ? (
                <p className="text-[0.72rem] text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div
                role="alert"
                className="rounded-xl border border-[#F3CFD4] bg-[#FDF5F6] px-3 py-2.5 text-[0.72rem] text-[#7D3441]"
              >
                {serverError}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={submitting}
            >
              {submitting ? 'Entrando...' : 'Entrar na clínica'}
              <ArrowRightIcon className="size-4" />
            </Button>
            <p className="pt-1 text-center text-[0.72rem] text-muted-foreground">
              Ainda não tem clínica?{' '}
              <Link
                to="/cadastro"
                className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
              >
                Cadastre a sua em 2 passos
              </Link>
            </p>
          </form>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-center font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            <ShieldCheckIcon className="size-3" />
            acesso seguro por perfil · clareia
          </p>
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
            clareia · gestão odontológica
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-white/60">
            2026
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
          <p className="max-w-md font-display text-[2.6rem] leading-[1.05] tracking-[-0.02em] text-white xl:text-[3.2rem]">
            A agenda lembra.
            <br />
            <span className="italic text-[#67E8F9]">A gente cuida</span> do
            resto.
          </p>

          <div className="mt-10 max-w-md space-y-2.5 rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#67E8F9]">
                <CalendarCheck2Icon className="size-4" />
              </span>
              <div>
                <p className="text-[0.76rem] font-medium text-white">
                  Agenda sem conflitos
                </p>
                <p className="mt-0.5 text-[0.7rem] leading-relaxed text-white/55">
                  Validação automática de sobreposições por dentista e por
                  paciente.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/10 pt-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#67E8F9]">
                <UsersIcon className="size-4" />
              </span>
              <div>
                <p className="text-[0.76rem] font-medium text-white">
                  Isolamento por clínica e perfil
                </p>
                <p className="mt-0.5 text-[0.7rem] leading-relaxed text-white/55">
                  O dono acompanha toda a clínica; cada dentista acessa apenas a
                  própria agenda e seus pacientes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-8">
          <p className="max-w-sm text-[0.7rem] leading-relaxed text-white/45">
            Clareia — plataforma de gestão odontológica para clínicas e equipes.
          </p>
        </div>
      </aside>
    </div>
  )
}
