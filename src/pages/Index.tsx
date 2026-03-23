import { useState, useMemo } from 'react'
import { useFinance } from '@/contexts/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { ArrowDownRight, ArrowUpRight, Wallet, Activity, Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
  ComposedChart,
  Line,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#10B981', '#E11D48', '#F59E0B', '#3B82F6', '#8B5CF6', '#14B8A6', '#F43F5E']

export default function Index() {
  const { transactions, accounts, companies, categories, debts, debtInstallments } = useFinance()
  const [selectedCompany, setSelectedCompany] = useState<string>('all')

  const now = useMemo(() => new Date(), [])
  const currentMonthStart = useMemo(() => startOfMonth(now), [now])
  const currentMonthEnd = useMemo(() => endOfMonth(now), [now])
  const lastMonthStart = useMemo(() => startOfMonth(subMonths(now, 1)), [now])
  const lastMonthEnd = useMemo(() => endOfMonth(subMonths(now, 1)), [now])

  const dashboardTransactions = useMemo(() => {
    if (selectedCompany === 'all') return transactions
    return transactions.filter((t) => t.companyId === selectedCompany)
  }, [transactions, selectedCompany])

  const dashboardAccounts = useMemo(() => {
    if (selectedCompany === 'all') return accounts
    return accounts.filter((a) => a.companyId === selectedCompany)
  }, [accounts, selectedCompany])

  const dashboardDebts = useMemo(() => {
    if (selectedCompany === 'all') return debts
    return debts.filter((d) => d.companyId === selectedCompany)
  }, [debts, selectedCompany])

  const dashboardDebtInstallments = useMemo(() => {
    const validDebtIds = new Set(dashboardDebts.map((d) => d.id))
    return debtInstallments.filter((i) => validDebtIds.has(i.debtId))
  }, [debtInstallments, dashboardDebts])

  const saldoAtual = useMemo(() => {
    const initial = dashboardAccounts.reduce((sum, a) => sum + a.initialBalance, 0)
    const validTxs = dashboardTransactions.filter(
      (t) => t.status === 'CONFIRMED' || new Date(t.paymentDate) <= now,
    )
    const txs = validTxs.reduce((sum, t) => sum + (t.type === 'IN' ? t.value : -t.value), 0)
    return initial + txs
  }, [dashboardAccounts, dashboardTransactions, now])

  const thisMonthTxs = useMemo(
    () =>
      dashboardTransactions.filter((t) =>
        isWithinInterval(new Date(t.paymentDate), {
          start: currentMonthStart,
          end: currentMonthEnd,
        }),
      ),
    [dashboardTransactions, currentMonthStart, currentMonthEnd],
  )

  const lastMonthTxs = useMemo(
    () =>
      dashboardTransactions.filter((t) =>
        isWithinInterval(new Date(t.paymentDate), { start: lastMonthStart, end: lastMonthEnd }),
      ),
    [dashboardTransactions, lastMonthStart, lastMonthEnd],
  )

  const thisMonthIn = useMemo(
    () => thisMonthTxs.filter((t) => t.type === 'IN').reduce((s, t) => s + t.value, 0),
    [thisMonthTxs],
  )
  const thisMonthOut = useMemo(
    () => thisMonthTxs.filter((t) => t.type === 'OUT').reduce((s, t) => s + t.value, 0),
    [thisMonthTxs],
  )
  const thisMonthNet = thisMonthIn - thisMonthOut

  const lastMonthIn = useMemo(
    () => lastMonthTxs.filter((t) => t.type === 'IN').reduce((s, t) => s + t.value, 0),
    [lastMonthTxs],
  )
  const lastMonthOut = useMemo(
    () => lastMonthTxs.filter((t) => t.type === 'OUT').reduce((s, t) => s + t.value, 0),
    [lastMonthTxs],
  )

  const inChange =
    lastMonthIn === 0
      ? thisMonthIn > 0
        ? 100
        : 0
      : ((thisMonthIn - lastMonthIn) / lastMonthIn) * 100
  const outChange =
    lastMonthOut === 0
      ? thisMonthOut > 0
        ? 100
        : 0
      : ((thisMonthOut - lastMonthOut) / lastMonthOut) * 100

  const renderChange = (value: number, invertColors = false) => {
    const isPositive = value > 0
    const isZero = value === 0
    let color = 'text-slate-500'
    if (!isZero) {
      color = invertColors
        ? isPositive
          ? 'text-rose-500'
          : 'text-emerald-500'
        : isPositive
          ? 'text-emerald-500'
          : 'text-rose-500'
    }
    return (
      <span className={`text-xs font-medium ${color}`}>
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    )
  }

  const last6MonthsData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, 5 - i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      const monthTxs = dashboardTransactions.filter((t) =>
        isWithinInterval(new Date(t.paymentDate), { start, end }),
      )
      const receitas = monthTxs.filter((t) => t.type === 'IN').reduce((s, t) => s + t.value, 0)
      const despesas = monthTxs.filter((t) => t.type === 'OUT').reduce((s, t) => s + t.value, 0)
      return {
        name: format(date, 'MMM/yy', { locale: ptBR }),
        Receitas: receitas,
        Despesas: despesas,
      }
    })
  }, [dashboardTransactions, now])

  const expensesByCategory = useMemo(() => {
    const grouped = thisMonthTxs
      .filter((t) => t.type === 'OUT')
      .reduce(
        (acc, t) => {
          acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(grouped)
      .map(([id, value]) => {
        const cat = categories.find((c) => c.id === id)
        return { name: cat?.name || 'Outros', value }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [thisMonthTxs, categories])

  const projectionData = useMemo(() => {
    const histStart = startOfMonth(subMonths(now, 3))
    const histEnd = endOfMonth(subMonths(now, 1))
    const histTxs = dashboardTransactions.filter(
      (t) =>
        isWithinInterval(new Date(t.paymentDate), { start: histStart, end: histEnd }) &&
        t.status === 'CONFIRMED',
    )
    const histIn =
      histTxs.filter((t) => t.type === 'IN').reduce((acc, t) => acc + t.value, 0) / 3 || 0
    const histOut =
      histTxs
        .filter((t) => t.type === 'OUT' && !t.debtInstallmentId)
        .reduce((acc, t) => acc + t.value, 0) / 3 || 0

    const remainderOfCurrentMonthTxs = dashboardTransactions.filter(
      (t) =>
        t.status === 'PENDING' &&
        new Date(t.paymentDate) > now &&
        new Date(t.paymentDate) <= currentMonthEnd,
    )
    const remainderIn = remainderOfCurrentMonthTxs
      .filter((t) => t.type === 'IN')
      .reduce((acc, t) => acc + t.value, 0)
    const remainderOut = remainderOfCurrentMonthTxs
      .filter((t) => t.type === 'OUT' && !t.debtInstallmentId)
      .reduce((acc, t) => acc + t.value, 0)

    const remainderDebts = dashboardDebtInstallments.filter(
      (inst) =>
        inst.status === 'PENDING' &&
        new Date(inst.dueDate) > now &&
        new Date(inst.dueDate) <= currentMonthEnd,
    )
    const remainderDebtOut = remainderDebts.reduce((acc, inst) => acc + inst.amount, 0)

    let runningBal = saldoAtual + remainderIn - (remainderOut + remainderDebtOut)

    const data = []

    for (let i = 1; i <= 6; i++) {
      const targetMonth = addMonths(now, i)
      const start = startOfMonth(targetMonth)
      const end = endOfMonth(targetMonth)

      const monthTxs = dashboardTransactions.filter(
        (t) => t.status === 'PENDING' && isWithinInterval(new Date(t.paymentDate), { start, end }),
      )
      const pendingIn = monthTxs.filter((t) => t.type === 'IN').reduce((acc, t) => acc + t.value, 0)
      const pendingOut = monthTxs
        .filter((t) => t.type === 'OUT' && !t.debtInstallmentId)
        .reduce((acc, t) => acc + t.value, 0)

      const monthDebts = dashboardDebtInstallments.filter(
        (inst) =>
          inst.status === 'PENDING' && isWithinInterval(new Date(inst.dueDate), { start, end }),
      )
      const pendingDebtOut = monthDebts.reduce((acc, inst) => acc + inst.amount, 0)

      const projectedIn = Math.max(pendingIn, histIn)
      const projectedOperatingOut = Math.max(pendingOut, histOut)
      const totalProjectedOut = projectedOperatingOut + pendingDebtOut

      runningBal = runningBal + projectedIn - totalProjectedOut

      data.push({
        name: format(targetMonth, 'MMM/yy', { locale: ptBR }),
        Receitas: projectedIn,
        Despesas: totalProjectedOut,
        Saldo: runningBal,
      })
    }

    return data
  }, [saldoAtual, now, currentMonthEnd, dashboardTransactions, dashboardDebtInstallments])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral e indicadores das suas empresas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-slate-400" />
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[220px] bg-white">
              <SelectValue placeholder="Todas as Empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Empresas</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(saldoAtual)}</div>
            <p className="text-xs text-muted-foreground mt-1">Saldo consolidado até hoje</p>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Receitas (Mês)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(thisMonthIn)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {renderChange(inChange, false)} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Despesas (Mês)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(thisMonthOut)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {renderChange(outChange, true)} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Resultado Líquido (Mês)
            </CardTitle>
            <Activity
              className={`h-4 w-4 ${thisMonthNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${thisMonthNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {formatCurrency(thisMonthNet)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Diferença do mês atual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-subtle border-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Faturamento vs Despesas (Últimos 6 meses)</CardTitle>
            <CardDescription>Evolução de receitas e despesas ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={{ Receitas: { color: '#10B981' }, Despesas: { color: '#E11D48' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={last6MonthsData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-subtle border-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Maiores Despesas (Mês Atual)</CardTitle>
            <CardDescription>Top 5 categorias com mais gastos</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            {expensesByCategory.length > 0 ? (
              <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
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
              <p className="text-muted-foreground text-sm">Sem despesas neste mês.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle border-slate-100">
        <CardHeader>
          <CardTitle className="text-base">Projeção de Fluxo de Caixa (Próximos 6 Meses)</CardTitle>
          <CardDescription>
            Previsão automática baseada na média dos últimos 3 meses e contas a pagar/receber
            futuras (incluindo parcelas de dívidas e financiamentos).
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <ChartContainer
            config={{
              Receitas: { color: '#10B981' },
              Despesas: { color: '#E11D48' },
              Saldo: { color: '#3B82F6' },
            }}
            className="h-[350px] w-full"
          >
            <ComposedChart
              data={projectionData}
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
              <Line
                type="monotone"
                dataKey="Saldo"
                stroke="var(--color-Saldo)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
