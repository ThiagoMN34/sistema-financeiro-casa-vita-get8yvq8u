import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('thiagomnaves@yahoo.com.br')
  const [password, setPassword] = useState('1234')
  const [loading, setLoading] = useState(false)
  const { signIn, resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      console.error('Login error:', error)
      toast({
        title: 'Erro de Autenticação',
        description:
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos. Verifique as credenciais.'
            : error.message,
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Preencha o campo de e-mail para recuperar a senha.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      })
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-sm shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Casa Vita</CardTitle>
            <CardDescription>Acesse o sistema financeiro</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2 p-3 text-xs text-slate-500 bg-slate-100 rounded-md border border-slate-200 text-center">
            <p>
              <strong>Admin:</strong> thiagomnaves@yahoo.com.br
            </p>
            <p>
              <strong>Gestora:</strong> naves034@gmail.com
            </p>
            <p className="mt-1 border-t pt-1">Senha: 1234</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-xs text-primary hover:underline font-medium"
                  disabled={loading}
                >
                  Esqueci minha senha
                </button>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
