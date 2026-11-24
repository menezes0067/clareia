import type { Appointment, ClinicState, Dentist, Patient } from './types'

export function isOwner(dentist: Dentist | null | undefined): boolean {
  return dentist?.role === 'owner'
}

export function canViewTeam(dentist: Dentist | null | undefined): boolean {
  return isOwner(dentist)
}

export function canManageDentist(
  dentist: Dentist | null | undefined,
): boolean {
  return isOwner(dentist)
}

export function canSeeAllPatients(
  dentist: Dentist | null | undefined,
): boolean {
  return isOwner(dentist)
}

export function canManagePatient(
  patient: Patient,
  dentist: Dentist | null | undefined,
): boolean {
  if (!dentist) return false
  if (isOwner(dentist)) return true
  return patient.dentistId === dentist.id
}

export function canManageAppointment(
  appointment: Appointment,
  dentist: Dentist | null | undefined,
): boolean {
  if (!dentist) return false
  if (isOwner(dentist)) return true
  return appointment.dentistId === dentist.id
}

export function visiblePatients(
  state: Pick<ClinicState, 'patients'>,
  dentist: Dentist | null | undefined,
): Patient[] {
  if (!dentist) return []
  if (isOwner(dentist)) return state.patients
  return state.patients.filter((patient) => patient.dentistId === dentist.id)
}

export function visibleAppointments(
  state: Pick<ClinicState, 'appointments'>,
  dentist: Dentist | null | undefined,
): Appointment[] {
  if (!dentist) return []
  if (isOwner(dentist)) return state.appointments
  return state.appointments.filter(
    (appointment) => appointment.dentistId === dentist.id,
  )
}

export function visibleDentists(
  state: Pick<ClinicState, 'dentists'>,
  dentist: Dentist | null | undefined,
): Dentist[] {
  if (!dentist) return []
  if (isOwner(dentist)) return state.dentists
  return state.dentists.filter((member) => member.id === dentist.id)
}

export function manageableDentistsForPatient(
  state: Pick<ClinicState, 'dentists'>,
  dentist: Dentist | null | undefined,
): Dentist[] {
  if (!dentist) return []
  if (isOwner(dentist)) {
    return state.dentists.filter((member) => member.status === 'active')
  }
  return [dentist]
}
