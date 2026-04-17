import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import { Plus } from 'lucide-react'

export default function Fields() {
  const { user } = useAuth()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await apiService.getFields(user.id, 'ADMIN')
        setFields(data.data || data)
      } catch (error) {
        console.error('Failed to fetch fields:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFields()
  }, [user.id])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Fields</h1>
        <Link
          to="/fields/create"
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Field
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.map(field => (
              <tr key={field.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.cropType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.currentStage}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={field.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.agentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link to={`/fields/${field.id}`} className="text-green-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}