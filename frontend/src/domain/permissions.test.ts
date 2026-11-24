import { describe, expect, it } from 'vitest'
import type { Appointment, Dentist, Patient } from '@/domain/types'
import {
  canManageAppointment,
  canManageDentist,
  canManagePatient,
  canSeeAllPatients,
  canViewTeam,
  manageableDentistsForPatient,
  visibleAppointments,
  visibleDentists,
  visiblePatients,
} from '@/domain/permissions'

const owner: Dentist = {
  id: 'dent-marina',
  clinicId: 'clinic-clareia',
  name: 'Dra. Marina Prado',
  email: 'marina@clareia.app',
  phone: '(11) 99812-4401',
  cro: 'CRO-SP 48.210',
  specialty: 'Clínica geral',
  role: 'owner',
  status: 'active',
  tone: 'teal',
  createdAt: '2023-02-10T12:00:00.000Z',
}

const dentist: Dentist = {
  ...owner,
  id: 'dent-rafael',
  name: 'Dr. Rafael Nunes',
  email: 'rafael@clareia.app',
  role: 'dentist',
  tone: 'sky',
}

const inactiveDentist: Dentist = {
  ...dentist,
  id: 'dent-bruno',
  status: 'inactive',
}

function patient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'patient-01',
    clinicId: 'clinic-clareia',
    dentistId: 'dent-rafael',
    name: 'Ana Beatriz Souza',
    email: 'ana@email.com',
    phone: '(11) 99999-0000',
    birthDate: '1990-04-12',
    notes: '',
    status: 'active',
    createdAt: '2024-01-01T12:00:00.000Z',
    ...overrides,
  }
}

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'appointment-01',
    clinicId: 'clinic-clareia',
    dentistId: 'dent-rafael',
    patientId: 'patient-01',
    date: '2026-11-23',
    startTime: '09:00',
    durationMinutes: 60,
    type: 'return',
    status: 'scheduled',
    createdAt: '2024-01-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('permissões do dono', () => {
  it('vê toda a clínica', () => {
    const state = {
      patients: [
        patient({ id: 'p1', dentistId: 'dent-rafael' }),
        patient({ id: 'p2', dentistId: 'dent-camila' }),
      ],
      appointments: [
        appointment({ id: 'a1', dentistId: 'dent-rafael' }),
        appointment({ id: 'a2', dentistId: 'dent-camila' }),
      ],
      dentists: [owner, dentist, inactiveDentist],
    }

    expect(visiblePatients(state, owner)).toHaveLength(2)
    expect(visibleAppointments(state, owner)).toHaveLength(2)
    expect(visibleDentists(state, owner)).toHaveLength(3)
    expect(canViewTeam(owner)).toBe(true)
    expect(canManageDentist(owner)).toBe(true)
    expect(canSeeAllPatients(owner)).toBe(true)
    expect(canManagePatient(state.patients[1], owner)).toBe(true)
    expect(canManageAppointment(state.appointments[1], owner)).toBe(true)
  })

  it('só pode atribuir pacientes a dentistas ativos', () => {
    expect(
      manageableDentistsForPatient(
        { dentists: [owner, dentist, inactiveDentist] },
        owner,
      ).map((member) => member.id),
    ).toEqual([owner.id, dentist.id])
  })
})

describe('permissões do dentista', () => {
  const state = {
    patients: [
      patient({ id: 'p1', dentistId: 'dent-rafael' }),
      patient({ id: 'p2', dentistId: 'dent-camila' }),
    ],
    appointments: [
      appointment({ id: 'a1', dentistId: 'dent-rafael' }),
      appointment({ id: 'a2', dentistId: 'dent-camila' }),
    ],
    dentists: [owner, dentist, inactiveDentist],
  }

  it('vê apenas seus pacientes e consultas', () => {
    expect(visiblePatients(state, dentist).map((item) => item.id)).toEqual(['p1'])
    expect(visibleAppointments(state, dentist).map((item) => item.id)).toEqual([
      'a1',
    ])
  })

  it('não acessa a equipe nem a ficha de outro dentista', () => {
    expect(canViewTeam(dentist)).toBe(false)
    expect(canManageDentist(dentist)).toBe(false)
    expect(canSeeAllPatients(dentist)).toBe(false)
    expect(canManagePatient(state.patients[1], dentist)).toBe(false)
    expect(canManageAppointment(state.appointments[1], dentist)).toBe(false)
  })

  it('so pode atribuir pacientes a si mesmo', () => {
    expect(
      manageableDentistsForPatient(state, dentist).map((member) => member.id),
    ).toEqual([dentist.id])
  })

  it('bloqueia acesso sem sessão', () => {
    expect(visiblePatients(state, null)).toEqual([])
    expect(visibleAppointments(state, undefined)).toEqual([])
    expect(canManagePatient(state.patients[0], null)).toBe(false)
  })

  it('bloqueia dentista inativo mesmo com sessão antiga', () => {
    expect(visiblePatients(state, inactiveDentist)).toEqual([])
  })
})
