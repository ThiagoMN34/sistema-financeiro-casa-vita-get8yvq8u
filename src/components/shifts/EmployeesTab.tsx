import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { EmployeeSheet } from './EmployeeSheet'

export function EmployeesTab() {
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const { toast } = useToast()

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('name', { ascending: true })
    if (data) setEmployees(data)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este funcionário?')) return
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
      return
    }
    fetchEmployees()
    toast({ title: 'Sucesso', description: 'Funcionário excluído.' })
  }

  const handleEdit = (emp: any) => {
    setSelectedEmployee(emp)
    setSheetOpen(true)
  }

  const handleNew = () => {
    setSelectedEmployee(null)
    setSheetOpen(true)
  }

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="border-b flex flex-row items-center justify-between py-4">
        <div>
          <CardTitle className="text-lg">Cadastro de Funcionários</CardTitle>
          <CardDescription>
            Gerencie o cadastro completo dos colaboradores e suas permissões para plantões.
          </CardDescription>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Funcionário
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-6 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo / Área</TableHead>
                <TableHead>Lotação</TableHead>
                <TableHead className="w-[120px] text-center">Status</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{emp.role || '-'}</div>
                      <div className="text-xs text-muted-foreground">{emp.department || '-'}</div>
                    </TableCell>
                    <TableCell className="text-sm">{emp.workplace || '-'}</TableCell>
                    <TableCell className="text-center">
                      {emp.active ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Ativo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-rose-50 text-rose-700 border-rose-200"
                        >
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                          <Pencil className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(emp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <EmployeeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />
    </Card>
  )
}
