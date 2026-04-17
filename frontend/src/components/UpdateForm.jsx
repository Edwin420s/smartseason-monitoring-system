import { useState } from 'react'
import { Camera, MapPin, Loader2, X } from 'lucide-react'
import { mockApi } from '../services/mockApi'

export default function UpdateForm({ fieldId, userId, onSuccess, onCancel }) {
  const [stage, setStage] = useState('GROWING')
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState(null)
  const [location, setLocation] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const captureLocation = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLocating(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not fetch location. Please check permissions.')
          setIsLocating(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
      setIsLocating(false)
    }
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real app, we'd upload the image to Cloudinary/S3.
    // For mock, we just store a placeholder URL.
    const imageUrl = image ? URL.createObjectURL(image) : null

    try {
      await mockApi.addUpdate(fieldId, {
        updatedById: userId,
        stage,
        notes,
        latitude: location?.lat,
        longitude: location?.lng,
        imageUrl
      })
      onSuccess()
    } catch (error) {
      console.error('Submission failed', error)
      alert('Failed to submit update')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Log Field Update</h2>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="PLANTED">Planted</option>
            <option value="GROWING">Growing</option>
            <option value="READY">Ready</option>
            <option value="HARVESTED">Harvested</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="e.g., Leaves looking yellow, requires fertilizer..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Visual Evidence</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {image ? image.name : 'Click to take photo or upload'}
                </p>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={captureLocation}
            className={`flex items-center justify-center w-full p-2.5 border rounded-lg text-sm font-medium transition-colors ${
              location ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
            {location ? `Location Captured: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Tap to Capture GPS Location'}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 text-white bg-green-600 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Update'}
        </button>
      </form>
    </div>
  )
}