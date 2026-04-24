import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://amused-insight-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to compute field status (same logic as backend)
const computeStatus = (currentStage, lastUpdateDate) => {
  if (currentStage === 'HARVESTED') return 'Completed';
  if (!lastUpdateDate) return 'Active';
  const daysSince = (new Date() - new Date(lastUpdateDate)) / (1000 * 60 * 60 * 24);
  return daysSince > 7 ? 'At Risk' : 'Active';
};

export const apiService = {
  // Auth
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Fields
  getFields: async (userId, role) => {
    const response = await api.get('/fields');
    let fields = response.data.data || response.data;
    
    // Filter by role if AGENT
    if (role === 'AGENT') {
      fields = fields.filter(f => f.assignedAgentId === userId);
    }

    // Enrich with computed status
    return fields.map(field => {
      const lastUpdate = field.updates?.[0];
      const status = computeStatus(field.currentStage, lastUpdate?.createdAt);
      return {
        ...field,
        agentName: field.assignedAgent?.name || 'Unassigned',
        status,
        updatesCount: field.updates?.length || 0
      };
    });
  },

  getField: async (fieldId) => {
    const response = await api.get(`/fields/${fieldId}`);
    const field = response.data.data || response.data;
    
    // Add computed status
    const lastUpdate = field.updates?.[0];
    const status = computeStatus(field.currentStage, lastUpdate?.createdAt);
    
    return {
      ...field,
      agentName: field.assignedAgent?.name,
      status,
      updates: field.updates?.map(u => ({
        ...u,
        updatedBy: u.updatedBy?.name
      })) || []
    };
  },

  createField: async (fieldData) => {
    const response = await api.post('/fields', fieldData);
    return response.data;
  },

  updateField: async (fieldId, fieldData) => {
    const response = await api.put(`/fields/${fieldId}`, fieldData);
    return response.data;
  },

  deleteField: async (fieldId) => {
    const response = await api.delete(`/fields/${fieldId}`);
    return response.data;
  },

  // Updates
  addUpdate: async (fieldId, updateData) => {
    // For image upload, we need to use FormData
    const formData = new FormData();
    formData.append('stage', updateData.stage);
    if (updateData.notes) formData.append('notes', updateData.notes);
    if (updateData.latitude) formData.append('latitude', updateData.latitude);
    if (updateData.longitude) formData.append('longitude', updateData.longitude);
    if (updateData.image) formData.append('image', updateData.image);

    const response = await api.post(`/updates/field/${fieldId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUpdates: async (fieldId) => {
    const response = await api.get(`/updates/field/${fieldId}`);
    return response.data;
  },

  // Agents
  getAgents: async () => {
    const response = await api.get('/users/agents');
    return response.data.data || response.data;
  },

  // Dashboard
  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getAgentStats: async (agentId) => {
    const response = await api.get('/dashboard/agent');
    return response.data;
  },
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
