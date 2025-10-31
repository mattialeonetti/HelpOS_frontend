import { defineStore } from 'pinia'
import api from '@/api/api'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    isLoading: false,
    error: null
  }),
  getters: {
    isLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },
  actions: {
    async postProfile(profileData) {
      try {
        this.isLoading = true
        const response = await api.post('/profile', profileData)
        this.profile = response.data
      } catch (error) {
        this.error = error
      } finally {
        this.isLoading = false
      }
    }
  }
})