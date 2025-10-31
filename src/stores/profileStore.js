import { defineStore } from 'pinia'
import api from '@/api/api'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    isLoading: false,
    error: null
  }),
  actions: {
    async postProfile(profileData) {
      this.isLoading = true
      try {
        const response = await api.post('/profile', profileData)
        this.profile = response
      } catch (error) {
        this.error = error
      } finally {
        this.isLoading = false
      }
    }
  }
})