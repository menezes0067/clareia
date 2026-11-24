import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  Clinic,
  ClinicInput,
  Dentist,
  DentistInput,
  DentistStatus,
  DentistTone,
  Patient,
  PatientInput,
} from '@/domain/types'
import { createId } from '@/lib/id'
import { createClinicState, type NewClinicInput } from '@/domain/clinic'
import { clinicReducer } from './clinic-reducer'
import {
  LocalClinicRepository,
  type ClinicRepository,
} from './local-repository'

const TONES: DentistTone[] = ['sky', 'mint', 'sand', 'rose', 'teal']

interface ClinicContextValue {
  clinic: Clinic
  dentists: Dentist[]
  patients: Patient[]
  appointments: Appointment[]
  createPatient: (input: PatientInput) => Patient
  updatePatient: (id: string, input: PatientInput) => void
  archivePatient: (id: string) => void
  restorePatient: (id: string) => void
  createClinic: (input: NewClinicInput) => Dentist
  createDentist: (input: DentistInput) => Dentist
  updateDentist: (id: string, input: DentistInput) => void
  setDentistStatus: (id: string, status: DentistStatus) => void
  createAppointment: (input: AppointmentInput) => Appointment
  updateAppointment: (id: string, input: AppointmentInput) => void
  setAppointmentStatus: (id: string, status: AppointmentStatus) => void
  updateClinic: (input: ClinicInput) => void
  resetDemo: () => Dentist
}

const ClinicContext = createContext<ClinicContextValue | null>(null)

interface ClinicProviderProps {
  children: ReactNode
  repository?: ClinicRepository
}

export function ClinicProvider({ children, repository }: ClinicProviderProps) {
  const [repositoryInstance] = useState<ClinicRepository>(
    () => repository ?? new LocalClinicRepository(),
  )
  const [state, dispatch] = useReducer(
    clinicReducer,
    undefined,
    () => repositoryInstance.load(),
  )

  useEffect(() => {
    repositoryInstance.save(state)
  }, [repositoryInstance, state])

  const clinicId = state.clinic.id

  const createPatient = useCallback(
    (input: PatientInput): Patient => {
      const patient: Patient = {
        id: createId('patient'),
        clinicId,
        ...input,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'patient:create', payload: patient })
      return patient
    },
    [clinicId],
  )

  const updatePatient = useCallback((id: string, input: PatientInput) => {
    const changes: Partial<Patient> = { ...input }
    dispatch({ type: 'patient:update', payload: { id, changes } })
  }, [])

  const archivePatient = useCallback((id: string) => {
    dispatch({ type: 'patient:archive', payload: { id } })
  }, [])

  const restorePatient = useCallback((id: string) => {
    dispatch({ type: 'patient:restore', payload: { id } })
  }, [])

  const createClinic = useCallback(
    (input: NewClinicInput): Dentist => {
      const { owner, state } = createClinicState(input)
      dispatch({ type: 'clinic:create', payload: state })
      return owner
    },
    [],
  )

  const createDentist = useCallback(
    (input: DentistInput): Dentist => {
      const dentist: Dentist = {
        id: createId('dentist'),
        clinicId,
        ...input,
        role: 'dentist',
        status: 'active',
        tone: TONES[state.dentists.length % TONES.length],
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'dentist:create', payload: dentist })
      return dentist
    },
    [clinicId, state.dentists.length],
  )

  const updateDentist = useCallback((id: string, input: DentistInput) => {
    const changes: Partial<Dentist> = { ...input }
    dispatch({ type: 'dentist:update', payload: { id, changes } })
  }, [])

  const setDentistStatus = useCallback(
    (id: string, status: DentistStatus) => {
      dispatch({ type: 'dentist:setStatus', payload: { id, status } })
    },
    [],
  )

  const createAppointment = useCallback(
    (input: AppointmentInput): Appointment => {
      const appointment: Appointment = {
        id: createId('appointment'),
        clinicId,
        ...input,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'appointment:create', payload: appointment })
      return appointment
    },
    [clinicId],
  )

  const updateAppointment = useCallback(
    (id: string, input: AppointmentInput) => {
      const changes: Partial<Appointment> = { ...input }
      dispatch({ type: 'appointment:update', payload: { id, changes } })
    },
    [],
  )

  const setAppointmentStatus = useCallback(
    (id: string, status: AppointmentStatus) => {
      dispatch({ type: 'appointment:setStatus', payload: { id, status } })
    },
    [],
  )

  const updateClinic = useCallback((input: ClinicInput) => {
    dispatch({ type: 'clinic:update', payload: input })
  }, [])

  const resetDemo = useCallback((): Dentist => {
    const seeded = repositoryInstance.reset()
    dispatch({ type: 'demo:reset', payload: seeded })
    return seeded.dentists.find((member) => member.role === 'owner')!
  }, [repositoryInstance])

  const value = useMemo<ClinicContextValue>(
    () => ({
      clinic: state.clinic,
      dentists: state.dentists,
      patients: state.patients,
      appointments: state.appointments,
      createPatient,
      updatePatient,
      archivePatient,
      restorePatient,
      createClinic,
      createDentist,
      updateDentist,
      setDentistStatus,
      createAppointment,
      updateAppointment,
      setAppointmentStatus,
      updateClinic,
      resetDemo,
    }),
    [
      state.clinic,
      state.dentists,
      state.patients,
      state.appointments,
      createPatient,
      updatePatient,
      archivePatient,
      restorePatient,
      createClinic,
      createDentist,
      updateDentist,
      setDentistStatus,
      createAppointment,
      updateAppointment,
      setAppointmentStatus,
      updateClinic,
      resetDemo,
    ],
  )

  return (
    <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
  )
}

export function useClinic(): ClinicContextValue {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error('useClinic deve ser usado dentro de ClinicProvider')
  }
  return context
}
