'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, Animal } from '@/lib/supabase'
import Link from 'next/link'

const MARCHAS = ['Todas', 'MB', 'MP'] as const
const TIPOS = ['Todos', 'Convencional', 'Castrado', 'Excl. Marcha'] as const
const TIPO_MAP: Record<string, string> = { 'Excl. Marcha': 'Exclusivamente Marcha' }
const PER_PAGE = 30

export default function Home() {
  const [search, setSearch] = useState('')
  const [marcha, setMarcha] = useState<string>('Todas')
  const [tipo, setTipo] = useState<string>('Todos')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchAnimals = useCallback(async (pageNum: number, reset: boolean) => {
    setLoading(true)
    const from = pageNum * PER_PAGE
    const to = from + PER_PAGE - 1

    let query = supabase
      .from('nm_animais')
      .select('*', { count: 'exact' })
      .order('id_catalogo', { ascending: true })
      .range(from, to)

    if (search.trim()) {
      const s = search.trim()
      if (/^\d+$/.test(s)) {
        query = query.or(`registro.eq.${s},chip.eq.${s},num_catalogo.eq.${s}`)
      } else {
        query = query.ilike('nome', `%${s}%`)
      }
    }
    if (marcha !== 'Todas') query = query.eq('tipo_marcha', marcha)
    const tipoReal = TIPO_MAP[tipo] || tipo
    if (tipoReal !== 'Todos') query = query.eq('tipo_campeonato', tipoReal)

    const { data, count, error } = await query

    if (!error && data) {
      if (reset) {
        setAnimals(data)
      } else {
        setAnimals(prev => [...prev, ...data])
      }
      setTotal(count ?? 0)
      setHasMore(data.length === PER_PAGE)
    }
    setLoading(false)
  }, [search, marcha, tipo])

  useEffect(() => {
    setPage(0)
    setAnimals([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAnimals(0, true)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, marcha, tipo, fetchAnimals])

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchAnimals(nextPage, false)
      }
    }, { threshold: 0.1 })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [page, loading, hasMore, fetchAnimals])

  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 pt-4 pb-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
              MM
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">43ª Nacional</h1>
              <p className="text-xs text-[var(--text-muted)]">Mangalarga Marchador</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-xs text-[var(--text-muted)]">{total} animais</span>
            </div>
          </div>

          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, registro ou chip..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-0.5 flex-shrink-0">
              {MARCHAS.map(m => (
                <button
                  key={m}
                  onClick={() => setMarcha(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    marcha === m
                      ? m === 'MB' ? 'bg-[var(--mb-color)] text-white' : m === 'MP' ? 'bg-[var(--mp-color)] text-white' : 'bg-[var(--accent)] text-black'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-0.5 flex-shrink-0">
              {TIPOS.map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    tipo === t ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
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
                    {animal.num_catalogo && (
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">#{animal.num_catalogo}</span>
                    )}
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
              <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-muted)]">
                <span className="truncate">Pai: {animal.pai || '—'}</span>
                <span className="truncate">Mãe: {animal.mae || '—'}</span>
              </div>
            </Link>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && animals.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">Nenhum animal encontrado</p>
            <p className="text-xs mt-1">Tente outros filtros ou termos de busca</p>
          </div>
        )}

        {hasMore && <div ref={sentinelRef} className="h-10" />}
      </div>

      <nav className="sticky bottom-0 bg-[#0f0f1a]/95 backdrop-blur-sm border-t border-[var(--border)] px-4 py-2 safe-bottom">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-[var(--accent)]">
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
