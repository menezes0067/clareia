import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ShieldAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-provider'
import { Logo } from '@/components/shared/logo'

export function AccessDeniedPage() {
  const { isOwner, dentist } = useAuth()

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-5 py-16 text-center">
      <Logo className="mb-10" />
      <span className="inline-flex size-16 items-center justify-center rounded-3xl bg-rose-soft text-[#7D3441]">
        <ShieldAlertIcon className="size-7" strokeWidth={1.6} />
      </span>
      <p className="eyebrow mt-6">Acesso restrito</p>
      <h1 className="display-title mt-2 max-w-xl text-4xl text-ink sm:text-5xl">
        Esta parte da clínica é só do dono.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        {dentist?.name}, seu perfil como dentista tem acesso aos seus pacientes
        e à sua agenda. A gestão da equipe fica com a pessoa responsável pela
        clínica.
      </p>
      <Button asChild className="mt-7 gap-2 rounded-full">
        <Link to="/app">
          <ArrowLeftIcon className="size-4" />
          {isOwner ? 'Voltar para a visão geral' : 'Voltar para o meu painel'}
        </Link>
      </Button>
    </div>
  )
}
