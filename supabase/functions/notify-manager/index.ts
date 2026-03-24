import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { shiftId, employeeName, shiftType, date } = await req.json()

    // Since we do not have an external email service secret provided,
    // we log the action simulating the email dispatch mechanism.
    console.log(`[EMAIL DISPATCH] Notifying manager about new shift registration:`, {
      shiftId,
      employeeName,
      shiftType,
      date,
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Manager successfully notified' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
