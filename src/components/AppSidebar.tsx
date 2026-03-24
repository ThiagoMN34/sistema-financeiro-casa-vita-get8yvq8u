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
  ChevronsUpDown,
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
  useSidebar,
} from '@/components/ui/sidebar'
import { useFinance } from '@/contexts/FinanceContext'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const { isMobile } = useSidebar()
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
    <Sidebar className="border-r border-slate-200 glass-effect flex flex-col h-full">
      <SidebarHeader className="p-4 border-b border-slate-100 flex items-center flex-row gap-3">
        <div className="bg-primary p-2 rounded-lg text-white">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-primary">Casa Vita</h1>
          <p className="text-xs text-muted-foreground">Sistema Financeiro</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1">
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

      <SidebarFooter className="border-t border-slate-100 p-2 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-6"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold">
                      {profile?.email?.substring(0, 2).toUpperCase() || 'CV'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-800">{profile?.email}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.role === 'ADMIN' ? 'Administrador' : 'Gestor'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm p-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold">
                        {profile?.email?.substring(0, 2).toUpperCase() || 'CV'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{profile?.email}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {profile?.role === 'ADMIN' ? 'Administrador' : 'Gestor'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2.5"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
