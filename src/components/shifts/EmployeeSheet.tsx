import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: any
  onSuccess: () => void
}

const UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

export function EmployeeSheet({ open, onOpenChange, employee, onSuccess }: Props) {
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      name: '',
      role: '',
      department: '',
      work_schedule: '',
      active: true,
      has_transport_voucher: false,
      has_meal_voucher: false,
      transport_voucher_amount: '',
      bank_name: '',
      bank_agency: '',
      bank_account_type: '',
      bank_account_number: '',
      pix_key: '',
      admission_date: '',
      workplace: '',
      dismissal_date: '',
      birth_date: '',
      cpf: '',
      rg: '',
      pis: '',
      ctps: '',
      cbo: '',
      email: '',
      address_zip: '',
      address_street: '',
      address_number: '',
      address_complement: '',
      address_neighborhood: '',
      address_city: '',
      address_state: '',
      phone: '',
      emergency_contact1_name: '',
      emergency_contact1_phone: '',
      emergency_contact2_name: '',
      emergency_contact2_phone: '',
    },
  })

  useEffect(() => {
    if (employee) {
      form.reset({
        ...employee,
        transport_voucher_amount: employee.transport_voucher_amount?.toString() || '',
        active: employee.active ?? true,
      })
    } else {
      form.reset({
        name: '',
        role: '',
        department: '',
        work_schedule: '',
        active: true,
        has_transport_voucher: false,
        has_meal_voucher: false,
        transport_voucher_amount: '',
        bank_name: '',
        bank_agency: '',
        bank_account_type: '',
        bank_account_number: '',
        pix_key: '',
        admission_date: '',
        workplace: '',
        dismissal_date: '',
        birth_date: '',
        cpf: '',
        rg: '',
        pis: '',
        ctps: '',
        cbo: '',
        email: '',
        address_zip: '',
        address_street: '',
        address_number: '',
        address_complement: '',
        address_neighborhood: '',
        address_city: '',
        address_state: '',
        phone: '',
        emergency_contact1_name: '',
        emergency_contact1_phone: '',
        emergency_contact2_name: '',
        emergency_contact2_phone: '',
      })
    }
  }, [employee, open, form])

  const watchDismissal = form.watch('dismissal_date')

  useEffect(() => {
    if (watchDismissal) {
      form.setValue('active', false)
    }
  }, [watchDismissal, form])

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      transport_voucher_amount: data.transport_voucher_amount
        ? parseFloat(data.transport_voucher_amount)
        : 0,
      active: data.dismissal_date ? false : data.active,
    }

    if (!payload.admission_date) payload.admission_date = null
    if (!payload.dismissal_date) payload.dismissal_date = null
    if (!payload.birth_date) payload.birth_date = null

    if (employee) {
      const { error } = await supabase.from('employees').update(payload).eq('id', employee.id)
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Sucesso', description: 'Funcionário atualizado.' })
    } else {
      const { error } = await supabase.from('employees').insert(payload)
      if (error) {
        toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Sucesso', description: 'Funcionário cadastrado.' })
    }

    onSuccess()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col bg-slate-50">
        <SheetHeader className="px-6 py-4 bg-white border-b">
          <SheetTitle>{employee ? 'Editar Funcionário' : 'Novo Funcionário'}</SheetTitle>
          <SheetDescription>Preencha os dados completos do colaborador.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <Form {...form}>
            <form
              id="employee-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 py-6"
            >
              <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Situação do Funcionário</h4>
                  <p className="text-sm text-slate-500">
                    Define se o funcionário está ativo para ser selecionado em plantões.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!!watchDismissal}
                        />
                      </FormControl>
                      <FormLabel className="font-semibold">
                        {field.value ? 'Ativo' : 'Inativo'}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input required {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Contato</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Contrato e Lotação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="work_schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escala</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 12x36" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workplace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lotação</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Casa 1">Casa 1</SelectItem>
                            <SelectItem value="Casa 2">Casa 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="admission_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Admissão</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dismissal_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Demissão</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground">
                          Preencher inativa o funcionário.
                        </p>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ctps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTPS</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIS</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cbo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CBO</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Benefícios</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="has_transport_voucher"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 mt-2">
                        <FormLabel>Recebe VT?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="has_meal_voucher"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 mt-2">
                        <FormLabel>Recebe VR?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transport_voucher_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do VT (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Dados Bancários</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banco</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Conta</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                            <SelectItem value="Poupança">Poupança</SelectItem>
                            <SelectItem value="Conta Salário">Conta Salário</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agência</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número da Conta</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pix_key"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Chave PIX</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address_zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Rua / Logradouro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_city"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UFS.map((uf) => (
                              <SelectItem key={uf} value={uf}>
                                {uf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Contatos de Emergência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4 p-4 border rounded-md bg-slate-50/50">
                    <h4 className="font-medium text-slate-700 text-sm">Contato 1</h4>
                    <FormField
                      control={form.control}
                      name="emergency_contact1_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergency_contact1_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4 p-4 border rounded-md bg-slate-50/50">
                    <h4 className="font-medium text-slate-700 text-sm">Contato 2</h4>
                    <FormField
                      control={form.control}
                      name="emergency_contact2_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergency_contact2_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>
            </form>
          </Form>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 bg-white border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="employee-form">
            {employee ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
