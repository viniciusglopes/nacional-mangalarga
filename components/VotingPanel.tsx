'use client'

import { useState, useEffect } from 'react'
import { supabase, Animal, RankingAnimal } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

const POSICAO_LABELS = ['Campeao', 'Reservado', '1o Premio']
const POSICAO_ICONS = ['🥇', '🥈', '🥉']

type MeusVotos = { modalidade: string; posicao: number; animal_id: number; animal_nome: string }[]

export default function VotingPanel({ campeonato, tipoCampeonato }: { campeonato: string; tipoCampeonato: string }) {
  const { user } = useAuth()
  const [tab, setTab] = useState<'marcha' | 'categoria'>('marcha')
  const [ranking, setRanking] = useState<RankingAnimal[]>([])
  const [meusVotos, setMeusVotos] = useState<MeusVotos>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [voting, setVoting] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const [loadingAnimals, setLoadingAnimals] = useState(false)

  useEffect(() => {
    loadRanking()
    if (user) loadMeusVotos()
  }, [tab, campeonato, user])

  async function loadRanking() {
    const { data } = await supabase.rpc('nm_ranking', { p_campeonato: campeonato, p_modalidade: tab })
    setRanking(data || [])
  }

  async function loadMeusVotos() {
    if (!user) return
    const { data } = await supabase.rpc('nm_meus_votos', { p_usuario_id: user.id, p_campeonato: campeonato })
    setMeusVotos(data || [])
  }

  async function openVoting(posicao: number) {
    setVoting(posicao)
    setSearch('')
    setLoadingAnimals(true)

    let query = supabase
      .from('nm_animais')
      .select('*')
      .eq('campeonato', campeonato)
      .order('nome')

    if (tab === 'categoria') {
      query = query.neq('tipo_campeonato', 'Exclusivamente Marcha')
    }

    const { data } = await query
    setAnimals(data || [])
    setLoadingAnimals(false)
  }

  async function votar(animalId: number) {
    if (!user || voting === null) return
    setMsg('')
    const { data } = await supabase.rpc('nm_votar', {
      p_usuario_id: user.id,
      p_animal_id: animalId,
      p_campeonato: campeonato,
      p_modalidade: tab,
      p_posicao: voting,
    })
    if (data?.error) {
      setMsg(data.error)
      return
    }
    setVoting(null)
    loadRanking()
    loadMeusVotos()
  }

  const filteredAnimals = animals.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  )

  const myVotesForTab = meusVotos.filter(v => v.modalidade === tab)

  const isExclMarchaOnly = tipoCampeonato === 'Exclusivamente Marcha'

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="flex border-b border-[var(--border)]">
        <button
          onClick={() => setTab('marcha')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
            tab === 'marcha' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'
          }`}
        >
          Votacao Marcha
        </button>
        {!isExclMarchaOnly && (
          <button
            onClick={() => setTab('categoria')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              tab === 'categoria' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'
            }`}
          >
            Votacao Categoria
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Ranking */}
        {ranking.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[10px] text-[var(--accent)] uppercase tracking-wide font-semibold mb-2">Ranking</h4>
            <div className="space-y-1.5">
              {ranking.slice(0, 3).map((r, i) => (
                <div key={r.id} className="flex items-center gap-2 bg-[var(--bg-primary)] rounded-lg p-2">
                  <span className="text-lg">{POSICAO_ICONS[i]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{r.nome}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{r.total_votos} votos · {r.pontos} pts</p>
                  </div>
                  {r.num_catalogo && (
                    <span className="text-sm font-bold text-[var(--accent)]">#{r.num_catalogo}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User's votes or login prompt */}
        {!user ? (
          <div className="text-center py-3">
            <p className="text-xs text-[var(--text-muted)] mb-2">Faca login para votar nos seus favoritos</p>
            <a href="/login" className="inline-block px-4 py-2 bg-[var(--accent)] text-black text-xs font-semibold rounded-lg">
              Entrar
            </a>
          </div>
        ) : (
          <div>
            <h4 className="text-[10px] text-[var(--accent)] uppercase tracking-wide font-semibold mb-2">Seus votos</h4>
            <div className="space-y-1.5">
              {[1, 2, 3].map(pos => {
                const voto = myVotesForTab.find(v => v.posicao === pos)
                return (
                  <button
                    key={pos}
                    onClick={() => openVoting(pos)}
                    className="w-full flex items-center gap-2 bg-[var(--bg-primary)] rounded-lg p-2.5 text-left hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <span className="text-lg">{POSICAO_ICONS[pos - 1]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase">{POSICAO_LABELS[pos - 1]}</p>
                      {voto ? (
                        <p className="text-xs font-semibold truncate">{voto.animal_nome}</p>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] italic">Toque para escolher</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {msg && <p className="text-xs text-red-400 mt-2 text-center">{msg}</p>}
      </div>

      {/* Animal selection modal */}
      {voting !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
          <div className="bg-[var(--bg-primary)] flex-1 flex flex-col max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <button onClick={() => setVoting(null)} className="text-[var(--text-muted)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div>
                <p className="text-sm font-bold">Escolher {POSICAO_LABELS[voting - 1]}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{tab === 'marcha' ? 'Votacao Marcha' : 'Votacao Categoria'}</p>
              </div>
            </div>
            <div className="px-4 py-2 border-b border-[var(--border)]">
              <input
                type="text"
                placeholder="Buscar animal..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full py-2 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {loadingAnimals ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredAnimals.map(a => (
                    <button
                      key={a.id}
                      onClick={() => votar(a.id)}
                      className="w-full flex items-center gap-3 bg-[var(--bg-card)] rounded-lg p-3 text-left hover:border-[var(--accent)]/30 border border-[var(--border)] transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            a.tipo_marcha === 'MB' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {a.tipo_marcha === 'MB' ? 'M. Batida' : 'M. Picada'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold truncate">{a.nome}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{a.haras || ''} · Reg. {a.registro}</p>
                      </div>
                      {a.num_catalogo && (
                        <span className="text-lg font-bold text-[var(--accent)]">#{a.num_catalogo}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
