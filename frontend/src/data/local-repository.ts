import type { ClinicState } from '@/domain/types'
import { createSeedState, DB_VERSION } from './seed'

const STORAGE_KEY = 'clareia:clinic:v1'

export interface ClinicRepository {
  load(): ClinicState
  save(state: ClinicState): void
  reset(): ClinicState
}

function isValidState(value: unknown): value is ClinicState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ClinicState>
  return (
    candidate.version === DB_VERSION &&
    Boolean(candidate.clinic) &&
    Array.isArray(candidate.dentists) &&
    Array.isArray(candidate.patients) &&
    Array.isArray(candidate.appointments)
  )
}

export class LocalClinicRepository implements ClinicRepository {
  private readonly storage: Storage

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage
  }

  load(): ClinicState {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (isValidState(parsed)) return parsed
      }
    } catch {
      // Corrupted or unavailable storage falls back to a fresh demo.
    }
    const seeded = createSeedState()
    this.save(seeded)
    return seeded
  }

  save(state: ClinicState): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // A demo can keep running in memory if storage is unavailable.
    }
  }

  reset(): ClinicState {
    const seeded = createSeedState()
    this.save(seeded)
    return seeded
  }
}

const SESSION_KEY = 'clareia:session:v1'

export function readSessionDentistId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function writeSessionDentistId(dentistId: string): void {
  try {
    window.localStorage.setItem(SESSION_KEY, dentistId)
  } catch {
    // Session stays in memory when storage is unavailable.
  }
}

export function clearSessionDentistId(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignore storage errors in the demo.
  }
}
