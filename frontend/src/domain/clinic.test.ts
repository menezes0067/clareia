import { describe, expect, it } from 'vitest'
import { CLINIC_STATE_VERSION, createClinicState } from '@/domain/clinic'

const input = {
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
}

describe('criação da clínica como entidade', () => {
  it('vincula a clínica à dona recém-cadastrada', () => {
    const { clinic, owner, state } = createClinicState(
      input,
      new Date('2026-11-23T12:00:00.000Z'),
    )

    expect(state.version).toBe(CLINIC_STATE_VERSION)
    expect(clinic.name).toBe('Clínica Helena')
    expect(clinic.ownerDentistId).toBe(owner.id)
    expect(owner.clinicId).toBe(clinic.id)
    expect(owner.role).toBe('owner')
    expect(owner.status).toBe('active')
    expect(owner.createdAt).toBe(clinic.createdAt)
    expect(state.clinic).toEqual(clinic)
    expect(state.dentists).toEqual([owner])
  })

  it('começa com um workspace vazio, pronto para os formulários', () => {
    const { state } = createClinicState(input)
    expect(state.patients).toEqual([])
    expect(state.appointments).toEqual([])
  })

  it('gera identificadores únicos para clínicas diferentes', () => {
    const first = createClinicState(input)
    const second = createClinicState(input)
    expect(first.clinic.id).not.toBe(second.clinic.id)
    expect(first.owner.id).not.toBe(second.owner.id)
  })
})
