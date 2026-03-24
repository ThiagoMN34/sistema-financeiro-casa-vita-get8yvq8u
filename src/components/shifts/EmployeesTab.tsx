import { useState } from 'react'
import { useFinance, Employee } from '@/contexts/FinanceContext'
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
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export function EmployeesTab() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useFinance()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addEmployee(newName.trim())
    setNewName('')
  }

  const handleEdit = (e: Employee) => {
    setEditingId(e.id)
    setEditName(e.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return
    await updateEmployee(editingId, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Funcionários para Plantões</CardTitle>
        <CardDescription>
          Gerencie a lista de funcionários que podem ser selecionados ao lançar um novo plantão.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-6 max-w-md">
          <Input
            placeholder="Nome do funcionário"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[120px] text-center">Ativo</TableHead>
                <TableHead className="text-right w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhum funcionário cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      {editingId === emp.id ? (
                        <div className="flex items-center gap-2 max-w-sm">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-emerald-600 hover:bg-emerald-50"
                            onClick={handleSaveEdit}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-slate-400 hover:bg-slate-100"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className={emp.active ? '' : 'text-slate-400 line-through'}>
                          {emp.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={emp.active}
                        onCheckedChange={(checked) => updateEmployee(emp.id, { active: checked })}
                        disabled={editingId === emp.id}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {!editingId || editingId !== emp.id ? (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                            <Pencil className="h-4 w-4 text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => deleteEmployee(emp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
