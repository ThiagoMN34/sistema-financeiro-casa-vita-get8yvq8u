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
import { Bot, Eye, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

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
  const [isUploading, setIsUploading] = useState(false)

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
      nfAttachmentUrl: '',
      pcAttachmentUrl: '',
    },
  })

  useEffect(() => {
    if (transaction) {
      form.reset({
        ...transaction,
        date: transaction.paymentDate.split('T')[0],
        debtInstallmentId: transaction.debtInstallmentId || 'none',
        nfAttachmentUrl: transaction.nfAttachmentUrl || '',
        pcAttachmentUrl: transaction.pcAttachmentUrl || '',
      })
    } else {
      form.reset({
        description: '',
        value: '',
        type: 'OUT',
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        companyId: companies[0]?.id || '',
        accountId: accounts[0]?.id || '',
        nfNumber: '',
        debtInstallmentId: 'none',
        nfAttachmentUrl: '',
        pcAttachmentUrl: '',
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
  }, [form.watch('description'), transaction, aiSuggestCategory])

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
  }, [form.watch('debtInstallmentId'), transaction, pendingInstallments, debts, form])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fieldName}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('attachments').getPublicUrl(filePath)

      form.setValue(fieldName, publicUrlData.publicUrl)
      toast({ title: 'Upload concluído', description: 'Arquivo anexado com sucesso.' })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = (data: any) => {
    if (
      !data.categoryId ||
      !data.companyId ||
      !data.accountId ||
      !data.description ||
      !data.value
    ) {
      toast({
        title: 'Campos obrigatórios',
        description:
          'Por favor, preencha todos os campos (Descrição, Valor, Categoria, Empresa, Conta).',
        variant: 'destructive',
      })
      return
    }

    const payload: any = {
      id: transaction ? transaction.id : Math.random().toString(36).substring(7),
      ...data,
      value: Number(data.value),
      paymentDate: new Date(data.date).toISOString(),
      competenceDate: new Date(data.date).toISOString(),
      status: data.status || 'PENDING',
      debtInstallmentId: data.debtInstallmentId === 'none' ? undefined : data.debtInstallmentId,
      nfAttachmentUrl: data.nfAttachmentUrl || undefined,
      pcAttachmentUrl: data.pcAttachmentUrl || undefined,
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
                      {transaction?.status === 'CONFIRMED' && (
                        <SelectItem value="CONFIRMED">Pago / Confirmado (Conciliado)</SelectItem>
                      )}
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

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <FormField
                control={form.control}
                name="nfAttachmentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Nota Fiscal</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => handleFileUpload(e, 'nfAttachmentUrl')}
                          disabled={isUploading}
                          className="text-xs flex-1 cursor-pointer"
                        />
                        {field.value && (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="shrink-0"
                            title="Ver anexo"
                          >
                            <a href={field.value} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 text-blue-500" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pcAttachmentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Pedido de Compra
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => handleFileUpload(e, 'pcAttachmentUrl')}
                          disabled={isUploading}
                          className="text-xs flex-1 cursor-pointer"
                        />
                        {field.value && (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="shrink-0"
                            title="Ver anexo"
                          >
                            <a href={field.value} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 text-emerald-500" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
