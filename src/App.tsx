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
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import ShiftCheckIn from './pages/ShiftCheckIn'
import { FinanceProvider } from './contexts/FinanceContext'
import { AuthProvider, useAuth } from './hooks/use-auth'

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth()
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  if (!session) return <Login />
  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Preparando o seu ambiente...
      </div>
    )
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

const App = () => (
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
              path="/import"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Import />
                </RoleGuard>
              }
            />
            <Route path="/shifts" element={<Shifts />} />
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

export default App
