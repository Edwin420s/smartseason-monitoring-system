import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AgentDashboard from './pages/AgentDashboard'
import Fields from './pages/Fields'
import FieldDetails from './pages/FieldDetails'
import CreateField from './pages/CreateField'
import Navbar from './components/Navbar'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/agent'} replace />
  }
  return children
}

function AppContent() {
  const { user } = useAuth()
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/agent" element={
          <ProtectedRoute allowedRoles={['AGENT']}>
            <AgentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/fields" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Fields />
          </ProtectedRoute>
        } />
        <Route path="/fields/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT']}>
            <FieldDetails />
          </ProtectedRoute>
        } />
        <Route path="/fields/create" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CreateField />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to={user?.role === 'ADMIN' ? '/admin' : '/agent'} replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}