import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { useFinance } from '@/contexts/FinanceContext'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function Import() {
  const [step, setStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { addTransaction, aiSuggestCategory } = useFinance()
  const navigate = useNavigate()

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
    simulateImport()
  }

  const simulateImport = () => {
    setStep(2)
    setIsProcessing(true)
    setTimeout(() => {
      // Create mock imported rows
      const descriptions = [
        'PAGAMENTO DE TARIFA',
        'FORNECEDOR SILVA',
        'LUZ E FORCA',
        'RECEBIMENTO PIX',
      ]
      descriptions.forEach((desc, i) => {
        const suggestion = aiSuggestCategory(desc)
        addTransaction({
          id: `imp-${Date.now()}-${i}`,
          competenceDate: new Date().toISOString(),
          paymentDate: new Date().toISOString(),
          companyId: '1',
          accountId: '1',
          description: desc,
          value: Math.random() * 500,
          type: i === 3 ? 'IN' : 'OUT',
          categoryId: suggestion.categoryId,
          status: 'PENDING',
          aiConfidence: suggestion.confidence,
        })
      })
      setIsProcessing(false)
      setStep(3)
    }, 2000)
  }

  const handleFinish = () => {
    toast.success('Extrato importado com sucesso!')
    navigate('/transactions')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Importar Extrato</h2>
        <p className="text-muted-foreground">
          Faça upload do seu OFX ou Excel para classificação automática pela IA.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2" />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= s
                ? 'bg-primary text-white ring-4 ring-white'
                : 'bg-slate-100 text-slate-400 ring-4 ring-white'
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
                ? '2. IA Processando...'
                : '3. Sucesso'}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              'Arraste e solte ou clique para procurar. Formatos aceitos: .ofx, .xlsx, .csv'}
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
              onClick={simulateImport}
            >
              <UploadCloud className="size-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">
                Clique ou arraste o arquivo aqui
              </h3>
              <p className="text-sm text-muted-foreground mt-1">OFX do Bradesco ou Inter</p>
            </div>
          )}

          {step === 2 && (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-lg font-medium text-slate-700">
                A IA está analisando 4 transações...
              </p>
              <p className="text-sm text-muted-foreground">Mapeando com histórico anterior.</p>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 text-center space-y-6">
              <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-fade-in-up">
                <CheckCircle2 className="size-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">4 transações importadas!</h3>
                <p className="text-muted-foreground mt-2">
                  As transações foram adicionadas à lista de lançamentos com status "Revisão
                  Pendente".
                </p>
              </div>
              <Button size="lg" onClick={handleFinish} className="w-full sm:w-auto">
                Revisar Lançamentos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
