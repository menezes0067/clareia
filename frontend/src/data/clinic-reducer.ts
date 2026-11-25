import type {
  Appointment,
  AppointmentStatus,
  ClinicInput,
  ClinicState,
  Dentist,
  DentistStatus,
  Patient,
} from '@/domain/types'

export type ClinicAction =
  | { type: 'patient:create'; payload: Patient }
  | { type: 'patient:update'; payload: { id: string; changes: Partial<Patient> } }
  | { type: 'patient:archive'; payload: { id: string } }
  | { type: 'patient:restore'; payload: { id: string } }
  | { type: 'dentist:create'; payload: Dentist }
  | { type: 'dentist:update'; payload: { id: string; changes: Partial<Dentist> } }
  | {
      type: 'dentist:setStatus'
      payload: { id: string; status: DentistStatus }
    }
  | { type: 'appointment:create'; payload: Appointment }
  | {
      type: 'appointment:update'
      payload: { id: string; changes: Partial<Appointment> }
    }
  | {
      type: 'appointment:setStatus'
      payload: { id: string; status: AppointmentStatus }
    }
  | { type: 'clinic:create'; payload: ClinicState }
  | { type: 'clinic:update'; payload: ClinicInput }
  | { type: 'workspace:hydrate'; payload: ClinicState }

export function clinicReducer(
  state: ClinicState,
  action: ClinicAction,
): ClinicState {
  switch (action.type) {
    case 'patient:create':
      return { ...state, patients: [action.payload, ...state.patients] }
    case 'patient:update':
      return {
        ...state,
        patients: state.patients.map((patient) =>
          patient.id === action.payload.id
            ? { ...patient, ...action.payload.changes }
            : patient,
        ),
      }
    case 'patient:archive':
      return {
        ...state,
        patients: state.patients.map((patient) =>
          patient.id === action.payload.id
            ? { ...patient, status: 'archived' }
            : patient,
        ),
      }
    case 'patient:restore':
      return {
        ...state,
        patients: state.patients.map((patient) =>
          patient.id === action.payload.id
            ? { ...patient, status: 'active' }
            : patient,
        ),
      }
    case 'dentist:create':
      return { ...state, dentists: [...state.dentists, action.payload] }
    case 'dentist:update':
      return {
        ...state,
        dentists: state.dentists.map((dentist) =>
          dentist.id === action.payload.id
            ? { ...dentist, ...action.payload.changes }
            : dentist,
        ),
      }
    case 'dentist:setStatus':
      return {
        ...state,
        dentists: state.dentists.map((dentist) =>
          dentist.id === action.payload.id
            ? { ...dentist, status: action.payload.status }
            : dentist,
        ),
      }
    case 'appointment:create':
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
      }
    case 'appointment:update':
      return {
        ...state,
        appointments: state.appointments.map((appointment) =>
          appointment.id === action.payload.id
            ? { ...appointment, ...action.payload.changes }
            : appointment,
        ),
      }
    case 'appointment:setStatus':
      return {
        ...state,
        appointments: state.appointments.map((appointment) =>
          appointment.id === action.payload.id
            ? { ...appointment, status: action.payload.status }
            : appointment,
        ),
      }
    case 'clinic:create':
    case 'workspace:hydrate':
      return action.payload
    case 'clinic:update':
      return {
        ...state,
        clinic: { ...state.clinic, ...action.payload },
      }
    default:
      return state
  }
}
