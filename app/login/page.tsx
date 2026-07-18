'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { user, loginDirect, logout, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<'dados' | 'codigo'>('dados')
  const [mode, setMode] = useState<'email' | 'telefone'>('telefone')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [codigo, setCodigo] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const destino = mode === 'email' ? email.trim() : telefone.trim()

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nome.trim()) { setError('Digite seu nome'); return }
    if (mode === 'email' && !email.trim()) { setError('Digite seu email'); return }
    if (mode === 'telefone' && !telefone.trim()) { setError('Digite seu telefone'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: mode, destino, nome: nome.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar codigo')
      } else {
        setStep('codigo')
        setCodigo(['', '', '', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    } catch {
      setError('Erro de conexao')
    }
    setSubmitting(false)
  }

  async function handleVerify() {
    const code = codigo.join('')
    if (code.length !== 6) { setError('Digite o codigo completo'); return }

    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destino, codigo: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Codigo invalido')
      } else if (data.user) {
        loginDirect(data.user)
        router.push('/')
      }
    } catch {
      setError('Erro de conexao')
    }
    setSubmitting(false)
  }

  function handleCodeInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...codigo]
    newCode[index] = value.slice(-1)
    setCodigo(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (index === 5 && value) {
      const full = [...newCode].join('')
      if (full.length === 6) {
        setTimeout(() => handleVerify(), 100)
      }
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCodigo(pasted.split(''))
      inputRefs.current[5]?.focus()
      setTimeout(() => {
        handleVerify()
      }, 100)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (user) return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-[var(--text-muted)] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-base font-bold">Minha Conta</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-black text-2xl font-bold mb-4">
          {user.nome.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-lg font-bold mb-1">{user.nome}</h2>
        <p className="text-sm text-[var(--text-muted)] mb-1">{user.email || user.telefone}</p>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-medium mb-6">Verificado</span>
        <button
          onClick={() => { logout(); router.push('/') }}
          className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium"
        >
          Sair
        </button>
      </div>
    </main>
  )

  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {step === 'codigo' ? (
            <button onClick={() => setStep('dados')} className="text-[var(--text-muted)] hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          ) : (
            <Link href="/" className="text-[var(--text-muted)] hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
          )}
          <h1 className="text-base font-bold">{step === 'dados' ? 'Entrar' : 'Verificacao'}</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {step === 'dados' ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-lg bg-[var(--accent)] flex items-center justify-center text-black font-bold text-xl mx-auto mb-3">
                  MM
                </div>
                <h2 className="text-lg font-bold">43a Nacional</h2>
                <p className="text-xs text-[var(--text-muted)]">Entre para votar nos seus favoritos</p>
              </div>

              <div className="flex gap-1 bg-[var(--bg-card)] rounded-lg p-0.5 mb-4">
                <button
                  onClick={() => setMode('telefone')}
                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                    mode === 'telefone' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setMode('email')}
                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                    mode === 'email' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Email
                </button>
              </div>

              <form onSubmit={handleSendCode} className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
                {mode === 'telefone' ? (
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full py-2.5 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                ) : (
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full py-2.5 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                )}
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[var(--accent)] text-black font-semibold rounded-lg text-sm disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : mode === 'telefone' ? 'Enviar codigo por WhatsApp' : 'Enviar codigo por Email'}
                </button>
              </form>

              <p className="text-[10px] text-[var(--text-muted)] text-center mt-4">
                Voce pode navegar sem login. O cadastro e necessario apenas para votar.
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Digite o codigo</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Enviamos um codigo de 6 digitos para
                </p>
                <p className="text-sm font-medium text-[var(--accent)] mt-0.5">{destino}</p>
              </div>

              <div className="flex gap-2 justify-center mb-4" onPaste={handleCodePaste}>
                {codigo.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeInput(i, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    className="w-11 h-13 text-center text-xl font-bold bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                ))}
              </div>

              {error && <p className="text-xs text-red-400 text-center mb-3">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={submitting || codigo.join('').length !== 6}
                className="w-full py-2.5 bg-[var(--accent)] text-black font-semibold rounded-lg text-sm disabled:opacity-50"
              >
                {submitting ? 'Verificando...' : 'Verificar'}
              </button>

              <button
                onClick={handleSendCode}
                disabled={submitting}
                className="w-full py-2 text-[var(--text-muted)] text-xs mt-3 hover:text-white transition-colors"
              >
                Reenviar codigo
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
