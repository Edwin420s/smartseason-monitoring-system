import { createContext, useContext, useState, useEffect } from 'react'
import { apiService, getCurrentUser, isAuthenticated } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we have a token and user in localStorage
    if (isAuthenticated()) {
      const storedUser = getCurrentUser()
      if (storedUser) {
        setUser(storedUser)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const result = await apiService.login(email, password)
      if (result.success) {
        setUser(result.user)
        return { success: true, user: result.user }
      }
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const logout = () => {
    apiService.logout()
    setUser(null)
  }

  const value = { user, login, logout, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)