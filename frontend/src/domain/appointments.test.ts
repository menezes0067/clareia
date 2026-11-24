import { describe, expect, it } from 'vitest'
import type { Appointment } from '@/domain/types'
import {
  endTimeOf,
  findDentistConflict,
  findPatientConflict,
  isUpcoming,
  layoutOverlappingAppointments,
  minutesToTime,
  nextAppointment,
  overlaps,
  timeToMinutes,
} from '@/domain/appointments'

function appointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id: 'a1',
    clinicId: 'clinic-clareia',
    dentistId: 'dent-rafael',
    patientId: 'patient-01',
    date: '2026-11-23',
    startTime: '09:00',
    durationMinutes: 60,
    type: 'orthodontics',
    status: 'scheduled',
    createdAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('horários', () => {
  it('converte horários para minutos e vice-versa', () => {
    expect(timeToMinutes('09:30')).toBe(570)
    expect(minutesToTime(570)).toBe('09:30')
    expect(minutesToTime(1500)).toBe('01:00')
  })

  it('calcula o horário de término', () => {
    expect(endTimeOf(appointment({ startTime: '09:30', durationMinutes: 45 }))).toBe(
      '10:15',
    )
  })

  it('detecta sobreposição, mas permite encadeamento exato', () => {
    const base = appointment({ startTime: '09:00', durationMinutes: 60 })
    expect(
      overlaps(base, appointment({ startTime: '09:30', durationMinutes: 30 })),
    ).toBe(true)
    expect(
      overlaps(base, appointment({ startTime: '10:00', durationMinutes: 30 })),
    ).toBe(false)
    expect(
      overlaps(base, appointment({ startTime: '08:30', durationMinutes: 30 })),
    ).toBe(false)
    expect(
      overlaps(base, appointment({ date: '2026-11-24' })),
    ).toBe(false)
  })

  it('reaproveita a faixa livre em cadeias de sobreposição', () => {
    const a = appointment({ id: 'a', startTime: '09:00', durationMinutes: 60 })
    const b = appointment({ id: 'b', startTime: '09:30', durationMinutes: 60 })
    const c = appointment({ id: 'c', startTime: '10:15', durationMinutes: 30 })

    const layout = layoutOverlappingAppointments([a, b, c])

    expect(layout.map((item) => [item.appointment.id, item.lane])).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 0],
    ])
    expect(layout.every((item) => item.laneCount === 2)).toBe(true)
  })
})

describe('conflitos de agenda', () => {
  it('bloqueia consultas sobrepostas do mesmo dentista', () => {
    const existing = appointment({ id: 'a1' })
    const candidate = appointment({ id: 'a2', startTime: '09:30' })
    expect(findDentistConflict([existing], candidate)?.id).toBe('a1')
  })

  it('ignora a própria consulta ao reagendar', () => {
    const existing = appointment({ id: 'a1' })
    expect(findDentistConflict([existing], existing, 'a1')).toBeUndefined()
  })

  it('ignora consultas canceladas', () => {
    const cancelled = appointment({ id: 'a1', status: 'cancelled' })
    const candidate = appointment({ id: 'a2', startTime: '09:15' })
    expect(findDentistConflict([cancelled], candidate)).toBeUndefined()
    expect(findPatientConflict([cancelled], candidate)).toBeUndefined()
  })

  it('bloqueia consultas sobrepostas do mesmo paciente com outro dentista', () => {
    const existing = appointment({ id: 'a1', dentistId: 'dent-marina' })
    const candidate = appointment({
      id: 'a2',
      dentistId: 'dent-camila',
      startTime: '09:45',
    })
    expect(findPatientConflict([existing], candidate)?.id).toBe('a1')
  })
})

describe('consultas futuras', () => {
  const now = new Date('2026-11-23T08:00:00.000Z')

  it('considera Amanhã como futura e ontem como passada', () => {
    const future = appointment({ date: '2026-11-24', startTime: '09:00' })
    const past = appointment({ date: '2026-11-22', startTime: '09:00' })
    expect(isUpcoming(future, now)).toBe(true)
    expect(isUpcoming(past, now)).toBe(false)
  })

  it('ignora canceladas, concluídas e faltas', () => {
    const base = appointment({ date: '2026-11-24' })
    expect(
      isUpcoming(base, now) &&
        isUpcoming({ ...base, status: 'cancelled' }, now) &&
        isUpcoming({ ...base, status: 'completed' }, now) &&
        isUpcoming({ ...base, status: 'no_show' }, now),
    ).toBe(false)
  })

  it('retorna a próxima consulta em ordem cronológica', () => {
    const later = appointment({ id: 'later', startTime: '14:00' })
    const sooner = appointment({ id: 'sooner', startTime: '10:00' })
    expect(nextAppointment([later, sooner], now)?.id).toBe('sooner')
  })
})
