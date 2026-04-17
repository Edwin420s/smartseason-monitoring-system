import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sprout, LayoutDashboard, Map, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user?.role === 'ADMIN' ? '/admin' : '/agent'} className="flex items-center">
              <Sprout className="w-6 h-6 text-green-600 mr-2" />
              <span className="text-xl font-bold text-gradient">SmartSeason</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              <Link
                to={user?.role === 'ADMIN' ? '/admin' : '/agent'}
                className="btn-ghost flex items-center"
              >
                <LayoutDashboard className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/fields"
                  className="btn-ghost flex items-center"
                >
                  <Map className="w-4 h-4 mr-1" />
                  All Fields
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="btn-ghost flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}