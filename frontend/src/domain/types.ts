export type DentistRole = 'owner' | 'dentist'
export type DentistStatus = 'active' | 'inactive'
export type DentistTone = 'teal' | 'sky' | 'mint' | 'sand' | 'rose'

export type PatientStatus = 'active' | 'archived'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type AppointmentType =
  | 'evaluation'
  | 'cleaning'
  | 'return'
  | 'root_canal'
  | 'orthodontics'
  | 'implant'
  | 'whitening'
  | 'urgency'

export interface Clinic {
  id: string
  name: string
  address: string
  cnpj: string
  phone: string
  email: string
  ownerDentistId: string
  createdAt: string
}

export interface Dentist {
  id: string
  clinicId: string
  name: string
  email: string
  phone: string
  cro: string
  specialty: string
  role: DentistRole
  status: DentistStatus
  tone: DentistTone
  bio?: string
  createdAt: string
}

export interface Patient {
  id: string
  clinicId: string
  dentistId: string
  name: string
  email: string
  phone: string
  birthDate: string
  notes: string
  status: PatientStatus
  createdAt: string
}

export interface Appointment {
  id: string
  clinicId: string
  dentistId: string
  patientId: string
  /** ISO date in yyyy-MM-dd */
  date: string
  /** 24h time in HH:mm */
  startTime: string
  durationMinutes: number
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  createdAt: string
}

export interface ClinicState {
  version: number
  clinic: Clinic
  dentists: Dentist[]
  patients: Patient[]
  appointments: Appointment[]
  seededAt: string
}

export interface PatientInput {
  name: string
  email: string
  phone: string
  birthDate: string
  dentistId: string
  notes: string
}

export interface DentistInput {
  name: string
  email: string
  phone: string
  cro: string
  specialty: string
  bio?: string
}

export interface AppointmentInput {
  patientId: string
  dentistId: string
  date: string
  startTime: string
  durationMinutes: number
  type: AppointmentType
  notes?: string
}

export interface ClinicInput {
  name: string
  address: string
  cnpj: string
  phone: string
  email: string
}
