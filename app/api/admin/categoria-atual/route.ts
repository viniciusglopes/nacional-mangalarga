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

  const [{ data: atualData }, { data: categoriasData }] = await Promise.all([
    supabase.rpc('nm_get_categoria_atual'),
    supabase.rpc('nm_distinct_categorias'),
  ])

  const atual = Array.isArray(atualData) ? atualData[0] : atualData
  const categorias = (categoriasData || [])
    .map((d: { categoria: string }) => d.categoria)
    .filter(Boolean)

  return NextResponse.json({
    categoria: atual?.categoria || null,
    tipo_marcha: atual?.tipo_marcha || null,
    categorias,
  })
}

export async function PUT(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const { categoria, tipo_marcha } = await req.json()

  const { error } = await supabase.rpc('nm_admin_set_categoria_atual', {
    p_categoria: categoria || null,
    p_tipo_marcha: tipo_marcha || null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
