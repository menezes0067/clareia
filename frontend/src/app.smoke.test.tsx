// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '@/App'
import { apiClient, type WorkspacePayload } from '@/data/api-client'
import { ClinicProvider } from '@/data/clinic-provider'
import { AuthProvider } from '@/features/auth/auth-provider'
import { addDaysISO, todayISO } from '@/lib/dates'
import type { Clinic, Dentist, Patient, Appointment } from '@/domain/types'

const clinicFixture: Clinic = {
  id: 'clinic-clareia',
  name: 'Clareia Odontologia',
  address: 'Rua das Acácias, 128 — São Paulo',
  cnpj: '12.345.678/0001-95',
  phone: '(11) 3082-4410',
  email: 'ola@clareia.app',
  ownerDentistId: 'dent-marina',
  createdAt: '2026-01-01T12:00:00.000Z',
}

const marinaFixture: Dentist = {
  id: 'dent-marina',
  clinicId: clinicFixture.id,
  name: 'Dra. Marina Prado',
  email: 'marina@clareia.app',
  phone: '(11) 99812-4401',
  cro: 'CRO-SP 48.210',
  specialty: 'Clínica geral',
  role: 'owner',
  status: 'active',
  tone: 'teal',
  createdAt: '2026-01-01T12:00:00.000Z',
}

const rafaelFixture: Dentist = {
  id: 'dent-rafael',
  clinicId: clinicFixture.id,
  name: 'Dr. Rafael Nunes',
  email: 'rafael@clareia.app',
  phone: '(11) 99775-1290',
  cro: 'CRO-SP 51.932',
  specialty: 'Ortodontia',
  role: 'dentist',
  status: 'active',
  tone: 'sky',
  createdAt: '2026-01-02T12:00:00.000Z',
}

const patientsFixture: Patient[] = [
  {
    id: 'patient-01',
    clinicId: clinicFixture.id,
    dentistId: 'dent-marina',
    name: 'Ana Beatriz Souza',
    email: 'ana.souza@email.com',
    phone: '(11) 98812-4471',
    birthDate: '1991-03-14',
    notes: '',
    status: 'active',
    createdAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'patient-02',
    clinicId: clinicFixture.id,
    dentistId: 'dent-rafael',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    phone: '(11) 99145-8820',
    birthDate: '1985-07-22',
    notes: '',
    status: 'active',
    createdAt: '2026-02-02T12:00:00.000Z',
  },
]

const todayAppointmentFixture: Appointment = {
  id: 'appointment-001',
  clinicId: clinicFixture.id,
  dentistId: 'dent-marina',
  patientId: 'patient-01',
  date: todayISO(),
  startTime: '09:00',
  durationMinutes: 45,
  type: 'cleaning',
  status: 'confirmed',
  createdAt: '2026-02-10T12:00:00.000Z',
}

const ownerWorkspace: WorkspacePayload = {
  clinic: clinicFixture,
  dentists: [marinaFixture, rafaelFixture],
  patients: patientsFixture,
  appointments: [todayAppointmentFixture],
}

const rafaelWorkspace: WorkspacePayload = {
  clinic: clinicFixture,
  dentists: [rafaelFixture],
  patients: [patientsFixture[1]],
  appointments: [],
}

function renderApp(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ClinicProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ClinicProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  window.scrollTo = vi.fn() as typeof window.scrollTo
  vi.restoreAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('navegação principal integrada à API', () => {
  it('renderiza a landing page', async () => {
    renderApp(['/'])
    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Sua clínica inteira em um só lugar')
    expect(
      screen.getAllByRole('link', { name: /Fazer parte da Clareia/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: /^Entrar$/ }).length,
    ).toBeGreaterThan(0)
  })

  it('entra como dona via API e abre a lista de pacientes', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'login').mockResolvedValue({
      accessToken: 'jwt-marina',
      expiresIn: 3600,
      dentist: marinaFixture,
      clinic: clinicFixture,
    })
    vi.spyOn(apiClient, 'getWorkspace').mockResolvedValue(ownerWorkspace)

    renderApp(['/login'])

    await user.type(await screen.findByLabelText('E-mail'), 'marina@clareia.app')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: /Entrar na clínica/ }))

    expect(await screen.findByText(/Vamos cuidar\?/)).toBeTruthy()

    await user.click(screen.getByRole('link', { name: 'Pacientes' }))
    expect(
      (await screen.findAllByText('Lucas Ferreira')).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Ana Beatriz Souza').length).toBeGreaterThan(0)
  })

  it('mostra apenas os pacientes retornados para o dentista logado', async () => {
    window.localStorage.setItem('clareia:token:v1', 'jwt-rafael')
    vi.spyOn(apiClient, 'getMe').mockResolvedValue({
      dentist: rafaelFixture,
      clinic: clinicFixture,
    })
    vi.spyOn(apiClient, 'getWorkspace').mockResolvedValue(rafaelWorkspace)

    renderApp(['/app/pacientes'])

    expect(
      (await screen.findAllByText('Lucas Ferreira')).length,
    ).toBeGreaterThan(0)
    expect(screen.queryAllByText('Ana Beatriz Souza')).toHaveLength(0)
  })

  it('bloqueia o acesso do dentista à página da equipe', async () => {
    window.localStorage.setItem('clareia:token:v1', 'jwt-rafael')
    vi.spyOn(apiClient, 'getMe').mockResolvedValue({
      dentist: rafaelFixture,
      clinic: clinicFixture,
    })
    vi.spyOn(apiClient, 'getWorkspace').mockResolvedValue(rafaelWorkspace)

    renderApp(['/app/equipe'])

    expect(
      await screen.findByText('Esta parte da clínica é só do dono.'),
    ).toBeTruthy()
  })

  it('cadastra a dona e a clínica via API e entra no workspace recém-criado', async () => {
    const user = userEvent.setup()
    const registerSpy = vi.spyOn(apiClient, 'registerClinic').mockResolvedValue({
      accessToken: 'jwt-helena',
      expiresIn: 3600,
      clinic: {
        id: 'clinic-helena',
        name: 'Clínica Helena',
        address: 'Rua Nova, 42 — São Paulo',
        cnpj: '12.345.678/0001-95',
        phone: '(11) 3333-4444',
        email: 'contato@clinicahelena.com',
        ownerDentistId: 'dent-helena',
        createdAt: '2026-11-24T12:00:00.000Z',
      },
      dentist: {
        id: 'dent-helena',
        clinicId: 'clinic-helena',
        name: 'Dra. Helena Barros',
        email: 'helena@clareia.app',
        phone: '(11) 99999-1234',
        cro: 'CRO-SP 12.345',
        specialty: 'Endodontia',
        role: 'owner',
        status: 'active',
        tone: 'teal',
        createdAt: '2026-11-24T12:00:00.000Z',
      },
    })

    renderApp(['/cadastro'])

    await user.type(
      await screen.findByLabelText('Nome completo'),
      'Dra. Helena Barros',
    )
    await user.type(screen.getByLabelText('E-mail'), 'helena@clareia.app')
    await user.type(screen.getByLabelText('Telefone'), '(11) 99999-1234')
    await user.type(screen.getByLabelText('CRO'), 'CRO-SP 12.345')
    await user.type(screen.getByLabelText('Especialidade'), 'Endodontia')
    await user.type(screen.getByLabelText('Senha de acesso'), 'senhaForte123')
    await user.click(
      screen.getByRole('button', { name: /Cadastrar dona e continuar/ }),
    )

    expect(await screen.findByLabelText('Nome da clínica')).toBeTruthy()
    await user.type(
      screen.getByLabelText('Nome da clínica'),
      'Clínica Helena',
    )
    await user.type(screen.getByLabelText('CNPJ'), '12345678000195')
    await user.type(
      screen.getByLabelText('Endereço'),
      'Rua Nova, 42 — São Paulo',
    )
    await user.type(
      screen.getByLabelText('Telefone da clínica'),
      '(11) 3333-4444',
    )
    await user.type(
      screen.getByLabelText('E-mail de contato'),
      'contato@clinicahelena.com',
    )
    await user.click(
      screen.getByRole('button', { name: /Criar clínica e entrar/ }),
    )

    expect(registerSpy).toHaveBeenCalledTimes(1)
    expect(
      (await screen.findAllByText('Clínica Helena')).length,
    ).toBeGreaterThan(0)
    expect(screen.queryAllByText('Clareia Odontologia')).toHaveLength(0)
  })

  it('mantém o dia escolhido ao navegar entre semanas na agenda', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('clareia:token:v1', 'jwt-marina')
    vi.spyOn(apiClient, 'getMe').mockResolvedValue({
      dentist: marinaFixture,
      clinic: clinicFixture,
    })
    vi.spyOn(apiClient, 'getWorkspace').mockResolvedValue(ownerWorkspace)

    renderApp(['/app/agenda'])

    const selectedBefore = (
      await screen.findAllByRole('button', { pressed: true })
    )[0]
    const dateBefore = selectedBefore.getAttribute('data-date')
    expect(dateBefore).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Próxima semana' }))

    const selectedAfter = (
      await screen.findAllByRole('button', { pressed: true })
    )[0]
    expect(selectedAfter.getAttribute('data-date')).toBe(
      addDaysISO(dateBefore!, 7),
    )
  })

  it('abre os detalhes da consulta com horário de início, término e reagendamento', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('clareia:token:v1', 'jwt-marina')
    vi.spyOn(apiClient, 'getMe').mockResolvedValue({
      dentist: marinaFixture,
      clinic: clinicFixture,
    })
    vi.spyOn(apiClient, 'getWorkspace').mockResolvedValue(ownerWorkspace)

    renderApp(['/app/agenda'])

    const trigger = (
      await screen.findAllByTitle((title) => title.includes('09:00'))
    )[0]
    await user.click(trigger)

    expect(await screen.findByText('Início')).toBeTruthy()
    expect(screen.getByText('Término')).toBeTruthy()
    expect(screen.getByRole('dialog').getAttribute('data-side')).toBe('bottom')
    expect(
      screen.getByRole('button', { name: 'Fechar detalhes da consulta' }),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reagendar' }))
    expect(await screen.findByText('Ajuste os detalhes')).toBeTruthy()
    expect(screen.getByRole('dialog').getAttribute('data-side')).toBe('bottom')
  })

  it('redireciona visitantes sem sessão para o login', async () => {
    renderApp(['/app'])
    expect(await screen.findByText(/Entre na sua/)).toBeTruthy()
  })
})
