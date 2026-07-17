'use client'

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase, Animal } from '@/lib/supabase'
import Link from 'next/link'
import Banner from '@/components/Banner'
import { trackAnimalClick } from '@/components/Analytics'

const MARCHAS = [
  { value: 'Todas', label: 'Todas' },
  { value: 'MB', label: 'M. Batida' },
  { value: 'MP', label: 'M. Picada' },
]
const PER_PAGE = 30

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 12px center',
}

type Suggestion = { label: string; type: 'haras' | 'criador' | 'expositor'; value: string }

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const campeonatoParam = searchParams.get('campeonato')

  const [search, setSearch] = useState('')
  const [marcha, setMarcha] = useState<string>('Todas')
  const [categoria, setCategoria] = useState<string>('Todas')
  const [criador, setCriador] = useState<string>('Todos')
  const [expositor, setExpositor] = useState<string>('Todos')
  const [haras, setHaras] = useState<string>('Todos')
  const [categorias, setCategorias] = useState<string[]>([])
  const [criadores, setCriadores] = useState<string[]>([])
  const [expositores, setExpositores] = useState<string[]>([])
  const [harasList, setHarasList] = useState<string[]>([])
  const [campeonatoFilter, setCampeonatoFilter] = useState<string | null>(campeonatoParam)
  const [showFilters, setShowFilters] = useState(false)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCampeonatoFilter(campeonatoParam)
  }, [campeonatoParam])

  useEffect(() => {
    async function loadFilters() {
      const [catRes, criRes, expRes, harRes] = await Promise.all([
        supabase.rpc('nm_distinct_categorias'),
        supabase.rpc('nm_distinct_criadores'),
        supabase.rpc('nm_distinct_expositores'),
        supabase.rpc('nm_distinct_haras'),
      ])
      if (catRes.data) setCategorias(catRes.data.map((d: { categoria: string }) => d.categoria).filter(Boolean))
      if (criRes.data) setCriadores(criRes.data.map((d: { criador: string }) => d.criador).filter(Boolean))
      if (expRes.data) setExpositores(expRes.data.map((d: { expositor: string }) => d.expositor).filter(Boolean))
      if (harRes.data) setHarasList(harRes.data.map((d: { haras: string }) => d.haras).filter(Boolean))
    }
    loadFilters()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q.length < 2) return []
    const results: Suggestion[] = []
    for (const h of harasList) {
      if (h.toLowerCase().includes(q)) results.push({ label: h, type: 'haras', value: h })
      if (results.length >= 5) break
    }
    for (const c of criadores) {
      if (c.toLowerCase().includes(q)) results.push({ label: c, type: 'criador', value: c })
      if (results.length >= 10) break
    }
    for (const e of expositores) {
      if (e.toLowerCase().includes(q)) results.push({ label: e, type: 'expositor', value: e })
      if (results.length >= 15) break
    }
    return results.slice(0, 8)
  }, [search, harasList, criadores, expositores])

  const activeFilterCount = [
    criador !== 'Todos',
    expositor !== 'Todos',
    haras !== 'Todos',
  ].filter(Boolean).length

  const fetchAnimals = useCallback(async (pageNum: number, reset: boolean) => {
    setLoading(true)
    const from = pageNum * PER_PAGE
    const to = from + PER_PAGE - 1

    let query = supabase
      .from('nm_animais')
      .select('*', { count: 'exact' })
      .order('id_catalogo', { ascending: true })
      .range(from, to)

    if (activeFilter) {
      if (activeFilter.type === 'haras') query = query.eq('haras', activeFilter.value)
      else if (activeFilter.type === 'criador') query = query.eq('criador', activeFilter.value)
      else if (activeFilter.type === 'expositor') query = query.eq('expositor', activeFilter.value)
    } else if (search.trim()) {
      const s = search.trim()
      if (/^\d+$/.test(s)) {
        query = query.or(`registro.eq.${s},chip.eq.${s},num_catalogo.eq.${s}`)
      } else {
        query = query.ilike('nome', `%${s}%`)
      }
    }
    if (marcha !== 'Todas') query = query.eq('tipo_marcha', marcha)
    if (categoria !== 'Todas') query = query.eq('categoria', categoria)
    if (criador !== 'Todos' && !activeFilter) query = query.eq('criador', criador)
    if (expositor !== 'Todos' && !activeFilter) query = query.eq('expositor', expositor)
    if (haras !== 'Todos' && !activeFilter) query = query.eq('haras', haras)
    if (campeonatoFilter) query = query.eq('campeonato', campeonatoFilter)

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
  }, [search, marcha, categoria, criador, expositor, haras, campeonatoFilter, activeFilter])

  useEffect(() => {
    setPage(0)
    setAnimals([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAnimals(0, true)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, marcha, categoria, criador, expositor, haras, campeonatoFilter, activeFilter, fetchAnimals])

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

  function selectSuggestion(s: Suggestion) {
    setActiveFilter({ type: s.type, value: s.value })
    setSearch(s.label)
    setShowSuggestions(false)
  }

  function clearSearch() {
    setSearch('')
    setActiveFilter(null)
    setShowSuggestions(false)
  }

  const typeLabel = { haras: 'Haras', criador: 'Criador', expositor: 'Expositor' }
  const typeColor = { haras: 'text-[var(--accent)]', criador: 'text-blue-400', expositor: 'text-purple-400' }

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
              <p className="text-2xl font-bold text-[var(--accent)] leading-none">{total.toLocaleString()}</p>
              <p className="text-[10px] text-[var(--text-muted)] uppercase">animais</p>
            </div>
          </div>

          {campeonatoFilter && (
            <div className="flex items-center gap-2 mb-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg px-3 py-2">
              <span className="text-xs text-[var(--accent)] flex-1 truncate">{campeonatoFilter}</span>
              <Link href="/" className="text-[var(--text-muted)] hover:text-white flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Link>
            </div>
          )}

          {/* Search with autocomplete */}
          <div className="relative mb-3" ref={searchRef}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar animal, haras, criador, expositor..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveFilter(null); setShowSuggestions(true) }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {(search || activeFilter) && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}

            {/* Active filter badge */}
            {activeFilter && (
              <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className={`text-[9px] font-bold uppercase ${typeColor[activeFilter.type as keyof typeof typeColor]}`}>
                  {typeLabel[activeFilter.type as keyof typeof typeLabel]}:
                </span>
              </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && !activeFilter && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-2xl z-50">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.type}-${s.value}-${i}`}
                    onClick={() => selectSuggestion(s)}
                    className="w-full px-4 py-2.5 text-left hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-3 border-b border-[var(--border)] last:border-0"
                  >
                    <span className={`text-[9px] font-bold uppercase w-16 flex-shrink-0 ${typeColor[s.type]}`}>
                      {typeLabel[s.type]}
                    </span>
                    <span className="text-sm truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {/* Row 1: Marcha + Filtros toggle */}
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-0.5 flex-shrink-0">
                {MARCHAS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMarcha(m.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      marcha === m.value
                        ? m.value === 'MB' ? 'bg-[var(--mb-color)] text-white' : m.value === 'MP' ? 'bg-[var(--mp-color)] text-white' : 'bg-[var(--accent)] text-black'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border flex items-center gap-1 ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-[var(--accent)] text-black border-[var(--accent)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-white'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
            </div>

            {/* Categoria always visible */}
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full py-2 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
              style={selectStyle}>
              <option value="Todas">Todas as categorias</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Expandable filters (Criador, Expositor, Haras dropdowns) */}
            {showFilters && (
              <div className="space-y-2 pt-1">
                <select value={criador} onChange={e => setCriador(e.target.value)}
                  className="w-full py-2 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  style={selectStyle}>
                  <option value="Todos">Todos os criadores</option>
                  {criadores.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={expositor} onChange={e => setExpositor(e.target.value)}
                  className="w-full py-2 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  style={selectStyle}>
                  <option value="Todos">Todos os expositores</option>
                  {expositores.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={haras} onChange={e => setHaras(e.target.value)}
                  className="w-full py-2 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  style={selectStyle}>
                  <option value="Todos">Todos os haras</option>
                  {harasList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setCriador('Todos'); setExpositor('Todos'); setHaras('Todos') }}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <Banner posicao="topo" />

      <div className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full">
        <div className="space-y-2">
          {animals.map(animal => (
            <Link
              key={animal.id}
              href={`/animal/${animal.id}`}
              onClick={() => trackAnimalClick(animal.id)}
              className="block bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      animal.tipo_marcha === 'MB' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {animal.tipo_marcha === 'MB' ? 'M. Batida' : 'M. Picada'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      animal.tipo_campeonato === 'Exclusivamente Marcha'
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {animal.tipo_campeonato === 'Exclusivamente Marcha' ? 'Excl. Marcha' : 'Convencional'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold truncate">{animal.nome}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{animal.categoria}</p>
                </div>
                {animal.num_catalogo && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase">Catalogo</p>
                    <p className="text-2xl font-bold text-[var(--accent)] leading-none">{animal.num_catalogo}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-muted)]">
                <span className="font-mono">Reg. {animal.registro}</span>
                {animal.haras && <span className="text-[var(--accent)] truncate">{animal.haras}</span>}
                <span className="truncate">Pai: {animal.pai || '—'}</span>
                <span className="truncate">Mae: {animal.mae || '—'}</span>
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

      <Banner posicao="rodape" />

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
