import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import FieldCard from '../components/FieldCard'
import UpdateForm from '../components/UpdateForm'
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AgentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalAssigned: 0, active: 0, atRisk: 0, completed: 0 })
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(null)

  const fetchData = async () => {
    try {
      const [statsData, fieldsData] = await Promise.all([
        apiService.getAgentStats(user.id),
        apiService.getFields(user.id, 'AGENT')
      ])
      setStats(statsData.summary || statsData)
      setFields(fieldsData.data || fieldsData)
    } catch (error) {
      console.error('Failed to fetch agent data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user.id])

  const handleUpdateSuccess = () => {
    setShowUpdateForm(null)
    fetchData() // Refresh data
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gradient mb-6">My Assigned Fields</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAssigned}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">At Risk / Completed</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.atRisk} / {stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {showUpdateForm && (
        <div className="mb-6">
          <UpdateForm
            fieldId={showUpdateForm}
            userId={user.id}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setShowUpdateForm(null)}
          />
        </div>
      )}

      {fields.length === 0 ? (
        <p className="text-gray-500">You have no assigned fields.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => (
            <FieldCard
              key={field.id}
              field={field}
              onUpdateClick={() => setShowUpdateForm(field.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}