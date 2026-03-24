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
import { useFinance, Shift } from '@/contexts/FinanceContext'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

interface ShiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: Shift | null
  selectedDate?: string | null
}

export function ShiftModal({ open, onOpenChange, shift, selectedDate }: ShiftModalProps) {
  const { companies, addShift, updateShift } = useFinance()

  const form = useForm<any>({
    defaultValues: {
      employeeName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      companyId: '',
    },
  })

  useEffect(() => {
    if (shift) {
      form.reset({
        ...shift,
        amount: shift.amount.toString(),
      })
    } else {
      form.reset({
        employeeName: '',
        amount: '',
        date: selectedDate || new Date().toISOString().split('T')[0],
        companyId: companies[0]?.id || '',
      })
    }
  }, [shift, open, selectedDate, companies, form])

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
      status: shift ? shift.status : 'PENDING',
    }

    if (shift) {
      updateShift(shift.id, payload)
    } else {
      addShift(payload)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shift ? 'Editar Plantão' : 'Novo Plantão'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Funcionário</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maria Silva" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Plantão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade / Empresa</FormLabel>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
