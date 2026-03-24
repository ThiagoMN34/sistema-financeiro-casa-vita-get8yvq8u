import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadCloud } from 'lucide-react'
import { useFinance } from '@/contexts/FinanceContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ImportInvoiceModal({ open, onOpenChange, cardId, invoiceMonth }: any) {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { aiSuggestCategory, categories, addCreditCardTransactions, learnAiMapping } = useFinance()

  const handleFile = () => {
    setIsProcessing(true)
    setStep(2)
    setTimeout(() => {
      const mockTx = [
        { date: `${invoiceMonth}-05`, description: 'UBER *TRIP', amount: 25.5 },
        { date: `${invoiceMonth}-10`, description: 'IFOOD *DELIVERY', amount: 45.9 },
        { date: `${invoiceMonth}-12`, description: 'AMAZON PRIME', amount: 14.9 },
        { date: `${invoiceMonth}-15`, description: 'MERCADO LIVRE', amount: 120.0 },
        { date: `${invoiceMonth}-20`, description: 'POSTO IPIRANGA', amount: 150.0 },
      ]

      const parsed = mockTx.map((tx, i) => {
        const cat = aiSuggestCategory(tx.description)
        return {
          id: `tmp-${i}`,
          ...tx,
          categoryId: cat.categoryId,
          aiConfidence: cat.confidence,
        }
      })
      setRows(parsed)
      setIsProcessing(false)
    }, 1500)
  }

  const handleConfirm = () => {
    const txs = rows.map((r) => ({
      cardId,
      date: r.date,
      description: r.description,
      amount: r.amount,
      categoryId: r.categoryId,
      invoiceMonth,
    }))
    addCreditCardTransactions(txs)

    rows.forEach((r) => {
      const words = r.description.split(' ').filter((w: string) => w.length > 3)
      if (words.length > 0) learnAiMapping(words[0], r.categoryId)
    })

    onOpenChange(false)
    setStep(1)
    setRows([])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setStep(1)
          setRows([])
        }
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar Fatura (OCR)</DialogTitle>
          <DialogDescription>
            Importe o PDF da sua fatura para leitura automática dos lançamentos.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-primary/50 hover:bg-slate-50 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.csv"
              onChange={handleFile}
            />
            <UploadCloud className="size-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">
              Clique para enviar o PDF da fatura
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              A IA fará a extração e categorização dos lançamentos.
            </p>
          </div>
        )}

        {step === 2 && isProcessing && (
          <div className="py-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg font-medium text-slate-700">Lendo faturas via OCR...</p>
          </div>
        )}

        {step === 2 && !isProcessing && (
          <div className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Categoria (IA)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>R$ {row.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={row.categoryId}
                          onValueChange={(v) => {
                            const n = [...rows]
                            n[i].categoryId = v
                            setRows(n)
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={handleConfirm}>Confirmar {rows.length} Lançamentos</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
