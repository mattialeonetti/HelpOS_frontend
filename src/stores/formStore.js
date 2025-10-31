import { defineStore } from 'pinia'
import api from '@/api/api'

export const useFormStore = defineStore('form', {
  state: () => ({
    topics: [],
    forms: {},
    isLoading: false,
    formsLoading: false,
    error: null
  }),

  getters: {
    hasError: (state) => state.error !== null,
    formForTopic: (state) => (topicId) => {
      if (!state.forms[topicId]) {
        fetchFormsForTopic(topicId)
      }
      return state.forms[topicId] || []
    }
  },

  actions: {
    async fetchTopics() {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.get('/topics')
        this.topics = response
      }
      catch (err) {
        this.error = err.message || 'Failed to fetch topics'
        console.error('Failed to fetch topics:', err)
      } finally {
        this.isLoading = false
      }
    },

    async fetchFormsForTopic(topicId) {
      try {
        this.formsLoading = true
        this.error = null
        const response = await api.get(`/topics/${topicId}/forms`)
        this.forms[topicId] = response
      } catch (err) {
        this.error = err.message || 'Failed to fetch forms'
        console.error('Failed to fetch forms:', err)
      } finally {
        this.formsLoading = false
      }
    },

    async addForm(formData) {
      try {
        this.formsLoading = true
        this.error = null
        const response = await api.post('forms', formData)
        this.forms.push(response)
        return response
      } catch (err) {
        this.error = err.message || 'Failed to add form'
        console.error('Failed to add form:', err)
        throw err
      } finally {
        this.formsLoading = false
      }
    },
  }
})