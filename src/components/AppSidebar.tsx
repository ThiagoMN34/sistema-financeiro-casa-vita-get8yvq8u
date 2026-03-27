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
  Settings,
  LogOut,
  Users,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import logoUrl from '@/assets/casavita_300rgb-1-24932.jpg'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transações', href: '/transactions', icon: Receipt },
    { name: 'Importar Extrato', href: '/import', icon: Upload },
    { name: 'Aprovações', href: '/approvals', icon: CheckSquare },
    { name: 'Usuários', href: '/users', icon: Users },
  ]

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
              {navigation.map((item) => {
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
