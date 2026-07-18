import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { tipo, destino, nome } = await req.json()

  if (!tipo || !destino || !nome) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('nm_gerar_codigo', {
    p_tipo: tipo,
    p_destino: destino,
    p_nome: nome,
  })

  if (error) {
    return NextResponse.json({ error: 'Erro ao gerar codigo' }, { status: 500 })
  }

  const codigo = data.codigo

  try {
    if (tipo === 'email') {
      await sendEmail(destino, codigo)
    } else {
      await sendWhatsApp(destino, codigo)
    }
  } catch (e) {
    console.error('Erro ao enviar codigo:', e)
    return NextResponse.json({ error: 'Erro ao enviar codigo. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ sent: true, expires_in: 600 })
}

async function sendEmail(email: string, codigo: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Nacional MM <noreply@nacional2026.com.br>',
      to: [email],
      subject: 'Seu codigo de verificacao - 43a Nacional MM',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a5c2e;">43a Nacional do Cavalo Mangalarga Marchador</h2>
          <p>Seu codigo de verificacao:</p>
          <div style="background:#f4f4f4;padding:20px;text-align:center;border-radius:8px;margin:16px 0;">
            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a5c2e;">${codigo}</span>
          </div>
          <p style="color:#666;font-size:14px;">Este codigo expira em 10 minutos.</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}

async function sendWhatsApp(telefone: string, codigo: string) {
  const apiUrl = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE

  if (!apiUrl || !apiKey || !instance) throw new Error('Evolution API not configured')

  let numero = telefone.replace(/\D/g, '')
  if (!numero.startsWith('55')) numero = '55' + numero

  const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: numero,
      text: `🐴 *43a Nacional MM*\n\nSeu codigo de verificacao: *${codigo}*\n\nExpira em 10 minutos.`,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Evolution error: ${err}`)
  }
}
