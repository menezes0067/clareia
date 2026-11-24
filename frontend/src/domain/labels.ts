import type {
  AppointmentStatus,
  AppointmentType,
  DentistRole,
  DentistStatus,
  DentistTone,
  PatientStatus,
} from './types'

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  evaluation: 'Avaliação',
  cleaning: 'Limpeza',
  return: 'Retorno',
  root_canal: 'Endodontia',
  orthodontics: 'Ortodontia',
  implant: 'Implante',
  whitening: 'Clareamento',
  urgency: 'Urgência',
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  no_show: 'Faltou',
}

export const appointmentStatusDescriptions: Record<AppointmentStatus, string> = {
  scheduled: 'Ainda aguardando confirmação do paciente.',
  confirmed: 'Presença confirmada.',
  completed: 'Atendimento realizado.',
  cancelled: 'Consulta cancelada.',
  no_show: 'Paciente não compareceu.',
}

export const dentistRoleLabels: Record<DentistRole, string> = {
  owner: 'Dono da clínica',
  dentist: 'Dentista',
}

export const dentistStatusLabels: Record<DentistStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
}

export const patientStatusLabels: Record<PatientStatus, string> = {
  active: 'Ativo',
  archived: 'Arquivado',
}

export const dentistToneLabels: Record<DentistTone, string> = {
  teal: 'Teal',
  sky: 'Céu',
  mint: 'Menta',
  sand: 'Areia',
  rose: 'Rosé',
}

export const appointmentDurationByType: Record<AppointmentType, number> = {
  evaluation: 30,
  cleaning: 45,
  return: 30,
  root_canal: 90,
  orthodontics: 60,
  implant: 120,
  whitening: 60,
  urgency: 30,
}

export const appointmentTypes = Object.keys(
  appointmentTypeLabels,
) as AppointmentType[]

export const appointmentStatuses = Object.keys(
  appointmentStatusLabels,
) as AppointmentStatus[]
