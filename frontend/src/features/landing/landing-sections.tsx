import { useState, type ComponentType, type ReactNode } from 'react'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  CheckIcon,
  CircleSlash2Icon,
  CrownIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StethoscopeIcon,
  UsersIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { InitialsAvatar } from '@/components/shared/avatar'
import { AppointmentStatusBadge } from '@/components/shared/status-badge'
import { OccupancyRing, WeeklyBars } from '@/components/shared/charts'

type RoleView = 'owner' | 'dentist'

const roleContent = {
  owner: {
    label: 'Visão do dono',
    title: 'A clínica inteira, sem ruído.',
    description:
      'Marina enxerga cada dentista, cada paciente e a agenda completa. Decide com contexto, não com achismo.',
    allowed: [
      'Todos os pacientes da clínica',
      'Todos os dentistas e suas agendas',
      'Reatribuir responsáveis e cadastrar a equipe',
      'Dashboard com a saúde da operação',
    ],
    denied: [],
    clinicLabel: 'Clínica inteira',
    stats: [
      { label: 'pacientes', value: '20' },
      { label: 'dentistas', value: '3' },
      { label: 'hoje', value: '9' },
    ],
  },
  dentist: {
    label: 'Visão do dentista',
    title: 'Só o que importa para o seu dia.',
    description:
      'Rafael vê a própria agenda e os próprios pacientes. O resto da clínica continua privado — sem excesso, sem distração.',
    allowed: [
      'Seus pacientes e as fichas deles',
      'Sua agenda e seus reagendamentos',
      'Cadastro de novos pacientes para si',
      'Seus indicadores da semana',
    ],
    denied: [
      'Pacientes de outros dentistas',
      'Equipe e permissões da clínica',
    ],
    clinicLabel: 'Meu painel',
    stats: [
      { label: 'pacientes', value: '6' },
      { label: 'dentista', value: '1' },
      { label: 'hoje', value: '3' },
    ],
  },
}

export function RoleSwitcherSection() {
  const [role, setRole] = useState<RoleView>('owner')
  const content = roleContent[role]

  return (
    <section id="sistema" className="relative border-y border-border/80 bg-white/60">
      <div className="container-page py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">O sistema</p>
          <h2 className="display-title text-4xl text-ink sm:text-5xl lg:text-[3.4rem]">
            Uma clínica. Dois acessos.
            <br />
            <span className="italic text-primary">Zero confusão.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Cada pessoa entra e encontra exatamente o que precisa — nada mais,
            nada menos. Alterne a visão e veja a diferença.
          </p>
        </div>

        <div className="mt-10 rounded-[2.2rem] border border-border bg-white p-2 shadow-[0_30px_80px_-50px_rgba(13,124,134,0.45)] sm:p-2.5 lg:mt-12">
          <div className="grid overflow-hidden rounded-[1.8rem] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div
                className="inline-flex rounded-full border border-border bg-[#F7FCFC] p-1"
                role="tablist"
                aria-label="Alternar visão de perfil"
              >
                {(['owner', 'dentist'] as RoleView[]).map((option) => (
                  <button
                    key={option}
                    id={`aba-${option}`}
                    type="button"
                    role="tab"
                    aria-controls={`painel-${option}`}
                    aria-selected={role === option}
                    onClick={() => setRole(option)}
                    className={`rounded-full px-4 py-2 text-[0.68rem] font-medium transition-all ${
                      role === option
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-ink'
                    }`}
                  >
                    {option === 'owner' ? 'Dono' : 'Dentista'}
                  </button>
                ))}
              </div>

              <div
                key={role}
                id={`painel-${role}`}
                role="tabpanel"
                aria-labelledby={`aba-${role}`}
                className="animate-rise-in"
              >
                <p className="mt-8 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-primary">
                  {content.label}
                </p>
                <h3 className="mt-2 font-display text-[2rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[2.4rem]">
                  {content.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {content.description}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {content.allowed.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[0.8rem] text-ink"
                    >
                      <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#E8F7EF] text-[#27634D]">
                        <CheckIcon className="size-2.5" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                  {content.denied.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[0.8rem] text-muted-foreground"
                    >
                      <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <LockKeyholeIcon className="size-2.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 flex items-start gap-2 rounded-2xl bg-[#F4FAFA] p-3.5 text-[0.68rem] leading-relaxed text-muted-foreground">
                <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                O acesso é definido pelo perfil. O sistema bloqueia de verdade,
                não só esconde o botão.
              </p>
            </div>

            <div className="relative overflow-hidden border-t border-border bg-[#F2FAF9] p-4 sm:p-6 lg:border-l lg:border-t-0">
              <div
                aria-hidden="true"
                className="absolute inset-0 dot-grid opacity-30"
              />
              <div
                key={role}
                className="relative animate-rise-in rounded-[1.4rem] border border-border bg-white p-4 shadow-[0_20px_50px_-40px_rgba(13,124,134,0.5)] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <InitialsAvatar
                      name={role === 'owner' ? 'Marina Prado' : 'Rafael Nunes'}
                      tone={role === 'owner' ? 'teal' : 'sky'}
                      size="sm"
                    />
                    <div>
                      <p className="text-[0.74rem] font-semibold text-ink">
                        {role === 'owner' ? 'Bom dia, Marina' : 'Bom dia, Rafael'}
                      </p>
                      <p className="text-[0.58rem] text-muted-foreground">
                        {role === 'owner'
                          ? 'Dona da clínica'
                          : 'Ortodontia · CRO-SP 51.932'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-border bg-[#F7FCFC] px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {content.clinicLabel}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {content.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border/70 bg-[#FAFDFD] px-2.5 py-2.5"
                    >
                      <p className="text-lg font-semibold leading-none text-ink">
                        {stat.value}
                      </p>
                      <p className="mt-1 font-mono text-[0.48rem] uppercase tracking-[0.12em] text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {role === 'owner' ? <OwnerMock /> : <DentistMock />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function OwnerMock() {
  const team = [
    { name: 'Dra. Marina', specialty: 'Clínica geral', patients: 6, value: 82, tone: 'teal' as const },
    { name: 'Dr. Rafael', specialty: 'Ortodontia', patients: 6, value: 64, tone: 'sky' as const },
    { name: 'Dra. Camila', specialty: 'Endodontia', patients: 6, value: 71, tone: 'mint' as const },
  ]
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-muted-foreground">
          equipe · ocupação da semana
        </p>
        <span className="text-[0.55rem] text-primary">ver tudo</span>
      </div>
      {team.map((member) => (
        <div
          key={member.name}
          className="flex items-center gap-3 rounded-xl border border-border/70 px-2.5 py-2"
        >
          <InitialsAvatar name={member.name} tone={member.tone} size="xs" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[0.66rem] font-medium text-ink">
                {member.name}
              </p>
              <span className="font-mono text-[0.52rem] text-muted-foreground">
                {member.value}%
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${member.value}%` }}
              />
            </div>
            <p className="mt-1 text-[0.5rem] text-muted-foreground">
              {member.specialty} · {member.patients} pacientes
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function DentistMock() {
  const agenda = [
    { time: '09:00', name: 'Lucas Ferreira', type: 'Ortodontia', status: 'confirmed' as const },
    { time: '11:00', name: 'Juliana Castro', type: 'Avaliação', status: 'scheduled' as const },
    { time: '14:30', name: 'Thiago Mendes', type: 'Manutenção', status: 'confirmed' as const },
  ]
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between px-1">
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-muted-foreground">
          sua agenda · hoje
        </p>
        <span className="text-[0.55rem] text-primary">abrir agenda</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {agenda.map((item) => (
          <div
            key={item.time}
            className="flex items-center gap-2.5 rounded-xl border border-border/70 px-2.5 py-2"
          >
            <span className="font-mono text-[0.55rem] text-muted-foreground">
              {item.time}
            </span>
            <span className="h-6 w-0.5 rounded-full bg-[#3DAFC0]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.66rem] font-medium text-ink">
                {item.name}
              </p>
              <p className="text-[0.5rem] text-muted-foreground">{item.type}</p>
            </div>
            <AppointmentStatusBadge
              status={item.status}
              showDot={false}
              className="px-1.5 py-0.5 text-[0.46rem]"
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FDF1E4] px-3 py-2 text-[0.55rem] text-[#7A5327]">
        <LockKeyholeIcon className="size-3" />
        A agenda de outros dentistas não aparece aqui.
      </div>
    </div>
  )
}

export function PersonaSection() {
  return (
    <section id="para-quem" className="container-page py-20 sm:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Para quem é</p>
          <h2 className="display-title text-4xl text-ink sm:text-5xl">
            Feito para quem cuida
            <br />
            <span className="italic text-primary">e para quem lidera.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          A mesma clínica, dois olhares. A Clareia organiza o acesso para que
          cada pessoa veja só o que faz sentido para o seu papel.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <PersonaCard
          icon={CrownIcon}
          label="Para o dono"
          title="Clareza para decidir."
          description="Enxergue a clínica como um todo: quem está atendendo, quais pacientes precisam de atenção e como a semana está se desenhando."
          items={[
            'Cadastre e gerencie toda a equipe',
            'Veja e edite qualquer paciente',
            'Acompanhe a ocupação e os retornos',
            'Reatribua pacientes entre dentistas',
          ]}
          cta="Entrar como dona"
          href="/login?conta=marina@clareia.app"
          tone="teal"
        />
        <PersonaCard
          icon={StethoscopeIcon}
          label="Para cada dentista"
          title="Foco no próprio cuidado."
          description="Uma agenda pessoal, uma lista de pacientes só sua e a tranquilidade de saber que o resto da clínica continua privado."
          items={[
            'Gerencie apenas os seus pacientes',
            'Agende, confirme e reagende consultas',
            'Registre observações clínicas',
            'Sem acesso à equipe ou a outros dentistas',
          ]}
          cta="Entrar como dentista"
          href="/login?conta=rafael@clareia.app"
          tone="sky"
        />
      </div>
    </section>
  )
}

function PersonaCard({
  icon: Icon,
  label,
  title,
  description,
  items,
  cta,
  href,
  tone,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  title: string
  description: string
  items: string[]
  cta: string
  href: string
  tone: 'teal' | 'sky'
}) {
  const toneClasses =
    tone === 'teal'
      ? 'bg-[#E4F6F5] text-[#0B565E]'
      : 'bg-[#E2F5F9] text-[#0E5D6B]'
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-45px_rgba(13,124,134,0.5)] sm:p-8">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 size-44 rounded-full bg-[#F2FAF9] transition-transform duration-500 group-hover:scale-125"
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className={`inline-flex size-11 items-center justify-center rounded-2xl ${toneClasses}`}>
            <Icon className="size-5" strokeWidth={1.7} />
          </span>
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </span>
        </div>
        <h3 className="mt-6 font-display text-[2rem] leading-none tracking-[-0.02em] text-ink">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[0.72rem] leading-relaxed text-ink"
            >
              <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={href}
          className="mt-6 inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-primary transition-colors hover:text-[#0B565E]"
        >
          {cta}
          <ArrowUpRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section id="recursos" className="border-y border-border/80 bg-white/60">
      <div className="container-page py-20 sm:py-24 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Recursos</p>
          <h2 className="display-title text-4xl text-ink sm:text-5xl">
            Menos abas abertas.
            <br />
            <span className="italic text-primary">Mais cuidado presente.</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            As ferramentas essenciais de uma clínica odontológica, desenhadas
            para conversar entre si.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <FeatureAgenda />
          <FeaturePermissions />
          <FeaturePatients />
          <FeatureDashboard />
        </div>
      </div>
    </section>
  )
}

function FeatureAgenda() {
  const columns = [
    { day: 'seg', items: [{ top: 4, label: 'Ana · limpeza', tone: 'bg-[#E4F6F5] text-[#0B565E]' }, { top: 42, label: 'Pedro · retorno', tone: 'bg-[#E4F6F5] text-[#0B565E]' }] },
    { day: 'ter', items: [{ top: 16, label: 'Lucas · orto', tone: 'bg-[#E2F5F9] text-[#0E5D6B]' }, { top: 58, label: 'Sofia · avaliação', tone: 'bg-[#E2F5F9] text-[#0E5D6B]' }] },
    { day: 'qua', items: [{ top: 8, label: 'Helena · canal', tone: 'bg-[#E8F7EF] text-[#27634D]' }, { top: 48, label: 'Marcelo · retorno', tone: 'bg-[#E4F6F5] text-[#0B565E]' }] },
    { day: 'qui', items: [{ top: 30, label: 'Isabela · avaliação', tone: 'bg-[#E8F7EF] text-[#27634D]' }, { top: 68, label: 'Gustavo · limpeza', tone: 'bg-[#E2F5F9] text-[#0E5D6B]' }] },
    { day: 'sex', items: [{ top: 12, label: 'Renata · clareamento', tone: 'bg-[#E4F6F5] text-[#0B565E]' }, { top: 54, label: 'Caio · retorno', tone: 'bg-[#E8F7EF] text-[#27634D]' }] },
  ]
  return (
    <RevealCard className="lg:col-span-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <FeatureIcon icon={CalendarRangeIcon} />
          <h3 className="mt-5 font-display text-[1.8rem] leading-none text-ink">
            Agenda que se defende sozinha
          </h3>
          <p className="mt-2.5 text-[0.8rem] leading-relaxed text-muted-foreground">
            Ao agendar, a Clareia avisa se o dentista ou o paciente já têm algo
            naquele horário. Reagendar é um clique, não uma negociação.
          </p>
        </div>
        <div className="w-full max-w-[280px] shrink-0 rounded-2xl border border-border bg-[#FAFDFD] p-2.5">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-muted-foreground">
              semana · novembro
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[0.46rem] text-primary">
              sem conflitos
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {columns.map((column) => (
              <div key={column.day}>
                <p className="mb-1 text-center font-mono text-[0.46rem] uppercase text-muted-foreground">
                  {column.day}
                </p>
                <div className="relative h-[92px] rounded-lg bg-white/80">
                  <div className="absolute inset-0 flex flex-col justify-evenly px-1">
                    {[0, 1, 2].map((line) => (
                      <span key={line} className="h-px w-full bg-border/50" />
                    ))}
                  </div>
                  {column.items.map((item) => (
                    <span
                      key={item.label}
                      className={`absolute inset-x-0.5 rounded-[4px] px-1 py-1 text-[0.58rem] font-medium leading-tight ${item.tone}`}
                      style={{ top: item.top }}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#F4D9BC] bg-[#FDF8F1] px-3 py-2 text-[0.62rem] text-[#7A5327]">
        <SparklesIcon className="size-3.5" />
        Conflito detectado? O horário não é salvo até ser ajustado.
      </div>
    </RevealCard>
  )
}

function FeaturePermissions() {
  const rows = [
    { name: 'Marina', role: 'Dona', access: 'Toda a clínica', tone: 'teal' as const, full: true },
    { name: 'Rafael', role: 'Dentista', access: 'Seus pacientes', tone: 'sky' as const, full: false },
    { name: 'Camila', role: 'Dentista', access: 'Seus pacientes', tone: 'mint' as const, full: false },
  ]
  return (
    <RevealCard className="lg:col-span-5" delay={80}>
      <FeatureIcon icon={ShieldCheckIcon} />
      <h3 className="mt-5 font-display text-[1.8rem] leading-none text-ink">
        Permissões sem planilha
      </h3>
      <p className="mt-2.5 text-[0.8rem] leading-relaxed text-muted-foreground">
        O dono cadastra a equipe e define quem pode ver o quê. Cada dentista
        entra no próprio universo.
      </p>
      <div className="mt-5 space-y-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-[#FAFDFD] px-2.5 py-2"
          >
            <InitialsAvatar name={row.name} tone={row.tone} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.64rem] font-medium text-ink">
                {row.name} <span className="text-muted-foreground">· {row.role}</span>
              </p>
              <p className="text-[0.5rem] text-muted-foreground">{row.access}</p>
            </div>
            {row.full ? (
              <span className="rounded-full bg-[#E4F6F5] px-2 py-0.5 text-[0.46rem] text-[#0B565E]">
                acesso total
              </span>
            ) : (
              <LockKeyholeIcon className="size-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </RevealCard>
  )
}

function FeaturePatients() {
  const patients = [
    { name: 'Ana Beatriz', dentist: 'Marina', note: 'Sensibilidade', tone: 'teal' as const },
    { name: 'Lucas Ferreira', dentist: 'Rafael', note: 'Aparelho fixo', tone: 'sky' as const },
    { name: 'Helena Martins', dentist: 'Camila', note: 'Alergia a látex', tone: 'mint' as const },
  ]
  return (
    <RevealCard className="lg:col-span-5" delay={80}>
      <FeatureIcon icon={UsersIcon} />
      <h3 className="mt-5 font-display text-[1.8rem] leading-none text-ink">
        Pacientes com contexto
      </h3>
      <p className="mt-2.5 text-[0.8rem] leading-relaxed text-muted-foreground">
        Contato, observações clínicas e histórico de consultas no mesmo lugar.
        Nada de procurar em cadernos.
      </p>
      <div className="mt-5 space-y-1.5">
        {patients.map((patient) => (
          <div
            key={patient.name}
            className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-[#FAFDFD] px-2.5 py-2"
          >
            <InitialsAvatar name={patient.name} tone={patient.tone} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.64rem] font-medium text-ink">{patient.name}</p>
              <p className="text-[0.5rem] text-muted-foreground">
                Dra. {patient.dentist} · {patient.note}
              </p>
            </div>
            <ArrowRightIcon className="size-3 text-muted-foreground/60" />
          </div>
        ))}
      </div>
    </RevealCard>
  )
}

function FeatureDashboard() {
  const days = [
    { label: 'seg', value: 7 },
    { label: 'ter', value: 10 },
    { label: 'qua', value: 8, highlight: true },
    { label: 'qui', value: 6 },
    { label: 'sex', value: 9 },
  ]
  return (
    <RevealCard className="lg:col-span-7" delay={80}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm">
          <FeatureIcon icon={LayoutDashboardIcon} />
          <h3 className="mt-5 font-display text-[1.8rem] leading-none text-ink">
            Dashboard para decidir
          </h3>
          <p className="mt-2.5 text-[0.8rem] leading-relaxed text-muted-foreground">
            O dono acompanha ocupação, retornos e equipe em uma leitura só. O
            dentista vê a própria semana, sem ruído.
          </p>
        </div>
        <div className="flex w-full max-w-[300px] shrink-0 items-center gap-4 rounded-2xl border border-border bg-[#FAFDFD] p-3.5">
          <div className="flex-1">
            <p className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-muted-foreground">
              consultas na semana
            </p>
            <WeeklyBars data={days} className="mt-3 h-28" />
          </div>
          <OccupancyRing value={82} size={82} stroke={7} label="ocupação" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { label: 'retornos pendentes', value: '4', color: 'text-[#7A5327]' },
          { label: 'cancelamentos', value: '2', color: 'text-[#7D3441]' },
          { label: 'pacientes ativos', value: '20', color: 'text-ink' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/70 px-3 py-2.5">
            <p className={`text-base font-semibold leading-none ${stat.color}`}>
              {stat.value}
            </p>
            <p className="mt-1 font-mono text-[0.44rem] uppercase tracking-[0.1em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </RevealCard>
  )
}

function FeatureIcon({
  icon: Icon,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
}) {
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#E4F6F5] text-[#0B565E]">
      <Icon className="size-[1.1rem]" strokeWidth={1.7} />
    </span>
  )
}

function RevealCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div
      className={`rounded-[1.8rem] border border-border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-50px_rgba(13,124,134,0.45)] sm:p-6 ${className ?? ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function StepsSection() {
  const steps = [
    {
      number: '01',
      title: 'Entre como dono',
      description:
        'Use a conta demo da Marina para conhecer a visão completa da clínica e a gestão da equipe.',
      icon: CrownIcon,
    },
    {
      number: '02',
      title: 'Monte a rotina',
      description:
        'Cadastre dentistas e pacientes, distribua responsáveis e organize a agenda da semana.',
      icon: CalendarDaysIcon,
    },
    {
      number: '03',
      title: 'Troque de perfil',
      description:
        'Saia e entre como Rafael ou Camila para sentir a diferença de permissões na prática.',
      icon: UsersIcon,
    },
  ]
  return (
    <section id="como-funciona" className="container-page py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-3">Como experimentar</p>
        <h2 className="display-title text-4xl text-ink sm:text-5xl">
          Três passos para
          <br />
          <span className="italic text-primary">sentir a diferença.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          A demonstração já vem com uma clínica inteira montada. Você só precisa
          escolher por qual porta entrar.
        </p>
      </div>

      <div className="relative mt-12 grid gap-4 md:grid-cols-3">
        <div
          aria-hidden="true"
          className="absolute left-[16%] right-[16%] top-10 hidden border-t border-dashed border-[#B9E9DC] md:block"
        />
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative rounded-[1.6rem] border border-border bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-2xl bg-[#F4FAFA] text-primary ring-4 ring-background">
                <step.icon className="size-5" strokeWidth={1.7} />
              </span>
              <span className="font-display text-[2.2rem] leading-none text-[#C3E9E7]">
                {step.number}
              </span>
            </div>
            <h3 className="mt-5 text-sm font-semibold text-ink">{step.title}</h3>
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ManifestoSection() {
  return (
    <section className="container-page py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0B3034] px-6 py-14 sm:px-12 sm:py-20">
        <div className="absolute inset-0 dot-grid opacity-[0.1]" />
        <div className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-[#0D7C86]/35 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 size-[26rem] rounded-full bg-[#67E8F9]/10 blur-3xl" />
        <svg
          viewBox="0 0 600 600"
          aria-hidden="true"
          className="absolute -right-20 top-1/2 size-[30rem] -translate-y-1/2 text-[#67E8F9]/15"
        >
          <path
            d="M100 220c40 130 115 195 200 195s160-65 200-195"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <div className="relative max-w-3xl">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#67E8F9]">
            <SparklesIcon className="size-5" strokeWidth={1.6} />
          </span>
          <p className="mt-7 font-display text-[2.3rem] leading-[1.08] tracking-[-0.02em] text-white sm:text-[3.2rem]">
            “Cuidado não se automatiza.
            <br />
            <span className="italic text-[#67E8F9]">O que a gente organiza</span>{' '}
            é o tempo para ele acontecer.”
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/45">
              manifesto clareia
            </span>
            <span className="hidden h-px w-10 bg-white/20 sm:block" />
            {['Agenda', 'Pacientes', 'Equipe', 'Permissões'].map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-[0.68rem] text-white/55"
              >
                <span className="size-1 rounded-full bg-[#67E8F9]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function FinalCtaSection() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[#C3E9E7] bg-[linear-gradient(135deg,#F4FCFB_0%,#E8F8F6_50%,#E4F6F5_100%)] px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="absolute inset-0 dot-grid opacity-25" />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow">Demonstração aberta</p>
          <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl lg:text-[3.5rem]">
            Sua clínica merece um sistema
            <br />
            que <span className="italic text-primary">respira.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Entre com a conta da dona ou de um dentista e explore os dois lados
            da Clareia. Só precisa de um navegador.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              to="/cadastro"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[0.8rem] font-semibold text-primary-foreground shadow-[0_18px_40px_-20px_rgba(13,124,134,0.7)] transition-transform hover:-translate-y-0.5"
            >
              Fazer parte da Clareia
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white/70 px-6 text-[0.8rem] font-medium text-ink transition-colors hover:bg-white"
            >
              Entrar na clínica
              <ArrowRightIcon className="size-3.5" />
            </Link>
            <a
              href="#sistema"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white/70 px-6 text-[0.8rem] font-medium text-ink transition-colors hover:bg-white"
            >
              Rever o sistema
            </a>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted-foreground">
            <CircleSlash2Icon className="size-3" />
            sem cartão · sem backend · dados locais
          </p>
        </div>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white/60">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-[1.8rem] leading-none tracking-[-0.03em] text-ink">
              clareia
            </p>
            <p className="mt-3 max-w-xs text-[0.72rem] leading-relaxed text-muted-foreground">
              Gestão odontológica com cuidado de gente. Uma demonstração de
              front-end feita para clínicas pequenas e médias.
            </p>
            <p className="mt-5 font-mono text-[0.54rem] uppercase tracking-[0.16em] text-muted-foreground/70">
              feito com react · tailwind · shadcn
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
              Produto
            </p>
            <div className="mt-3 grid gap-2 text-[0.72rem] text-muted-foreground">
              <a className="transition-colors hover:text-ink" href="#sistema">O sistema</a>
              <a className="transition-colors hover:text-ink" href="#recursos">Recursos</a>
              <a className="transition-colors hover:text-ink" href="#como-funciona">Como funciona</a>
              <Link className="transition-colors hover:text-ink" to="/app">Abrir a clínica</Link>
              <Link className="transition-colors hover:text-ink" to="/cadastro">Criar clínica</Link>
            </div>
          </div>
          <div>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
              Demonstração
            </p>
            <div className="mt-3 grid gap-2 text-[0.72rem] text-muted-foreground">
              <Link className="transition-colors hover:text-ink" to="/login?conta=marina@clareia.app">Entrar como dona</Link>
              <Link className="transition-colors hover:text-ink" to="/login?conta=rafael@clareia.app">Entrar como dentista</Link>
              <Link className="transition-colors hover:text-ink" to="/login">Todas as contas</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-5 text-[0.6rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Clareia Odontologia — projeto de demonstração.</p>
          <p className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-[#66B894]" />
            dados fictícios salvos neste navegador
          </p>
        </div>
      </div>
    </footer>
  )
}
