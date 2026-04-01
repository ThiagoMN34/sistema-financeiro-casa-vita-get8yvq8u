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
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'

interface ShiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: Shift | null
  selectedDate?: string | null
}

export function ShiftModal({ open, onOpenChange, shift, selectedDate }: ShiftModalProps) {
  const { companies, addShift, updateShift, shiftRates } = useFinance()
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [reasonsList, setReasonsList] = useState<any[]>([])

  useEffect(() => {
    const fetchSelectData = async () => {
      const { data: empData } = await supabase
        .from('employees')
        .select('id, name, active')
        .order('name')
      if (empData) setEmployeesList(empData)

      const { data: reasonData } = await supabase
        .from('shift_reasons')
        .select('id, reason')
        .order('reason')
      if (reasonData) setReasonsList(reasonData)
    }
    if (open) {
      fetchSelectData()
    }
  }, [open])

  const form = useForm<any>({
    defaultValues: {
      employeeName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      companyId: '',
      shiftType: '',
      guestName: '',
      reason: '',
      authorizedBy: '',
    },
  })

  const shiftType = form.watch('shiftType')

  useEffect(() => {
    if (shift) {
      form.reset({
        ...shift,
        amount: shift.amount !== undefined ? shift.amount.toString() : '0',
        shiftType: shift.shiftType || '',
        guestName: shift.guestName || '',
        reason: shift.reason || '',
        authorizedBy: shift.authorizedBy || '',
      })
    } else {
      form.reset({
        employeeName: '',
        amount: '',
        date: selectedDate || new Date().toISOString().split('T')[0],
        companyId: companies[0]?.id || '',
        shiftType: '',
        guestName: '',
        reason: '',
        authorizedBy: '',
      })
    }
  }, [shift, open, selectedDate, companies, form])

  useEffect(() => {
    if (shiftType && !shift) {
      const rate = shiftRates.find((r) => r.shiftType === shiftType)
      if (rate && rate.amount > 0) {
        const currentAmount = form.getValues('amount')
        if (!currentAmount || currentAmount === '0' || currentAmount === '') {
          form.setValue('amount', rate.amount.toString())
        }
      }
    }
  }, [shiftType, shift, shiftRates, form])

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      amount: Number(data.amount || 0),
      status: shift ? shift.status : 'PENDING',
    }

    if (shift) {
      updateShift(shift.id, payload)
    } else {
      addShift(payload)
    }

    onOpenChange(false)
  }

  const isPendingOrNew = !shift || shift.status === 'PENDING'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{shift ? 'Editar Plantão' : 'Novo Plantão'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Funcionário</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ex: Maria Silva"
                        list="employees-list"
                        autoComplete="off"
                        {...field}
                        required
                      />
                      <datalist id="employees-list">
                        {employeesList
                          .filter((e) => e.active)
                          .map((e) => (
                            <option key={e.id} value={e.name} />
                          ))}
                      </datalist>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {isPendingOrNew ? (
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
            ) : (
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
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="shiftType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plantão</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="12h diurno clínica">12h Diurno - Clínica</SelectItem>
                      <SelectItem value="12h noturno clínica">12h Noturno - Clínica</SelectItem>
                      <SelectItem value="12h diurno hóspede">12h Diurno - Hóspede</SelectItem>
                      <SelectItem value="12h noturno hóspede">12h Noturno - Hóspede</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {shiftType?.includes('hóspede') && (
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel>Nome do Hóspede</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do paciente" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo / Justificativa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasonsList.map((r) => (
                        <SelectItem key={r.id} value={r.reason}>
                          {r.reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorizedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autorizado por</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome de quem autorizou" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Plantão</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
