import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRightIcon, MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'

const links = [
  { href: '#sistema', label: 'O sistema' },
  { href: '#para-quem', label: 'Para quem é' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#como-funciona', label: 'Como funciona' },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/80 bg-background/85 backdrop-blur-xl'
          : 'bg-transparent',
      )}
    >
      <div className="container-page flex h-[76px] items-center justify-between gap-4">
        <Link to="/" aria-label="Clareia — início" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação do site">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[0.76rem] font-medium text-muted-foreground transition-colors hover:bg-white/70 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className="hidden rounded-full px-4 text-[0.76rem] sm:inline-flex"
          >
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild className="hidden gap-1.5 rounded-full px-4 sm:inline-flex">
            <Link to="/cadastro">
              Fazer parte da Clareia
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/70 backdrop-blur lg:hidden"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent className="w-[300px] gap-0 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-full flex-col px-5 py-6">
            <Logo />
            <nav className="mt-8 flex flex-col gap-1" aria-label="Navegação mobile">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto space-y-2">
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild className="w-full gap-2 rounded-full">
                <Link to="/cadastro" onClick={() => setMobileOpen(false)}>
                  Fazer parte da Clareia
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
