import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('thiagomnaves@yahoo.com.br')
  const [password, setPassword] = useState('securepassword123')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signIn(email, password)
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
            <p className="mt-1 border-t pt-1">Senha: securepassword123</p>
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
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
