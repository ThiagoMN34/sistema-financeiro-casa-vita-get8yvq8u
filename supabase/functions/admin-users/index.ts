import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Header de Autorização ausente.')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) throw new Error(`Token inválido: ${authError?.message || 'Sessão não encontrada'}`)

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profileError) throw new Error(`Erro ao validar permissões: ${profileError.message}`)
    if (profile?.role !== 'ADMIN') throw new Error('Acesso negado: Apenas administradores podem realizar esta ação.')

    const bodyText = await req.text()
    const body = bodyText ? JSON.parse(bodyText) : {}
    const { action } = body

    if (action === 'create') {
      const { email, password, role } = body
      if (!email) throw new Error('O e-mail é obrigatório.')
      if (!password || password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.')
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (createError) throw createError

      if (role) {
        const { error: roleError } = await supabase.from('profiles').update({ role }).eq('id', newUser.user.id)
        if (roleError) throw new Error(`Usuário criado, mas houve erro ao definir perfil: ${roleError.message}`)
      }

      return new Response(JSON.stringify({ success: true, user: newUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update_password') {
      const { id, password } = body
      if (!id) throw new Error('ID do usuário não fornecido.')
      if (!password || password.length < 6) throw new Error('A nova senha deve ter pelo menos 6 caracteres.')
        
      const { error: updateError } = await supabase.auth.admin.updateUserById(id, { password })
      if (updateError) throw updateError
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) throw new Error('ID do usuário não fornecido.')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(id)
      if (deleteError) throw deleteError
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Ação solicitada não reconhecida pelo servidor.')
  } catch (error: any) {
    console.error('[Admin Users Function Error]:', error)
    const errorMessage = error.message || JSON.stringify(error)
    
    // Always return 200 so the frontend fetch/invoke doesn't throw a generic "Non-2xx status code" error
    // By passing `{ error: errorMessage }`, the client can display the exact reason for the failure.
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
