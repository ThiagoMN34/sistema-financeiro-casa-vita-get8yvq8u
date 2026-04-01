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
import { EmployeeSheet } from '@/components/shifts/EmployeeSheet'

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const { toast } = useToast()

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*').order('name')
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setEmployees(data || [])
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee)
    setSheetOpen(true)
  }

  const handleNew = () => {
    setSelectedEmployee(null)
    setSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este funcionário?')) return
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Funcionário excluído.' })
      fetchEmployees()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Funcionários</h2>
          <p className="text-muted-foreground">Gestão de colaboradores e prestadores de plantão.</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo Funcionário
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
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
                <TableHead>Nome</TableHead>
                <TableHead>Cargo/Área</TableHead>
                <TableHead>Lotação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.id} className="group hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-800">{emp.name}</TableCell>
                  <TableCell className="text-slate-600">
                    {emp.role || '-'} {emp.department ? `/ ${emp.department}` : ''}
                  </TableCell>
                  <TableCell className="text-slate-600">{emp.workplace || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={emp.active ? 'outline' : 'secondary'}
                      className={
                        emp.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''
                      }
                    >
                      {emp.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500"
                        onClick={() => handleDelete(emp.id)}
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
                    Nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />
    </div>
  )
}
