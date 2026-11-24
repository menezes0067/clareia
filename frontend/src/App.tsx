import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth, RequireOwner } from '@/features/auth/require-auth'

const LandingPage = lazy(() =>
  import('@/features/landing/landing-page').then((module) => ({
    default: module.LandingPage,
  })),
)
const LoginPage = lazy(() =>
  import('@/features/auth/login-page').then((module) => ({
    default: module.LoginPage,
  })),
)
const OnboardingPage = lazy(() =>
  import('@/features/onboarding/onboarding-page').then((module) => ({
    default: module.OnboardingPage,
  })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
)
const AgendaPage = lazy(() =>
  import('@/features/agenda/agenda-page').then((module) => ({
    default: module.AgendaPage,
  })),
)
const PatientsPage = lazy(() =>
  import('@/features/patients/patients-page').then((module) => ({
    default: module.PatientsPage,
  })),
)
const PatientDetailPage = lazy(() =>
  import('@/features/patients/patient-detail-page').then((module) => ({
    default: module.PatientDetailPage,
  })),
)
const TeamPage = lazy(() =>
  import('@/features/team/team-page').then((module) => ({
    default: module.TeamPage,
  })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/settings-page').then((module) => ({
    default: module.SettingsPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found-page').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function RouteFallback() {
  return (
    <div
      className="flex min-h-[60svh] items-center justify-center"
      role="status"
      aria-label="Carregando página"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastro" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="pacientes" element={<PatientsPage />} />
              <Route
                path="pacientes/:patientId"
                element={<PatientDetailPage />}
              />
              <Route
                path="equipe"
                element={
                  <RequireOwner>
                    <TeamPage />
                  </RequireOwner>
                }
              />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
