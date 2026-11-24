// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '@/App'
import { ClinicProvider } from '@/data/clinic-provider'
import { createSeedState } from '@/data/seed'
import { AuthProvider } from '@/features/auth/auth-provider'
import { addDaysISO } from '@/lib/dates'

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
})

afterEach(() => {
  cleanup()
})

describe('navegação principal', () => {
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

  it('entra como dona e abre a lista de pacientes', async () => {
    const user = userEvent.setup()
    renderApp(['/login'])

    await user.click(
      await screen.findByRole('button', { name: /Marina Prado/ }),
    )

    expect(await screen.findByText(/Vamos cuidar\?/)).toBeTruthy()

    await user.click(screen.getByRole('link', { name: 'Pacientes' }))
    expect((await screen.findAllByText('Ana Beatriz Souza')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Lucas Ferreira').length).toBeGreaterThan(0)
  })

  it('mostra apenas os pacientes do dentista logado', async () => {
    window.localStorage.setItem('clareia:session:v1', 'dent-rafael')
    renderApp(['/app/pacientes'])

    expect((await screen.findAllByText('Lucas Ferreira')).length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Ana Beatriz Souza')).toHaveLength(0)
    expect(screen.queryAllByText('Helena Martins')).toHaveLength(0)
  })

  it('bloqueia o acesso do dentista à página da equipe', async () => {
    window.localStorage.setItem('clareia:session:v1', 'dent-rafael')
    renderApp(['/app/equipe'])

    expect(
      await screen.findByText('Esta parte da clínica é só do dono.'),
    ).toBeTruthy()
  })

  it('cadastra a dona, a clínica e entra no workspace recém-criado', async () => {
    const user = userEvent.setup()
    renderApp(['/cadastro'])

    await user.type(
      await screen.findByLabelText('Nome completo'),
      'Dra. Helena Barros',
    )
    await user.type(
      screen.getByLabelText('E-mail'),
      'helena@clareia.app',
    )
    await user.type(screen.getByLabelText('Telefone'), '(11) 99999-1234')
    await user.type(screen.getByLabelText('CRO'), 'CRO-SP 12.345')
    await user.type(screen.getByLabelText('Especialidade'), 'Endodontia')
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

    expect((await screen.findAllByText('Clínica Helena')).length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Clareia Odontologia')).toHaveLength(0)
  })

  it('mantém o dia escolhido ao navegar entre semanas na agenda', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('clareia:session:v1', 'dent-marina')
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

  it('abre os detalhes com horário de início, término e fechar acessível', async () => {
    const user = userEvent.setup()
    const seed = createSeedState(new Date('2026-11-23T12:00:00.000Z'))
    window.localStorage.setItem('clareia:clinic:v1', JSON.stringify(seed))
    window.localStorage.setItem('clareia:session:v1', 'dent-marina')
    renderApp(['/app/agenda'])

    const target = seed.appointments.find(
      (appointment) =>
        appointment.date === '2026-11-23' &&
        appointment.status !== 'cancelled',
    )
    expect(target).toBeTruthy()

    const trigger = (
      await screen.findAllByTitle((title) =>
        title.includes(target!.startTime),
      )
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
