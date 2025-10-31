<template>
  <div class="form-view">
    <div class="form-layout">
  <!-- Left: Form main section -->
      <div class="form-section">
        <div class="form-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>{{ currentForm?.title || 'Form' }}</h1>
            <Button icon="pi pi-plus" @click="showCreateDialog = true" />
          </div>
          <p v-if="currentForm?.description">{{ currentForm.description }}</p>
        </div>

        <div v-if="isLoading" class="loading">
          <Skeleton width="50%" height="2rem" />
        </div>

        <Message v-else-if="hasError" severity="error" :closable="false">
          <div class="error-content">
            <p>{{ error }}</p>
            <Button
              label="Retry"
              icon="pi pi-refresh"
              @click="loadForm"
              severity="secondary"
              size="small"
            />
          </div>
        </Message>

        <form v-else class="dynamic-form">
          <div v-for="question in formQuestions" :key="question.id" class="form-group">
            <Question :questionId="question.id" />
          </div>

          <div class="form-actions">
            <Button
              type="submit"
              icon="pi pi-check"
              label="Finish Case"
              @click="isSubmitting = true"
            />
            <Button
              label="Cancel Case"
              class="error"
              icon="pi pi-arrow-left"
              @click="$router.push('/form-select')"
              severity="secondary"
            />
          </div>
        </form>
      </div>

  <!-- Submission preview -->
      <Dialog
        v-model:visible="isSubmitting"
        modal
        :closable="false"
        :dismissable-mask="false"
        class="submission-dialog"
      >
        <div class="submission-content">
          <div
            v-for="answer in caseStore.caseRun.steps"
            :key="answer.questionId"
            class="answer-item"
          >
            <h3>{{ formStore.forms.find(f => f.id === answer.formId)?.title }}</h3>
            <h4>{{ allQuestionsFlat.find(q => q.id === answer.questionId)?.text }}:</h4>
            <p>{{ answer.answer }}</p>
            <Divider />
            <SelectButton label="Decision: " v-model="decision" :options="['Approve', 'Reject']" class="w-full" />
            <Button label="Complete Case" @click="completeCase(answer)" />
          </div>
        </div>
      </Dialog>

  <!-- Top-level question creation (wider + three equal-length inputs + Answer inline on right + button) -->
      <Dialog
        v-model:visible="showCreateDialog"
        modal
        :closable="true"
        :dismissable-mask="true"
        class="top-create-dialog"
        :style="{ width: '40rem', maxWidth: '90vw', borderRadius: '1rem' }"
        :pt="{
          header:  { class: 'top-dialog-header' },
          content: { class: 'top-dialog-content' },
          footer:  { class: 'top-dialog-footer' }
        }"
      >
        <template #header>Create top-level Question</template>

        <div class="top-create-body">
          <IftaLabel class="w-full">
            <InputText id="question" v-model="form.question" placeholder="Question" showClear fluid />
            <label for="question">Question</label>
          </IftaLabel>

          <IftaLabel class="w-full">
            <InputText id="source" v-model="form.source" placeholder="Source" showClear fluid />
            <label for="source">Source</label>
          </IftaLabel>

          <div class="top-answer-row">
            <Chip
              v-for="answer in form.answers"
              :key="answer"
              :label="answer"
              removable
              @remove="removeAnswer(answer)"
            />
          </div>

          <!-- Answer input + inline plus icon -->
          <div class="top-answer-add">
            <IftaLabel class="top-answer-field">
              <InputText
                id="answer"
                v-model="form.answer"
                placeholder="Answer"
                showClear
                fluid
                @keyup.enter="createAnswer"
              />
              <label for="answer">Answer</label>

              <Button
                icon="pi pi-plus"
                rounded
                text
                class="top-btn-inline"
                v-tooltip.bottom="'Add Answer'"
                @click="createAnswer"
              />
            </IftaLabel>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <Button label="Cancel" severity="secondary" @click="showCreateDialog = false" />
            <Button label="Create" icon="pi pi-check" @click="createQuestion" />
          </div>
        </template>
      </Dialog>

  <!-- Right placeholder section -->
      <Divider layout="vertical" class="form-divider" />
      <div class="cases-section">
        <div class="cases-placeholder">
          <h3>Cases</h3>
          <p class="placeholder-text">Case view will be imported here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useFormStore } from '@/stores/formStore'
import { useQuestionStore } from '@/stores/questionStore'
import { useCaseStore } from '@/stores/caseStore'

import {
  Button, InputText, Message, Skeleton, Divider, Dialog,
  SelectButton, Chip, IftaLabel
} from 'primevue'
import Question from '@/components/Question.vue'

const route = useRoute()
const router = useRouter()

const formStore = useFormStore()
const { forms } = storeToRefs(formStore)

const questionStore = useQuestionStore()
const { questions, isLoading, error, hasError } = storeToRefs(questionStore)

const caseStore = useCaseStore()

const allQuestionsFlat = computed(() => Object.values(questions.value || {}).flat())

const showCreateDialog = ref(false)
const form = ref({ question: '', answer: '', answers: [], source: '' })

const formQuestions = computed(() => {
  const formId = route.params.id
  const list = (questions.value && questions.value[formId]) ? questions.value[formId] : []
  return list.filter(q => !q.parentQuestionId)
})

const isSubmitting = ref(false)
const allowLeaving = ref(false)

const currentForm = computed(() =>
  formStore.forms[formStore.selectedTopicId].find(f => f.id === formStore.selectedFormId)
)

const createAnswer = () => {
  if (form.value.answer && !form.value.answers.includes(form.value.answer)) {
    form.value.answers.push(form.value.answer)
    form.value.answer = ''
  }
}
const removeAnswer = (a) => (form.value.answers = form.value.answers.filter(x => x !== a))

const handleBeforeUnload = (e) => {
  if (!allowLeaving.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}

onBeforeRouteLeave((to, from, next) => {
  if (!allowLeaving.value) {
    const ok = window.confirm('Are you sure you want to leave this page?')
    ok ? next() : next(false)
  } else {
    next()
  }
})

const loadForm = async () => {
  if (forms.value.length === 0) await formStore.fetchForms()
}

const completeCase = async () => {
  try {
    router.push('/form-select')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadForm()
  questionStore.fetchQuestionsForForm(route.params.id)
  window.addEventListener('beforeunload', handleBeforeUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))

const createQuestion = () => {
  if (!form.value.question || form.value.answers.length === 0) {
    alert('Please fill in the question and add at least one answer.')
    return
  }
  questionStore.createQuestion(route.params.id, {
    text: form.value.question,
    answerOptions: form.value.answers.map(ans => ({ label: ans })),
    source: form.value.source,
    parentQuestionId: null,
    parentAnswerId: null
  })
  form.value = { question: '', answer: '', answers: [], source: '' }
  showCreateDialog.value = false
}
</script>

<style scoped>
.form-view { width: 100%; padding: 2rem; }
.form-header h1 { margin: 0 0 .5rem 0; }
.form-header p { color: #6c757d; margin: 0; }

/* Two columns */
.form-layout { display: flex; gap: 2rem; min-height: 500px; }
.form-section { flex: 2; min-width: 0; }
.form-divider { margin: 0; }
.cases-section { flex: 1; min-width: 250px; }
.cases-placeholder { padding: 1rem; background: var(--p-surface-50); border-radius: 6px; height: 100%; }
.cases-placeholder h3 { margin: 0 0 1rem 0; color: var(--p-primary-600); }
.placeholder-text { color: #6c757d; font-style: italic; }

.loading { text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.error-content { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.dynamic-form { margin-top: 0; }
.form-group { margin-bottom: 1.5rem; }

.form-actions { display: flex; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; }

/* ====== Top-level create dialog: wider + three equal-length inputs + Answer inline plus icon ====== */
.top-dialog-header { padding: 1.25rem 1.5rem .25rem; font-size: 1.25rem; font-weight: 700; }
.top-dialog-content { padding: 1rem 1.5rem 1.25rem; }
.top-dialog-footer { padding: .75rem 1.5rem; }
.top-create-body { display: flex; flex-direction: column; gap: .75rem; }

/* Make all three inputs 100% width */
.top-create-dialog :deep(.p-inputtext),
.top-create-dialog :deep(.p-inputwrapper),
.top-create-dialog :deep(.p-inputtext-fluid) { width: 100%; }

.top-answer-row { display: flex; flex-wrap: wrap; gap: .5rem; }

/* Answer row */
.top-answer-add { width: 100%; }
.top-answer-field { position: relative; display: block; width: 100%; }
.top-answer-field :deep(.p-inputtext) { padding-right: 2.25rem !important; } /* Reserve space for plus icon */

.top-btn-inline {
  position: absolute;
  right: .4rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  color: var(--text-color-secondary);
  transition: color .2s, background-color .2s;
}
.top-btn-inline:hover { background: var(--surface-200); color: var(--text-color); }

/* Fallback for small screens */
@media (max-width: 1024px) {
  .form-layout { flex-direction: column; }
  .form-divider { display: none; }
  .cases-section { min-width: 100%; }
}
@media (max-width: 480px) {
  .top-dialog-header { padding: 1rem 1rem .25rem; }
  .top-dialog-content { padding: .75rem 1rem 1rem; }
  .top-dialog-footer { padding: .5rem 1rem; }
}
</style>