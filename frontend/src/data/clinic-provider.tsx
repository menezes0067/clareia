import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  Clinic,
  ClinicInput,
  ClinicState,
  Dentist,
  DentistInput,
  DentistStatus,
  NewClinicInput,
  Patient,
  PatientInput,
} from '@/domain/types'
import { clinicReducer } from './clinic-reducer'
import {
  apiClient,
  writeAccessToken,
  type WorkspacePayload,
} from './api-client'

const EMPTY_CLINIC_STATE: ClinicState = {
  clinic: {
    id: '',
    name: '',
    address: '',
    cnpj: '',
    phone: '',
    email: '',
    ownerDentistId: '',
    createdAt: '',
  },
  dentists: [],
  patients: [],
  appointments: [],
}

interface ClinicContextValue {
  clinic: Clinic
  dentists: Dentist[]
  patients: Patient[]
  appointments: Appointment[]
  refreshWorkspace: () => Promise<WorkspacePayload>
  resetWorkspaceMemory: () => void
  createPatient: (input: PatientInput) => Promise<Patient>
  updatePatient: (id: string, input: PatientInput) => Promise<void>
  archivePatient: (id: string) => Promise<void>
  restorePatient: (id: string) => Promise<void>
  createClinic: (input: NewClinicInput) => Promise<Dentist>
  createDentist: (input: DentistInput) => Promise<Dentist>
  updateDentist: (id: string, input: DentistInput) => Promise<void>
  setDentistStatus: (id: string, status: DentistStatus) => Promise<void>
  createAppointment: (input: AppointmentInput) => Promise<Appointment>
  updateAppointment: (id: string, input: AppointmentInput) => Promise<void>
  setAppointmentStatus: (
    id: string,
    status: AppointmentStatus,
  ) => Promise<void>
  updateClinic: (input: ClinicInput) => Promise<void>
}

const ClinicContext = createContext<ClinicContextValue | null>(null)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(clinicReducer, EMPTY_CLINIC_STATE)

  const refreshWorkspace = useCallback(async (): Promise<WorkspacePayload> => {
    const workspace = await apiClient.getWorkspace()
    dispatch({ type: 'workspace:hydrate', payload: workspace })
    return workspace
  }, [])

  const resetWorkspaceMemory = useCallback(() => {
    dispatch({ type: 'workspace:hydrate', payload: EMPTY_CLINIC_STATE })
  }, [])

  const createPatient = useCallback(
    async (input: PatientInput): Promise<Patient> => {
      const created = await apiClient.createPatient(input)
      dispatch({ type: 'patient:create', payload: created })
      return created
    },
    [],
  )

  const updatePatient = useCallback(
    async (id: string, input: PatientInput): Promise<void> => {
      const updated = await apiClient.updatePatient(id, input)
      dispatch({ type: 'patient:update', payload: { id, changes: updated } })
    },
    [],
  )

  const archivePatient = useCallback(async (id: string): Promise<void> => {
    await apiClient.archivePatient(id)
    dispatch({ type: 'patient:archive', payload: { id } })
  }, [])

  const restorePatient = useCallback(async (id: string): Promise<void> => {
    await apiClient.restorePatient(id)
    dispatch({ type: 'patient:restore', payload: { id } })
  }, [])

  const createClinic = useCallback(
    async (input: NewClinicInput): Promise<Dentist> => {
      const result = await apiClient.registerClinic(input)
      writeAccessToken(result.accessToken)
      dispatch({
        type: 'clinic:create',
        payload: {
          clinic: result.clinic,
          dentists: [result.dentist],
          patients: [],
          appointments: [],
        },
      })
      return result.dentist
    },
    [],
  )

  const createDentist = useCallback(
    async (input: DentistInput): Promise<Dentist> => {
      const created = await apiClient.createDentist(input)
      dispatch({ type: 'dentist:create', payload: created })
      return created
    },
    [],
  )

  const updateDentist = useCallback(
    async (id: string, input: DentistInput): Promise<void> => {
      const updated = await apiClient.updateDentist(id, input)
      dispatch({ type: 'dentist:update', payload: { id, changes: updated } })
    },
    [],
  )

  const setDentistStatus = useCallback(
    async (id: string, status: DentistStatus): Promise<void> => {
      const updated = await apiClient.setDentistStatus(id, status)
      dispatch({
        type: 'dentist:setStatus',
        payload: { id, status: updated.status },
      })
    },
    [],
  )

  const createAppointment = useCallback(
    async (input: AppointmentInput): Promise<Appointment> => {
      const created = await apiClient.createAppointment(input)
      dispatch({ type: 'appointment:create', payload: created })
      return created
    },
    [],
  )

  const updateAppointment = useCallback(
    async (id: string, input: AppointmentInput): Promise<void> => {
      const updated = await apiClient.updateAppointment(id, input)
      dispatch({
        type: 'appointment:update',
        payload: { id, changes: updated },
      })
    },
    [],
  )

  const setAppointmentStatus = useCallback(
    async (id: string, status: AppointmentStatus): Promise<void> => {
      const updated = await apiClient.setAppointmentStatus(id, status)
      dispatch({
        type: 'appointment:setStatus',
        payload: { id, status: updated.status },
      })
    },
    [],
  )

  const updateClinic = useCallback(async (input: ClinicInput): Promise<void> => {
    const updated = await apiClient.updateClinic(input)
    dispatch({
      type: 'clinic:update',
      payload: {
        name: updated.name,
        address: updated.address,
        cnpj: updated.cnpj,
        phone: updated.phone,
        email: updated.email,
      },
    })
  }, [])

  const value = useMemo<ClinicContextValue>(
    () => ({
      clinic: state.clinic,
      dentists: state.dentists,
      patients: state.patients,
      appointments: state.appointments,
      refreshWorkspace,
      resetWorkspaceMemory,
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
    }),
    [
      state.clinic,
      state.dentists,
      state.patients,
      state.appointments,
      refreshWorkspace,
      resetWorkspaceMemory,
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
