// app/utils/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export const api = {
  get: async (endpoint, requiresAuth = true) => {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (requiresAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { headers })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return await res.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  post: async (endpoint, data, requiresAuth = true) => {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (requiresAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return await res.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  put: async (endpoint, data, requiresAuth = true) => {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (requiresAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return await res.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  delete: async (endpoint, requiresAuth = true) => {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (requiresAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return await res.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}
