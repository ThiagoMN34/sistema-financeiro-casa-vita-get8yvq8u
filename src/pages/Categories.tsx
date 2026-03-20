import { useState } from 'react'
import { useFinance } from '@/contexts/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CategoryModal } from '@/components/categories/CategoryModal'

export default function Categories() {
  const { categories } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)

  // Sort categories alphabetically to keep the list organized
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plano de Contas / Categorias</h2>
          <p className="text-muted-foreground">Lista de categorias e contas do sistema.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nome da Categoria</TableHead>
                <TableHead className="w-[150px]">Tipo Padrão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        c.type === 'IN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.type === 'OUT'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                      }
                    >
                      {c.type === 'IN' ? 'Receita' : c.type === 'OUT' ? 'Despesa' : 'Ambos'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {sortedCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CategoryModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
