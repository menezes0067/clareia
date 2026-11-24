import type { Appointment, AppointmentStatus } from '@/domain/types'
import { parseISODate } from '@/lib/dates'

export type AppointmentCandidate = Pick<
  Appointment,
  'date' | 'startTime' | 'durationMinutes' | 'dentistId' | 'patientId'
>

const inactiveStatuses: AppointmentStatus[] = ['cancelled']

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(total: number): string {
  const normalized = ((total % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function endTimeOf(
  appointment: Pick<Appointment, 'startTime' | 'durationMinutes'>,
): string {
  return minutesToTime(
    timeToMinutes(appointment.startTime) + appointment.durationMinutes,
  )
}

export function appointmentStart(appointment: Appointment): Date {
  return parseISODate(`${appointment.date}T${appointment.startTime}:00`)
}

export function appointmentEnd(appointment: Appointment): Date {
  return new Date(
    appointmentStart(appointment).getTime() +
      appointment.durationMinutes * 60_000,
  )
}

export function appointmentRange(appointment: Appointment): string {
  return `${appointment.startTime} – ${endTimeOf(appointment)}`
}

export function isActiveAppointment(appointment: Appointment): boolean {
  return !inactiveStatuses.includes(appointment.status)
}

export function isUpcoming(appointment: Appointment, now = new Date()): boolean {
  if (!isActiveAppointment(appointment)) return false
  if (appointment.status === 'completed' || appointment.status === 'no_show') {
    return false
  }
  return appointmentEnd(appointment) >= now
}

export function isPast(appointment: Appointment, now = new Date()): boolean {
  return appointmentEnd(appointment) < now
}

export function sortByStart<T extends Appointment>(appointments: T[]): T[] {
  return [...appointments].sort((a, b) => {
    const dateOrder = a.date.localeCompare(b.date)
    if (dateOrder !== 0) return dateOrder
    return a.startTime.localeCompare(b.startTime)
  })
}

export function overlaps(
  a: AppointmentCandidate,
  b: AppointmentCandidate,
): boolean {
  if (a.date !== b.date) return false
  const aStart = timeToMinutes(a.startTime)
  const aEnd = aStart + a.durationMinutes
  const bStart = timeToMinutes(b.startTime)
  const bEnd = bStart + b.durationMinutes
  return aStart < bEnd && bStart < aEnd
}

/** Distribui consultas juntas em faixas realmente livres (para a grade da agenda). */
export function layoutOverlappingAppointments<T extends Appointment>(
  sorted: T[],
): { appointment: T; lane: number; laneCount: number }[] {
  const lanes: T[][] = []
  return sorted
    .map((appointment) => {
      let lane = lanes.findIndex((items) =>
        items.every((item) => !overlaps(appointment, item)),
      )
      if (lane === -1) {
        lane = lanes.length
        lanes.push([])
      }
      lanes[lane].push(appointment)
      return { appointment, lane }
    })
    .map((item) => ({ ...item, laneCount: lanes.length }))
}

export function findDentistConflict(
  appointments: Appointment[],
  candidate: AppointmentCandidate,
  excludeId?: string,
): Appointment | undefined {
  return appointments.find(
    (appointment) =>
      appointment.id !== excludeId &&
      appointment.dentistId === candidate.dentistId &&
      isActiveAppointment(appointment) &&
      overlaps(candidate, appointment),
  )
}

export function findPatientConflict(
  appointments: Appointment[],
  candidate: AppointmentCandidate,
  excludeId?: string,
): Appointment | undefined {
  return appointments.find(
    (appointment) =>
      appointment.id !== excludeId &&
      appointment.patientId === candidate.patientId &&
      isActiveAppointment(appointment) &&
      overlaps(candidate, appointment),
  )
}

export function conflictMessage(conflict: Appointment): string {
  return `Já existe uma consulta nesse horário (${conflict.startTime}–${endTimeOf(
    conflict,
  )}).`
}

export function totalBookedMinutes(appointments: Appointment[]): number {
  return appointments
    .filter(isActiveAppointment)
    .reduce((total, appointment) => total + appointment.durationMinutes, 0)
}

export function nextAppointment(
  appointments: Appointment[],
  now = new Date(),
): Appointment | undefined {
  return sortByStart(
    appointments.filter((appointment) => isUpcoming(appointment, now)),
  )[0]
}

export function appointmentStatusOrder(status: AppointmentStatus): number {
  const order: Record<AppointmentStatus, number> = {
    confirmed: 0,
    scheduled: 1,
    completed: 2,
    no_show: 3,
    cancelled: 4,
  }
  return order[status]
}
