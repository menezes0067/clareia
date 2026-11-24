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
  CheckIcon,
  CrownIcon,
  LockKeyholeIcon,
  MailIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react'
import { loginSchema, type LoginFormValues, DEMO_PASSWORD } from '@/domain/schemas'
import { useAuth } from '@/features/auth/auth-provider'
import { useClinic } from '@/data/clinic-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/shared/logo'
import { InitialsAvatar } from '@/components/shared/avatar'
import { dentistRoleLabels } from '@/domain/labels'

export function LoginPage() {
  const { dentist, login } = useAuth()
  const { dentists } = useClinic()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const contaSugerida = searchParams.get('conta') ?? ''
  const from =
    (location.state as { from?: string } | null)?.from ?? '/app'
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: { email: contaSugerida, password: '' },
  })

  if (dentist) return <Navigate to={from} replace />

  const demoDentists = dentists
    .filter((member) => member.status === 'active')
    .sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0))
    .slice(0, 3)

  const onSubmit = (values: LoginFormValues) => {
    const result = login(values.email, values.password)
    if (!result.ok) {
      setServerError(result.error ?? 'Não foi possível entrar.')
      return
    }
    setServerError(null)
    navigate(from, { replace: true })
  }

  const enterDemo = (email: string) => {
    const result = login(email, DEMO_PASSWORD)
    if (result.ok) navigate(from, { replace: true })
    else setServerError(result.error ?? 'Não foi possível entrar.')
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
            Sua agenda, seus pacientes e sua equipe no mesmo lugar. Escolha uma
            conta demo para explorar em segundos.
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
                  placeholder="voce@clareia.app"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[0.78rem]">
                  Senha
                </Label>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  demo: {DEMO_PASSWORD}
                </span>
              </div>
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

            <Button type="submit" size="lg" className="w-full rounded-full">
              Entrar na clínica
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

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">
              ou explorar como
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            {demoDentists.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => enterDemo(member.email)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-white/80 p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#B9E9DC] hover:shadow-[0_12px_30px_-20px_rgba(13,124,134,0.5)]"
              >
                <InitialsAvatar name={member.name} tone={member.tone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[0.76rem] font-semibold text-ink">
                    {member.name}
                    {member.role === 'owner' ? (
                      <CrownIcon className="size-3 text-[#DDA05F]" />
                    ) : null}
                  </span>
                  <span className="block truncate text-[0.72rem] text-muted-foreground">
                    {member.role === 'owner'
                      ? 'Dono · vê a clínica inteira'
                      : `${member.specialty} · ${dentistRoleLabels[member.role]}`}
                  </span>
                </span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-secondary text-primary transition-transform group-hover:translate-x-0.5">
                  <ArrowRightIcon className="size-3.5" />
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            <ShieldCheckIcon className="size-3" />
            ambiente de demonstração · dados locais
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
            clareia · demonstração
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

          <div className="mt-10 max-w-md rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/50">
                hoje na clínica
              </p>
              <span className="flex items-center gap-1 rounded-full bg-[#67E8F9]/15 px-2 py-0.5 text-[0.55rem] text-[#CFF7FA]">
                <span className="size-1 rounded-full bg-[#67E8F9]" />
                ao vivo
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { time: '09:00', name: 'Ana Beatriz', label: 'Limpeza · Dra. Marina', tone: 'bg-[#0D7C86]' },
                { time: '10:30', name: 'Lucas Ferreira', label: 'Ortodontia · Dr. Rafael', tone: 'bg-[#3DAFC0]' },
                { time: '13:30', name: 'Helena Martins', label: 'Endodontia · Dra. Camila', tone: 'bg-[#66B894]' },
              ].map((item) => (
                <div
                  key={item.time}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.055] px-3 py-2.5"
                >
                  <span className="font-mono text-[0.7rem] text-white/55">
                    {item.time}
                  </span>
                  <span className={`size-1.5 rounded-full ${item.tone}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.72rem] font-medium text-white">
                      {item.name}
                    </span>
                    <span className="block text-[0.72rem] text-white/45">
                      {item.label}
                    </span>
                  </span>
                  <CheckIcon className="size-3.5 text-[#67E8F9]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-8">
          <p className="max-w-sm text-[0.7rem] leading-relaxed text-white/45">
            Um projeto de demonstração com dados fictícios. Nenhum paciente real
            foi convidado para esta agenda.
          </p>
        </div>
      </aside>
    </div>
  )
}
