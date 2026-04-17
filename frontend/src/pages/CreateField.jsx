import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import { MapPin } from 'lucide-react'

export default function CreateField() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    cropType: '',
    plantingDate: '',
    assignedAgentId: '',
    locationLat: '',
    locationLng: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await apiService.getAgents()
        setAgents(data.data || data)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
      }
    }
    fetchAgents()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const captureLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            locationLat: position.coords.latitude,
            locationLng: position.coords.longitude
          })
        },
        (error) => console.error('Error getting location:', error)
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiService.createField({
        ...formData,
        currentStage: 'PLANTED'
      })
      navigate('/fields')
    } catch (error) {
      console.error('Failed to create field', error)
      alert(error.response?.data?.error || 'Failed to create field')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gradient mb-6">Create New Field</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slide-up">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
          <input
            type="text"
            name="cropType"
            value={formData.cropType}
            onChange={handleChange}
            placeholder="e.g., Maize, Beans, Wheat"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
          <input
            type="date"
            name="plantingDate"
            value={formData.plantingDate}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agent</label>
          <select
            name="assignedAgentId"
            value={formData.assignedAgentId}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            required
          >
            <option value="">Select an agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Location (Optional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="locationLat"
              placeholder="Latitude"
              value={formData.locationLat}
              onChange={handleChange}
              className="flex-1 p-2.5 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="locationLng"
              placeholder="Longitude"
              value={formData.locationLng}
              onChange={handleChange}
              className="flex-1 p-2.5 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={captureLocation}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/fields')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
          >
            {loading ? 'Creating...' : 'Create Field'}
          </button>
        </div>
      </form>
    </div>
  )
}