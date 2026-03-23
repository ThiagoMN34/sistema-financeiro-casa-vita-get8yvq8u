import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance } from '@/contexts/FinanceContext'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

interface DebtModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DebtModal({ open, onOpenChange }: DebtModalProps) {
  const { companies, addDebt } = useFinance()

  const form = useForm<any>({
    defaultValues: {
      description: '',
      creditor: '',
      totalAmount: '',
      totalInstallments: '',
      startDate: new Date().toISOString().split('T')[0],
      companyId: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        description: '',
        creditor: '',
        totalAmount: '',
        totalInstallments: '',
        startDate: new Date().toISOString().split('T')[0],
        companyId: companies[0]?.id || '',
      })
    }
  }, [open, companies, form])

  const onSubmit = (data: any) => {
    const total = parseFloat(data.totalAmount)
    const qty = parseInt(data.totalInstallments, 10)
    const amountPerInstallment = total / qty

    const installments = []
    let currentDate = new Date(data.startDate)

    for (let i = 1; i <= qty; i++) {
      installments.push({
        installmentNumber: i,
        dueDate: currentDate.toISOString(),
        amount: amountPerInstallment,
        status: 'PENDING' as const,
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    addDebt(
      {
        companyId: data.companyId,
        description: data.description,
        creditor: data.creditor,
        totalAmount: total,
        totalInstallments: qty,
        startDate: new Date(data.startDate).toISOString(),
        status: 'ACTIVE',
      },
      installments,
    )

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Financiamento / Dívida</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="creditor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credor / Banco</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Itaú" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Capital de Giro" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qtd. de Parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da 1ª Parcela</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Cadastrar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
