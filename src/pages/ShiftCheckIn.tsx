import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { MapPin, CheckCircle2, Stethoscope } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

export default function ShiftCheckIn() {
  const [searchParams] = useSearchParams()
  const initialCompanyId = searchParams.get('companyId') || ''

  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [companyId, setCompanyId] = useState(initialCompanyId)
  const [employeeName, setEmployeeName] = useState('')
  const [shiftType, setShiftType] = useState('')
  const [guestName, setGuestName] = useState('')
  const [reason, setReason] = useState('')
  const [authorizedBy, setAuthorizedBy] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from('companies').select('id, name')
      if (data) setCompanies(data)
    }
    fetchCompanies()

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geo error', err),
        { enableHighAccuracy: true, timeout: 5000 },
      )
    }
  }, [])

  const validateTime = (type: string) => {
    const hour = new Date().getHours()
    if (type.includes('diurno')) {
      return hour >= 6 && hour < 19
    } else if (type.includes('noturno')) {
      return hour >= 18 || hour < 7
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateTime(shiftType)) {
      toast({
        title: 'Horário Inválido',
        description:
          'Você só pode registrar o plantão durante o horário correspondente ao turno selecionado.',
        variant: 'destructive',
      })
      return
    }

    if (shiftType.includes('hóspede') && !guestName) {
      toast({
        title: 'Aviso',
        description: 'O nome do hóspede é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    const dateStr = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('shifts')
      .insert({
        company_id: companyId,
        employee_name: employeeName,
        date: dateStr,
        status: 'PENDING',
        shift_type: shiftType,
        guest_name: guestName || null,
        reason: reason,
        authorized_by: authorizedBy,
        check_in_time: new Date().toISOString(),
        latitude: location?.lat || null,
        longitude: location?.lng || null,
      })
      .select()
      .single()

    setIsSubmitting(false)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o plantão. Tente novamente.',
        variant: 'destructive',
      })
    } else {
      setSuccess(true)

      // Notify the manager asynchronously via Edge Function
      supabase.functions
        .invoke('notify-manager', {
          body: {
            shiftId: data?.id,
            employeeName,
            shiftType,
            date: dateStr,
          },
        })
        .catch((err) => console.error('Failed to dispatch notification', err))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center py-8 border-slate-200">
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Check-in Realizado!</h2>
            <p className="text-slate-500">
              Seu plantão foi registrado com sucesso e a gestora já foi notificada para aprovação.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Registrar Novo Plantão
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 py-8">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Registro de Plantão</CardTitle>
          <CardDescription>Preencha os dados no início do seu turno</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Unidade / Empresa</Label>
              <Select value={companyId} onValueChange={setCompanyId} required>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seu Nome Completo</Label>
              <Input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                className="bg-white"
                placeholder="Digite seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Plantão</Label>
              <Select value={shiftType} onValueChange={setShiftType} required>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h diurno clínica">12h Diurno - Clínica</SelectItem>
                  <SelectItem value="12h noturno clínica">12h Noturno - Clínica</SelectItem>
                  <SelectItem value="12h diurno hóspede">12h Diurno - Hóspede</SelectItem>
                  <SelectItem value="12h noturno hóspede">12h Noturno - Hóspede</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shiftType.includes('hóspede') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Nome do Hóspede</Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="bg-white"
                  placeholder="Nome do paciente/hóspede"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Motivo do Plantão (Justificativa)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="bg-white resize-none"
                rows={2}
                placeholder="Ex: Cobertura de atestado, demanda extra, etc"
              />
            </div>

            <div className="space-y-2">
              <Label>Nome de Quem Autorizou</Label>
              <Input
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                required
                className="bg-white"
                placeholder="Ex: Gestora Maria"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-medium bg-slate-100 p-3 rounded-md border border-slate-200">
              <MapPin className={`w-4 h-4 ${location ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className={location ? 'text-emerald-700' : 'text-amber-700'}>
                {location
                  ? 'Localização capturada com sucesso'
                  : 'Aguardando localização do GPS...'}
              </span>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !companyId}>
              {isSubmitting ? 'Registrando...' : 'Registrar Check-in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
