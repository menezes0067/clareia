import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth-provider'
import { AccessDeniedPage } from '@/pages/access-denied-page'

export function RequireAuth() {
  const { dentist, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div
        className="flex min-h-svh items-center justify-center"
        role="status"
        aria-label="Restaurando sessão"
      >
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!dentist) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}

export function RequireOwner({ children }: { children: ReactNode }) {
  const { isOwner, dentist } = useAuth()
  if (!isOwner || !dentist) return <AccessDeniedPage />
  return <>{children}</>
}
