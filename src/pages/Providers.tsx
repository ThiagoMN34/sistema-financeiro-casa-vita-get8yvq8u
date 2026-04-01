import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ProviderSheet } from '@/components/providers/ProviderSheet'

export default function Providers() {
  const [providers, setProviders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const { toast } = useToast()

  const fetchProviders = async () => {
    const { data, error } = await supabase.from('providers').select('*').order('company_name')
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setProviders(data || [])
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [])

  const filtered = providers.filter(
    (p) =>
      p.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cnpj?.includes(searchTerm),
  )

  const handleEdit = (provider: any) => {
    setSelectedProvider(provider)
    setSheetOpen(true)
  }

  const handleNew = () => {
    setSelectedProvider(null)
    setSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este prestador?')) return
    const { error } = await supabase.from('providers').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Prestador excluído.' })
      fetchProviders()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prestadores de Serviço</h2>
          <p className="text-muted-foreground">Gestão de fornecedores e prestadores.</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo Prestador
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, fantasia ou CNPJ..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>Razão Social / Fantasia</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="group hover:bg-slate-50">
                  <TableCell>
                    <div className="font-medium text-slate-800">{p.company_name}</div>
                    {p.trade_name && <div className="text-sm text-slate-500">{p.trade_name}</div>}
                  </TableCell>
                  <TableCell className="text-slate-600">{p.cnpj || '-'}</TableCell>
                  <TableCell className="text-slate-600">
                    <div>{p.email || '-'}</div>
                    <div className="text-sm">{p.phone || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.active ? 'outline' : 'secondary'}
                      className={
                        p.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''
                      }
                    >
                      {p.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Nenhum prestador encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProviderSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        provider={selectedProvider}
        onSuccess={fetchProviders}
      />
    </div>
  )
}
