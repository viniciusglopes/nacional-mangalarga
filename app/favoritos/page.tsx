'use client'

import { useState, useEffect } from 'react'
import { supabase, Animal } from '@/lib/supabase'
import Link from 'next/link'

export default function Favoritos() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const favs: number[] = JSON.parse(localStorage.getItem('nm_favoritos') || '[]')
      if (favs.length === 0) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('nm_animais')
        .select('*')
        .in('id', favs)
        .order('nome', { ascending: true })
      setAnimals(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-[var(--text-muted)] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-base font-bold">Meus Favoritos</h1>
          <span className="ml-auto text-xs text-[var(--text-muted)]">{animals.length} animais</span>
        </div>
      </header>

      <div className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : animals.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-sm">Nenhum favorito ainda</p>
            <p className="text-xs mt-1">Toque no coracao na pagina do animal para salvar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {animals.map(animal => (
              <Link
                key={animal.id}
                href={`/animal/${animal.id}`}
                className="block bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        animal.tipo_marcha === 'MB' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {animal.tipo_marcha}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold truncate">{animal.nome}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{animal.categoria}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">Reg. {animal.registro}</p>
                    {animal.haras && (
                      <p className="text-[10px] text-[var(--accent)] mt-0.5 max-w-[120px] truncate">{animal.haras}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

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
          <Link href="/favoritos" className="flex flex-col items-center gap-0.5 text-[var(--accent)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span className="text-[10px]">Favoritos</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
