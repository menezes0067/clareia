import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth-provider'
import { AccessDeniedPage } from '@/pages/access-denied-page'

export function RequireAuth() {
  const { dentist } = useAuth()
  const location = useLocation()

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
