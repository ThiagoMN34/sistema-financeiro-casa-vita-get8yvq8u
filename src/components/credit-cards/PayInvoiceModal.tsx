import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useFinance } from '@/contexts/FinanceContext'
import { formatCurrency } from '@/lib/formatters'

export function PayInvoiceModal({ open, onOpenChange, cardId, invoiceMonth, total }: any) {
  const { accounts, payCreditCardInvoice } = useFinance()
  const [accountId, setAccountId] = useState('')

  const handlePay = () => {
    if (!accountId) return
    payCreditCardInvoice(cardId, invoiceMonth, accountId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar Fatura - {invoiceMonth}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-6 rounded-md text-center border border-slate-200">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Valor a Pagar
            </div>
            <div className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(total)}</div>
          </div>
          <div className="space-y-2">
            <Label>Conta Origem do Pagamento</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione de onde sairá o dinheiro" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
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
          <Button onClick={handlePay} disabled={!accountId}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
