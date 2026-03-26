import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFinance, Transaction } from '@/contexts/FinanceContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit2, Bot, Trash2, UploadCloud, Paperclip } from 'lucide-react'
import { TransactionModal } from '@/components/transactions/TransactionModal'
import { useToast } from '@/hooks/use-toast'
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
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { startOfMonth, endOfMonth, subMonths, isSameDay, endOfDay } from 'date-fns'

export default function Transactions() {
  const {
    filteredTransactions,
    categories,
    companies,
    accounts,
    deleteTransaction,
    deleteAllTransactions,
    summary,
    filters,
    setFilters,
  } = useFinance()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null)
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false)

  const transactionsWithBalance = useMemo(() => {
    let currentBalance = summary.balance
    return filteredTransactions.map((tx) => {
      const runningBalance = currentBalance
      if (tx.type === 'IN') {
        currentBalance -= tx.value
      } else {
        currentBalance += tx.value
      }
      return { ...tx, runningBalance }
    })
  }, [filteredTransactions, summary.balance])

  const displayData = transactionsWithBalance.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nfNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (t: Transaction) => {
    setSelectedTx(t)
    setModalOpen(true)
  }

  const handleNew = () => {
    setSelectedTx(null)
    setModalOpen(true)
  }

  const handleDeleteClick = (t: Transaction) => {
    setTxToDelete(t)
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id)
      toast({
        title: 'Lançamento excluído',
        description: 'O lançamento foi removido com sucesso.',
      })
      setDeleteModalOpen(false)
      setTxToDelete(null)
    }
  }

  const handleClearAllClick = () => {
    setClearAllModalOpen(true)
  }

  const confirmClearAll = async () => {
    await deleteAllTransactions()
    setClearAllModalOpen(false)
  }

  const today = new Date()
  const currentMonthRange = useMemo(
    () => ({ from: startOfMonth(today), to: endOfMonth(today) }),
    [today],
  )
  const lastMonthRange = useMemo(() => {
    const lastMonth = subMonths(today, 1)
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
  }, [today])
  const last6MonthsRange = useMemo(
    () => ({ from: startOfMonth(subMonths(today, 5)), to: endOfMonth(today) }),
    [today],
  )
  const allTimeRange = useMemo(
    () => ({ from: new Date('2000-01-01'), to: new Date('2100-12-31') }),
    [],
  )

  let activeFilter = 'custom'
  if (filters.dateRange.from && filters.dateRange.to) {
    if (
      isSameDay(filters.dateRange.from, currentMonthRange.from) &&
      isSameDay(filters.dateRange.to, currentMonthRange.to)
    ) {
      activeFilter = 'current_month'
    } else if (
      isSameDay(filters.dateRange.from, lastMonthRange.from) &&
      isSameDay(filters.dateRange.to, lastMonthRange.to)
    ) {
      activeFilter = 'last_month'
    } else if (
      isSameDay(filters.dateRange.from, last6MonthsRange.from) &&
      isSameDay(filters.dateRange.to, last6MonthsRange.to)
    ) {
      activeFilter = 'last_6_months'
    } else if (
      isSameDay(filters.dateRange.from, allTimeRange.from) &&
      isSameDay(filters.dateRange.to, allTimeRange.to)
    ) {
      activeFilter = 'all_time'
    }
  }

  const applyDateFilter = (filterType: string) => {
    let newRange = currentMonthRange
    if (filterType === 'last_month') newRange = lastMonthRange
    else if (filterType === 'last_6_months') newRange = last6MonthsRange
    else if (filterType === 'all_time') newRange = allTimeRange

    setFilters((prev) => ({ ...prev, dateRange: newRange }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lançamentos</h2>
          <p className="text-muted-foreground">Gerencie as transações do período.</p>
        </div>
        <div className="flex flex-wrap w-full sm:w-auto gap-2">
          <Button
            variant="outline"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            onClick={handleClearAllClick}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Limpar Todos
          </Button>
          <Button variant="outline" asChild>
            <Link to="/import">
              <UploadCloud className="h-4 w-4 mr-2" /> Importar
            </Link>
          </Button>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" /> Novo
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeFilter === 'current_month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyDateFilter('current_month')}
            className={activeFilter !== 'current_month' ? 'bg-white hover:bg-slate-100' : ''}
          >
            Mês atual
          </Button>
          <Button
            variant={activeFilter === 'last_month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyDateFilter('last_month')}
            className={activeFilter !== 'last_month' ? 'bg-white hover:bg-slate-100' : ''}
          >
            Mês anterior
          </Button>
          <Button
            variant={activeFilter === 'last_6_months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyDateFilter('last_6_months')}
            className={activeFilter !== 'last_6_months' ? 'bg-white hover:bg-slate-100' : ''}
          >
            Últimos 6 meses
          </Button>
          <Button
            variant={activeFilter === 'all_time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyDateFilter('all_time')}
            className={activeFilter !== 'all_time' ? 'bg-white hover:bg-slate-100' : ''}
          >
            Todo o período
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar descrição ou NF..."
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <DatePickerWithRange
              date={filters.dateRange as any}
              setDate={(range) => {
                if (range?.from && range?.to) {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { from: range.from!, to: endOfDay(range.to!) },
                  }))
                } else if (range?.from) {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { from: range.from!, to: endOfDay(range.from!) },
                  }))
                }
              }}
            />
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Empresa / Conta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum lançamento encontrado para os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((tx) => (
                  <TableRow key={tx.id} className="group transition-colors hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-600">
                      {formatDate(tx.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {tx.description}
                          {(tx.nfAttachmentUrl || tx.pcAttachmentUrl) && (
                            <Paperclip
                              className="h-3.5 w-3.5 text-slate-400"
                              title="Possui anexo(s)"
                            />
                          )}
                        </span>
                        {(tx.status === 'PENDING' || tx.status === 'AUTHORIZED') && (
                          <div className="flex items-center gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                tx.status === 'AUTHORIZED'
                                  ? 'text-blue-600 border-blue-200 bg-blue-50'
                                  : 'text-amber-600 border-amber-200 bg-amber-50'
                              }`}
                            >
                              {tx.status === 'AUTHORIZED' ? 'Aprovado' : 'Aguardando Aprovação'}
                            </Badge>
                            {tx.aiConfidence && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1"
                              >
                                <Bot className="size-3" /> IA {tx.aiConfidence}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">
                      {categories.find((c) => c.id === tx.categoryId)?.name || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-slate-500">
                      <div>{companies.find((c) => c.id === tx.companyId)?.name}</div>
                      <div className="opacity-70">
                        {accounts.find((a) => a.id === tx.accountId)?.name}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {tx.type === 'OUT' ? '-' : '+'}
                      {formatCurrency(tx.value)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-600">
                      {formatCurrency(tx.runningBalance)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tx)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDeleteClick(tx)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} transaction={selectedTx} />

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lançamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTxToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAllModalOpen} onOpenChange={setClearAllModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir TODOS os Lançamentos</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>TODOS</strong> os lançamentos? Esta ação é
              irreversível e removerá todos os dados de transações cadastradas no sistema. Utilize
              esta opção apenas durante a fase de testes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
