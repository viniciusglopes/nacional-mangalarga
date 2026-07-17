'use client'

import { useState, useEffect, use } from 'react'
import { supabase, Animal } from '@/lib/supabase'
import Link from 'next/link'

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-start py-2 border-b border-[var(--border)]">
      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{label}</span>
      <span className="text-sm text-right ml-4">{value}</span>
    </div>
  )
}

function GenealogyCard({ label, nome, registro }: { label: string; nome: string; registro: string }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)] flex-1 min-w-0">
      <p className="text-[10px] text-[var(--accent)] font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-semibold truncate">{nome || '—'}</p>
      {registro && <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">Reg. {registro}</p>}
    </div>
  )
}

export default function AnimalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('nm_animais')
        .select('*')
        .eq('id', id)
        .single()
      setAnimal(data)
      setLoading(false)
    }
    load()

    const favs = JSON.parse(localStorage.getItem('nm_favoritos') || '[]')
    setIsFav(favs.includes(Number(id)))
  }, [id])

  function toggleFav() {
    const favs: number[] = JSON.parse(localStorage.getItem('nm_favoritos') || '[]')
    const numId = Number(id)
    if (favs.includes(numId)) {
      const next = favs.filter(f => f !== numId)
      localStorage.setItem('nm_favoritos', JSON.stringify(next))
      setIsFav(false)
    } else {
      favs.push(numId)
      localStorage.setItem('nm_favoritos', JSON.stringify(favs))
      setIsFav(true)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!animal) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-[var(--text-muted)]">Animal nao encontrado</p>
      <Link href="/" className="text-[var(--accent)] text-sm">Voltar</Link>
    </div>
  )

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-[var(--text-muted)] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold truncate">{animal.nome}</h1>
            <p className="text-[10px] text-[var(--text-muted)]">{animal.categoria}</p>
          </div>
          <button onClick={toggleFav} className="p-2">
            <svg className={`w-5 h-5 ${isFav ? 'text-red-400 fill-red-400' : 'text-[var(--text-muted)]'}`} viewBox="0 0 24 24" stroke="currentColor" fill={isFav ? 'currentColor' : 'none'}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Name & Badges */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              animal.tipo_marcha === 'MB' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
            }`}>
              {animal.tipo_marcha === 'MB' ? 'Marcha Batida' : 'Marcha Picada'}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
              {animal.tipo_campeonato}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-1">{animal.nome}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{animal.campeonato}</p>
        </div>

        {/* Info */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-2">Dados do Animal</h3>
          <InfoRow label="Registro" value={animal.registro} />
          <InfoRow label="Chip" value={animal.chip} />
          <InfoRow label="No Catalogo" value={animal.num_catalogo ? `#${animal.num_catalogo}` : null} />
          <InfoRow label="Nascimento" value={animal.data_nascimento} />
          <InfoRow label="Idade" value={animal.idade} />
          <InfoRow label="Categoria" value={animal.categoria} />
        </div>

        {/* Genealogy */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-3">Genealogia</h3>
          <div className="flex gap-2">
            <GenealogyCard label="Pai" nome={animal.pai} registro={animal.pai_registro} />
            <GenealogyCard label="Mae" nome={animal.mae} registro={animal.mae_registro} />
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-2">Propriedade</h3>
          <InfoRow label="Criador" value={animal.criador} />
          <InfoRow label="Expositor" value={animal.expositor} />
          <InfoRow label="Haras" value={animal.haras} />
          <InfoRow label="Cidade" value={animal.cidade && animal.uf ? `${animal.cidade} - ${animal.uf}` : animal.cidade} />
        </div>

        {/* Share */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: animal.nome,
                text: `${animal.nome} - ${animal.campeonato} | 43ª Nacional Mangalarga Marchador`,
                url: window.location.href,
              })
            } else {
              navigator.clipboard.writeText(window.location.href)
            }
          }}
          className="w-full py-3 bg-[var(--accent)] text-black font-semibold rounded-xl text-sm active:scale-[0.98] transition-transform"
        >
          Compartilhar Animal
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="sticky bottom-0 bg-[#0f0f1a]/95 backdrop-blur-sm border-t border-[var(--border)] px-4 py-2">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-[var(--text-muted)] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-[10px]">Busca</span>
          </Link>
          <Link href="/campeonatos" className="flex flex-col items-center gap-0.5 text-[var(--text-muted)] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            <span className="text-[10px]">Campeonatos</span>
          </Link>
          <Link href="/favoritos" className="flex flex-col items-center gap-0.5 text-[var(--text-muted)] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span className="text-[10px]">Favoritos</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
