import { useState } from 'react'
import { useFinance } from '@/contexts/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/formatters'
import { Landmark, Building2, Pencil, Check, X } from 'lucide-react'

export default function Accounts() {
  const { accounts, companies, updateAccount } = useFinance()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  const handleEdit = (account: (typeof accounts)[0]) => {
    setEditingId(account.id)
    setEditValue(account.initialBalance.toString())
  }

  const handleSave = (accountId: string) => {
    const newBalance = parseFloat(editValue)
    if (!isNaN(newBalance)) {
      updateAccount(accountId, { initialBalance: newBalance })
    }
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contas Bancárias</h2>
        <p className="text-muted-foreground">Controle as contas vinculadas a cada empresa.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account) => {
          const company = companies.find((c) => c.id === account.companyId)
          const isEditing = editingId === account.id

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
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center h-[72px]">
                  <span className="text-sm font-medium text-slate-500">
                    Saldo Inicial Configurado
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-32 h-8 text-right bg-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(account.id)
                          if (e.key === 'Escape') handleCancel()
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleSave(account.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-800">
                        {formatCurrency(account.initialBalance)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 ml-1"
                        onClick={() => handleEdit(account)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
