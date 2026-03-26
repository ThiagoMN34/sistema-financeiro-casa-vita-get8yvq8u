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
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Bot,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ImportMode = 'statement' | 'legacy'

type ImportRow = {
  id: string
  date: string
  competenceDate?: string
  description: string
  value: number
  type: 'IN' | 'OUT'
  categoryId: string
  companyId?: string
  accountId?: string
  nfNumber?: string
  aiConfidence: 'high' | 'medium' | 'low'
  selected: boolean
}

export default function Import() {
  const [step, setStep] = useState(1)
  const [importMode, setImportMode] = useState<ImportMode>('statement')
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
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const parseBRDate = (d: string) => {
    if (!d) return ''
    const clean = d.trim()
    const parts = clean.split(/[/-]/)
    if (parts.length >= 3) {
      let y = parts[2]
      if (y.includes(' ')) y = y.split(' ')[0]
      if (y.length === 2) y = '20' + y

      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].substring(0, 2).padStart(2, '0')}`
      }
      return `${y}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
    if (clean.includes('-')) return clean.split('T')[0]
    return ''
  }

  const parseNumberValue = (v: string) => {
    if (!v) return 0
    let clean = String(v)
      .replace(/[R$\s"']/gi, '')
      .trim()

    const isNegative = clean.startsWith('-') || (clean.startsWith('(') && clean.endsWith(')'))
    clean = clean.replace(/[()-]/g, '')

    const lastComma = clean.lastIndexOf(',')
    const lastDot = clean.lastIndexOf('.')

    if (lastComma > lastDot) {
      // Brazilian format: 1.000,00 -> lastComma > lastDot
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else if (lastDot > lastComma) {
      // US format or missing comma: 1,000.00 -> lastDot > lastComma
      if (lastComma === -1 && clean.split('.').pop()?.length === 3) {
        // Dot used as thousand separator in BR: e.g. "11.700" -> 11700
        clean = clean.replace(/\./g, '')
      } else {
        // Proper US format: 1,000.00 -> 1000.00
        clean = clean.replace(/,/g, '')
      }
    }

    const val = parseFloat(clean) || 0
    return isNegative ? -val : val
  }

  const readFileAsText = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    try {
      const decoder = new TextDecoder('utf-8', { fatal: true })
      return decoder.decode(buffer)
    } catch (e) {
      const decoder = new TextDecoder('windows-1252')
      return decoder.decode(buffer)
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setStep(2)

    try {
      if (importMode === 'legacy') {
        await parseLegacyFile(file)
      } else {
        await parseStatementFile(file)
      }
    } catch (error: any) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Falha ao processar arquivo. Verifique o formato.',
      })
      setStep(1)
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const parseLegacyFile = async (file: File) => {
    const text = await readFileAsText(file)

    if (
      text.includes('\x00') ||
      text.startsWith('PK\x03\x04') ||
      text.startsWith('\xD0\xCF\x11\xE0')
    ) {
      throw new Error(
        'Arquivos Excel diretos (.xls, .xlsx) não são suportados para leitura de texto. Salve a sua planilha como "CSV (Separado por vírgulas)" e tente novamente.',
      )
    }

    const lines = text.split(/\r?\n|\r/).filter((l) => l.trim() !== '')
    const parsed: ImportRow[] = []

    if (lines.length === 0) throw new Error('Arquivo vazio ou formato inválido.')

    let delimiter = '\t'
    let headerIdx = -1

    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const l = lines[i].toLowerCase()
      if (
        (l.includes('data') || l.includes('pagto') || l.includes('dt')) &&
        (l.includes('valor') || l.includes('r$') || l.includes('hist'))
      ) {
        headerIdx = i
        if (lines[i].includes(';') && !lines[i].includes('\t')) delimiter = ';'
        else if (lines[i].includes(',') && !lines[i].includes('\t')) delimiter = ','
        break
      }
    }

    if (headerIdx === -1) {
      if (lines[0].includes(';') && !lines[0].includes('\t')) delimiter = ';'
      else if (lines[0].includes(',') && !lines[0].includes('\t')) delimiter = ','
    }

    const startIdx = headerIdx >= 0 ? headerIdx + 1 : 0

    let colDate = 0
    let colDesc = 1
    let colComp = 2
    let colVal = 3
    let colCat = -1

    if (headerIdx >= 0) {
      const headerParts = lines[headerIdx]
        .split(delimiter)
        .map((p) => p.toLowerCase().trim().replace(/^"|"$/g, ''))

      const d = headerParts.findIndex(
        (p) => p.includes('data') || p.includes('dt') || p.includes('pagto'),
      )
      const h = headerParts.findIndex(
        (p) =>
          p.includes('histórico') ||
          p.includes('historico') ||
          p.includes('hist') ||
          p.includes('desc'),
      )
      const c = headerParts.findIndex((p) => p.includes('comp'))
      const v = headerParts.findIndex((p) => p.includes('valor') || p.includes('r$'))
      const cat = headerParts.findIndex(
        (p) =>
          p.includes('categoria') ||
          p.includes('cat') ||
          p.includes('grupo') ||
          p.includes('classifica'),
      )

      if (d >= 0) colDate = d
      if (h >= 0) colDesc = h
      if (c >= 0) colComp = c
      if (v >= 0) colVal = v
      if (cat >= 0) colCat = cat
    }

    const normalize = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      let parts: string[] = []
      if (delimiter === '\t') {
        parts = line.split('\t').map((p) => p.trim().replace(/^"|"$/g, ''))
      } else {
        let inQuotes = false
        let current = ''
        for (let j = 0; j < line.length; j++) {
          const char = line[j]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === delimiter && !inQuotes) {
            parts.push(current.trim().replace(/^"|"$/g, ''))
            current = ''
          } else {
            current += char
          }
        }
        parts.push(current.trim().replace(/^"|"$/g, ''))
      }

      if (parts.length < 2) continue

      let dDate = colDate
      let dVal = colVal
      let dDesc = colDesc
      let dComp = colComp

      if (
        dDate >= parts.length ||
        dVal >= parts.length ||
        !parts[dDate] ||
        !parseBRDate(parts[dDate]) ||
        (parts[dVal] && isNaN(parseNumberValue(parts[dVal])))
      ) {
        let foundDate = -1
        let foundVal = -1
        for (let k = 0; k < parts.length; k++) {
          if (foundDate === -1 && parseBRDate(parts[k])) foundDate = k
          else if (
            foundVal === -1 &&
            !isNaN(parseNumberValue(parts[k])) &&
            parseNumberValue(parts[k]) !== 0
          ) {
            foundVal = k
          }
        }
        if (foundDate !== -1) dDate = foundDate
        if (foundVal !== -1) dVal = foundVal
        if (foundDate !== -1 && foundVal !== -1) {
          for (let k = 0; k < parts.length; k++) {
            if (k !== dDate && k !== dVal && k !== colCat) {
              dDesc = k
              break
            }
          }
        }
      }

      const dateStr = parts[dDate] || ''
      const desc1 = parts[dDesc] || ''
      const desc2 =
        dComp >= 0 &&
        dComp < parts.length &&
        dComp !== dDesc &&
        dComp !== dDate &&
        dComp !== dVal &&
        dComp !== colCat
          ? parts[dComp] || ''
          : ''
      const valStr = parts[dVal] || ''
      let catStr = colCat >= 0 && colCat < parts.length ? parts[colCat] || '' : ''

      const date = parseBRDate(dateStr)
      if (!date) continue

      const rawVal = parseNumberValue(valStr)

      if (isNaN(rawVal) || rawVal === 0) continue

      const type = rawVal >= 0 ? 'IN' : 'OUT'
      const value = Math.abs(rawVal)
      const description = [desc1, desc2]
        .filter((v) => v && v.trim() !== '')
        .join(' - ')
        .substring(0, 150)

      if (!description) continue

      let categoryId = ''
      let aiConfidence: 'high' | 'medium' | 'low' = 'low'

      if (catStr) {
        const normalizedCatStr = normalize(catStr)
        const matchedCategory = categories.find((c) => normalize(c.name) === normalizedCatStr)
        if (matchedCategory) {
          categoryId = matchedCategory.id
          aiConfidence = 'high'
        }
      }

      if (!categoryId) {
        for (let k = 0; k < parts.length; k++) {
          if (k === dDate || k === dVal) continue
          const pStr = normalize(parts[k])
          if (!pStr) continue
          const matchedCategory = categories.find((c) => normalize(c.name) === pStr)
          if (matchedCategory) {
            categoryId = matchedCategory.id
            aiConfidence = 'high'
            if (!catStr) catStr = parts[k]
            break
          }
        }
      }

      if (!categoryId) {
        const suggestion = aiSuggestCategory(catStr ? `${description} ${catStr}` : description)
        categoryId = suggestion.categoryId
        aiConfidence = suggestion.confidence
      }

      parsed.push({
        id: `leg-${Date.now()}-${i}`,
        date,
        competenceDate: date,
        description,
        value,
        type,
        categoryId,
        aiConfidence,
        companyId: selectedCompanyId,
        accountId: selectedAccountId,
        selected: true,
      })
    }

    if (parsed.length === 0) {
      throw new Error(
        'Nenhum dado legível encontrado. Verifique se o arquivo possui as colunas de Data e Valor.',
      )
    }

    toast({
      title: 'Sucesso',
      description: `${parsed.length} transações históricas identificadas.`,
    })
    setImportRows(parsed)
  }

  const parseStatementFile = async (file: File) => {
    const text = await readFileAsText(file)

    if (
      text.includes('\x00') ||
      text.startsWith('PK\x03\x04') ||
      text.startsWith('\xD0\xCF\x11\xE0')
    ) {
      throw new Error('Arquivos Excel não são suportados. Salve como CSV e tente novamente.')
    }

    const lines = text.split(/\r?\n/)
    const parsed: ImportRow[] = []
    const dateRegex = /(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/

    // Detect delimiter
    let delimiter = ','
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].includes(';')) {
        delimiter = ';'
        break
      } else if (lines[i].includes('\t')) {
        delimiter = '\t'
        break
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Properly split considering quotes
      let parts: string[] = []
      let inQuotes = false
      let current = ''
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delimiter && !inQuotes) {
          parts.push(current.trim().replace(/^"|"$/g, ''))
          current = ''
        } else {
          current += char
        }
      }
      parts.push(current.trim().replace(/^"|"$/g, ''))

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
        } else if (!hasVal && !dateRegex.test(part)) {
          const raw = parseNumberValue(part)
          if (!isNaN(raw) && raw !== 0 && part.match(/\d/)) {
            val = raw
            hasVal = true
          }
        }

        if (
          !dateRegex.test(part) &&
          isNaN(Number(part.replace(/[R$\s.,-]/g, ''))) &&
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
      throw new Error('Nenhum dado legível encontrado.')
    } else {
      toast({ title: 'Sucesso', description: `${parsed.length} transações identificadas.` })
    }
    setImportRows(parsed)
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
    const toImport = importRows.filter((r) => r.selected)
    if (toImport.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhuma transação selecionada.',
      })
      return
    }

    if (!selectedCompanyId || !selectedAccountId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione a empresa e conta destino padrão.',
      })
      return
    }

    toImport.forEach((r) => {
      addTransaction({
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        competenceDate: r.competenceDate
          ? new Date(r.competenceDate).toISOString()
          : new Date(r.date).toISOString(),
        paymentDate: new Date(r.date).toISOString(),
        companyId: r.companyId || selectedCompanyId,
        accountId: r.accountId || selectedAccountId,
        categoryId: r.categoryId,
        description: r.description,
        nfNumber: r.nfNumber,
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

  const selectedCount = importRows.filter((r) => r.selected).length

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Importar Dados</h2>
        <p className="text-muted-foreground">
          Importe extratos bancários ou migre seu histórico financeiro de planilhas.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 relative px-4 max-w-3xl mx-auto">
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
              ? '1. Selecione a Origem e o Arquivo'
              : step === 2
                ? '2. Revisão Inteligente'
                : '3. Importação Concluída'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Escolha o tipo de importação e faça o upload do arquivo.'}
            {step === 2 && 'Revise as classificações sugeridas pela IA antes de confirmar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Tabs
              value={importMode}
              onValueChange={(v) => setImportMode(v as ImportMode)}
              className="w-full max-w-3xl mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="statement" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Extrato Bancário
                </TabsTrigger>
                <TabsTrigger value="legacy" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Planilha Legada
                </TabsTrigger>
              </TabsList>

              <TabsContent value="statement">
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
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileInput}
                  />
                  <UploadCloud className="size-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Clique ou arraste o extrato aqui
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Formatos aceitos: CSV, TXT. (Não use arquivos Excel direto)
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="legacy">
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
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileInput}
                  />
                  <FileSpreadsheet className="size-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Clique ou arraste a planilha em CSV aqui
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ideal para planilhas com colunas: Data Pagto, Histórico, Complemento, Valor.
                    <br />
                    <span className="text-amber-600 font-medium">
                      Salve seu Excel como CSV antes de importar.
                    </span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {step === 2 && isProcessing && (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-lg font-medium text-slate-700">Processando arquivo...</p>
            </div>
          )}

          {step === 2 && !isProcessing && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border max-w-3xl mx-auto">
                <div>
                  <Label>Empresa Destino Padrão</Label>
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
                  <Label>Conta Bancária Padrão</Label>
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
                      <TableHead className="min-w-[180px]">Categoria</TableHead>
                      <TableHead className="min-w-[150px]">Destino</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importRows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={!row.selected ? 'opacity-50 bg-slate-50' : ''}
                      >
                        <TableCell className="text-center align-top pt-4">
                          <Checkbox
                            checked={row.selected}
                            onCheckedChange={(c) => updateRow(index, { selected: !!c })}
                          />
                        </TableCell>
                        <TableCell className="align-top space-y-2">
                          <Input
                            type="date"
                            value={row.date}
                            onChange={(e) => updateRow(index, { date: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="align-top space-y-2">
                          <Input
                            value={row.description}
                            onChange={(e) => updateRow(index, { description: e.target.value })}
                            className="h-8 text-xs"
                            title={row.description}
                          />
                        </TableCell>
                        <TableCell className="align-top space-y-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={row.value}
                            onChange={(e) =>
                              updateRow(index, { value: parseFloat(e.target.value) || 0 })
                            }
                            className="h-8 text-xs"
                          />
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
                        <TableCell className="align-top">
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
                                title="IA com alta confiança / Correspondência Exata"
                              />
                            ) : (
                              <AlertCircle
                                className="text-amber-500 w-4 h-4 shrink-0"
                                title="Revise a sugestão"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top space-y-2">
                          <Select
                            value={row.companyId || selectedCompanyId}
                            onValueChange={(v) => {
                              const accs = accounts.filter((a) => a.companyId === v)
                              updateRow(index, {
                                companyId: v,
                                accountId: accs.length > 0 ? accs[0].id : '',
                              })
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id} className="text-xs">
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={row.accountId || selectedAccountId}
                            onValueChange={(v) => updateRow(index, { accountId: v })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Conta" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts
                                .filter((a) => a.companyId === (row.companyId || selectedCompanyId))
                                .map((a) => (
                                  <SelectItem key={a.id} value={a.id} className="text-xs">
                                    {a.name}
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
            <Button size="lg" onClick={() => navigate('/transactions')}>
              Acessar Lançamentos
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
