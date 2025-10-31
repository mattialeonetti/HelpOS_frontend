import { defineStore } from 'pinia'
import api from '@/api/api'

export const useQuestionStore = defineStore('question', {
    state: () => ({
        topicId: null,
        formId: null,
        questions: {},
        isLoading: false,
        error: null
    }),
    getters: {
        hasError: (state) => state.error !== null,
        questionsForForm: (state) => (formId) => {
            if (!state.questions[formId]) {
                fetchQuestionsForForm(formId)
            }
            return state.questions[formId] || []
        }
    },
    actions: {
        async fetchQuestionsForForm(formId) {
            this.isLoading = true
            this.error = null
            try {
                const response = await api.get(`/topics/${this.topicId}/forms/${formId}/questions`)
                this.questions[formId] = response
            } catch (err) {
                this.error = err.message || 'Failed to fetch questions'
                console.error('Failed to fetch questions:', err)
            } finally {
                this.isLoading = false
            }
        },

        async createQuestion(formId, questionData, parentQuestionId = null) {
            this.isLoading = true
            this.error = null
            try {
                const response = await api.post(`/topics/${this.topicId}/forms/${formId}/questions${parentQuestionId ? `/${parentQuestionId}` : ''}`, questionData)
                this.fetchQuestionsForForm(formId)
                return response
            } catch (err) {
                this.error = err.message || 'Failed to create question'
                console.error('Failed to create question:', err)
                throw err
            } finally {
                this.isLoading = false
            }
        }
    }
})
