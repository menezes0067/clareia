import { CheckIcon, SparklesIcon, StethoscopeIcon } from 'lucide-react'
import { AvatarStack } from '@/components/shared/avatar-stack'
import { OccupancyRing } from '@/components/shared/charts'
import { formatDayNumber, formatMonthShort, todayISO } from '@/lib/dates'
import { dentistTones } from '@/lib/tone'

const appointments = [
  {
    time: '09:00',
    duration: '45 min',
    patient: 'Ana Beatriz',
    type: 'Limpeza',
    dentist: 'Dra. Marina',
    tone: 'teal' as const,
    status: 'Confirmada',
    confirmed: true,
  },
  {
    time: '10:30',
    duration: '60 min',
    patient: 'Lucas Ferreira',
    type: 'Ortodontia',
    dentist: 'Dr. Rafael',
    tone: 'sky' as const,
    status: 'Agendada',
    confirmed: false,
  },
  {
    time: '13:30',
    duration: '90 min',
    patient: 'Helena Martins',
    type: 'Endodontia',
    dentist: 'Dra. Camila',
    tone: 'mint' as const,
    status: 'Confirmada',
    confirmed: true,
  },
  {
    time: '15:00',
    duration: '30 min',
    patient: 'Pedro Henrique',
    type: 'Retorno',
    dentist: 'Dra. Marina',
    tone: 'teal' as const,
    status: 'Agendada',
    confirmed: false,
  },
]

export function HeroPreview() {
  const today = todayISO()

  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_60%_30%,rgba(103,232,249,0.18),transparent_70%)]"
      />
      <svg
        viewBox="0 0 600 600"
        aria-hidden="true"
        className="absolute -right-12 -top-14 -z-10 size-[24rem] text-primary/15 sm:size-[28rem]"
      >
        <path
          d="M80 200c40 140 125 210 220 210s180-70 220-210"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="520" cy="196" r="5" fill="currentColor" />
      </svg>

      <div className="relative -rotate-[0.8deg] rounded-[2rem] border border-white bg-white p-2.5 shadow-[0_40px_100px_-40px_rgba(11,48,52,0.45)]">
        <div className="rounded-[1.55rem] border border-border/80 bg-[#F7FCFC] p-3.5 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#E38C99]/70" />
              <span className="size-2 rounded-full bg-[#F2C89B]" />
              <span className="size-2 rounded-full bg-[#66B894]/70" />
            </div>
            <span className="rounded-full border border-border bg-white px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-muted-foreground">
              clareia / agenda
            </span>
          </div>

          <div className="rounded-[1.25rem] border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
                  agenda de hoje
                </p>
                <p className="mt-1.5 flex items-baseline gap-2">
                  <span className="display-title text-[2.25rem] leading-none text-ink">
                    {formatDayNumber(today)}
                  </span>
                  <span className="text-[0.68rem] text-muted-foreground">
                    {formatMonthShort(today)}
                  </span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F6] px-2.5 py-1 text-[0.58rem] font-medium text-[#0B565E]">
                <span className="size-1.5 rounded-full bg-[#0D7C86]" />
                3 dentistas
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'consultas', value: '4' },
                { label: 'confirmadas', value: '2' },
                { label: 'livres', value: '2' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-[#F4FAFA] px-2.5 py-2"
                >
                  <p className="text-base font-semibold leading-none text-ink">
                    {item.value}
                  </p>
                  <p className="mt-1 font-mono text-[0.48rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5">
              {appointments.map((appointment) => {
                const tone = dentistTones[appointment.tone]
                return (
                  <div
                    key={appointment.time}
                    className="group flex items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-2 transition-colors hover:border-border hover:bg-[#FAFDFD]"
                  >
                    <span className="w-9 font-mono text-[0.58rem] font-medium text-muted-foreground">
                      {appointment.time}
                    </span>
                    <span className={`h-7 w-1 rounded-full ${tone.solid}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span className="truncate text-[0.72rem] font-semibold text-ink">
                          {appointment.patient}
                        </span>
                        <span className="truncate text-[0.55rem] text-muted-foreground">
                          {appointment.type}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[0.55rem] text-muted-foreground">
                        {appointment.dentist} · {appointment.duration}
                      </span>
                    </span>
                    <span
                      className={`hidden items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.48rem] font-medium sm:inline-flex ${
                        appointment.confirmed
                          ? 'bg-[#E8F7EF] text-[#27634D]'
                          : 'bg-[#F4FAFA] text-muted-foreground'
                      }`}
                    >
                      {appointment.confirmed ? (
                        <CheckIcon className="size-2.5" />
                      ) : null}
                      {appointment.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between rounded-[1.1rem] border border-border bg-white px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <AvatarStack />
              <div>
                <p className="text-[0.58rem] font-medium text-ink">
                  Equipe alinhada
                </p>
                <p className="text-[0.5rem] text-muted-foreground">
                  3 dentistas · 20 pacientes
                </p>
              </div>
            </div>
            <span className="font-mono text-[0.5rem] uppercase tracking-wider text-muted-foreground">
              semana 48
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -left-3 bottom-24 hidden w-[172px] animate-float-soft rounded-2xl border border-border bg-white/95 p-3.5 shadow-[0_20px_50px_-24px_rgba(13,124,134,0.5)] backdrop-blur sm:block">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#E8F7EF] text-[#27634D]">
            <CheckIcon className="size-3.5" />
          </span>
          <div>
            <p className="text-[0.6rem] font-semibold text-ink">
              Consulta confirmada
            </p>
            <p className="text-[0.5rem] text-muted-foreground">
              Ana · 09:00 com Marina
            </p>
          </div>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-3/4 rounded-full bg-[#66B894]" />
        </div>
      </div>

      <div className="absolute -right-3 top-20 hidden animate-[float-soft_8s_ease-in-out_infinite] items-center gap-2.5 rounded-2xl border border-border bg-white/95 px-3 py-2.5 shadow-[0_18px_40px_-24px_rgba(13,124,134,0.45)] backdrop-blur sm:flex">
        <div className="relative">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#E4F6F5] text-[#0B565E]">
            <StethoscopeIcon className="size-4" />
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-[#66B894]" />
        </div>
        <div>
          <p className="text-[0.6rem] font-semibold text-ink">Dra. Camila</p>
          <p className="text-[0.5rem] text-muted-foreground">
            3 consultas hoje
          </p>
        </div>
      </div>

      <div className="absolute -right-1 -bottom-10 hidden items-center gap-3 rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-[0_24px_60px_-30px_rgba(13,124,134,0.5)] backdrop-blur md:flex">
        <OccupancyRing value={82} size={64} stroke={6} label="semana" />
        <div>
          <p className="flex items-center gap-1 text-[0.64rem] font-semibold text-ink">
            <SparklesIcon className="size-3 text-primary" />
            Boa ocupação
          </p>
          <p className="mt-0.5 max-w-[120px] text-[0.52rem] leading-relaxed text-muted-foreground">
            A agenda da clínica está saudável nesta semana.
          </p>
        </div>
      </div>

      <div className="absolute -bottom-12 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur md:flex">
        <span className="size-1.5 rounded-full bg-primary" />
        visão do dono · tempo real
      </div>
    </div>
  )
}
