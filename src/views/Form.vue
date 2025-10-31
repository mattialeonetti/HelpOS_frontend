<template>
  <div class="form-view">
    <div class="form-header">
      <h1>{{ currentForm?.title || 'Form' }}</h1>
      <p v-if="currentForm?.description">{{ currentForm.description }}</p>
    </div>
    <div class="form-layout">
      <div class="form-section">
        <div v-if="isLoading" class="loading">
          <Skeleton width="50%" height="2rem" />
        </div>

        <Message v-else-if="hasError" severity="error" :closable="false">
          <div class="error-content">
            <p>{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" @click="loadForm" severity="secondary" size="small" />
          </div>
        </Message>

        <form v-else class="dynamic-form">
          <div v-for="question in formQuestions" :key="question.id" class="form-group">
            <Question :questionId="question.id" />
          </div>

          <div class="form-actions">
            <Button type="submit" label="Finish Case" @click="isSubmitting = true" />
            <Button label="Cancel Case" icon="pi pi-arrow-left" @click="$router.push('/form-select')"
              severity="secondary" />
          </div>
        </form>
      </div>

      <Dialog v-model:visible="isSubmitting" modal :closable="false" :dismissable-mask="false"
        class="submission-dialog">
        <div class="submission-content">
          <div v-for="answer in caseStore.caseRun.steps" :key="answer.questionId" class="answer-item">
            <h3>{{formStore.forms.find(f => f.id === answer.formId)?.title}}</h3>
            <h4>{{ allQuestionsFlat.find(q => q.id === answer.questionId)?.text }}:</h4>
            <p>{{ answer.answer }}</p>
            <Divider />
            <SelectButton label="Decision: " v-model="decision" :options="['Approve', 'Reject']" class="w-full" />
            <Button label="Complete Case" @click="completeCase(answer)" />
          </div>
        </div>
      </Dialog>

      <!-- Divider -->
      <Divider layout="vertical" class="form-divider" />

      <!-- Right Section: Cases (1/3 width) - Placeholder -->
      <div class="cases-section">
        <div class="cases-placeholder">
          <h3>Cases</h3>
          <p class="placeholder-text">Case view will be imported here</p>
          <!-- Cases component will be imported here later -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFormStore } from '@/stores/formStore'
import { useQuestionStore } from '@/stores/questionStore'
import {
  Card, Button, InputText, Textarea,
  Checkbox, Message,
  Skeleton, Divider,
  Dialog,
  SelectButton
} from 'primevue'
import Question from '@/components/Question.vue'
import { useCaseStore } from '@/stores/caseStore'

const route = useRoute()
const router = useRouter()
const formStore = useFormStore()
const { forms } = storeToRefs(formStore)
const questionStore = useQuestionStore()
const { questions, isLoading, error, hasError } = storeToRefs(questionStore)
const caseStore = useCaseStore()

// Flatten all questions across forms for lookups (e.g., by questionId)
const allQuestionsFlat = computed(() => Object.values(questions.value || {}).flat())

const formQuestions = computed(() => {
  const formId = route.params.id
  console.log('Form ID:', formId)
  console.log('All questions (by form):', questions.value)
  const list = (questions.value && questions.value[formId]) ? questions.value[formId] : []
  console.log('Current form questions:', list)
  return list.filter(q => !q.parentQuestionId)
})
// Form state
const formData = ref({})
const fieldErrors = ref({})
const isSubmitting = ref(false)
const allowLeaving = ref(false)

// Get current form
const currentForm = computed(() => {
  return formStore.forms[formStore.selectedTopicId].find(form => form.id === formStore.selectedFormId)
})

// Browser beforeunload event - warns when closing tab/window
const handleBeforeUnload = (e) => {
  if (!allowLeaving.value) {
    e.preventDefault()
    e.returnValue = '' // Chrome requires returnValue to be set
    return '' // Some browsers use the return value
  }
}

// Vue Router navigation guard - warns when navigating to another route
onBeforeRouteLeave((to, from, next) => {
  if (!allowLeaving.value) {
    const answer = window.confirm(
      'Are you sure you want to leave this page?'
    )
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

const loadForm = async () => {
  if (forms.value.length === 0) {
    await formStore.fetchForms()
  }
}

const completeCase = async () => {
  try {
    // Here you would submit the form data
    // await api.post(`forms/${route.params.id}/submissions`, formData.value)

    console.log('Form submitted:', formData.value)

    // Allow leaving the page after successful submission (optional - remove if you want to keep prompting)
    // allowLeaving.value = true

    // Show success and redirect
    router.push('/form-select')
  } catch (error) {
    console.error('Failed to submit form:', error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadForm()
  questionStore.fetchQuestionsForForm(route.params.id)
  // Add browser beforeunload listener
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  // Clean up event listener
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.form-view {
  width: 100%;
  padding: 2rem;
}

.form-header h1 {
  margin: 0 0 0.5rem 0;
}

.form-header p {
  color: #6c757d;
  margin: 0;
}

/* Two-column layout */
.form-layout {
  display: flex;
  gap: 2rem;
  min-height: 500px;
}

/* Left section: Form (2/3 width) */
.form-section {
  flex: 2;
  min-width: 0;
  /* Prevents flex item from overflowing */
}

/* Divider styling */
.form-divider {
  margin: 0;
}

/* Right section: Cases (1/3 width) */
.cases-section {
  flex: 1;
  min-width: 250px;
}

.cases-placeholder {
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: 6px;
  height: 100%;
}

.cases-placeholder h3 {
  margin: 0 0 1rem 0;
  color: var(--p-primary-600);
}

.placeholder-text {
  color: #6c757d;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.dynamic-form {
  margin-top: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group label {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.p-error {
  display: block;
  margin-top: 0.25rem;
}

/* Responsive: Stack on smaller screens */
@media (max-width: 1024px) {
  .form-layout {
    flex-direction: column;
  }

  .form-divider {
    display: none;
  }

  .cases-section {
    min-width: 100%;
  }
}
</style>