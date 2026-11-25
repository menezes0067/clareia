import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Dentist } from '@/domain/types'
import { isOwner as isOwnerRole } from '@/domain/permissions'
import { useClinic } from '@/data/clinic-provider'
import {
  apiClient,
  ApiError,
  clearAccessToken,
  readAccessToken,
  writeAccessToken,
} from '@/data/api-client'

interface LoginResult {
  ok: boolean
  error?: string
}

interface AuthContextValue {
  dentist: Dentist | null
  isOwner: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  signIn: (dentist: Dentist) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { dentists, refreshWorkspace, resetWorkspaceMemory } = useClinic()
  const [authenticatedDentist, setAuthenticatedDentist] =
    useState<Dentist | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(readAccessToken()),
  )

  useEffect(() => {
    const token = readAccessToken()
    if (!token) return
    let active = true
    Promise.all([apiClient.getMe(), refreshWorkspace()])
      .then(([me]) => {
        if (!active) return
        setAuthenticatedDentist(me.dentist)
      })
      .catch(() => {
        if (!active) return
        clearAccessToken()
        setAuthenticatedDentist(null)
        resetWorkspaceMemory()
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshWorkspace, resetWorkspaceMemory])

  const dentist = useMemo(() => {
    if (!authenticatedDentist) return null
    const latest = dentists.find(
      (member) => member.id === authenticatedDentist.id,
    )
    const current = latest ?? authenticatedDentist
    return current.status === 'active' ? current : null
  }, [authenticatedDentist, dentists])

  const signIn = useCallback((nextDentist: Dentist) => {
    setAuthenticatedDentist(nextDentist)
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      try {
        const result = await apiClient.login(email, password)
        writeAccessToken(result.accessToken)
        await refreshWorkspace()
        setAuthenticatedDentist(result.dentist)
        return { ok: true }
      } catch (error) {
        clearAccessToken()
        if (error instanceof ApiError) {
          return { ok: false, error: error.message }
        }
        return { ok: false, error: 'Não foi possível entrar.' }
      }
    },
    [refreshWorkspace],
  )

  const logout = useCallback(() => {
    clearAccessToken()
    setAuthenticatedDentist(null)
    resetWorkspaceMemory()
  }, [resetWorkspaceMemory])

  const value = useMemo<AuthContextValue>(
    () => ({
      dentist,
      isOwner: isOwnerRole(dentist),
      isLoading,
      login,
      signIn,
      logout,
    }),
    [dentist, isLoading, login, signIn, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
