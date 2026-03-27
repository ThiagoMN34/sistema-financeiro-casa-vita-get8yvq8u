import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinance } from '@/contexts/FinanceContext'
import { toast } from '@/hooks/use-toast'

interface ShiftRatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShiftRatesModal({ open, onOpenChange }: ShiftRatesModalProps) {
  const { shiftRates, updateShiftRate } = useFinance()
  const [rates, setRates] = useState<Record<string, number>>({})

  useEffect(() => {
    if (open) {
      const initial: Record<string, number> = {}
      shiftRates.forEach((r) => {
        initial[r.id] = r.amount
      })
      setRates(initial)
    }
  }, [open, shiftRates])

  const handleSave = async () => {
    try {
      for (const [id, amount] of Object.entries(rates)) {
        const original = shiftRates.find((r) => r.id === id)
        if (original && original.amount !== amount) {
          await updateShiftRate(id, amount)
        }
      }
      toast({ title: 'Sucesso', description: 'Valores atualizados com sucesso.' })
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao salvar valores.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Valores de Plantão</DialogTitle>
          <DialogDescription>
            Configure os valores predefinidos para cada tipo de plantão. Eles serão aplicados
            automaticamente durante a aprovação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {shiftRates.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center">
              Nenhum tipo de plantão configurado no banco de dados.
            </div>
          ) : (
            shiftRates.map((rate) => (
              <div key={rate.id} className="space-y-2">
                <Label className="capitalize">{rate.shiftType}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={rates[rate.id] !== undefined ? rates[rate.id] : ''}
                    onChange={(e) =>
                      setRates((prev) => ({ ...prev, [rate.id]: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Valores</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
