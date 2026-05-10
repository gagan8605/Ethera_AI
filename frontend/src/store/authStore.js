import { create } from 'zustand'
import { authAPI } from '../api/index.js'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password, rememberMe) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login({ email, password, rememberMe })
      const { user, tokens } = response.data
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      set({ user, isAuthenticated: true, isLoading: false })
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.register({ name, email, password })
      const { user, tokens } = response.data
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      set({ user, isAuthenticated: true, isLoading: false })
      return user
    } catch (error) {
      const message = error.response?.data?.errors?.email || error.response?.data?.message || 'Registration failed'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
    // Redirect to login page
    window.location.href = '/login'
  },

  getCurrentUser: async () => {
    set({ isLoading: true })
    try {
      const response = await authAPI.getCurrentUser()
      set({ user: response.data, isAuthenticated: true, isLoading: false })
      return response.data
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, isAuthenticated: false, isLoading: false })
      return null
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      set((state) => ({ user: { ...state.user, ...response.data } }))
      return response.data
    } catch (error) {
      throw error
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      set({ isLoading: true })
      try {
        const response = await authAPI.getCurrentUser()
        set({ user: response.data, isAuthenticated: true, isLoading: false })
      } catch (error) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } else {
      set({ isLoading: false })
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword })
    } catch (error) {
      throw error
    }
  },

  deactivateAccount: async (password) => {
    try {
      await authAPI.deactivateAccount({ password })
      set((state) => ({ user: { ...state.user, isActive: false } }))
    } catch (error) {
      throw error
    }
  },

  activateAccount: async (password) => {
    try {
      await authAPI.activateAccount({ password })
      set((state) => ({ user: { ...state.user, isActive: true } }))
    } catch (error) {
      throw error
    }
  },

  deleteAccount: async (password, confirmDelete) => {
    try {
      await authAPI.deleteAccount({ password, confirmDelete })
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, isAuthenticated: false })
    } catch (error) {
      throw error
    }
  }
}))
