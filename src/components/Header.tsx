import { Bell, LogOut } from 'lucide-react'
import { useFinance } from '@/contexts/FinanceContext'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { companies, accounts, filters, setFilters, pendingTransactions } = useFinance()
  const { signOut, profile } = useAuth()

  const handleCompanyChange = (value: string) => {
    setFilters((prev) => ({ ...prev, companyId: value, accountId: 'all' }))
  }

  const handleAccountChange = (value: string) => {
    setFilters((prev) => ({ ...prev, accountId: value }))
  }

  const handleDateChange = (range: any) => {
    if (range?.from && range?.to) {
      setFilters((prev) => ({ ...prev, dateRange: { from: range.from, to: range.to } }))
    }
  }

  const filteredAccounts =
    filters.companyId === 'all'
      ? accounts
      : accounts.filter((a) => a.companyId === filters.companyId)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md shadow-sm">
      <SidebarTrigger className="-ml-1" />

      <div className="flex flex-1 items-center justify-between gap-4 md:gap-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-1 min-w-max">
          <Select value={filters.companyId} onValueChange={handleCompanyChange}>
            <SelectTrigger className="w-[180px] bg-white/50">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Consolidado (Ambas)</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.accountId} onValueChange={handleAccountChange}>
            <SelectTrigger className="w-[180px] bg-white/50">
              <SelectValue placeholder="Conta Bancária" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Contas</SelectItem>
              {filteredAccounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePickerWithRange
            date={filters.dateRange}
            setDate={handleDateChange}
            className="hidden md:flex"
          />
        </div>

        <div className="flex items-center gap-4 pr-2">
          <Link
            to="/transactions"
            className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <Bell className="size-5 text-slate-600" />
            {pendingTransactions.length > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 bg-amber-500 hover:bg-amber-600 text-white">
                {pendingTransactions.length}
              </Badge>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-8 w-8 rounded-full bg-primary cursor-pointer hover:bg-primary/90 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-colors">
                {profile?.email?.substring(0, 2).toUpperCase() || 'CV'}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {profile?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
