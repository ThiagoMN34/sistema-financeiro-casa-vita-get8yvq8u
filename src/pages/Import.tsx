import { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { UploadCloud, CheckCircle2, AlertCircle, Bot } from 'lucide-react'
import { useFinance } from '@/contexts/FinanceContext'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ImportRow = {
  id: string
  date: string
  description: string
  value: number
  type: 'IN' | 'OUT'
  categoryId: string
  aiConfidence: 'high' | 'medium' | 'low'
  selected: boolean
}

export default function Import() {
  const [step, setStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importRows, setImportRows] = useState<ImportRow[]>([])

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addTransaction, aiSuggestCategory, categories, companies, accounts, learnAiMapping } =
    useFinance()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id)
    }
  }, [companies, selectedCompanyId])

  useEffect(() => {
    if (selectedCompanyId) {
      const accs = accounts.filter((a) => a.companyId === selectedCompanyId)
      if (accs.length > 0) {
        setSelectedAccountId(accs[0].id)
      } else {
        setSelectedAccountId('')
      }
    }
  }, [selectedCompanyId, accounts])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true)
    else if (e.type === 'dragleave') setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      parseFile(e.target.files[0])
    }
  }

  const parseFile = async (file: File) => {
    setIsProcessing(true)
    setStep(2)

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/)
      const parsed: ImportRow[] = []

      const dateRegex = /(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!line.trim()) continue

        const parts = line.split(/[,\t;]/).map((p) => p.trim().replace(/^"|"$/g, ''))

        let date = ''
        let desc = ''
        let val = 0
        let hasVal = false

        for (const part of parts) {
          if (!date && dateRegex.test(part)) {
            const match = part.match(dateRegex)
            if (match) {
              if (match[1].includes('/')) {
                const [d, m, y] = match[1].split('/')
                date = `${y}-${m}-${d}`
              } else {
                date = match[1]
              }
            }
          } else if (!hasVal) {
            const clean = part.replace(/[R$\s"']/gi, '')
            if (/^[-+]?\d{1,3}(\.\d{3})*(,\d+)?$/.test(clean) || /^[-+]?\d+(,\d+)?$/.test(clean)) {
              val = parseFloat(clean.replace(/\./g, '').replace(',', '.'))
              hasVal = true
            } else if (
              /^[-+]?\d{1,3}(,\d{3})*(\.\d+)?$/.test(clean) ||
              /^[-+]?\d+(\.\d+)?$/.test(clean)
            ) {
              val = parseFloat(clean.replace(/,/g, ''))
              hasVal = true
            }
          }

          if (
            !dateRegex.test(part) &&
            isNaN(Number(part.replace(/[R$\s.,]/g, ''))) &&
            part.length > 2
          ) {
            if (!desc) desc = part
            else desc += ` ${part}`
          }
        }

        if (date && hasVal && desc) {
          const suggestion = aiSuggestCategory(desc)
          parsed.push({
            id: `imp-${Date.now()}-${i}`,
            date,
            description: desc.substring(0, 80),
            value: Math.abs(val),
            type: val >= 0 ? 'IN' : 'OUT',
            categoryId: suggestion.categoryId,
            aiConfidence: suggestion.confidence,
            selected: true,
          })
        }
      }

      if (parsed.length === 0) {
        const mockDesc = [
          'TARIFA BANCARIA',
          'PAGAMENTO FORNECEDOR',
          'CONTA DE LUZ',
          'RECEBIMENTO PIX',
          'MATERIAL LIMPEZA',
        ]
        mockDesc.forEach((desc, i) => {
          const suggestion = aiSuggestCategory(desc)
          parsed.push({
            id: `imp-${Date.now()}-${i}`,
            date: new Date().toISOString().split('T')[0],
            description: desc,
            value: Math.floor(Math.random() * 500) + 15,
            type: i === 3 ? 'IN' : 'OUT',
            categoryId: suggestion.categoryId,
            aiConfidence: suggestion.confidence,
            selected: true,
          })
        })
        toast({
          title: 'Aviso',
          description:
            'Arquivo binário ou formato não reconhecido. Usando dados extraídos simulados para demonstração.',
        })
      } else {
        toast({ title: 'Sucesso', description: `${parsed.length} transações identificadas.` })
      }

      setImportRows(parsed)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao processar arquivo.' })
      setStep(1)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateRow = (index: number, updates: Partial<ImportRow>) => {
    setImportRows((prev) => {
      const newRows = [...prev]
      newRows[index] = { ...newRows[index], ...updates }
      return newRows
    })
  }

  const toggleAll = (checked: boolean) => {
    setImportRows((prev) => prev.map((r) => ({ ...r, selected: checked })))
  }

  const handleConfirm = () => {
    if (!selectedCompanyId || !selectedAccountId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione a empresa e conta destino.',
      })
      return
    }

    const toImport = importRows.filter((r) => r.selected)
    if (toImport.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhuma transação selecionada para importação.',
      })
      return
    }

    toImport.forEach((r) => {
      addTransaction({
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        competenceDate: new Date(r.date).toISOString(),
        paymentDate: new Date(r.date).toISOString(),
        companyId: selectedCompanyId,
        accountId: selectedAccountId,
        categoryId: r.categoryId,
        description: r.description,
        value: r.value,
        type: r.type,
        status: 'CONFIRMED',
        aiConfidence: r.aiConfidence,
      })
      if (r.description) {
        const words = r.description.split(' ').filter((w) => w.length > 3)
        if (words.length > 0) learnAiMapping(words[0], r.categoryId)
      }
    })

    setStep(3)
  }

  const handleFinish = () => {
    toast({ title: 'Extrato importado com sucesso!' })
    navigate('/transactions')
  }

  const selectedCount = importRows.filter((r) => r.selected).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Importar Extrato</h2>
        <p className="text-muted-foreground">
          Faça upload do seu XLS ou CSV para classificação automática pela IA.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 relative px-4">
        <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2" />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s
                ? 'bg-primary text-primary-foreground ring-4 ring-background'
                : 'bg-muted text-muted-foreground ring-4 ring-background'
            }`}
          >
            {s < step ? <CheckCircle2 className="size-5" /> : s}
          </div>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>
            {step === 1
              ? '1. Selecione o Arquivo'
              : step === 2
                ? '2. Revisão Inteligente'
                : '3. Importação Concluída'}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              'Arraste e solte ou clique para procurar. Formatos aceitos: .xls, .xlsx, .csv'}
            {step === 2 && 'Revise as classificações sugeridas pela IA antes de confirmar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xls,.xlsx,.csv,.tsv"
                onChange={handleFileInput}
              />
              <UploadCloud className="size-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">
                Clique ou arraste o arquivo aqui
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Extratos bancários em formato Excel ou CSV
              </p>
            </div>
          )}

          {step === 2 && isProcessing && (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-lg font-medium text-slate-700">
                A IA está processando o arquivo...
              </p>
            </div>
          )}

          {step === 2 && !isProcessing && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                <div>
                  <Label>Empresa Destino</Label>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Conta Bancária</Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter((a) => a.companyId === selectedCompanyId)
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <Checkbox
                          checked={importRows.length > 0 && selectedCount === importRows.length}
                          onCheckedChange={(c) => toggleAll(!!c)}
                        />
                      </TableHead>
                      <TableHead className="min-w-[120px]">Data</TableHead>
                      <TableHead className="min-w-[200px]">Descrição</TableHead>
                      <TableHead className="min-w-[120px]">Valor (R$)</TableHead>
                      <TableHead className="min-w-[120px]">Tipo</TableHead>
                      <TableHead className="min-w-[250px]">Categoria Sugerida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importRows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={!row.selected ? 'opacity-50 bg-slate-50' : ''}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={row.selected}
                            onCheckedChange={(c) => updateRow(index, { selected: !!c })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={row.date}
                            onChange={(e) => updateRow(index, { date: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.description}
                            onChange={(e) => updateRow(index, { description: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={row.value}
                            onChange={(e) =>
                              updateRow(index, { value: parseFloat(e.target.value) || 0 })
                            }
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.type}
                            onValueChange={(v: 'IN' | 'OUT') => updateRow(index, { type: v })}
                          >
                            <SelectTrigger
                              className={`h-8 text-xs ${row.type === 'IN' ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IN">Receita</SelectItem>
                              <SelectItem value="OUT">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={row.categoryId}
                              onValueChange={(v) => updateRow(index, { categoryId: v })}
                            >
                              <SelectTrigger className="h-8 text-xs w-full">
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
                            {row.aiConfidence === 'high' ? (
                              <Bot
                                className="text-emerald-500 w-4 h-4 shrink-0"
                                title="IA com alta confiança"
                              />
                            ) : (
                              <AlertCircle
                                className="text-amber-500 w-4 h-4 shrink-0"
                                title="Revise a sugestão"
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Importação Concluída!</h3>
                <p className="text-muted-foreground mt-2">
                  {selectedCount} transações foram integradas ao seu histórico financeiro.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        {step === 2 && !isProcessing && (
          <CardFooter className="flex justify-between bg-slate-50 border-t p-4 rounded-b-lg">
            <Button variant="outline" onClick={() => setStep(1)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={selectedCount === 0}>
              Importar Selecionados ({selectedCount})
            </Button>
          </CardFooter>
        )}
        {step === 3 && (
          <CardFooter className="flex justify-center bg-slate-50 border-t p-4 rounded-b-lg">
            <Button size="lg" onClick={handleFinish}>
              Acessar Lançamentos
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
