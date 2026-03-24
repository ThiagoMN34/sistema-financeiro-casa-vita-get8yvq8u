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
import { Input } from '@/components/ui/input'
import { UploadCloud, Trash2, Plus, FileText } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

export function ImportInvoiceModal({ open, onOpenChange, cardId, invoiceMonth }: any) {
  const [step, setStep] = useState(1)
  const [currentTab, setCurrentTab] = useState('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [pastedText, setPastedText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { aiSuggestCategory, categories, addCreditCardTransactions, learnAiMapping } = useFinance()

  const parseAndSetRows = (text: string) => {
    const lines = text.split('\n')
    const newRows: any[] = []

    // Regex for DD/MM Description Amount
    const regex1 = /(\d{2}\/\d{2})\s+(.+?)\s+R?\$\s*([\d.,]+)/i
    const regex2 = /(\d{2}\/\d{2})\s+(.+?)\s+([\d.,]+)/i
    // Regex for YYYY-MM-DD,Description,Amount (CSV)
    const csvRegex = /(\d{4}-\d{2}-\d{2})[;,]\s*(.+?)[;,]\s*([\d.,]+)/i

    lines.forEach((line, i) => {
      let date = ''
      let desc = ''
      let amount = NaN

      const csvMatch = line.match(csvRegex)
      const match1 = line.match(regex1)
      const match2 = line.match(regex2)

      if (csvMatch) {
        date = csvMatch[1]
        desc = csvMatch[2]
        amount = parseFloat(csvMatch[3].replace(/\./g, '').replace(',', '.'))
      } else if (match1) {
        const [_, dateStr, descStr, amountStr] = match1
        const [day, month] = dateStr.split('/')
        const year = invoiceMonth ? invoiceMonth.split('-')[0] : new Date().getFullYear().toString()
        date = `${year}-${month}-${day}`
        desc = descStr
        amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'))
      } else if (match2) {
        const [_, dateStr, descStr, amountStr] = match2
        const [day, month] = dateStr.split('/')
        const year = invoiceMonth ? invoiceMonth.split('-')[0] : new Date().getFullYear().toString()
        date = `${year}-${month}-${day}`
        desc = descStr
        amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'))
      }

      if (date && desc && !isNaN(amount)) {
        const cat = aiSuggestCategory(desc.trim())
        newRows.push({
          id: `tmp-${Date.now()}-${i}`,
          date,
          description: desc.trim(),
          amount,
          categoryId: cat.categoryId,
          aiConfidence: cat.confidence,
        })
      }
    })

    if (newRows.length > 0) {
      setRows(newRows)
    } else {
      toast({
        title: 'Aviso',
        description: 'Nenhum lançamento identificado automaticamente. Adicione manualmente.',
        variant: 'default',
      })
      setRows([
        {
          id: `tmp-${Date.now()}-empty`,
          date: `${invoiceMonth || new Date().toISOString().slice(0, 7)}-01`,
          description: '',
          amount: 0,
          categoryId: categories[0]?.id || '',
        },
      ])
    }
    setStep(2)
    setIsProcessing(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.name.endsWith('.pdf')) {
      toast({
        title: 'Aviso de Formato',
        description:
          'A extração automática de PDFs não está disponível no navegador. Por favor, copie o texto do PDF e utilize a aba "Colar Texto".',
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      setCurrentTab('paste')
      return
    }

    setIsProcessing(true)
    setStep(2)

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = evt.target?.result as string
        parseAndSetRows(text)
      }
      reader.readAsText(file)
    } else {
      setIsProcessing(false)
      setStep(1)
      toast({
        title: 'Formato inválido',
        description: 'Por favor, envie um arquivo CSV ou TXT.',
        variant: 'destructive',
      })
    }
  }

  const handlePasteProcess = () => {
    setIsProcessing(true)
    parseAndSetRows(pastedText)
  }

  const updateRow = (id: string, field: string, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        date: `${invoiceMonth}-01`,
        description: '',
        amount: 0,
        categoryId: categories[0]?.id || '',
      },
    ])
  }

  const handleConfirm = () => {
    const validRows = rows.filter((r) => r.description && r.amount > 0 && r.date)
    if (validRows.length === 0) {
      toast({
        title: 'Erro',
        description: 'Nenhum lançamento válido para importar.',
        variant: 'destructive',
      })
      return
    }

    const txs = validRows.map((r) => ({
      cardId,
      date: r.date,
      description: r.description,
      amount: r.amount,
      categoryId: r.categoryId,
      invoiceMonth,
    }))
    addCreditCardTransactions(txs)

    validRows.forEach((r) => {
      const words = r.description.split(' ').filter((w: string) => w.length > 3)
      if (words.length > 0) learnAiMapping(words[0], r.categoryId)
    })

    toast({ title: 'Sucesso', description: `${validRows.length} lançamentos importados.` })
    onOpenChange(false)
    setStep(1)
    setRows([])
    setPastedText('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setStep(1)
          setRows([])
          setPastedText('')
          setCurrentTab('upload')
        }
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Importar Fatura</DialogTitle>
          <DialogDescription>
            Importe o CSV/TXT ou cole o texto da sua fatura para leitura dos lançamentos.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
              <TabsTrigger value="paste">Colar Texto</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-primary/50 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.txt,.pdf"
                  onChange={handleFile}
                />
                <UploadCloud className="size-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">
                  Clique para enviar o arquivo da fatura
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Suporta CSV ou TXT.</p>
                <p className="text-xs text-rose-500 mt-2 font-medium">
                  Para PDF, por favor, copie o conteúdo e utilize a aba "Colar Texto".
                </p>
              </div>
            </TabsContent>
            <TabsContent value="paste" className="mt-4 space-y-4">
              <Textarea
                placeholder="Cole aqui o texto copiado da sua fatura em PDF (Data, Descrição, Valor)..."
                className="min-h-[200px]"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
              <Button onClick={handlePasteProcess} disabled={!pastedText.trim()} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Processar Texto
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {step === 2 && isProcessing && (
          <div className="py-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg font-medium text-slate-700">Processando lançamentos...</p>
          </div>
        )}

        {step === 2 && !isProcessing && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-amber-50 text-amber-800 p-4 rounded-md text-sm border border-amber-200 gap-4">
              <p>
                <strong>Atenção:</strong> Revise os lançamentos extraídos. O sistema tentou
                identificar os registros de forma estrita. Se faltou algo, adicione manualmente.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                className="bg-white whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar Linha
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[140px]">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[120px]">Valor (R$)</TableHead>
                    <TableHead className="w-[180px]">Categoria</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Nenhum lançamento válido encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="p-2">
                          <Input
                            type="date"
                            value={row.date}
                            onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                            className="h-9 text-sm"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.description}
                            onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="Descrição"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={row.amount}
                            onChange={(e) =>
                              updateRow(row.id, 'amount', parseFloat(e.target.value) || 0)
                            }
                            className="h-9 text-sm"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Select
                            value={row.categoryId}
                            onValueChange={(v) => updateRow(row.id, 'categoryId', v)}
                          >
                            <SelectTrigger className="h-9 text-sm bg-white">
                              <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id} className="text-sm">
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => removeRow(row.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              <div className="text-sm font-medium bg-slate-100 px-4 py-2 rounded-md w-full sm:w-auto text-center">
                Total da Fatura:{' '}
                <span className="text-lg font-bold ml-2">
                  R$ {rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto">
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={rows.length === 0}
                  className="w-full sm:w-auto"
                >
                  Confirmar {rows.length} Lançamentos
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
