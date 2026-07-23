'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('nm_cookie_consent')
    if (!consent) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem('nm_cookie_consent', 'accepted')
    const sid = localStorage.getItem('nm_session_id') || crypto.randomUUID()
    localStorage.setItem('nm_session_id', sid)
    setShow(false)
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'cookie_consent', session_id: sid }),
    })
  }

  function decline() {
    localStorage.setItem('nm_cookie_consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-16 left-4 right-4 z-[100] max-w-lg mx-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 shadow-2xl">
      <p className="text-sm mb-3">
        Usamos cookies para melhorar sua experiencia e gerar estatisticas de acesso.
        Ao continuar, voce concorda com nossa politica de privacidade.
      </p>
      <div className="flex gap-2">
        <button onClick={accept} className="flex-1 py-2 bg-[var(--accent)] text-white font-semibold rounded-lg text-sm">
          Aceitar
        </button>
        <button onClick={decline} className="flex-1 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-sm">
          Recusar
        </button>
      </div>
    </div>
  )
}
