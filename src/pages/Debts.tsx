import { useState } from 'react'
import { useFinance } from '@/contexts/FinanceContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Landmark, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { DebtModal } from '@/components/debts/DebtModal'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function Debts() {
  const { debts, debtInstallments, companies, deleteDebt } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null)

  const confirmDelete = () => {
    if (debtToDelete) {
      deleteDebt(debtToDelete)
      setDeleteModalOpen(false)
      setDebtToDelete(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Controle de Dívidas</h2>
          <p className="text-muted-foreground">
            Gerencie financiamentos e parcelamentos das empresas.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Financiamento
        </Button>
      </div>

      <div className="grid gap-6">
        {debts.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Landmark className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">Nenhuma dívida cadastrada</p>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                Cadastre seus empréstimos e financiamentos para acompanhar o pagamento das parcelas.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setModalOpen(true)}>
                Cadastrar Primeira Dívida
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {debts.map((debt) => {
              const company = companies.find((c) => c.id === debt.companyId)
              const installments = debtInstallments
                .filter((i) => i.debtId === debt.id)
                .sort((a, b) => a.installmentNumber - b.installmentNumber)
              const paidCount = installments.filter((i) => i.status === 'PAID').length
              const progress =
                debt.totalInstallments > 0 ? (paidCount / debt.totalInstallments) * 100 : 0

              return (
                <AccordionItem
                  key={debt.id}
                  value={debt.id}
                  className="bg-white border rounded-lg px-2 shadow-sm"
                >
                  <AccordionTrigger className="hover:no-underline px-4 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4 text-left pr-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-800">
                            {debt.creditor} - {debt.description}
                          </h3>
                          {progress === 100 ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Quitado
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Em andamento
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Empresa: {company?.name}
                        </p>
                      </div>

                      <div className="w-full sm:w-48 space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                          <span>Progresso</span>
                          <span>
                            {paidCount} de {debt.totalInstallments} pagas
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="w-full sm:w-32 text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                        <p className="font-bold text-slate-800">
                          {formatCurrency(debt.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-slate-700">Parcelas</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          setDebtToDelete(debt.id)
                          setDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir Dívida
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {installments.map((inst) => (
                        <div
                          key={inst.id}
                          className={`p-3 rounded-md border text-sm flex flex-col gap-1 transition-colors ${inst.status === 'PAID' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-slate-700">
                              Parcela {inst.installmentNumber}
                            </span>
                            {inst.status === 'PAID' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-300" />
                            )}
                          </div>
                          <div className="text-slate-500">{formatDate(inst.dueDate)}</div>
                          <div
                            className={`font-medium ${inst.status === 'PAID' ? 'text-emerald-700' : 'text-slate-800'}`}
                          >
                            {formatCurrency(inst.amount)}
                          </div>
                          {inst.status === 'PAID' && (
                            <div className="text-[10px] text-emerald-600/80 mt-1 flex items-center gap-1">
                              Pago nos Lançamentos
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>

      <DebtModal open={modalOpen} onOpenChange={setModalOpen} />

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Financiamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta dívida e todas as suas parcelas? Essa ação não
              pode ser desfeita e não apagará os lançamentos já efetuados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDebtToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
