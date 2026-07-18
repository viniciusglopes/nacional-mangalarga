import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { destino, codigo } = await req.json()

  if (!destino || !codigo) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('nm_verificar_codigo', {
    p_destino: destino,
    p_codigo: codigo,
  })

  if (error) {
    return NextResponse.json({ error: 'Erro ao verificar' }, { status: 500 })
  }

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 })
  }

  return NextResponse.json(data)
}
