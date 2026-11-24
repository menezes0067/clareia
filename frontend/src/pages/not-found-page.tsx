import { Link } from 'react-router-dom'
import { HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/logo'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-16 text-center">
      <Logo className="mb-12" />
      <p className="eyebrow">Erro 404</p>
      <h1 className="display-title mt-2 text-5xl text-ink sm:text-7xl">
        Essa página não está na agenda.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        O endereço existe no nosso sistema, mas não nesta demonstração. Volte
        para a clínica e continue de onde parou.
      </p>
      <div className="mt-7 flex gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/">Ver o site</Link>
        </Button>
        <Button asChild className="gap-2 rounded-full">
          <Link to="/app">
            <HomeIcon className="size-4" />
            Abrir a clínica
          </Link>
        </Button>
      </div>
    </div>
  )
}
