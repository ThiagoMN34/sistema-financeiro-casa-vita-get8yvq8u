import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import logoUrl from '@/assets/casavita_300rgb-1-24932.jpg'
import { useMobile } from '@/hooks/use-mobile'
import { Link } from 'react-router-dom'

export function Header() {
  const { user } = useAuth()
  const isMobile = useMobile()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-primary hover:text-primary/80 transition-colors" />
        {isMobile && (
          <Link to="/" className="flex items-center">
            <img
              src={logoUrl}
              alt="Casa Vita"
              className="h-9 w-auto object-contain drop-shadow-sm"
            />
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-secondary hover:text-secondary hover:bg-secondary/10 relative transition-all"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
        </Button>

        <div className="flex items-center gap-3 pl-3 border-l border-border/60">
          <div className="hidden flex-col items-end md:flex">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              {user?.email?.split('@')[0] || 'Usuário'}
            </span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20 transition-all hover:border-primary hover:shadow-sm cursor-pointer ring-offset-background hover:ring-2 hover:ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.email?.substring(0, 2).toUpperCase() || 'US'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
