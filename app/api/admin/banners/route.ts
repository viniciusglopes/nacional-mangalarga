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
  const { data } = await supabase.rpc('nm_admin_list_banners')
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase.rpc('nm_admin_create_banner', {
    p_posicao: body.posicao,
    p_titulo: body.titulo || null,
    p_imagem_url: body.imagem_url || null,
    p_link_url: body.link_url || null,
    p_html_content: body.html_content || null,
    p_ativo: body.ativo ?? true,
    p_ordem: body.ordem ?? 0,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase.rpc('nm_admin_update_banner', {
    p_id: body.id,
    p_posicao: body.posicao || null,
    p_titulo: body.titulo || null,
    p_imagem_url: body.imagem_url || null,
    p_link_url: body.link_url || null,
    p_html_content: body.html_content || null,
    p_ativo: body.ativo ?? null,
    p_ordem: body.ordem ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const { id } = await req.json()
  await supabase.rpc('nm_admin_delete_banner', { p_id: id })
  return NextResponse.json({ ok: true })
}
