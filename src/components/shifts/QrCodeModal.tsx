import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance } from '@/contexts/FinanceContext'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface QrCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QrCodeModal({ open, onOpenChange }: QrCodeModalProps) {
  const { companies } = useFinance()
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '')

  const qrUrl = useMemo(() => {
    if (!selectedCompany) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/check-in?companyId=${selectedCompany}`
  }, [selectedCompany])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QR Code de Registro</DialogTitle>
          <DialogDescription>
            Imprima este QR Code e fixe na unidade para que os funcionários possam registrar os
            plantões pelo celular.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Unidade do QR Code</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
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

          {qrUrl ? (
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50 space-y-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                alt="QR Code"
                className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm border border-slate-200"
              />
              <div className="text-xs text-center text-slate-500 break-all w-full px-2 font-mono">
                {qrUrl}
              </div>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrUrl)}`}
                download="qrcode-plantao.png"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline font-medium"
              >
                Abrir Imagem para Impressão
              </a>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-4">
              Selecione uma empresa para gerar o QR Code.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
