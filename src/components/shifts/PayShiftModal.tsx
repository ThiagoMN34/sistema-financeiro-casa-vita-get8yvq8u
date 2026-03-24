import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance, Shift } from '@/contexts/FinanceContext'
import { formatCurrency } from '@/lib/formatters'
import { Label } from '@/components/ui/label'

interface PayShiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift: Shift | null
}

export function PayShiftModal({ open, onOpenChange, shift }: PayShiftModalProps) {
  const { accounts, categories, payShift } = useFinance()
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    if (open && shift) {
      const defaultAccount =
        accounts.find((a) => a.companyId === shift.companyId)?.id || accounts[0]?.id || ''
      setAccountId(defaultAccount)

      const plantaoCat =
        categories.find((c) => c.name.toLowerCase().includes('plantão'))?.id ||
        categories[0]?.id ||
        ''
      setCategoryId(plantaoCat)
    }
  }, [open, shift, accounts, categories])

  const handleConfirm = async () => {
    if (!shift || !accountId || !categoryId) return
    await payShift(shift.id, accountId, categoryId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Efetivar Pagamento</DialogTitle>
          <DialogDescription>
            Confirme a conta e a categoria para gerar o lançamento financeiro de{' '}
            {shift ? formatCurrency(shift.amount) : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Conta Bancária (Saída)</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  .filter((a) => !shift || a.companyId === shift.companyId)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria Financeira</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!accountId || !categoryId}>
            Confirmar e Pagar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
