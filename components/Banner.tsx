'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type BannerData = {
  id: number
  posicao: string
  titulo: string | null
  imagem_url: string | null
  link_url: string | null
  html_content: string | null
  ativo: boolean
  ordem: number
}

export default function Banner({ posicao }: { posicao: 'topo' | 'rodape' }) {
  const [banners, setBanners] = useState<BannerData[]>([])

  useEffect(() => {
    supabase
      .from('nm_banners')
      .select('*')
      .eq('posicao', posicao)
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .then(({ data }) => {
        if (data) setBanners(data)
      })
  }, [posicao])

  if (banners.length === 0) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {banners.map(b => (
        <div key={b.id} className="my-2">
          {b.html_content ? (
            <div dangerouslySetInnerHTML={{ __html: b.html_content }} className="rounded-lg overflow-hidden" />
          ) : b.imagem_url ? (
            b.link_url ? (
              <a href={b.link_url} target="_blank" rel="noopener noreferrer">
                <img src={b.imagem_url} alt={b.titulo || 'Banner'} className="w-full rounded-lg" />
              </a>
            ) : (
              <img src={b.imagem_url} alt={b.titulo || 'Banner'} className="w-full rounded-lg" />
            )
          ) : null}
        </div>
      ))}
    </div>
  )
}
