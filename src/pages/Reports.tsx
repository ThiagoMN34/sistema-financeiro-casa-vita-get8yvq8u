import { useState, useMemo, useEffect } from 'react'
import { useFinance, Transaction } from '@/contexts/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  Line,
  LineChart,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  ListFilter,
  Check,
  ChevronsUpDown,
  Download,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TransactionModal } from '@/components/transactions/TransactionModal'

const COLORS = [
  '#10B981',
  '#E11D48',
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#14B8A6',
  '#F43F5E',
  '#06B6D4',
  '#84CC16',
  '#6366F1',
]

export default function Reports() {
  const { transactions, categories } = useFinance()

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(() => ({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  }))
  const [datePreset, setDatePreset] = useState('this_month')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [openCategory, setOpenCategory] = useState(false)

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const now = new Date()
    switch (datePreset) {
      case 'this_month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) })
        break
      case 'last_month': {
        const lastMonth = subMonths(now, 1)
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) })
        break
      }
      case 'last_6_months':
        setDateRange({ from: startOfMonth(subMonths(now, 6)), to: endOfMonth(now) })
        break
      case 'this_year':
        setDateRange({ from: startOfYear(now), to: endOfYear(now) })
        break
      case 'all_time':
        setDateRange({ from: new Date(2000, 0, 1), to: new Date(2100, 0, 1) })
        break
    }
  }, [datePreset])

  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((t) => {
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false
      if (selectedCategories.length > 0 && !selectedCategories.includes(t.categoryId)) return false

      if (dateRange?.from && dateRange?.to) {
        const d = new Date(t.paymentDate).getTime()
        const end = new Date(dateRange.to)
        end.setHours(23, 59, 59, 999) // ensure full day coverage
        if (d < dateRange.from.getTime() || d > end.getTime()) {
          return false
        }
      }
      return true
    })

    return filtered.sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    )
  }, [transactions, typeFilter, selectedCategories, dateRange])

  const summary = useMemo(() => {
    let inTotal = 0
    let outTotal = 0
    filteredTransactions.forEach((t) => {
      if (t.type === 'IN') inTotal += t.value
      else outTotal += t.value
    })
    return { inTotal, outTotal, net: inTotal - outTotal }
  }, [filteredTransactions])

  const timelineData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []
    const diffDays = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24)
    const groupByMonth = diffDays > 60

    const grouped = new Map()
    filteredTransactions.forEach((t) => {
      const date = new Date(t.paymentDate)
      const key = groupByMonth
        ? format(date, 'MMM/yy', { locale: ptBR })
        : format(date, 'dd/MMM', { locale: ptBR })

      const sortKey = groupByMonth ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd')

      if (!grouped.has(sortKey)) {
        grouped.set(sortKey, { name: key, sortKey, Receitas: 0, Despesas: 0 })
      }
      const group = grouped.get(sortKey)
      if (t.type === 'IN') group.Receitas += t.value
      else group.Despesas += t.value
    })

    return Array.from(grouped.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [filteredTransactions, dateRange])

  const monthlyComparisonData = useMemo(() => {
    const grouped = new Map()
    filteredTransactions.forEach((t) => {
      const date = new Date(t.paymentDate)
      const key = format(date, 'MMM/yy', { locale: ptBR })
      const sortKey = format(date, 'yyyy-MM')

      if (!grouped.has(sortKey)) {
        grouped.set(sortKey, { name: key, sortKey, Receitas: 0, Despesas: 0, Saldo: 0 })
      }
      const group = grouped.get(sortKey)
      if (t.type === 'IN') {
        group.Receitas += t.value
        group.Saldo += t.value
      } else {
        group.Despesas += t.value
        group.Saldo -= t.value
      }
    })

    return Array.from(grouped.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [filteredTransactions])

  const categoryData = useMemo(() => {
    const grouped = new Map()
    filteredTransactions.forEach((t) => {
      if (!grouped.has(t.categoryId)) {
        grouped.set(t.categoryId, { value: 0, categoryId: t.categoryId })
      }
      grouped.get(t.categoryId).value += t.value
    })

    return Array.from(grouped.values())
      .map((g) => {
        const cat = categories.find((c) => c.id === g.categoryId)
        return { name: cat?.name || 'Desconhecido', value: g.value }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [filteredTransactions, categories])

  const unusualTransactions = useMemo(() => {
    const categoryStats = new Map()
    transactions.forEach((t) => {
      if (!categoryStats.has(t.categoryId)) {
        categoryStats.set(t.categoryId, { sum: 0, count: 0 })
      }
      const stat = categoryStats.get(t.categoryId)
      stat.sum += t.value
      stat.count += 1
    })

    const anomalies = filteredTransactions.filter((t) => {
      const stat = categoryStats.get(t.categoryId)
      if (!stat || stat.count < 4) return false
      const avg = stat.sum / stat.count
      return t.value > avg * 2.5 && t.value > 100 // 2.5x mean and > 100
    })

    return anomalies.sort((a, b) => b.value - a.value).slice(0, 10)
  }, [filteredTransactions, transactions])

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setIsModalOpen(true)
  }

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']
    const rows = filteredTransactions.map((tx) => [
      formatDate(tx.paymentDate),
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${categories.find((c) => c.id === tx.categoryId)?.name || ''}"`,
      tx.type === 'IN' ? 'Receita' : 'Despesa',
      tx.value.toString().replace('.', ','),
    ])

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Inteligentes</h2>
          <p className="text-muted-foreground">
            Analise os seus dados financeiros com filtros avançados e gráficos.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="shrink-0 bg-white shadow-sm">
          <Download className="mr-2 h-4 w-4 text-slate-500" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Período
          </label>
          <Select value={datePreset} onValueChange={setDatePreset}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">Este Mês</SelectItem>
              <SelectItem value="last_month">Mês Passado</SelectItem>
              <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
              <SelectItem value="this_year">Este Ano</SelectItem>
              <SelectItem value="all_time">Todo o Período</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {datePreset === 'custom' && (
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Data Customizada
            </label>
            <DatePickerWithRange date={dateRange as any} setDate={setDateRange as any} />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Tipo
          </label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Todos os Tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="IN">Receitas</SelectItem>
              <SelectItem value="OUT">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Categorias
          </label>
          <Popover open={openCategory} onOpenChange={setOpenCategory}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCategory}
                className="w-full justify-between bg-white font-normal hover:bg-slate-50"
              >
                <span className="truncate">
                  {selectedCategories.length === 0
                    ? 'Todas as Categorias'
                    : selectedCategories.length === 1
                      ? categories.find((c) => c.id === selectedCategories[0])?.name
                      : `${selectedCategories.length} selecionadas`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar categoria..." />
                <CommandList>
                  <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedCategories([])
                        setOpenCategory(false)
                      }}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          selectedCategories.length === 0
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible',
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span className={selectedCategories.length === 0 ? 'font-medium' : ''}>
                        Todas as Categorias
                      </span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.id)
                      return (
                        <CommandItem
                          key={category.id}
                          onSelect={() => {
                            setSelectedCategories((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== category.id)
                                : [...prev, category.id],
                            )
                          }}
                          className="cursor-pointer"
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50 [&_svg]:invisible',
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{category.name}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Receitas no Período
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.inTotal)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Despesas no Período
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(summary.outTotal)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Resultado Líquido</CardTitle>
            <Activity
              className={`h-4 w-4 ${summary.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {formatCurrency(summary.net)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-subtle border-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Evolução no Período</CardTitle>
            <CardDescription>Fluxo de receitas e despesas ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            {timelineData.length > 0 ? (
              <ChartContainer
                config={{ Receitas: { color: '#10B981' }, Despesas: { color: '#E11D48' } }}
                className="h-[300px] w-full"
              >
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    dy={10}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v: number) => formatCurrency(v)} />}
                  />
                  <Bar
                    dataKey="Receitas"
                    fill="var(--color-Receitas)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Despesas"
                    fill="var(--color-Despesas)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Sem dados para exibir no período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-subtle border-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
            <CardDescription>Top categorias no período</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            {categoryData.length > 0 ? (
              <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-sm">Sem dados suficientes no período.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle border-slate-100">
        <CardHeader>
          <CardTitle className="text-base">Comparativo Mensal</CardTitle>
          <CardDescription>
            Evolução de receitas, despesas e saldo ao longo dos meses
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          {monthlyComparisonData.length > 0 ? (
            <ChartContainer
              config={{
                Receitas: { color: '#10B981' },
                Despesas: { color: '#E11D48' },
                Saldo: { color: '#3B82F6' },
              }}
              className="h-[300px] w-full"
            >
              <LineChart
                data={monthlyComparisonData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(v: number) => formatCurrency(v)} />}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="Receitas"
                  stroke="var(--color-Receitas)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Despesas"
                  stroke="var(--color-Despesas)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Saldo"
                  stroke="var(--color-Saldo)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Sem dados para exibir no período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-slate-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListFilter className="size-5 text-indigo-500" />
            <CardTitle className="text-lg">Lançamentos do Período</CardTitle>
          </div>
          <CardDescription>
            Lista detalhada das {filteredTransactions.length} transações correspondentes aos filtros
            aplicados. Clique em um lançamento para editar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma transação encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="group transition-colors hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleEdit(tx)}
                  >
                    <TableCell className="font-medium text-slate-600">
                      {formatDate(tx.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-800">{tx.description}</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {categories.find((c) => c.id === tx.categoryId)?.name || '-'}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {tx.type === 'OUT' ? '-' : '+'}
                      {formatCurrency(tx.value)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(tx)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-slate-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-500" />
            <CardTitle className="text-lg">Lançamentos Incomuns / Fora da Média</CardTitle>
          </div>
          <CardDescription>
            Transações que possuem valores significativamente maiores que a média histórica da mesma
            categoria.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unusualTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum lançamento incomum detectado no período filtrado.
                  </TableCell>
                </TableRow>
              ) : (
                unusualTransactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="group transition-colors hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleEdit(tx)}
                  >
                    <TableCell className="font-medium text-slate-600">
                      {formatDate(tx.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-800">{tx.description}</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {categories.find((c) => c.id === tx.categoryId)?.name || '-'}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {tx.type === 'OUT' ? '-' : '+'}
                      {formatCurrency(tx.value)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(tx)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransactionModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) {
            setTimeout(() => setEditingTransaction(null), 200)
          }
        }}
        transaction={editingTransaction}
      />
    </div>
  )
}
