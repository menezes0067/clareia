import { Link } from 'react-router-dom'
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CalendarCheck2Icon,
  LayoutDashboardIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react'
import { LandingNav } from './components/landing-nav'
import { HeroPreview } from './components/hero-preview'
import {
  FeaturesSection,
  FinalCtaSection,
  LandingFooter,
  ManifestoSection,
  PersonaSection,
  RoleSwitcherSection,
  StepsSection,
} from './landing-sections'
import { AvatarStack } from '@/components/shared/avatar-stack'
import { Reveal } from '@/components/shared/reveal'

const trustItems = [
  { icon: CalendarCheck2Icon, label: 'Agenda sem conflitos' },
  { icon: ShieldCheckIcon, label: 'Permissões por perfil' },
  { icon: LayoutDashboardIcon, label: 'Visão do dono' },
  { icon: RefreshCcwIcon, label: 'Reagendamento em 2 cliques' },
]

export function LandingPage() {
  return (
    <div className="overflow-x-clip bg-background">
      <LandingNav />

      <main>
        <section className="relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-40">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 landing-halo"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] dot-grid opacity-[0.45] [mask-image:radial-gradient(60%_70%_at_60%_20%,black,transparent)]"
          />
          <div className="container-page relative">
            <div className="grid items-center gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
              <div className="max-w-2xl">
                <Reveal>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#C3E9E7] bg-white/70 px-3.5 py-1.5 text-[0.66rem] font-medium text-[#0B565E] backdrop-blur">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                    </span>
                    Uma clínica demo pronta para explorar
                    <SparklesIcon className="size-3" />
                  </span>
                </Reveal>

                <Reveal delay={80}>
                  <h1 className="mt-6 font-display text-[3.15rem] leading-[0.95] tracking-[-0.035em] text-ink sm:text-[4.2rem] lg:text-[4.8rem] xl:text-[5.25rem]">
                    Sua clínica inteira em um só lugar, com a{' '}
                    <span className="relative inline-block italic text-primary">
                      calma
                      <svg
                        viewBox="0 0 200 20"
                        aria-hidden="true"
                        className="absolute -bottom-1 left-0 h-3 w-full text-[#B9E9DC]"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M3 13c45-9 100-10 194-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>{' '}
                    que o cuidado pede.
                  </h1>
                </Reveal>

                <Reveal delay={160}>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
                    Agenda, pacientes e equipe em um sistema que respeita o
                    ritmo da clínica. O dono enxerga tudo. Cada dentista cuida
                    do seu. Sem planilhas paralelas, sem ruído.
                  </p>
                </Reveal>

                <Reveal delay={240}>
                  <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <Link
                      to="/cadastro"
                      className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[0.82rem] font-semibold text-primary-foreground shadow-[0_20px_45px_-20px_rgba(13,124,134,0.75)] transition-all hover:-translate-y-0.5 hover:bg-[#0A6B74]"
                    >
                      Fazer parte da Clareia
                      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href="#sistema"
                      className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-white/60 px-5 text-[0.8rem] font-medium text-ink backdrop-blur transition-colors hover:bg-white"
                    >
                      Ver como funciona
                      <ArrowDownIcon className="size-3.5 text-muted-foreground" />
                    </a>
                  </div>
                  <Link
                    to="/login"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-1 py-0.5 text-[0.74rem] font-medium text-primary underline-offset-4 transition-colors hover:underline"
                  >
                    Já tem clínica? Entrar
                    <ArrowRightIcon className="size-3" />
                  </Link>
                </Reveal>

                <Reveal delay={320}>
                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <div className="flex items-center gap-2.5">
                      <AvatarStack />
                      <p className="text-[0.66rem] leading-tight text-muted-foreground">
                        <span className="block font-medium text-ink">
                          Marina, Rafael e Camila
                        </span>
                        já estão na clínica demo
                      </p>
                    </div>
                    <span className="hidden h-6 w-px bg-border sm:block" />
                    <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
                      sem backend · dados locais
                    </p>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={200} className="lg:pl-2">
                <HeroPreview />
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-y border-border/80 bg-white/60">
          <div className="container-page">
            <div className="grid grid-cols-2 divide-border/70 sm:grid-cols-4 sm:divide-x">
              {trustItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2.5 px-3 py-5 text-[0.68rem] font-medium text-muted-foreground sm:py-6"
                >
                  <item.icon className="size-4 text-primary" strokeWidth={1.7} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <RoleSwitcherSection />
        <PersonaSection />
        <FeaturesSection />
        <ManifestoSection />
        <StepsSection />
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
