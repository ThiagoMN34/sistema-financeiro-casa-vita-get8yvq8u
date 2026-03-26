import { useEffect, useState } from 'react'
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
import { useFinance, Transaction } from '@/contexts/FinanceContext'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Bot } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

export function TransactionModal({ open, onOpenChange, transaction }: TransactionModalProps) {
  const {
    categories,
    companies,
    accounts,
    debts,
    debtInstallments,
    addTransaction,
    updateTransaction,
    aiSuggestCategory,
    learnAiMapping,
  } = useFinance()
  const [aiSuggestion, setAiSuggestion] = useState<{ id: string; conf: string } | null>(null)

  const pendingInstallments = debtInstallments.filter((i) => i.status === 'PENDING')

  const form = useForm<any>({
    defaultValues: {
      description: '',
      value: '',
      type: 'OUT',
      status: 'CONFIRMED',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      companyId: '',
      accountId: '',
      nfNumber: '',
      debtInstallmentId: 'none',
    },
  })

  useEffect(() => {
    if (transaction) {
      form.reset({
        ...transaction,
        date: transaction.paymentDate.split('T')[0],
        debtInstallmentId: transaction.debtInstallmentId || 'none',
      })
    } else {
      form.reset({
        description: '',
        value: '',
        type: 'OUT',
        status: 'CONFIRMED',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        companyId: companies[0]?.id || '',
        accountId: accounts[0]?.id || '',
        nfNumber: '',
        debtInstallmentId: 'none',
      })
    }
  }, [transaction, open, companies, accounts, form])

  // AI Simulation Effect
  useEffect(() => {
    const desc = form.watch('description')
    if (desc && desc.length > 3 && !transaction) {
      const suggestion = aiSuggestCategory(desc)
      setAiSuggestion({ id: suggestion.categoryId, conf: suggestion.confidence })
    } else {
      setAiSuggestion(null)
    }
  }, [form.watch('description')])

  // Auto-fill value and desc when an installment is selected
  useEffect(() => {
    const selectedInstId = form.watch('debtInstallmentId')
    if (selectedInstId && selectedInstId !== 'none' && !transaction) {
      const inst = pendingInstallments.find((i) => i.id === selectedInstId)
      if (inst) {
        const debt = debts.find((d) => d.id === inst.debtId)
        form.setValue('value', inst.amount.toString())
        if (debt && !form.getValues('description')) {
          form.setValue(
            'description',
            `Parcela ${inst.installmentNumber}/${debt.totalInstallments} - ${debt.creditor}`,
          )
        }
      }
    }
  }, [form.watch('debtInstallmentId')])

  const onSubmit = (data: any) => {
    const payload: any = {
      id: transaction ? transaction.id : Math.random().toString(36).substring(7),
      ...data,
      value: Number(data.value),
      paymentDate: new Date(data.date).toISOString(),
      competenceDate: new Date(data.date).toISOString(),
      status: data.status || 'CONFIRMED',
      debtInstallmentId: data.debtInstallmentId === 'none' ? undefined : data.debtInstallmentId,
    }

    if (data.description && data.categoryId) {
      learnAiMapping(data.description, data.categoryId)
    }

    if (transaction) updateTransaction(transaction.id, payload)
    else addTransaction(payload)

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN">Receita</SelectItem>
                        <SelectItem value="OUT">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente (Aguardando Conferência)</SelectItem>
                      <SelectItem value="AUTHORIZED">Aprovado (Pronto para Pagar)</SelectItem>
                      <SelectItem value="CONFIRMED">Pago / Confirmado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {form.watch('type') === 'OUT' && (
              <FormField
                control={form.control}
                name="debtInstallmentId"
                render={({ field }) => (
                  <FormItem className="col-span-2 animate-in fade-in slide-in-from-top-1">
                    <FormLabel>Vincular a parcela de dívida/financiamento (Opcional)</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val)}
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma parcela pendente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Não vincular</SelectItem>
                        {pendingInstallments.map((i) => {
                          const debt = debts.find((d) => d.id === i.debtId)
                          return (
                            <SelectItem key={i.id} value={i.id}>
                              {debt?.creditor} - {debt?.description} | Parcela {i.installmentNumber}
                              /{debt?.totalInstallments} ({formatCurrency(i.amount)})
                            </SelectItem>
                          )
                        })}
                        {transaction?.debtInstallmentId &&
                          !pendingInstallments.find(
                            (i) => i.id === transaction.debtInstallmentId,
                          ) && (
                            <SelectItem value={transaction.debtInstallmentId} disabled>
                              Parcela vinculada atual (Já Paga)
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Conta de Luz" {...field} />
                  </FormControl>
                  {aiSuggestion && (
                    <div className="flex items-center gap-2 mt-1 animate-fade-in-up">
                      <Bot className="size-3 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">IA sugere:</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors"
                        onClick={() => form.setValue('categoryId', aiSuggestion.id)}
                      >
                        {categories.find((c) => c.id === aiSuggestion.id)?.name}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground opacity-60">
                        ({aiSuggestion.conf})
                      </span>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

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
