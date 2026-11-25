import { describe, expect, it } from 'vitest'
import { clinicReducer } from '@/data/clinic-reducer'
import type { ClinicState, Patient } from '@/domain/types'

const now = '2026-11-23T12:00:00.000Z'

function makeState(): ClinicState {
  return {
    clinic: {
      id: 'clinic-1',
      name: 'Clareia Odontologia',
      address: 'Rua das Acácias, 128',
      cnpj: '12.345.678/0001-95',
      phone: '(11) 3082-4410',
      email: 'ola@clareia.app',
      ownerDentistId: 'dent-marina',
      createdAt: now,
    },
    dentists: [
      {
        id: 'dent-marina',
        clinicId: 'clinic-1',
        name: 'Dra. Marina Prado',
        email: 'marina@clareia.app',
        phone: '(11) 99812-4401',
        cro: 'CRO-SP 48.210',
        specialty: 'Clínica geral',
        role: 'owner',
        status: 'active',
        tone: 'teal',
        createdAt: now,
      },
      {
        id: 'dent-rafael',
        clinicId: 'clinic-1',
        name: 'Dr. Rafael Nunes',
        email: 'rafael@clareia.app',
        phone: '(11) 99775-1290',
        cro: 'CRO-SP 51.932',
        specialty: 'Ortodontia',
        role: 'dentist',
        status: 'active',
        tone: 'sky',
        createdAt: now,
      },
    ],
    patients: [],
    appointments: [
      {
        id: 'appointment-001',
        clinicId: 'clinic-1',
        dentistId: 'dent-marina',
        patientId: 'patient-01',
        date: '2026-11-23',
        startTime: '09:00',
        durationMinutes: 45,
        type: 'cleaning',
        status: 'scheduled',
        createdAt: now,
      },
    ],
  }
}

describe('clinicReducer', () => {
  it('cria, edita, arquiva e restaura pacientes sem perder os dados', () => {
    const state = makeState()
    const patient: Patient = {
      id: 'patient-new',
      clinicId: state.clinic.id,
      dentistId: 'dent-rafael',
      name: 'Nova Paciente',
      email: 'nova@email.com',
      phone: '(11) 99999-1111',
      birthDate: '1995-01-01',
      notes: 'Sem alergias',
      status: 'active',
      createdAt: now,
    }

    const created = clinicReducer(state, {
      type: 'patient:create',
      payload: patient,
    })
    expect(created.patients[0].id).toBe('patient-new')

    const updated = clinicReducer(created, {
      type: 'patient:update',
      payload: { id: patient.id, changes: { name: 'Nova Paciente Prado' } },
    })
    expect(updated.patients[0].name).toBe('Nova Paciente Prado')

    const archived = clinicReducer(updated, {
      type: 'patient:archive',
      payload: { id: patient.id },
    })
    expect(archived.patients[0].status).toBe('archived')
    expect(archived.patients[0].notes).toBe('Sem alergias')

    const restored = clinicReducer(archived, {
      type: 'patient:restore',
      payload: { id: patient.id },
    })
    expect(restored.patients[0].status).toBe('active')
  })

  it('altera status de consultas e dentistas', () => {
    const state = makeState()

    const next = clinicReducer(state, {
      type: 'appointment:setStatus',
      payload: { id: 'appointment-001', status: 'confirmed' },
    })
    expect(
      next.appointments.find((item) => item.id === 'appointment-001')?.status,
    ).toBe('confirmed')

    const withDentist = clinicReducer(next, {
      type: 'dentist:setStatus',
      payload: { id: 'dent-rafael', status: 'inactive' },
    })
    expect(
      withDentist.dentists.find((item) => item.id === 'dent-rafael')?.status,
    ).toBe('inactive')
  })

  it('hidrata o workspace retornado pela API sem mutar o estado anterior', () => {
    const state = makeState()
    const fresh: ClinicState = {
      clinic: {
        ...state.clinic,
        id: 'clinic-helena',
        name: 'Clínica Helena',
        ownerDentistId: 'dent-helena',
      },
      dentists: [
        {
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
          createdAt: now,
        },
      ],
      patients: [],
      appointments: [],
    }

    const hydrated = clinicReducer(state, {
      type: 'workspace:hydrate',
      payload: fresh,
    })

    expect(hydrated.clinic.id).toBe('clinic-helena')
    expect(hydrated.dentists).toHaveLength(1)
    expect(hydrated.patients).toEqual([])
    expect(hydrated.appointments).toEqual([])
    expect(state.clinic.name).toBe('Clareia Odontologia')
  })

  it('atualiza os dados da clínica de forma imutável', () => {
    const state = makeState()
    const changed = clinicReducer(state, {
      type: 'clinic:update',
      payload: {
        name: 'Outra clínica',
        address: 'Rua Teste, 10',
        cnpj: '12.345.678/0001-95',
        phone: '(11) 3333-3333',
        email: 'teste@email.com',
      },
    })
    expect(changed.clinic.name).toBe('Outra clínica')
    expect(state.clinic.name).toBe('Clareia Odontologia')
  })
})
