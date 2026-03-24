import { useState } from 'react'
import { useFinance, Shift } from '@/contexts/FinanceContext'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  CircleDollarSign,
  Trash2,
  Pencil,
  CalendarDays,
  ListTodo,
  QrCode,
  MapPin,
  Clock,
  History,
} from 'lucide-react'
import { ShiftModal } from '@/components/shifts/ShiftModal'
import { PayShiftModal } from '@/components/shifts/PayShiftModal'
import { QrCodeModal } from '@/components/shifts/QrCodeModal'
import { AuditLogsTab } from '@/components/shifts/AuditLogsTab'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'

export default function Shifts() {
  const { shifts, companies, updateShift, deleteShift } = useFinance()
  const { profile } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [listFilterDate, setListFilterDate] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('calendar')

  const [modalOpen, setModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [selectedDateForNew, setSelectedDateForNew] = useState<string | null>(null)

  const [payModalOpen, setPayModalOpen] = useState(false)
  const [shiftToPay, setShiftToPay] = useState<Shift | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const gridDays = eachDayOfInterval({ start: startDate, end: endDate })

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleDayClick = (dayStr: string) => {
    setListFilterDate(dayStr)
    setActiveTab('list')
  }

  const handleNewShift = (dateStr?: string) => {
    setSelectedShift(null)
    setSelectedDateForNew(dateStr || format(new Date(), 'yyyy-MM-dd'))
    setModalOpen(true)
  }

  const handleEdit = (s: Shift) => {
    setSelectedShift(s)
    setModalOpen(true)
  }

  const handlePayClick = (s: Shift) => {
    setShiftToPay(s)
    setPayModalOpen(true)
  }

  const displayShifts = shifts
    .filter((s) => {
      if (listFilterDate && s.date !== listFilterDate) return false
      return true
    })
    .sort((a, b) => {
      const statusOrder = { PENDING: 0, AUTHORIZED: 1, PAID: 2 }
      if (statusOrder[a.status] !== statusOrder[b.status])
        return statusOrder[a.status] - statusOrder[b.status]
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Plantões</h2>
          <p className="text-muted-foreground">
            Controle de escalas extras, aprovações e pagamentos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setQrModalOpen(true)}>
            <QrCode className="h-4 w-4 mr-2" /> QR Code Check-in
          </Button>
          <Button onClick={() => handleNewShift()}>
            <Plus className="h-4 w-4 mr-2" /> Novo Plantão
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" onClick={() => setListFilterDate(null)}>
            <CalendarDays className="size-4 mr-2" /> Calendário
          </TabsTrigger>
          <TabsTrigger value="list">
            <ListTodo className="size-4 mr-2" /> Lista e Aprovações
          </TabsTrigger>
          {profile?.role === 'ADMIN' && (
            <TabsTrigger value="audit">
              <History className="size-4 mr-2" /> Auditoria
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="calendar" className="mt-0">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
              <CardTitle className="text-lg font-medium">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-slate-50/50">
              <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                  <div
                    key={d}
                    className="bg-slate-100 py-2 text-center text-xs font-semibold text-slate-600"
                  >
                    {d}
                  </div>
                ))}
                {gridDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd')
                  const dayShifts = shifts.filter((s) => s.date === dayStr)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const today = isToday(day)

                  return (
                    <div
                      key={day.toString()}
                      className={`min-h-[100px] p-2 transition-colors cursor-pointer hover:bg-slate-50 relative group
                        ${!isCurrentMonth ? 'bg-slate-50/80' : 'bg-white'} 
                        ${today ? 'bg-primary/5' : ''}`}
                      onClick={() => handleDayClick(dayStr)}
                    >
                      <div
                        className={`text-right text-sm font-medium ${today ? 'text-primary' : 'text-slate-500'}`}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayShifts.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className={`text-[10px] truncate rounded px-1.5 py-0.5 border ${
                              s.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : s.status === 'AUTHORIZED'
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}
                            title={`${s.employeeName} - ${s.shiftType || 'Manual'}`}
                          >
                            {s.employeeName} {s.checkInTime && '📱'}
                          </div>
                        ))}
                        {dayShifts.length > 3 && (
                          <div className="text-[10px] text-slate-500 font-medium pl-1">
                            +{dayShifts.length - 3} plantões
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute top-1 left-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNewShift(dayStr)
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card className="shadow-sm border-slate-200">
            {listFilterDate && (
              <div className="bg-indigo-50 border-b border-indigo-100 p-3 px-6 flex items-center justify-between">
                <span className="text-sm text-indigo-800 font-medium">
                  Mostrando plantões do dia: {formatDate(parseISO(listFilterDate))}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                  onClick={() => setListFilterDate(null)}
                >
                  Limpar Filtro
                </Button>
              </div>
            )}
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Funcionário / Tipo</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right w-[180px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayShifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum plantão encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayShifts.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {formatDate(s.date)}
                          {s.checkInTime && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />{' '}
                              {format(new Date(s.checkInTime), 'HH:mm')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            {s.employeeName}
                            {s.latitude && (
                              <MapPin
                                className="w-3 h-3 text-emerald-500 inline-block"
                                title="Localização Capturada"
                              />
                            )}
                          </div>
                          {s.shiftType && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {s.shiftType} {s.guestName && ` - Hóspede: ${s.guestName}`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {companies.find((c) => c.id === s.companyId)?.name}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(s.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {s.status === 'PAID' ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Pago
                            </Badge>
                          ) : s.status === 'AUTHORIZED' ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Autorizado
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200"
                            >
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {s.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => updateShift(s.id, { status: 'AUTHORIZED' })}
                                title="Autorizar"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Aprovar
                              </Button>
                            )}
                            {s.status === 'AUTHORIZED' && profile?.role === 'ADMIN' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handlePayClick(s)}
                                title="Efetivar Pagamento"
                              >
                                <CircleDollarSign className="h-4 w-4 mr-1" /> Pagar
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                              <Pencil className="h-4 w-4 text-slate-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => deleteShift(s.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {profile?.role === 'ADMIN' && (
          <TabsContent value="audit" className="mt-0">
            <AuditLogsTab />
          </TabsContent>
        )}
      </Tabs>

      <ShiftModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        shift={selectedShift}
        selectedDate={selectedDateForNew}
      />
      <PayShiftModal open={payModalOpen} onOpenChange={setPayModalOpen} shift={shiftToPay} />
      <QrCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
    </div>
  )
}
