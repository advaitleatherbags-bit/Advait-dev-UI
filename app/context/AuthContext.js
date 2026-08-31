'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token')
      // Clear profile data saved by earlier versions of the application.
      localStorage.removeItem('user')

      if (!storedToken) {
        setToken(null)
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setToken(storedToken)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          localStorage.removeItem('expiresAt')
          setToken(null)
          setUser(null)
          return
        }

        if (!response.ok) {
          throw new Error('Unable to restore session')
        }

        setUser(await response.json())
      } catch {
        // Keep the token for a later retry when Auth/me is temporarily unavailable.
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
    window.addEventListener('advit:auth-updated', restoreSession)
    return () => window.removeEventListener('advit:auth-updated', restoreSession)
  }, [])

  const login = (authToken) => {
    localStorage.setItem('token', authToken)
    window.dispatchEvent(new Event('advit:auth-updated'))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('expiresAt')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
