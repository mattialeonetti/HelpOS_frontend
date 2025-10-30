import { defineStore } from 'pinia'
import api from '@/api/api'

export const useFormStore = defineStore('form', {
  state: () => ({
    forms: [],
    isLoading: false,
    error: null
  }),

  getters: {
    formCount: (state) => state.forms.length,
    hasError: (state) => state.error !== null,
    getFormById: (state) => (id) => state.forms.find(form => form.id === id)
  },

  actions: {
    async fetchForms() {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.get('forms')
        this.forms = response
      } catch (err) {
        this.error = err.message || 'Failed to fetch forms'
        console.error('Failed to fetch forms:', err)
      } finally {
        this.isLoading = false
      }
    },

    async addForm(formData) {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.post('forms', formData)
        this.forms.push(response)
        return response
      } catch (err) {
        this.error = err.message || 'Failed to add form'
        console.error('Failed to add form:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateForm(id, formData) {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.put(`forms/${id}`, formData)
        const index = this.forms.findIndex(form => form.id === id)
        if (index !== -1) {
          this.forms[index] = response
        }
        return response
      } catch (err) {
        this.error = err.message || 'Failed to update form'
        console.error('Failed to update form:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteForm(id) {
      try {
        this.isLoading = true
        this.error = null
        await api.delete(`forms/${id}`)
        this.forms = this.forms.filter(form => form.id !== id)
      } catch (err) {
        this.error = err.message || 'Failed to delete form'
        console.error('Failed to delete form:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
})