import { useState, useEffect, createContext, useContext } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cl_token')
    if (!token) { setLoading(false); return }

    client.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('cl_token'))
      .finally(() => setLoading(false))
  }, [])

  const logout = () => {
    localStorage.removeItem('cl_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
