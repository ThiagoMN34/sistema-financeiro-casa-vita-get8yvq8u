import { useFinance } from '@/contexts/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatShortDate } from '@/lib/formatters'
import { ArrowDownRight, ArrowUpRight, Wallet, DollarSign, Activity } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#10B981', '#E11D48', '#F59E0B', '#3B82F6', '#8B5CF6', '#14B8A6', '#F43F5E']

export default function Index() {
  const { summary, filteredTransactions, categories } = useFinance()

  // Prepare chart data
  const expensesByCategory = categories
    .map((c) => {
      const value = filteredTransactions
        .filter((t) => t.categoryId === c.id && t.type === 'OUT')
        .reduce((sum, t) => sum + t.value, 0)
      return { name: c.name, value }
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5

  const lastDaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]

    const dayTrans = filteredTransactions.filter((t) => t.paymentDate.startsWith(dateStr))
    const inVal = dayTrans.filter((t) => t.type === 'IN').reduce((sum, t) => sum + t.value, 0)
    const outVal = dayTrans.filter((t) => t.type === 'OUT').reduce((sum, t) => sum + t.value, 0)

    return { name: formatShortDate(d), Receitas: inVal, Despesas: outVal, Fluxo: inVal - outVal }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-muted-foreground">Consolidado financeiro do período selecionado.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(summary.balance)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Receitas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.revenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Despesas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(summary.expenses)}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-subtle border-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Receitas vs Despesas (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={{ Receitas: { color: '#10B981' }, Despesas: { color: '#E11D48' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={lastDaysData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-subtle border-slate-100">
          <CardHeader>
            <CardTitle className="text-base">Top Despesas por Categoria</CardTitle>
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
              <p className="text-muted-foreground text-sm">Sem dados suficientes no período.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
