import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Receipt,
  Upload,
  CheckSquare,
  LogOut,
  Users,
  CreditCard,
  Landmark,
  Tags,
  PieChart,
  Clock,
  Building2,
  Briefcase,
  UserCircle,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import logoUrl from '@/assets/casavita_300rgb-1-24932.jpg'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { signOut, profile } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN'] },
    { name: 'Transações', href: '/transactions', icon: Receipt, roles: ['ADMIN'] },
    { name: 'Cartões', href: '/credit-cards', icon: CreditCard, roles: ['ADMIN'] },
    { name: 'Aprovações', href: '/approvals', icon: CheckSquare, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Plantões', href: '/shifts', icon: Clock, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Funcionários', href: '/employees', icon: UserCircle, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Prestadores', href: '/providers', icon: Briefcase, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Importar Extrato', href: '/import', icon: Upload, roles: ['ADMIN'] },
    { name: 'Relatórios', href: '/reports', icon: PieChart, roles: ['ADMIN'] },
    { name: 'Dívidas', href: '/debts', icon: Landmark, roles: ['ADMIN'] },
    { name: 'Categorias', href: '/categories', icon: Tags, roles: ['ADMIN'] },
    { name: 'Contas', href: '/accounts', icon: Building2, roles: ['ADMIN'] },
    { name: 'Usuários', href: '/users', icon: Users, roles: ['ADMIN'] },
  ]

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (profile && item.roles.includes(profile.role)),
  )

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/50 p-4 bg-background">
        <Link
          to="/"
          className="flex items-center justify-center py-2 transition-opacity hover:opacity-90"
        >
          <img src={logoUrl} alt="Casa Vita" className="h-16 w-auto object-contain" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* Small orange accent on the label */}
          <SidebarGroupLabel className="text-secondary font-semibold uppercase tracking-wider text-[10px]">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={
                        isActive
                          ? 'text-primary hover:text-primary font-medium'
                          : 'text-muted-foreground hover:text-primary'
                      }
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair do sistema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
