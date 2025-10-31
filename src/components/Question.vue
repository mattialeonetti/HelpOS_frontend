<template>
  <!-- Add is-nested class by level to enable sub-question visual style -->
  <div
    class="question"
    :class="{ 'is-nested': subQuestionLevel > 0 }"
    :style="{ '--sub-question-level': subQuestionLevel }"
  >
    <Card
      class="q-card"
      :pt="{
        root:    { class: 'q-card-root' },
        body:    { class: 'q-card-body p-0' },
        title:   { class: 'q-inset-x' },      // Unified left/right padding for title and content (PT)
        content: { class: 'q-inset-x' }
      }"
    >
  <!-- Title section -->
      <template #title>
        <div class="q-head">
          <h3 class="q-title">{{ question?.text }}</h3>
          <div class="q-actions">
            <Button
              icon="pi pi-plus"
              rounded
              text
              @click="showCreateDialog = true"
              v-tooltip.bottom="'Add Sub-Question'"
            />
            <Button
              icon="pi pi-external-link"
              rounded
              text
              :disabled="!question?.source"
              :url="question?.source"
              target="_blank"
              v-tooltip.bottom="'Open source'"
            />
          </div>
        </div>
      </template>

  <!-- Content section -->
      <template #content>
        <div class="q-content">
          <SelectButton
            v-model="selectedOptionId"
            :options="selectOptions"
            optionLabel="label"
            optionValue="value"
            @update:modelValue="updateChoice"
            :pt="{ root: { class: 'q-select-root' }, button: { class: 'q-select-btn' } }"
          />
        </div>
      </template>
    </Card>

  <!-- Create sub-question dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      modal
      header="Create Sub-Question"
      class="q-dialog"
      :style="{ width: '32rem' }"
    >
      <div class="q-dialog-body">
        <p class="q-dialog-hint">Select the gating answer and define a sub-question below.</p>

        <SelectButton
          v-model="selectedOptionForCreate"
          :options="selectOptions"
          optionLabel="label"
          optionValue="value"
          :pt="{ root: { class: 'q-select-root' }, button: { class: 'q-select-btn' } }"
        />

        <IftaLabel class="w-full">
          <InputText id="question" v-model="form.question" placeholder="Question" showClear fluid />
          <label for="question">Question</label>
        </IftaLabel>

        <IftaLabel class="w-full">
          <InputText id="source" v-model="form.source" placeholder="Source (optional URL)" showClear fluid />
          <label for="source">Source</label>
        </IftaLabel>

        <div class="q-answer-row">
          <Chip
            v-for="answer in form.answers"
            :key="answer"
            :label="answer"
            removable
            @remove="removeAnswer(answer)"
          />
        </div>

  <!-- Answer input box + inline “+” button -->
        <div class="q-answer-add">
          <IftaLabel class="flex-1 q-answer-field">
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
              class="q-btn-inline"
              v-tooltip.bottom="'Add Answer'"
              @click="createAnswer"
            />
          </IftaLabel>
        </div>
      </div>

      <template #footer>
        <div class="q-dialog-footer">
          <Button label="Cancel" severity="secondary" @click="showCreateDialog = false" />
          <Button label="Create" icon="pi pi-check" @click="createSubQuestion" />
        </div>
      </template>
    </Dialog>

  <!-- Sub-question recursion -->
    <Question
      v-for="subQuestion in subQuestions"
      :key="subQuestion.id"
      :questionId="subQuestion.id"
      :sub-question-level="subQuestionLevel + 1"
    />
  </div>
</template>

<script setup>
import { useCaseStore } from '@/stores/caseStore'
import { useQuestionStore } from '@/stores/questionStore'
import { Button, Card, Chip, Dialog, IftaLabel, InputText, SelectButton } from 'primevue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'Question' })

const questionStore = useQuestionStore()
const caseStore = useCaseStore()
const route = useRoute()

const props = defineProps({
  questionId: { type: String, required: true },
  subQuestionLevel: { type: Number, default: 0 }
})

const allQuestionsFlat = computed(() => Object.values(questionStore.questions || {}).flat())
const question = computed(() => allQuestionsFlat.value.find(q => q.id === props.questionId))

const selectedOptionId = ref(null)
const showCreateDialog = ref(false)
const selectedOptionForCreate = ref(null)

const answerOptionsRaw = computed(() => {
  const raw = question.value?.answerOptions ?? []
  return Array.isArray(raw) ? raw : Object.values(raw)
})
const selectOptions = computed(() => answerOptionsRaw.value.map(o => ({ label: o.label, value: o.id })))

const form = ref({ question: '', answer: '', answers: [], source: '' })

const createAnswer = () => {
  if (form.value.answer && !form.value.answers.includes(form.value.answer)) {
    form.value.answers.push(form.value.answer)
    form.value.answer = ''
  }
}
const removeAnswer = (a) => (form.value.answers = form.value.answers.filter(x => x !== a))

const subQuestions = computed(() => {
  const children = allQuestionsFlat.value.filter(q => q.parentQuestionId === props.questionId)
  const selected = selectedOptionId.value
  // Show all if not selected, filter by gating answer if selected
  return children.filter(q => q.parentAnswerId === selected)
})

const createSubQuestion = () => {
  if (!form.value.question || form.value.answers.length === 0 || !selectedOptionForCreate.value) {
    alert('Please fill question, add at least one answer, and select gating answer.')
    return
  }
  questionStore.createQuestion(route.params.id, {
    text: form.value.question,
    answerOptions: form.value.answers.map(ans => ({ label: ans })),
    parentQuestionId: props.questionId,
    parentAnswerId: selectedOptionForCreate.value,
    source: form.value.source
  })
  form.value = { question: '', answer: '', answers: [], source: '' }

  selectedOptionForCreate.value = null
  showCreateDialog.value = false
}


const updateChoice = async (newValue) => {
  console.log('Selected option changed:', newValue)
  await caseStore.submitCaseAnswer({ questionId: props.questionId, answerOptionId: newValue })
  console.log('Current case run:', caseStore.caseRun)
}
</script>

<style scoped>
:root{
  --q-inset-x: 1.5rem;          /* Align title/content left and right */
  --indent-step: 1.25rem;       /* Indent per level */
  --accent-color: var(--primary-500);
}

/* Outer container: indent by level */
.question{
  position: relative;
  width: 100%;
  margin-bottom: 1.25rem;
  padding-left: calc(var(--indent-step) * var(--sub-question-level, 0));
  transition: all .2s ease;
}
.question.is-nested{ margin-top: .5rem; }

/* Card appearance + PT alignment (title/content) */
.q-card-root{
  position: relative;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.q-card-body{ padding: 0; }
:deep(.q-inset-x){
  padding-left: var(--q-inset-x);
  padding-right: var(--q-inset-x);
}

/* ========= Use only color/width to visually weaken "affiliation" ========= */

/* Sub-level slightly narrower (shrink by 8px per level, max 24px) + lighter background + lighter shadow */
.question.is-nested .q-card-root{
  width: calc(100% - min(24px, 8px * var(--sub-question-level)));
  background: var(--surface-50);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

/* Left color bar (opacity increases with level) */
.question.is-nested .q-card-root::before{
  content: "";
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  /* 25% + 12%*level，最大约 61% */
  background: color-mix(in srgb, var(--accent-color) calc(25% + 12% * var(--sub-question-level)), transparent);
}

/* Title row and "secondary" title */
.q-head{ display:flex; justify-content:space-between; align-items:center; }
.q-title{ margin:0; font-size:1.1rem; font-weight:700; }
.question.is-nested .q-title{
  font-size: 1rem;
  color: var(--text-color-secondary);
}

/* Option button group (keep original style) */
.q-select-root{ display:flex; flex-wrap:wrap; gap:.5rem; }
.q-select-btn{ border-radius:9999px !important; padding:.4rem .9rem !important; font-size:.95rem; }

/* Dialog layout (keep original style) */
.q-dialog-body{ display:flex; flex-direction:column; gap:.75rem; }
.q-dialog-hint{ font-size:.85rem; color: var(--text-color-secondary); }
.q-answer-row{ display:flex; flex-wrap:wrap; gap:.5rem; }
.q-dialog-footer{ display:flex; justify-content:flex-end; gap:.5rem; }

/* Answer input + inline “+” button */
.q-answer-add{ display:flex; align-items:center; gap:0; margin-top:.25rem; }
.q-answer-field{ position:relative; width:100%; }
.q-btn-inline{
  position:absolute; right:.4rem; top:50%; transform:translateY(-50%);
  z-index:2; color: var(--text-color-secondary);
}
.q-btn-inline:hover{ background: var(--surface-200); color: var(--text-color); }
.q-answer-field :deep(.p-inputtext){ padding-right:2.2rem !important; }

/* Responsive: slightly reduce indent to avoid excessive compression on small screens */
@media (max-width: 768px){
  :root{ --indent-step: 1rem; }
}
</style>