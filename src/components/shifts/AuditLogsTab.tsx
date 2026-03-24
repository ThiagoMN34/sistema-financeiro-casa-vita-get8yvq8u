import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export function AuditLogsTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('audit_logs' as any)
        .select(`
          id, action, entity_id, details, created_at,
          profile:profiles(email)
        `)
        .eq('entity_type', 'SHIFT')
        .order('created_at', { ascending: false })
        .limit(100)

      if (data) setLogs(data)
      setLoading(false)
    }
    fetchLogs()
  }, [])

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-0 max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-[160px]">Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead className="w-[100px]">Ação</TableHead>
              <TableHead>Detalhes da Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Carregando auditoria...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum log de auditoria encontrado.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const oldStatus = log.details?.old?.status
                const newStatus = log.details?.new?.status

                let detailsText = ''
                if (log.action === 'UPDATE') {
                  if (oldStatus !== newStatus) {
                    detailsText = `Status alterado de ${oldStatus} para ${newStatus} (${log.details?.new?.employee_name})`
                  } else {
                    detailsText = `Registro atualizado: ${log.details?.new?.employee_name}`
                  }
                } else if (log.action === 'INSERT') {
                  detailsText = `Registro criado: ${log.details?.employee_name} (${log.details?.shift_type || 'Manual'})`
                } else if (log.action === 'DELETE') {
                  detailsText = `Registro removido: ${log.details?.employee_name}`
                }

                return (
                  <TableRow key={log.id} className="text-sm">
                    <TableCell className="whitespace-nowrap font-medium text-slate-600">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {log.profile?.email ? (
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-xs">
                          {log.profile.email}
                        </span>
                      ) : (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs">
                          QR Code / Autoatendimento
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                          log.action === 'INSERT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'UPDATE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500">{detailsText}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
