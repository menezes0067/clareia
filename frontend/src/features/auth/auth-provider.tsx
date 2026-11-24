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
import { DEMO_PASSWORD } from '@/domain/schemas'
import { useClinic } from '@/data/clinic-provider'
import {
  clearSessionDentistId,
  readSessionDentistId,
  writeSessionDentistId,
} from '@/data/local-repository'

interface LoginResult {
  ok: boolean
  error?: string
}

interface AuthContextValue {
  dentist: Dentist | null
  isOwner: boolean
  login: (email: string, password: string) => LoginResult
  /** Usado pelo cadastro: a dona já sai autenticada ao criar a clínica. */
  signIn: (dentistId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { dentists } = useClinic()
  const [sessionDentistId, setSessionDentistId] = useState<string | null>(() =>
    readSessionDentistId(),
  )

  const dentist = useMemo(() => {
    if (!sessionDentistId) return null
    const match = dentists.find((member) => member.id === sessionDentistId)
    if (!match || match.status !== 'active') return null
    return match
  }, [dentists, sessionDentistId])

  useEffect(() => {
    if (sessionDentistId && !dentist) {
      clearSessionDentistId()
      setSessionDentistId(null)
    }
  }, [dentist, sessionDentistId])

  const signIn = useCallback((dentistId: string) => {
    writeSessionDentistId(dentistId)
    setSessionDentistId(dentistId)
  }, [])

  const login = useCallback(
    (email: string, password: string): LoginResult => {
      const normalizedEmail = email.trim().toLowerCase()
      const match = dentists.find(
        (member) =>
          member.email.toLowerCase() === normalizedEmail &&
          member.status === 'active',
      )

      if (!match) {
        return {
          ok: false,
          error: 'Não encontramos uma conta ativa com este e-mail.',
        }
      }
      if (password !== DEMO_PASSWORD) {
        return {
          ok: false,
          error: 'Senha incorreta. Nas contas demo, use demo123.',
        }
      }

      signIn(match.id)
      return { ok: true }
    },
    [dentists, signIn],
  )

  const logout = useCallback(() => {
    clearSessionDentistId()
    setSessionDentistId(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      dentist,
      isOwner: isOwnerRole(dentist),
      login,
      signIn,
      logout,
    }),
    [dentist, login, signIn, logout],
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
