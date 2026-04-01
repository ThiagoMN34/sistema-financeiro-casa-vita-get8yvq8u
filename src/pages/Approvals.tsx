import { useState } from 'react'
import { useFinance } from '@/contexts/FinanceContext'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Eye, CheckCircle2, Wallet, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function Approvals() {
  const { transactions, companies, categories, updateTransaction } = useFinance()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'ADMIN'

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; type: string } | null>(null)

  const pendingApprovals = transactions
    .filter((t) => t.status === 'PENDING' || t.status === 'AUTHORIZED')
    .filter(
      (t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nfNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Aprovação de Lançamentos</h2>
          <p className="text-muted-foreground">
            Confira documentos e dados antes de autorizar e efetuar pagamentos.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar descrição..."
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
                <TableHead>Data Prevista</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-center">NF</TableHead>
                <TableHead className="text-center">PC</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Nenhum lançamento aguardando aprovação.
                  </TableCell>
                </TableRow>
              ) : (
                pendingApprovals.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-600">
                      {formatDate(tx.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-800">{tx.description}</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {categories.find((c) => c.id === tx.categoryId)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {companies.find((c) => c.id === tx.companyId)?.name}
                    </TableCell>

                    <TableCell className="text-center">
                      {tx.nfAttachmentUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 h-8"
                          onClick={() => setSelectedDoc({ url: tx.nfAttachmentUrl!, type: 'nf' })}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sem anexo</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {tx.pcAttachmentUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 h-8"
                          onClick={() => setSelectedDoc({ url: tx.pcAttachmentUrl!, type: 'pc' })}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sem anexo</span>
                      )}
                    </TableCell>

                    <TableCell
                      className={`text-right font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {tx.type === 'OUT' ? '-' : '+'}
                      {formatCurrency(tx.value)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          tx.status === 'AUTHORIZED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {tx.status === 'AUTHORIZED' ? 'Aprovado' : 'Pendente'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {tx.status === 'PENDING' && isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => updateTransaction(tx.id, { status: 'AUTHORIZED' })}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Aprovar
                          </Button>
                        )}
                        {tx.status === 'AUTHORIZED' && isAdmin && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => updateTransaction(tx.id, { status: 'CONFIRMED' })}
                          >
                            <Wallet className="h-4 w-4 mr-1" />{' '}
                            {tx.type === 'IN' ? 'Confirmar' : 'Pagar'}
                          </Button>
                        )}
                        {!isAdmin && (
                          <span className="text-xs text-muted-foreground italic">Apenas Admin</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDoc} onOpenChange={(o) => !o && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedDoc?.type === 'nf' ? 'Nota Fiscal' : 'Pedido de Compra'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-slate-100 rounded-md overflow-hidden flex items-center justify-center relative">
            {selectedDoc?.url ? (
              selectedDoc.url.toLowerCase().endsWith('.pdf') ||
              selectedDoc.url.toLowerCase().includes('.doc') ? (
                <iframe
                  src={selectedDoc.url}
                  className="w-full h-full border-0"
                  title="Documento"
                />
              ) : (
                <img
                  src={selectedDoc.url}
                  alt="Documento"
                  className="max-w-full max-h-full object-contain"
                />
              )
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
