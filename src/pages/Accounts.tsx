import { useFinance } from '@/contexts/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { Landmark, Building2 } from 'lucide-react'

export default function Accounts() {
  const { accounts, companies } = useFinance()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contas Bancárias</h2>
        <p className="text-muted-foreground">Controle as contas vinculadas a cada empresa.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account) => {
          const company = companies.find((c) => c.id === account.companyId)
          return (
            <Card
              key={account.id}
              className="shadow-sm border-slate-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Landmark className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{account.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Building2 className="size-3" />
                    {company?.name}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">
                    Saldo Inicial Configurado
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {formatCurrency(account.initialBalance)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
