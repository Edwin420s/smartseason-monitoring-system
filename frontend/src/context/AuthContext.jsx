import { createContext, useContext, useState, useEffect } from 'react'
import { mockApi } from '../services/mockApi'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('smartseason_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const foundUser = await mockApi.login(email, password)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('smartseason_user', JSON.stringify(foundUser))
      return { success: true, user: foundUser }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartseason_user')
  }

  const value = { user, login, logout, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)