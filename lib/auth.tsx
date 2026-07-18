'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Usuario } from './supabase'

type AuthContextType = {
  user: Usuario | null
  loginDirect: (user: Usuario) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginDirect: () => {},
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

  function loginDirect(u: Usuario) {
    setUser(u)
    localStorage.setItem('nm_user', JSON.stringify(u))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('nm_user')
  }

  return (
    <AuthContext.Provider value={{ user, loginDirect, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
