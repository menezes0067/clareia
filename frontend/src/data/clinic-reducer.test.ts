import { describe, expect, it } from 'vitest'
import { clinicReducer } from '@/data/clinic-reducer'
import { LocalClinicRepository } from '@/data/local-repository'
import { createSeedState, DB_VERSION } from '@/data/seed'
import { createClinicState } from '@/domain/clinic'
import type { ClinicState, Patient } from '@/domain/types'

const now = new Date('2026-11-23T12:00:00.000Z')

function seeded(): ClinicState {
  return createSeedState(now)
}

function memoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key)
    },
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe('clinicReducer', () => {
  it('cria, arquiva e restaura pacientes sem perder os dados', () => {
    const state = seeded()
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
      createdAt: now.toISOString(),
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
    const state = seeded()
    const appointmentId = state.appointments[0].id
    const dentistId = state.dentists[1].id

    const next = clinicReducer(state, {
      type: 'appointment:setStatus',
      payload: { id: appointmentId, status: 'confirmed' },
    })
    expect(next.appointments.find((item) => item.id === appointmentId)?.status).toBe(
      'confirmed',
    )

    const withDentist = clinicReducer(next, {
      type: 'dentist:setStatus',
      payload: { id: dentistId, status: 'inactive' },
    })
    expect(withDentist.dentists.find((item) => item.id === dentistId)?.status).toBe(
      'inactive',
    )
  })

  it('substitui o workspace demo quando uma clínica é cadastrada', () => {
    const state = seeded()
    const { state: fresh, owner, clinic } = createClinicState(
      {
        owner: {
          name: 'Dra. Helena Barros',
          email: 'helena@clareia.app',
          phone: '(11) 99999-1234',
          cro: 'CRO-SP 12.345',
          specialty: 'Endodontia',
        },
        clinic: {
          name: 'Clínica Helena',
          address: 'Rua Nova, 42 — São Paulo',
          cnpj: '12.345.678/0001-95',
          phone: '(11) 3333-4444',
          email: 'contato@clinicahelena.com',
        },
      },
      now,
    )

    const created = clinicReducer(state, {
      type: 'clinic:create',
      payload: fresh,
    })

    expect(created.clinic.id).toBe(clinic.id)
    expect(created.dentists).toEqual([owner])
    expect(created.patients).toEqual([])
    expect(created.appointments).toEqual([])
    expect(state.clinic.name).toBe('Clareia Odontologia')
  })

  it('restaura o estado inicial sem mutar o anterior', () => {
    const state = seeded()
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

    const reset = clinicReducer(changed, {
      type: 'demo:reset',
      payload: seeded(),
    })
    expect(reset.clinic.name).toBe('Clareia Odontologia')
  })
})

describe('LocalClinicRepository', () => {
  it('persiste e recarrega o estado', () => {
    const storage = memoryStorage()
    const repository = new LocalClinicRepository(storage)
    const state = seeded()

    repository.save(state)
    expect(repository.load()).toEqual(state)
    expect(JSON.parse(storage.getItem('clareia:clinic:v1') ?? '{}').version).toBe(
      DB_VERSION,
    )
  })

  it('descarta dados corrompidos e recria a demo', () => {
    const storage = memoryStorage()
    storage.setItem('clareia:clinic:v1', '{ dados quebrados')
    const repository = new LocalClinicRepository(storage)

    expect(repository.load().version).toBe(DB_VERSION)
    expect(repository.load().dentists.length).toBeGreaterThan(0)
  })

  it('restaura o estado demo', () => {
    const storage = memoryStorage()
    const repository = new LocalClinicRepository(storage)
    const original = repository.load()
    original.patients = []

    const reset = repository.reset()
    expect(reset.patients.length).toBeGreaterThan(0)
    expect(repository.load().patients.length).toBeGreaterThan(0)
  })
})
