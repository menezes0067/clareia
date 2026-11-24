import { createId } from '@/lib/id'
import type {
  Clinic,
  ClinicInput,
  ClinicState,
  Dentist,
  DentistInput,
} from './types'

/** Versão do formato persistido no localStorage. */
export const CLINIC_STATE_VERSION = 2

export interface NewClinicInput {
  owner: DentistInput
  clinic: ClinicInput
}

export interface NewClinicResult {
  clinic: Clinic
  owner: Dentist
  state: ClinicState
}

/**
 * Cria uma clínica nova e a conta da dona como entidades vinculadas.
 * O workspace começa vazio: pacientes, dentistas e consultas são cadastros
 * posteriores, feitos já com os dados da clínica disponíveis no sistema.
 */
export function createClinicState(
  input: NewClinicInput,
  now: Date = new Date(),
): NewClinicResult {
  const createdAt = now.toISOString()
  const clinicId = createId('clinic')
  const ownerId = createId('dent')

  const owner: Dentist = {
    ...input.owner,
    id: ownerId,
    clinicId,
    role: 'owner',
    status: 'active',
    tone: 'teal',
    createdAt,
  }

  const clinic: Clinic = {
    ...input.clinic,
    id: clinicId,
    ownerDentistId: ownerId,
    createdAt,
  }

  const state: ClinicState = {
    version: CLINIC_STATE_VERSION,
    clinic,
    dentists: [owner],
    patients: [],
    appointments: [],
    seededAt: createdAt,
  }

  return { clinic, owner, state }
}
