'use client'

import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { SCHEDULE, getEventType, getMarchaType, isToday, isPast } from '@/lib/calendario'

export default function CalendarioPage() {
  const [filter, setFilter] = useState<'todos' | 'MB' | 'MP'>('todos')
  const [expandedDay, setExpandedDay] = useState<string | null>(() => {
    const today = SCHEDULE.find(s => isToday(s.date))
    return today?.date || null
  })

  const nextIdx = SCHEDULE.findIndex(s => !isPast(s.date))

  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-[var(--text-muted)] hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-base font-bold">Programacao de Julgamentos</h1>
              <p className="text-[10px] text-[var(--text-muted)]">18/07 a 01/08 · Parque da Gameleira - BH/MG</p>
            </div>
          </div>
          <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-0.5">
            {(['todos', 'MB', 'MP'] as const).map(m => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === m
                    ? m === 'MB' ? 'bg-blue-500 text-white' : m === 'MP' ? 'bg-orange-500 text-white' : 'bg-[var(--accent)] text-black'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {m === 'todos' ? 'Todos' : m === 'MB' ? 'M. Batida' : 'M. Picada'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-3 max-w-2xl mx-auto w-full space-y-2">
        {SCHEDULE.map((day, idx) => {
          const today = isToday(day.date)
          const past = isPast(day.date)
          const expanded = expandedDay === day.date
          const isNext = idx === nextIdx && !today

          const filteredEvents = filter === 'todos'
            ? day.events
            : day.events.filter(e => {
                const mt = getMarchaType(e)
                return mt === null || mt === filter
              })

          if (filteredEvents.length === 0) return null

          return (
            <div key={day.date} className={`rounded-xl border overflow-hidden transition-all ${
              today ? 'border-[var(--accent)] bg-[var(--accent)]/5' :
              isNext ? 'border-amber-500/50 bg-amber-500/5' :
              day.highlight ? 'border-amber-500/30' :
              past ? 'border-[var(--border)] opacity-60' :
              'border-[var(--border)]'
            }`}>
              <button
                onClick={() => setExpandedDay(expanded ? null : day.date)}
                className="w-full flex items-center gap-3 p-3 text-left bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                  today ? 'bg-[var(--accent)] text-black' :
                  isNext ? 'bg-amber-500 text-black' :
                  day.highlight ? 'bg-amber-500/20 text-amber-400' :
                  'bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                }`}>
                  <span className="text-lg font-bold leading-none">{day.date.split('/')[0]}</span>
                  <span className="text-[9px] font-medium uppercase leading-none mt-0.5">
                    {parseInt(day.date.split('/')[1]) === 8 ? 'AGO' : 'JUL'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{day.weekday}</p>
                    {today && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--accent)] text-black uppercase">Hoje</span>}
                    {isNext && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black uppercase">Proximo</span>}
                    {day.highlight && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">Finais</span>}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Inicio {day.time} · {filteredEvents.length} {filteredEvents.length === 1 ? 'prova' : 'provas'}
                  </p>
                </div>
                <svg className={`w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expanded && (
                <div className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
                  {filteredEvents.map((evt, i) => {
                    const type = getEventType(evt)
                    const mt = getMarchaType(evt)
                    return (
                      <div key={i} className="flex items-start gap-2.5 px-3 py-2 border-b border-[var(--border)] last:border-b-0">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          type === 'especial' ? 'bg-amber-400' :
                          type === 'morfologia' ? 'bg-emerald-400' :
                          type === 'marcha' ? 'bg-purple-400' :
                          type === 'progenie' ? 'bg-pink-400' :
                          'bg-blue-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs ${type === 'especial' ? 'font-bold text-amber-400' : ''}`}>{evt}</p>
                        </div>
                        {mt && (
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0 ${
                            mt === 'MB' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                          }`}>{mt}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        <div className="text-center py-4">
          <p className="text-[10px] text-[var(--text-muted)]">Programacao sujeita a mudancas sem aviso previo</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Transmissao ao vivo pelo YouTube da ABCCMM</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
