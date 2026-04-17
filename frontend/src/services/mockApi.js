// Mock database in localStorage
const STORAGE_KEYS = {
  USERS: 'smartseason_users',
  FIELDS: 'smartseason_fields',
  UPDATES: 'smartseason_updates'
}

// Seed initial data
const seedDatabase = () => {
  // Users
  const users = [
    { id: '1', name: 'Admin User', email: 'admin@shamba.com', password: 'admin123', role: 'ADMIN' },
    { id: '2', name: 'John Agent', email: 'john@shamba.com', password: 'agent123', role: 'AGENT' },
    { id: '3', name: 'Mary Agent', email: 'mary@shamba.com', password: 'agent123', role: 'AGENT' }
  ]
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

  // Fields
  const fields = [
    {
      id: 'f1',
      name: 'Nairobi Plot A',
      cropType: 'Maize',
      plantingDate: '2026-03-01',
      currentStage: 'GROWING',
      assignedAgentId: '2',
      createdById: '1',
      locationLat: -1.2921,
      locationLng: 36.8219,
      createdAt: new Date().toISOString()
    },
    {
      id: 'f2',
      name: 'Kiambu Plot B',
      cropType: 'Beans',
      plantingDate: '2026-02-15',
      currentStage: 'READY',
      assignedAgentId: '3',
      createdById: '1',
      locationLat: -1.1821,
      locationLng: 36.9219,
      createdAt: new Date().toISOString()
    }
  ]
  localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(fields))

  // Updates
  const updates = [
    {
      id: 'u1',
      fieldId: 'f1',
      updatedById: '2',
      stage: 'PLANTED',
      notes: 'Initial planting completed',
      imageUrl: null,
      latitude: -1.2921,
      longitude: 36.8219,
      createdAt: '2026-03-01T10:00:00.000Z'
    },
    {
      id: 'u2',
      fieldId: 'f1',
      updatedById: '2',
      stage: 'GROWING',
      notes: 'Germination good, some weeds present',
      imageUrl: null,
      latitude: -1.2922,
      longitude: 36.8220,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    },
    {
      id: 'u3',
      fieldId: 'f2',
      updatedById: '3',
      stage: 'PLANTED',
      notes: 'Beans planted',
      imageUrl: null,
      latitude: -1.1821,
      longitude: 36.9219,
      createdAt: '2026-02-15T11:00:00.000Z'
    },
    {
      id: 'u4',
      fieldId: 'f2',
      updatedById: '3',
      stage: 'GROWING',
      notes: 'Good growth',
      imageUrl: null,
      latitude: -1.1820,
      longitude: 36.9218,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago -> At Risk
    },
    {
      id: 'u5',
      fieldId: 'f2',
      updatedById: '3',
      stage: 'READY',
      notes: 'Ready for harvest soon',
      imageUrl: null,
      latitude: -1.1822,
      longitude: 36.9220,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
  localStorage.setItem(STORAGE_KEYS.UPDATES, JSON.stringify(updates))
}

// Initialize if empty
if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
  seedDatabase()
}

// Helper to compute field status
const computeStatus = (currentStage, lastUpdateDate) => {
  if (currentStage === 'HARVESTED') return 'Completed'
  if (!lastUpdateDate) return 'Active'
  const daysSince = (new Date() - new Date(lastUpdateDate)) / (1000 * 60 * 60 * 24)
  return daysSince > 7 ? 'At Risk' : 'Active'
}

export const mockApi = {
  // Auth
  login: async (email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) return null
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },

  // Fields
  getFields: async (userId, role) => {
    const fields = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELDS) || '[]')
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const updates = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPDATES) || '[]')

    let filteredFields = fields
    if (role === 'AGENT') {
      filteredFields = fields.filter(f => f.assignedAgentId === userId)
    }

    // Enrich with agent name and computed status
    return filteredFields.map(field => {
      const agent = users.find(u => u.id === field.assignedAgentId)
      const fieldUpdates = updates.filter(u => u.fieldId === field.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
      const lastUpdate = fieldUpdates[0]
      const status = computeStatus(field.currentStage, lastUpdate?.createdAt)
      return {
        ...field,
        agentName: agent?.name || 'Unassigned',
        status,
        updatesCount: fieldUpdates.length
      }
    })
  },

  getField: async (fieldId) => {
    const fields = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELDS) || '[]')
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const updates = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPDATES) || '[]')
    const field = fields.find(f => f.id === fieldId)
    if (!field) return null

    const agent = users.find(u => u.id === field.assignedAgentId)
    const fieldUpdates = updates.filter(u => u.fieldId === fieldId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    const lastUpdate = fieldUpdates[0]
    const status = computeStatus(field.currentStage, lastUpdate?.createdAt)

    return {
      ...field,
      agentName: agent?.name,
      status,
      updates: fieldUpdates.map(u => ({
        ...u,
        updatedBy: users.find(usr => usr.id === u.updatedById)?.name
      }))
    }
  },

  createField: async (fieldData) => {
    const fields = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELDS) || '[]')
    const newField = {
      ...fieldData,
      id: 'f' + Date.now(),
      createdAt: new Date().toISOString()
    }
    fields.push(newField)
    localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(fields))
    return newField
  },

  // Updates
  addUpdate: async (fieldId, updateData) => {
    const updates = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPDATES) || '[]')
    const fields = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELDS) || '[]')
    
    const newUpdate = {
      id: 'u' + Date.now(),
      fieldId,
      ...updateData,
      createdAt: new Date().toISOString()
    }
    updates.push(newUpdate)
    localStorage.setItem(STORAGE_KEYS.UPDATES, JSON.stringify(updates))

    // Update field's current stage
    const fieldIndex = fields.findIndex(f => f.id === fieldId)
    if (fieldIndex !== -1) {
      fields[fieldIndex].currentStage = updateData.stage
      localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(fields))
    }

    return newUpdate
  },

  getAgents: async () => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    return users.filter(u => u.role === 'AGENT').map(({ password, ...agent }) => agent)
  },

  // Dashboard stats
  getAdminStats: async () => {
    const fields = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELDS) || '[]')
    const updates = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPDATES) || '[]')
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')

    const fieldsWithStatus = fields.map(f => {
      const fieldUpdates = updates.filter(u => u.fieldId === f.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
      return computeStatus(f.currentStage, fieldUpdates[0]?.createdAt)
    })

    return {
      totalFields: fields.length,
      active: fieldsWithStatus.filter(s => s === 'Active').length,
      atRisk: fieldsWithStatus.filter(s => s === 'At Risk').length,
      completed: fieldsWithStatus.filter(s => s === 'Completed').length,
      agents: users.filter(u => u.role === 'AGENT').length
    }
  },

  getAgentStats: async (agentId) => {
    const fields = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELDS) || '[]')
    const updates = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPDATES) || '[]')
    const agentFields = fields.filter(f => f.assignedAgentId === agentId)

    const fieldsWithStatus = agentFields.map(f => {
      const fieldUpdates = updates.filter(u => u.fieldId === f.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
      return computeStatus(f.currentStage, fieldUpdates[0]?.createdAt)
    })

    return {
      totalAssigned: agentFields.length,
      active: fieldsWithStatus.filter(s => s === 'Active').length,
      atRisk: fieldsWithStatus.filter(s => s === 'At Risk').length,
      completed: fieldsWithStatus.filter(s => s === 'Completed').length
    }
  }
}