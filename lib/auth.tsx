'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, Usuario } from './supabase'

type AuthContextType = {
  user: Usuario | null
  login: (nome: string, email?: string, telefone?: string) => Promise<string | null>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => null,
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('nm_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  async function login(nome: string, email?: string, telefone?: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('nm_user_login', {
      p_nome: nome,
      p_email: email || null,
      p_telefone: telefone || null,
    })
    if (error) return error.message
    if (data?.error) return data.error
    const u: Usuario = data
    setUser(u)
    localStorage.setItem('nm_user', JSON.stringify(u))
    return null
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('nm_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
