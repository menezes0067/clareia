import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'
import { ClinicProvider } from '@/data/clinic-provider'
import { AuthProvider } from '@/features/auth/auth-provider'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClinicProvider>
        <AuthProvider>
          <App />
          <Toaster theme="light" position="top-right" richColors />
        </AuthProvider>
      </ClinicProvider>
    </BrowserRouter>
  </StrictMode>,
)
