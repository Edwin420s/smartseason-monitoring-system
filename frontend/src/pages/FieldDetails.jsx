import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import UpdateForm from '../components/UpdateForm'
import { Calendar, MapPin, User, Sprout, ChevronLeft } from 'lucide-react'

export default function FieldDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [field, setField] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(false)

  const fetchField = async () => {
    try {
      const data = await apiService.getField(id)
      setField(data.data || data)
    } catch (error) {
      console.error('Failed to fetch field:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchField()
  }, [id])

  const handleUpdateSuccess = () => {
    setShowUpdateForm(false)
    fetchField()
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!field) return <div className="p-8">Field not found</div>

  const isAgentAssigned = user.role === 'AGENT' && field.assignedAgentId === user.id
  const canUpdate = user.role === 'ADMIN' || isAgentAssigned

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={user.role === 'ADMIN' ? '/admin' : '/agent'} className="inline-flex items-center text-green-600 mb-4 hover:underline">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
              <p className="flex items-center text-gray-500 mt-1">
                <Sprout className="w-4 h-4 mr-1" />
                {field.cropType}
              </p>
            </div>
            <StatusBadge status={field.status} />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Field Information</h3>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">Planting Date</dt>
                <dd className="text-sm text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {new Date(field.plantingDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">Current Stage</dt>
                <dd className="text-sm text-gray-900">{field.currentStage}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">Assigned Agent</dt>
                <dd className="text-sm text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  {field.agentName || 'Unassigned'}
                </dd>
              </div>
              {field.locationLat && (
                <div className="flex">
                  <dt className="w-32 text-sm text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {field.locationLat.toFixed(4)}, {field.locationLng.toFixed(4)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Updates Timeline</h3>
            {field.updates?.length === 0 ? (
              <p className="text-sm text-gray-500">No updates yet.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {field.updates?.map(update => (
                  <li key={update.id} className="border-l-2 border-green-200 pl-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{update.stage}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {update.notes && <p className="text-sm text-gray-600 mt-1">{update.notes}</p>}
                    <p className="text-xs text-gray-400 mt-1">by {update.updatedBy}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {canUpdate && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            {!showUpdateForm ? (
              <button
                onClick={() => setShowUpdateForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                + Log Update
              </button>
            ) : (
              <UpdateForm
                fieldId={field.id}
                userId={user.id}
                onSuccess={handleUpdateSuccess}
                onCancel={() => setShowUpdateForm(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}