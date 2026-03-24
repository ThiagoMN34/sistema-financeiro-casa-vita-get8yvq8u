import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ReceiptText,
  Tags,
  Landmark,
  UploadCloud,
  Building2,
  BarChart3,
  Banknote,
  CalendarDays,
  Users,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useFinance } from '@/contexts/FinanceContext'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'

const navigation = [
  { name: 'Visão Geral', to: '/', icon: LayoutDashboard },
  { name: 'Lançamentos', to: '/transactions', icon: ReceiptText },
  { name: 'Importar Extrato', to: '/import', icon: UploadCloud },
  { name: 'Plantões', to: '/shifts', icon: CalendarDays },
  { name: 'Relatórios', to: '/reports', icon: BarChart3 },
  { name: 'Dívidas', to: '/debts', icon: Banknote },
  { name: 'Categorias', to: '/categories', icon: Tags },
  { name: 'Contas Bancárias', to: '/accounts', icon: Landmark },
  { name: 'Usuários', to: '/users', icon: Users },
]

export function AppSidebar() {
  const location = useLocation()
  const { pendingTransactions, shifts } = useFinance()
  const { profile, signOut } = useAuth()

  const pendingShiftsCount = shifts.filter((s) => s.status === 'PENDING').length

  const filteredNavigation = navigation.filter((item) => {
    if (profile?.role === 'MANAGER') {
      return item.to === '/shifts'
    }
    return true
  })

  return (
    <Sidebar className="border-r border-slate-200 glass-effect">
      <SidebarHeader className="p-4 border-b border-slate-100 flex items-center flex-row gap-3">
        <div className="bg-primary p-2 rounded-lg text-white">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-primary">Casa Vita</h1>
          <p className="text-xs text-muted-foreground">Sistema Financeiro</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.to
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className="py-5"
                    >
                      <Link to={item.to} className="flex items-center gap-3">
                        <item.icon className="size-5" />
                        <span className="font-medium">{item.name}</span>
                        {item.to === '/transactions' && pendingTransactions.length > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto bg-amber-500 hover:bg-amber-600 text-[10px] px-1.5 py-0"
                          >
                            {pendingTransactions.length}
                          </Badge>
                        )}
                        {item.to === '/shifts' && pendingShiftsCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto bg-indigo-500 hover:bg-indigo-600 text-[10px] px-1.5 py-0"
                          >
                            {pendingShiftsCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="py-5 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="size-5" />
              <span className="font-medium">Sair do Sistema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
