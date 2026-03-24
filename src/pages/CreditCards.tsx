import { useState, useMemo } from 'react'
import { useFinance, CreditCard } from '@/contexts/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { CreditCardModal } from '@/components/credit-cards/CreditCardModal'
import { ImportInvoiceModal } from '@/components/credit-cards/ImportInvoiceModal'
import { PayInvoiceModal } from '@/components/credit-cards/PayInvoiceModal'
import {
  Plus,
  CreditCard as CreditCardIcon,
  UploadCloud,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CreditCards() {
  const {
    creditCards,
    creditCardTransactions,
    categories,
    deleteCreditCard,
    deleteCreditCardTransaction,
  } = useFinance()

  const [selectedCardId, setSelectedCardId] = useState<string | null>(creditCards[0]?.id || null)
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())

  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)

  // Update selected card if it's null and cards are loaded
  if (!selectedCardId && creditCards.length > 0) {
    setSelectedCardId(creditCards[0].id)
  }

  const invoiceMonth = format(currentMonthDate, 'yyyy-MM')
  const displayMonthStr = format(currentMonthDate, 'MMMM yyyy', { locale: ptBR })

  const selectedCard = creditCards.find((c) => c.id === selectedCardId)

  const currentTransactions = useMemo(() => {
    if (!selectedCardId) return []
    return creditCardTransactions
      .filter((t) => t.cardId === selectedCardId && t.invoiceMonth === invoiceMonth)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [creditCardTransactions, selectedCardId, invoiceMonth])

  const invoiceTotal = useMemo(() => {
    return currentTransactions.reduce((acc, t) => acc + t.amount, 0)
  }, [currentTransactions])

  const handlePrevMonth = () => setCurrentMonthDate(subMonths(currentMonthDate, 1))
  const handleNextMonth = () => setCurrentMonthDate(addMonths(currentMonthDate, 1))

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cartões de Crédito</h2>
          <p className="text-muted-foreground">Gerencie faturas e importações via PDF/OCR.</p>
        </div>
        <Button onClick={() => setIsCardModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Cartão
        </Button>
      </div>

      {creditCards.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCardIcon className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">Nenhum cartão cadastrado</p>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Cadastre seu primeiro cartão de crédito para começar a importar suas faturas
              automaticamente.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setIsCardModalOpen(true)}>
              Cadastrar Cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Cards List */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-slate-700 px-1">Meus Cartões</h3>
            <div className="flex flex-col gap-2">
              {creditCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCardId === card.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${selectedCardId === card.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      <CreditCardIcon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{card.name}</p>
                      <p className="text-xs text-slate-500">Vence dia {card.dueDay}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Invoice Area */}
          <div className="md:col-span-3 space-y-6">
            {selectedCard && (
              <>
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center justify-between border-b bg-slate-50/50 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePrevMonth}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-32 text-center font-semibold text-slate-800 capitalize">
                          {displayMonthStr}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleNextMonth}
                          className="h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="bg-white"
                        onClick={() => setIsImportModalOpen(true)}
                      >
                        <UploadCloud className="h-4 w-4 mr-2" /> Importar PDF
                      </Button>
                      <Button
                        onClick={() => setIsPayModalOpen(true)}
                        disabled={invoiceTotal === 0}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Wallet className="h-4 w-4 mr-2" /> Pagar Fatura
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-6 bg-white border-b flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                          Total da Fatura
                        </p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">
                          {formatCurrency(invoiceTotal)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">
                          Fechamento: Dia {selectedCard.closingDay}
                        </p>
                        <p className="text-sm text-slate-500">
                          Vencimento: Dia {selectedCard.dueDay}
                        </p>
                      </div>
                    </div>

                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-[100px]">Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="h-32 text-center text-muted-foreground"
                            >
                              <p>Nenhum lançamento nesta fatura.</p>
                              <Button
                                variant="link"
                                onClick={() => setIsImportModalOpen(true)}
                                className="mt-2"
                              >
                                Clique aqui para importar o PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentTransactions.map((tx) => {
                            const cat = categories.find((c) => c.id === tx.categoryId)
                            return (
                              <TableRow key={tx.id} className="group hover:bg-slate-50">
                                <TableCell className="font-medium text-slate-600">
                                  {formatDate(tx.date)}
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold text-slate-800">
                                    {tx.description}
                                  </span>
                                  {tx.installmentTotal && tx.installmentTotal > 1 && (
                                    <span className="ml-2 text-xs text-slate-400 font-normal">
                                      ({tx.installmentCurrent}/{tx.installmentTotal})
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-slate-500">
                                  {cat?.name || '-'}
                                </TableCell>
                                <TableCell className="text-right font-medium text-slate-800">
                                  {formatCurrency(tx.amount)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteCreditCardTransaction(tx.id)}
                                    title="Remover"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => {
                      if (
                        confirm(
                          'Tem certeza que deseja excluir este cartão e todo o seu histórico?',
                        )
                      ) {
                        deleteCreditCard(selectedCard.id)
                        setSelectedCardId(null)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir Cartão
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <CreditCardModal open={isCardModalOpen} onOpenChange={setIsCardModalOpen} />

      {selectedCard && (
        <>
          <ImportInvoiceModal
            open={isImportModalOpen}
            onOpenChange={setIsImportModalOpen}
            cardId={selectedCard.id}
            invoiceMonth={invoiceMonth}
          />
          <PayInvoiceModal
            open={isPayModalOpen}
            onOpenChange={setIsPayModalOpen}
            cardId={selectedCard.id}
            invoiceMonth={invoiceMonth}
            total={invoiceTotal}
          />
        </>
      )}
    </div>
  )
}
