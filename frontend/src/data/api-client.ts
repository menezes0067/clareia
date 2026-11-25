import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  Clinic,
  ClinicInput,
  Dentist,
  DentistInput,
  DentistStatus,
  NewClinicInput,
  Patient,
  PatientInput,
} from '@/domain/types'

const TOKEN_STORAGE_KEY = 'clareia:token:v1'

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL || '/api/v1'
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

export function readAccessToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeAccessToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // Ignore storage errors
  }
}

export function clearAccessToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

export interface AuthPayload {
  accessToken: string
  expiresIn: number
  dentist: Dentist
  clinic: Clinic
}

export interface WorkspacePayload {
  clinic: Clinic
  dentists: Dentist[]
  patients: Patient[]
  appointments: Appointment[]
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string>

  constructor(
    status: number,
    message: string,
    code = 'API_ERROR',
    fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options
  const token = skipAuth ? null : readAccessToken()
  const finalHeaders = new Headers(headers)

  if (!finalHeaders.has('Accept')) {
    finalHeaders.set('Accept', 'application/json')
  }
  if (rest.body && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json')
  }
  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      headers: finalHeaders,
    })
  } catch {
    throw new ApiError(
      0,
      'Não foi possível conectar ao servidor da Clareia. Verifique se o backend está em execução.',
      'NETWORK_ERROR',
    )
  }

  const contentType = response.headers.get('content-type') ?? ''
  const hasJson =
    contentType.includes('application/json') ||
    contentType.includes('application/problem+json')
  const body = hasJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    if (response.status === 401 && !skipAuth) {
      clearAccessToken()
    }
    const detail =
      (body && typeof body.detail === 'string' && body.detail) ||
      (body && typeof body.message === 'string' && body.message) ||
      'Não foi possível concluir a operação.'
    const code =
      (body && typeof body.code === 'string' && body.code) || 'API_ERROR'
    const fieldErrors =
      body && typeof body.fieldErrors === 'object' && body.fieldErrors !== null
        ? (body.fieldErrors as Record<string, string>)
        : {}
    throw new ApiError(response.status, detail, code, fieldErrors)
  }

  return body as T
}

export const apiClient = {
  login(email: string, password: string): Promise<AuthPayload> {
    return request<AuthPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
  },

  registerClinic(input: NewClinicInput): Promise<AuthPayload> {
    return request<AuthPayload>('/auth/register-clinic', {
      method: 'POST',
      body: JSON.stringify(input),
      skipAuth: true,
    })
  },

  getMe(): Promise<{ dentist: Dentist; clinic: Clinic }> {
    return request<{ dentist: Dentist; clinic: Clinic }>('/auth/me')
  },

  getWorkspace(): Promise<WorkspacePayload> {
    return request<WorkspacePayload>('/workspace')
  },

  updateClinic(input: ClinicInput): Promise<Clinic> {
    return request<Clinic>('/clinic', {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  createDentist(input: DentistInput): Promise<Dentist> {
    return request<Dentist>('/dentists', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updateDentist(id: string, input: DentistInput): Promise<Dentist> {
    return request<Dentist>(`/dentists/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  setDentistStatus(id: string, status: DentistStatus): Promise<Dentist> {
    return request<Dentist>(`/dentists/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  createPatient(input: PatientInput): Promise<Patient> {
    return request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updatePatient(id: string, input: PatientInput): Promise<Patient> {
    return request<Patient>(`/patients/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  archivePatient(id: string): Promise<Patient> {
    return request<Patient>(`/patients/${encodeURIComponent(id)}/archive`, {
      method: 'PATCH',
    })
  },

  restorePatient(id: string): Promise<Patient> {
    return request<Patient>(`/patients/${encodeURIComponent(id)}/restore`, {
      method: 'PATCH',
    })
  },

  createAppointment(input: AppointmentInput): Promise<Appointment> {
    return request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updateAppointment(id: string, input: AppointmentInput): Promise<Appointment> {
    return request<Appointment>(`/appointments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  setAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    return request<Appointment>(
      `/appointments/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    )
  },
}
