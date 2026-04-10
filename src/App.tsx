import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Transactions from './pages/Transactions'
import Import from './pages/Import'
import Reports from './pages/Reports'
import Debts from './pages/Debts'
import Categories from './pages/Categories'
import Accounts from './pages/Accounts'
import Shifts from './pages/Shifts'
import Users from './pages/Users'
import CreditCards from './pages/CreditCards'
import Approvals from './pages/Approvals'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import ShiftCheckIn from './pages/ShiftCheckIn'
import Employees from './pages/Employees'
import Providers from './pages/Providers'
import { useEffect } from 'react'
import { FinanceProvider } from './contexts/FinanceContext'
import { AuthProvider, useAuth } from './hooks/use-auth'

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Preparando o seu ambiente...</p>
        <button
          onClick={signOut}
          className="text-sm underline text-blue-500 hover:text-blue-600 transition-colors"
        >
          Sair / Trocar de Conta
        </button>
      </div>
    )
  }

  return <>{children}</>
}

const RoleGuard = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[]
  children: React.ReactNode
}) => {
  const { profile } = useAuth()
  if (!profile) return null
  if (!allowedRoles.includes(profile.role)) return <Navigate to="/shifts" replace />
  return <>{children}</>
}

const App = () => {
  useEffect(() => {
    const clearSupabaseTokens = () => {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.includes('supabase.auth.token')) {
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        // Ignore errors during cleanup
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const msg = reason?.message || reason?.toString() || ''

      if (
        msg.includes('Failed to fetch') ||
        msg.includes('Load failed') ||
        msg.includes('NetworkError') ||
        msg.includes('Erro na requisição') ||
        (reason?.url && reason.url.includes('auth/v1/token'))
      ) {
        console.warn('Ignored unhandled fetch error:', reason)

        if (
          msg.includes('auth/v1/token') ||
          msg.includes('refresh_token') ||
          (reason?.url && reason.url.includes('auth/v1/token'))
        ) {
          clearSupabaseTokens()
        }

        event.preventDefault()
      }
    }

    const handleError = (event: ErrorEvent) => {
      const msg = event.error?.message || event.message || ''
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('Load failed') ||
        msg.includes('NetworkError') ||
        msg.includes('Erro na requisição')
      ) {
        console.warn('Ignored fetch error:', msg)

        if (msg.includes('auth/v1/token') || msg.includes('refresh_token')) {
          clearSupabaseTokens()
        }

        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError, true)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError, true)
    }
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <Routes>
            <Route path="/check-in" element={<ShiftCheckIn />} />
            <Route
              element={
                <AuthWrapper>
                  <FinanceProvider>
                    <Layout />
                  </FinanceProvider>
                </AuthWrapper>
              }
            >
              <Route
                path="/"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Index />
                  </RoleGuard>
                }
              />
              <Route
                path="/transactions"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Transactions />
                  </RoleGuard>
                }
              />
              <Route
                path="/approvals"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                    <Approvals />
                  </RoleGuard>
                }
              />
              <Route
                path="/import"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Import />
                  </RoleGuard>
                }
              />
              <Route path="/shifts" element={<Shifts />} />
              <Route
                path="/employees"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                    <Employees />
                  </RoleGuard>
                }
              />
              <Route
                path="/providers"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                    <Providers />
                  </RoleGuard>
                }
              />
              <Route
                path="/reports"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Reports />
                  </RoleGuard>
                }
              />
              <Route
                path="/debts"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Debts />
                  </RoleGuard>
                }
              />
              <Route
                path="/categories"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Categories />
                  </RoleGuard>
                }
              />
              <Route
                path="/accounts"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Accounts />
                  </RoleGuard>
                }
              />
              <Route
                path="/credit-cards"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <CreditCards />
                  </RoleGuard>
                }
              />
              <Route
                path="/users"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <Users />
                  </RoleGuard>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
