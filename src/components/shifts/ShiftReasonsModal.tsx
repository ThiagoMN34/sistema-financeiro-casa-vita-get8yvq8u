import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus, ListPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShiftReasonsModal({ open, onOpenChange }: Props) {
  const [reasons, setReasons] = useState<any[]>([])
  const [newReason, setNewReason] = useState('')
  const { toast } = useToast()

  const fetchReasons = async () => {
    const { data } = await supabase
      .from('shift_reasons')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setReasons(data)
  }

  useEffect(() => {
    if (open) fetchReasons()
  }, [open])

  const handleAdd = async () => {
    if (!newReason.trim()) return
    const { error } = await supabase.from('shift_reasons').insert({ reason: newReason.trim() })
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o motivo.',
        variant: 'destructive',
      })
      return
    }
    setNewReason('')
    fetchReasons()
    toast({ title: 'Sucesso', description: 'Motivo adicionado.' })
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shift_reasons').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
      return
    }
    fetchReasons()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="w-5 h-5" /> Motivos de Plantão
          </DialogTitle>
          <DialogDescription>
            Cadastre os motivos pré-definidos para a justificativa dos plantões.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 my-2">
          <Input
            placeholder="Novo motivo..."
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>

        <div className="border rounded-md max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0">
              <TableRow>
                <TableHead>Motivo</TableHead>
                <TableHead className="w-[80px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                    Nenhum motivo cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                reasons.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.reason}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
