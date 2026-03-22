import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFinance } from '@/contexts/FinanceContext'
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
import { Search, Plus, Edit2, Bot, Trash2, UploadCloud } from 'lucide-react'
import { TransactionModal } from '@/components/transactions/TransactionModal'
import { Transaction } from '@/data/mockData'
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

export default function Transactions() {
  const { filteredTransactions, categories, companies, accounts, deleteTransaction } = useFinance()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null)

  const displayData = filteredTransactions.filter(
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lançamentos</h2>
          <p className="text-muted-foreground">Gerencie as transações do período.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar descrição ou NF..."
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum lançamento encontrado.
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
                        <span className="font-semibold text-slate-800">{tx.description}</span>
                        {tx.status === 'PENDING' && (
                          <div className="flex items-center gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] text-amber-600 border-amber-200 bg-amber-50"
                            >
                              Revisão Pendente
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
    </div>
  )
}
