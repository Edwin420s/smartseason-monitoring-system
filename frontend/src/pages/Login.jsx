import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sprout } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate(result.user.role === 'ADMIN' ? '/admin' : '/agent')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-farm">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-center mb-6">
          <Sprout className="w-10 h-10 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gradient">SmartSeason</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">Sign in to your account</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@shamba.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Demo Credentials:</p>
          <p>Admin: admin@shamba.com / admin123</p>
          <p>Agent: john@shamba.com / agent123</p>
        </div>
      </div>
    </div>
  )
}