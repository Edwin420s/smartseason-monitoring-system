import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { Sprout, Calendar, MapPin } from 'lucide-react'

export default function FieldCard({ field, onUpdateClick }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
          <p className="flex items-center text-sm text-gray-500 mt-1">
            <Sprout className="w-4 h-4 mr-1" />
            {field.cropType}
          </p>
        </div>
        <StatusBadge status={field.status} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Planted: {new Date(field.plantingDate).toLocaleDateString()}
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          Stage: {field.currentStage}
        </div>
        {field.agentName && (
          <p className="text-gray-500">Agent: {field.agentName}</p>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Link
          to={`/fields/${field.id}`}
          className="text-green-600 text-sm font-medium hover:underline"
        >
          View Details
        </Link>
        {onUpdateClick && (
          <button
            onClick={() => onUpdateClick(field.id)}
            className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100"
          >
            + Add Update
          </button>
        )}
      </div>
    </div>
  )
}