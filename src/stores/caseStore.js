import { defineStore } from 'pinia'
import api from '@/api/api'

export const useCaseStore = defineStore('case', {
    state: () => ({
        formId: null,
        topicId: null,
        cases: [],
        caseRun: null,
        isLoading: false,
        error: null
    }),
    getters: {
        hasError: (state) => state.error !== null,
        caseForForm: (state) => (formId) => {
            if (!state.cases[formId]) {
                fetchCasesForForm(formId)
            }
            return state.cases[formId] || []
        }
    },
    actions: {
        async startCaseRun(topicId, formId, profileId) {
            this.topicId = topicId
            this.formId = formId
            this.isLoading = true
            this.error = null
            try {
                const response = await api.post(`/topics/${topicId}/forms/${formId}/runs`, { profileId: profileId })
                this.caseRun = response
            } catch (err) {
                this.error = err.message || 'Failed to start case run'
                console.error('Failed to start case run:', err)
            } finally {
                this.isLoading = false
            }
        },

        async submitCaseAnswer(answerData) {
            this.isLoading = true
            this.error = null
            try {
                if (this.caseRun.steps.some(step => step.questionId === answerData.questionId)) {
                    // Update existing answer
                    const index = this.caseRun.steps.findIndex(step => step.questionId === answerData.questionId)
                    this.caseRun.steps[index] = answerData
                } else {
                    this.caseRun.steps.push(answerData)
                }
                const response = await api.put(`/topics/${this.topicId}/forms/${this.formId}/runs/${this.caseRun.id}`, this.caseRun)
                this.caseRun = response
                await this.fetchCasesForForm()
            } catch (err) {
                this.error = err.message || 'Failed to submit case answer'
                console.error('Failed to submit case answer:', err)
            }
            finally {
                this.isLoading = false
            }
        },

        async closeCaseRun(outcome, closureNotes = null) {
            this.isLoading = true
            this.error = null
            try {
                this.caseRun.closureNotes = closureNotes
                this.caseRun.outcome = outcome
                const response = await api.post(`/topics/${this.topicId}/forms/${this.formId}/runs/${this.caseRun.id}/close`, this.caseRun)
                this.caseRun = response
            } catch (err) {
                this.error = err.message || 'Failed to close case run'
                console.error('Failed to close case run:', err)
            } finally {
                this.isLoading = false
            }
        },

        async fetchCasesForForm() {
            this.isLoading = true
            this.error = null
            try {
                const response = await api.get(`/topics/${this.topicId}/forms/${this.formId}/runs/${this.caseRun.id}/similar`)
                this.cases = response
            } catch (err) {
                this.error = err.message || 'Failed to fetch cases'
                console.error('Failed to fetch cases:', err)
            } finally {
                this.isLoading = false
            }
        }
    }
})

