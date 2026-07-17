'use client'

import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

type DaySchedule = {
  date: string
  weekday: string
  time: string
  highlight?: boolean
  events: string[]
}

const SCHEDULE: DaySchedule[] = [
  {
    date: '18/07', weekday: 'Sabado', time: '7h30', events: [
      'Saudacao aos Expositores, Criadores e Apresentadores',
      'Progenie de Mae (MB)', 'Progenie de Mae (MP)',
      'Progenie de Pai Jovem (MB)', 'Progenie de Pai Jovem (MP)',
      'Progenie de Pai Senior (MB)', 'Progenie de Pai Senior (MP)',
      'Morfologia Cavalo Junior (MB)',
      'Campeonato de Marcha Castrado Junior (MP)',
      'Morfologia Cavalo Junior (MP)',
      'Campeonato de Marcha Castrado Jovem (MP)',
      'Campeonato de Marcha Cavalo Castrado (MP)',
      'Campeonato de Marcha Castrado Junior (MB)',
      'Campeonato de Marcha Castrado Jovem (MB)',
    ]
  },
  {
    date: '19/07', weekday: 'Domingo', time: '7h30', events: [
      'Campeonato Potro Mirim (MB)', 'Campeonato Potro Mirim (MP)',
      'Campeonato Potro Mirim Maior (MB)', 'Campeonato Potro Mirim Maior (MP)',
      'Morfologia Cavalo Junior Maior (MB)',
      'Campeonato de Marcha Castrado Adulto (MP)',
      'Morfologia Cavalo Junior Maior (MP)',
      'Campeonato de Marcha Castrado Senior (MP)',
      'Morfologia Cavalo Jovem (MB)',
      'Campeonato de Marcha Castrado Graduado (MP)',
      'Morfologia Cavalo Jovem (MP)',
      'Campeonato de Marcha Cavalo Castrado (MB)',
      'Campeonato de Marcha Castrado Adulto (MB)',
      'Campeonato de Marcha Castrado Senior (MB)',
      'Campeonato de Marcha Castrado Graduado (MB)',
    ]
  },
  {
    date: '20/07', weekday: 'Segunda', time: '7h30', events: [
      'Campeonato Potro Jovem (MB)', 'Campeonato Potro Jovem (MP)',
      'Campeonato Potro Jovem Maior (MB)', 'Campeonato Potro Jovem Maior (MP)',
      'Morfologia Cavalo Jovem Maior (MB)',
      'Campeonato de Marcha Cavalo Junior (MP)',
      'Morfologia Cavalo Jovem Maior (MP)',
      'Morfologia Cavalo (MB)',
      'Campeonato de Marcha Cavalo Junior Maior (MP)',
      'Morfologia Cavalo (MP)',
      'Campeonato de Marcha Castrado Master (MB)',
      'Campeonato de Marcha Cavalo Junior (MB)',
      'Campeonato de Marcha Cavalo Junior Maior (MB)',
    ]
  },
  {
    date: '21/07', weekday: 'Terca', time: '7h30', events: [
      'Campeonato Potro (MB)', 'Campeonato Potro (MP)',
      'Campeonato Potro Maior (MB)', 'Campeonato Potro Maior (MP)',
      'Morfologia Cavalo Maior (MB)',
      'Campeonato de Marcha Cavalo Jovem (MP)',
      'Morfologia Cavalo Maior (MP)',
      'Morfologia Cavalo Adulto (MB)',
      'Campeonato de Marcha Cavalo Jovem Maior (MP)',
      'Morfologia Cavalo Adulto (MP)',
      'Campeonato de Marcha Cavalo Jovem (MB)',
      'Campeonato de Marcha Cavalo Jovem Maior (MB)',
      'Campeonato de Marcha Cavalo (MB)',
    ]
  },
  {
    date: '22/07', weekday: 'Quarta', time: '7h30', events: [
      'Campeonato Potro Junior (MB)', 'Campeonato Potro Junior (MP)',
      'Campeonato Potro Junior Maior (MB)',
      'Campeonato Potra Mirim (MP)',
      'Morfologia Cavalo Adulto Maior (MB)',
      'Campeonato de Marcha Cavalo (MP)',
      'Morfologia Cavalo Adulto Maior (MP)',
      'Morfologia Cavalo Senior (MB)',
      'Campeonato de Marcha Cavalo Maior (MP)',
      'Morfologia Cavalo Senior (MP)',
      'Campeonato de Marcha Cavalo Maior (MB)',
      'Campeonato de Marcha Cavalo Adulto (MB)',
      'Campeonato de Marcha Cavalo Adulto Maior (MB)',
    ]
  },
  {
    date: '23/07', weekday: 'Quinta', time: '7h30', events: [
      'Campeonato Potro Graduado (MB)',
      'Campeonato Potra Mirim Maior (MP)',
      'Campeonato Potro Graduado Maior (MB)',
      'Campeonato Potra Jovem (MP)',
      'Morfologia Cavalo Senior Maior (MB)',
      'Campeonato de Marcha Cavalo Adulto (MP)',
      'Morfologia Cavalo Senior Maior (MP)',
      'Morfologia Cavalo Graduado (MB)',
      'Campeonato de Marcha Cavalo Adulto Maior (MP)',
      'Morfologia Egua Junior (MP)',
      'Campeonato de Marcha Cavalo Senior (MB)',
      '19h30 - Premiacao Etapa Nacional do Caminhos do Marchador 2025/2026',
      'Campeonato de Marcha Cavalo Senior Maior (MB)',
    ]
  },
  {
    date: '24/07', weekday: 'Sexta', time: '7h30', events: [
      'Campeonato Potra Mirim (MB)',
      'Campeonato Potra Jovem Maior (MP)',
      'Campeonato Potra Mirim Maior (MB)',
      'Campeonato Potra (MP)',
      'Morfologia Cavalo Graduado Maior (MB)',
      'Campeonato de Marcha Cavalo Senior (MP)',
      'Morfologia Egua Junior Maior (MP)',
      'Morfologia Cavalo Master (MB)',
      'Campeonato de Marcha Cavalo Senior Maior (MP)',
      'Morfologia Egua Jovem (MP)',
      'Campeonato de Marcha Cavalo Graduado (MB)',
      'Campeonato de Marcha Cavalo Graduado Maior (MB)',
      'Campeonato de Marcha Cavalo Master (MB)',
    ]
  },
  {
    date: '25/07', weekday: 'Sabado', time: '7h30', events: [
      'Campeonato Potra Jovem (MB)',
      'Campeonato Potra Maior (MP)',
      'Campeonato Potra Jovem Maior (MB)',
      'Campeonato Potra Junior (MP)',
      'Morfologia Cavalo Master Maior (MB)',
      'Campeonato de Marcha Egua Junior (MP)',
      'Morfologia Egua Jovem Maior (MP)',
      'Morfologia Egua Junior (MB)',
      'Campeonato de Marcha Egua Junior Maior (MP)',
      'Morfologia Egua (MP)',
      '17h - Solenidade Oficial',
      'Campeonato de Marcha Cavalo Master Maior (MB)',
      'Campeonato de Marcha Egua Junior (MB)',
    ]
  },
  {
    date: '26/07', weekday: 'Domingo', time: '7h30', events: [
      'Campeonato Potra (MB)',
      'Campeonato Potra Junior Maior (MP)',
      'Campeonato Potra Maior (MB)',
      'Campeonato Potra Graduada (MP)',
      'Morfologia Egua Junior Maior (MB)',
      'Campeonato de Marcha Egua Jovem (MP)',
      'Morfologia Egua Maior (MP)',
      'Morfologia Egua Jovem (MB)',
      'Campeonato de Marcha Egua Jovem Maior (MP)',
      'Morfologia Egua Adulta (MP)',
      'Morfologia Egua Jovem Maior (MB)',
      'Campeonato de Marcha Egua Junior Maior (MB)',
      'Campeonato de Marcha Egua Jovem (MB)',
      'Campeonato de Marcha Egua Jovem Maior (MB)',
    ]
  },
  {
    date: '27/07', weekday: 'Segunda', time: '7h30', events: [
      'Campeonato Potra Junior (MB)',
      'Campeonato Potra Graduada Maior (MP)',
      'Campeonato Potra Junior Maior (MB)',
      'Morfologia Egua (MB)',
      'Morfologia Egua Adulta Maior (MP)',
      'Morfologia Egua Maior (MB)',
      'Campeonato de Marcha Egua (MP)',
      'Morfologia Egua Senior (MP)',
      'Morfologia Egua Adulta (MB)',
      'Campeonato de Marcha Egua Maior (MP)',
      'Campeonato de Marcha Egua (MB)',
      'Campeonato de Marcha Egua Maior (MB)',
    ]
  },
  {
    date: '28/07', weekday: 'Terca', time: '7h30', events: [
      'Campeonato Potra Graduada (MB)',
      'Morfologia Egua Senior Maior (MP)',
      'Campeonato Potra Graduada Maior (MB)',
      'Morfologia Egua Graduada (MP)',
      'Morfologia Egua Adulta Maior (MB)',
      'Campeonato de Marcha Egua Adulta Maior (MP)',
      'Morfologia Egua Graduada Maior (MP)',
      'Morfologia Egua Senior (MB)',
      'Campeonato de Marcha Egua Adulta (MP)',
      'Morfologia Egua Senior Maior (MB)',
      'Campeonato de Marcha Egua Adulta (MB)',
      'Campeonato de Marcha Egua Adulta Maior (MB)',
      'Campeonato de Marcha Egua Senior (MB)',
    ]
  },
  {
    date: '29/07', weekday: 'Quarta', time: '7h30', events: [
      'Campeonato Potra Master (MB)',
      'Campeonato Potra Master Maior (MB)',
      'Morfologia Egua Graduada (MB)',
      'Campeonato de Marcha Egua Senior (MP)',
      'Morfologia Egua Master (MP)',
      'Morfologia Egua Graduada Maior (MB)',
      'Campeonato de Marcha Egua Senior Maior (MP)',
      'Morfologia Egua Master Maior (MP)',
      'Campeonato de Marcha Egua Graduada (MP)',
      'Campeonato de Marcha Egua Senior Maior (MB)',
      'Campeonato de Marcha Egua Graduada (MB)',
    ]
  },
  {
    date: '30/07', weekday: 'Quinta', time: '7h30', events: [
      'Campeonato de Marcha Egua Graduada Maior (MP)',
      'Morfologia Egua Master (MB)',
      'Campeonato de Marcha Egua Master (MP)',
      'Morfologia Egua Master Maior (MB)',
      'Campeonato de Marcha Egua Master Maior (MP)',
      'Campeonato de Marcha Egua Graduada Maior (MB)',
      'Campeonato de Marcha Egua Master (MB)',
      'Campeonato de Marcha Egua Master Maior (MB)',
    ]
  },
  {
    date: '31/07', weekday: 'Sexta', time: '8h', highlight: true, events: [
      'Grande Campeonato Jovem da Raca Machos (MB)',
      'Grande Campeonato Jovem da Raca Machos (MP)',
      'Grande Campeonato Jovem da Raca Femeas (MB)',
      'Grande Campeonato Jovem da Raca Femeas (MP)',
      'Provas Sociais',
    ]
  },
  {
    date: '01/08', weekday: 'Sabado', time: '8h', highlight: true, events: [
      'Morfologia dos Grandes Campeonatos Adultos da Raca',
      'Campeao dos Campeoes Castrado (MP)',
      'Campeao dos Campeoes Castrado (MB)',
      'Campeao dos Campeoes (MP)',
      'Campeao dos Campeoes (MB)',
      'Campea das Campeas (MP)',
      'Campea das Campeas (MB)',
      'Encerramento e Premiacao Final',
    ]
  },
]

function getEventType(evt: string): 'morfologia' | 'marcha' | 'campeonato' | 'especial' | 'progenie' {
  if (evt.match(/^\d+h|Saudacao|Solenidade|Premiacao|Encerramento|Provas Sociais/)) return 'especial'
  if (evt.startsWith('Progenie')) return 'progenie'
  if (evt.startsWith('Morfologia')) return 'morfologia'
  if (evt.includes('Campeonato de Marcha') || evt.includes('Campeao') || evt.includes('Campea') || evt.includes('Grande Campeonato')) return 'marcha'
  return 'campeonato'
}

function getMarchaType(evt: string): 'MB' | 'MP' | null {
  if (evt.endsWith('(MB)')) return 'MB'
  if (evt.endsWith('(MP)')) return 'MP'
  return null
}

function isToday(dateStr: string): boolean {
  const now = new Date()
  const [day, month] = dateStr.split('/')
  const year = month === '08' ? 2026 : 2026
  return now.getDate() === parseInt(day) && (now.getMonth() + 1) === parseInt(month) && now.getFullYear() === year
}

function isPast(dateStr: string): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const [day, month] = dateStr.split('/')
  const year = parseInt(month) >= 7 ? 2026 : 2026
  const eventDate = new Date(year, parseInt(month) - 1, parseInt(day))
  return eventDate < now
}

export default function CalendarioPage() {
  const [filter, setFilter] = useState<'todos' | 'MB' | 'MP'>('todos')
  const [expandedDay, setExpandedDay] = useState<string | null>(() => {
    const today = SCHEDULE.find(s => isToday(s.date))
    return today?.date || null
  })

  const todayIdx = SCHEDULE.findIndex(s => isToday(s.date))
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
