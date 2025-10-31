import { defineStore } from 'pinia'
import api from '@/api/api'

export const useQuestionStore = defineStore('question', {
    state: () => ({
        topicId: null,
        formId: null,
        // Map formId -> Question[]
        questions: {},
        isLoading: false,
        error: null
    }),
    getters: {
        hasError: (state) => state.error !== null
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
                console.log()
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
        },

        async fetchSubQuestions(parentQuestionId) {
            this.isLoading = true
            this.error = null
            try {
                const response = await api.get(`/topics/${this.topicId}/forms/${formId}/questions/${parentQuestionId}/children`)
                return response.id
            } catch (err) {
                this.error = err.message || 'Failed to fetch sub-questions'
                console.error('Failed to fetch sub-questions:', err)
            } finally {
                this.isLoading = false
            }
        },

        resetQuestions() {
            this.questions = {}
        }
    }
})
