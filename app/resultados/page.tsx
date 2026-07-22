'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase, Campeonato } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

type ResultadoLinha = {
  tipo_prova: string
  num_catalogo: string
  nome_animal: string | null
  pontuacao: string | null
  colocacao: string | null
}

const PROVAS: { tipo: string; label: string }[] = [
  { tipo: 'marcha', label: 'Marcha' },
  { tipo: 'morfologia', label: 'Morfologia' },
  { tipo: 'funcional', label: 'Funcional' },
  { tipo: 'final', label: 'Categoria' },
]

function formatColocacao(colocacao: string | null): string {
  if (!colocacao) return '—'
  if (/^\d+$/.test(colocacao)) return `${colocacao}º`
  return colocacao
}

function ProvaTable({ linhas, idPorCatalogo }: { linhas: ResultadoLinha[]; idPorCatalogo: Record<string, number> }) {
  if (linhas.length === 0) {
    return <p className="text-xs text-[var(--text-muted)] py-2">Ainda nao julgado</p>
  }
  const ordenadas = [...linhas].sort((a, b) => {
    const an = parseInt(a.colocacao || '', 10)
    const bn = parseInt(b.colocacao || '', 10)
    if (!isNaN(an) && !isNaN(bn)) return an - bn
    if (!isNaN(an)) return -1
    if (!isNaN(bn)) return 1
    return 0
  })
  const colunas = 'grid grid-cols-[3rem_2.5rem_1fr_4rem] gap-2 items-center px-1'

  return (
    <div className="text-xs">
      <div className={`${colunas} text-[var(--text-muted)] border-b border-[var(--border)] py-1.5`}>
        <span>Coloc.</span>
        <span>Nº</span>
        <span>Animal</span>
        <span className="text-right">Pontos</span>
      </div>
      {ordenadas.map((l, i) => {
        const animalId = idPorCatalogo[l.num_catalogo]
        const conteudo = (
          <>
            <span className="font-semibold">{formatColocacao(l.colocacao)}</span>
            <span className="text-[var(--text-muted)]">{l.num_catalogo}</span>
            <span className="truncate">{l.nome_animal}</span>
            <span className="text-right text-[var(--text-muted)]">{l.pontuacao || '—'}</span>
          </>
        )
        return animalId ? (
          <Link key={i} href={`/animal/${animalId}`} className={`${colunas} py-1.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)]`}>
            {conteudo}
          </Link>
        ) : (
          <div key={i} className={`${colunas} py-1.5 border-b border-[var(--border)] last:border-0`}>{conteudo}</div>
        )
      })}
    </div>
  )
}

function CategoriaResultado({ campeonato }: { campeonato: Campeonato }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [porProva, setPorProva] = useState<Record<string, ResultadoLinha[]>>({})
  const [idPorCatalogo, setIdPorCatalogo] = useState<Record<string, number>>({})
  const [loaded, setLoaded] = useState(false)

  async function toggle() {
    const next = !expanded
    setExpanded(next)
    if (next && !loaded) {
      setLoading(true)
      const [resultadosRes, animaisRes] = await Promise.all([
        supabase
          .from('nm_resultados')
          .select('tipo_prova, num_catalogo, nome_animal, pontuacao, colocacao')
          .eq('tipo_campeonato', campeonato.tipo_campeonato)
          .eq('tipo_marcha', campeonato.tipo_marcha)
          .eq('categoria', campeonato.categoria),
        supabase
          .from('nm_animais')
          .select('id, num_catalogo')
          .eq('tipo_campeonato', campeonato.tipo_campeonato)
          .eq('tipo_marcha', campeonato.tipo_marcha)
          .eq('categoria', campeonato.categoria),
      ])

      const grupos: Record<string, ResultadoLinha[]> = {}
      for (const linha of resultadosRes.data || []) {
        if (!grupos[linha.tipo_prova]) grupos[linha.tipo_prova] = []
        grupos[linha.tipo_prova].push(linha)
      }
      setPorProva(grupos)

      const mapa: Record<string, number> = {}
      for (const a of animaisRes.data || []) {
        if (a.num_catalogo) mapa[a.num_catalogo] = a.id
      }
      setIdPorCatalogo(mapa)

      setLoaded(true)
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-2 p-3 text-left bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              campeonato.tipo_marcha === 'MB' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
            }`}>
              {campeonato.tipo_marcha}
            </span>
            <span className="text-sm font-medium truncate">{campeonato.categoria}</span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-primary)] p-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            PROVAS.map(p => (
              <div key={p.tipo}>
                <h4 className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wide mb-1">{p.label}</h4>
                <ProvaTable linhas={porProva[p.tipo] || []} idPorCatalogo={idPorCatalogo} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultadosPage() {
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [filterMarcha, setFilterMarcha] = useState<string>('Todas')
  const [loading, setLoading] = useState(true)
  const [ultimaSync, setUltimaSync] = useState<string | null>(null)

  const loadCampeonatos = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('nm_campeonatos').select('*').order('categoria', { ascending: true })
    if (filterMarcha !== 'Todas') query = query.eq('tipo_marcha', filterMarcha)
    const { data } = await query
    setCampeonatos(data ?? [])
    setLoading(false)
  }, [filterMarcha])

  useEffect(() => { loadCampeonatos() }, [loadCampeonatos])

  useEffect(() => {
    async function loadSync() {
      const { data } = await supabase.rpc('nm_get_resultados_sync')
      const status = Array.isArray(data) ? data[0] : data
      setUltimaSync(status?.ultima_sincronizacao || null)
    }
    loadSync()
  }, [])

  const grouped: Record<string, Campeonato[]> = {}
  for (const c of campeonatos) {
    const key = c.tipo_campeonato
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  }

  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/" className="text-[var(--text-muted)] hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-base font-bold">Resultados por Categoria</h1>
          </div>
          {ultimaSync && (
            <p className="text-[10px] text-[var(--text-muted)] mb-3 ml-8">
              Atualizado em {new Date(ultimaSync).toLocaleString('pt-BR')}
            </p>
          )}
          <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-0.5">
            {['Todas', 'MB', 'MP'].map(m => (
              <button
                key={m}
                onClick={() => setFilterMarcha(m)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterMarcha === m
                    ? m === 'MB' ? 'bg-blue-500 text-white' : m === 'MP' ? 'bg-orange-500 text-white' : 'bg-[var(--accent)] text-black'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {m === 'Todas' ? 'Todas' : m === 'MB' ? 'Marcha Batida' : 'Marcha Picada'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          Object.entries(grouped).map(([tipo, items]) => (
            <div key={tipo}>
              <h2 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-2 px-1">{tipo}</h2>
              <div className="space-y-2">
                {items.map(c => <CategoriaResultado key={c.id} campeonato={c} />)}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  )
}
