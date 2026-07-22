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

export default function Banner({ posicao }: { posicao: 'topo' | 'rodape' | 'header_topo' | 'nav_rodape' }) {
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

  function renderBanner(b: BannerData) {
    if (b.html_content) {
      return <div dangerouslySetInnerHTML={{ __html: b.html_content }} className="h-full rounded-lg overflow-hidden" />
    }
    if (b.imagem_url) {
      const img = <img src={b.imagem_url} alt={b.titulo || 'Banner'} className="h-full w-auto rounded-lg object-contain" />
      return b.link_url ? (
        <a href={b.link_url} target="_blank" rel="noopener noreferrer" className="block h-full">{img}</a>
      ) : img
    }
    return null
  }

  // Com 1 banner so, mostra fixo. Com 2+, "letreiro" rolando na horizontal
  // (a lista e duplicada para o loop ficar sem costura).
  const scrolling = banners.length > 1
  const duracao = banners.length * 6

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 h-20 overflow-hidden">
      {scrolling ? (
        <div
          className="flex h-full gap-3 w-max animate-banner-marquee"
          style={{ animationDuration: `${duracao}s` }}
        >
          {[...banners, ...banners].map((b, i) => (
            <div key={`${b.id}-${i}`} className="h-full flex-shrink-0">{renderBanner(b)}</div>
          ))}
        </div>
      ) : (
        <div className="h-full flex justify-center">{renderBanner(banners[0])}</div>
      )}
    </div>
  )
}
