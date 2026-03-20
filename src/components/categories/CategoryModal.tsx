import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance } from '@/contexts/FinanceContext'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Category } from '@/data/mockData'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório'),
  type: z.enum(['IN', 'OUT', 'BOTH'], {
    required_error: 'Selecione o tipo da categoria',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryModal({ open, onOpenChange }: CategoryModalProps) {
  const { addCategory } = useFinance()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'OUT',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        type: 'OUT',
      })
    }
  }, [open, form])

  const onSubmit = (data: FormValues) => {
    const newCategory: Category = {
      id: `c_user_${Date.now()}`,
      name: data.name,
      type: data.type,
    }

    addCategory(newCategory)
    toast({
      title: 'Categoria adicionada',
      description: `A categoria "${data.name}" foi criada com sucesso.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Material de Escritório" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IN">Receita</SelectItem>
                      <SelectItem value="OUT">Despesa</SelectItem>
                      <SelectItem value="BOTH">Neutro / Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Categoria</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
