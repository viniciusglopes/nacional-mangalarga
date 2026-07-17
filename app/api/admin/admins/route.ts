import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = JSON.parse(Buffer.from(auth.slice(7), 'base64').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch { return null }
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const { data } = await supabase.rpc('nm_admin_list_admins')
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const { email, password, nome } = await req.json()
  if (!email || !password || !nome) return NextResponse.json({ error: 'Todos os campos sao obrigatorios' }, { status: 400 })

  const { error } = await supabase.rpc('nm_add_admin', { p_email: email, p_password: password, p_nome: nome })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const { id } = await req.json()
  await supabase.rpc('nm_admin_delete_admin', { p_id: id })
  return NextResponse.json({ ok: true })
}
