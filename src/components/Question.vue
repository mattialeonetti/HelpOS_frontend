<template>
  <div class="question" :style="{ '--sub-question-level': subQuestionLevel }">
    <Card>
      <template #title>{{ question?.text }}</template>
      <template #content>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <SelectButton v-model="selectedOptionId" :options="selectOptions" optionLabel="label" optionValue="value" />
          <div>
            <Button icon="pi pi-plus" class="mr-2 ml-4" @click="showCreateDialog = true" />
            <Button icon="pi pi-external-link" class="ml-4" :url="question.source" target="_blank" />
          </div>
        </div>
      </template>
    </Card>

    <Dialog :visible="showCreateDialog">
      <template #header>Create Sub-Question for this answer</template>
      <div>
        <SelectButton v-model="selectedOptionForCreate" :options="selectOptions" optionLabel="label"
          optionValue="value" />
        <IftaLabel class="w-full">
          <InputText id="question" v-model="form.question" placeholder="Question" showClear fluid />
          <label for="question">Question</label>
        </IftaLabel>
        <div style="display: flex;">
          <Chip v-for="answer in form.answers" :key="answer" :label="answer" removable @remove="removeAnswer(answer)" />
        </div>
        <div style="display: flex;">
          <InputText id="answer" v-model="form.answer" placeholder="Answer" showClear fluid />
        </div>
        <Button label="Add Answer" icon="pi pi-plus" @click="createAnswer" class="mr-2" />
        <Button label="Create" icon="pi pi-check" @click="createSubQuestion" />
      </div>
    </Dialog>
    <Question v-for="subQuestion in subQuestions" :key="subQuestion.id" :questionId="subQuestion.id"
      :sub-question-level="subQuestionLevel + 1" />
  </div>
</template>

<script setup>
import { useCaseStore } from '@/stores/caseStore'
import { useQuestionStore } from '@/stores/questionStore'
import { Button, Card, Chip, Dialog, IftaLabel, InputText, SelectButton } from 'primevue'
import { computed, watch, ref } from 'vue'

// Ensure self-referencing <Question> works in recursion
defineOptions({ name: 'Question' })

const questionStore = useQuestionStore()

const props = defineProps({
  questionId: {
    type: String,
    required: true
  },
  subQuestionLevel: {
    type: Number,
    default: 0
  }
})
const caseStore = useCaseStore()
// Flatten all questions across forms since the store keeps them by formId
const allQuestionsFlat = computed(() => Object.values(questionStore.questions || {}).flat())

const question = computed(() => allQuestionsFlat.value.find(q => q.id === props.questionId))
const selectedOptionId = ref(null)
const showCreateDialog = ref(false)
const selectedOptionForCreate = ref(null)

// Always normalize answerOptions to an array of AnswerOption
const answerOptionsRaw = computed(() => {
  const raw = question.value?.answerOptions ?? []
  return Array.isArray(raw) ? raw : Object.values(raw)
})

// Map AnswerOption -> { label, value }
const selectOptions = computed(() =>
  answerOptionsRaw.value.map((o) => ({ label: o.label, value: o.id }))
)

const form = ref({
  question: '',
  answer: '',
  answers: []
})

const createAnswer = () => {
  if (form.value.answer && !form.value.answers.includes(form.value.answer)) {
    form.value.answers.push(form.value.answer)
    form.value.answer = ''
  }
}

const removeAnswer = (answer) => {
  form.value.answers = form.value.answers.filter(a => a !== answer)
}

// Sub-questions: children with matching parentQuestionId, optionally gated by selected answer
const subQuestions = computed(() => {
  const children = allQuestionsFlat.value.filter(q => q.parentQuestionId === props.questionId)
  const selected = selectedOptionId.value
  // If a child declares a specific parentAnswerId, only show it when that option is selected
  return children.filter(q => !q.parentAnswerId || q.parentAnswerId === selected)
})

const createSubQuestion = () => {
  if (!form.value.question || form.value.answers.length === 0 || !selectedOptionForCreate.value) {
    alert('Please fill in the question, add at least one answer, and select an answer option for gating.')
    return
  }
  questionStore.createQuestion({
    text: form.value.question,
    answerOptions: form.value.answers.map((ans) => ({ label: ans })),
    parentQuestionId: props.questionId,
    parentAnswerId: selectedOptionForCreate.value
  })
  // Reset form
  form.value.question = ''
  form.value.answers = []
  selectedOptionForCreate.value = null
  showCreateDialog.value = false
}

watch(selectedOptionId, (newValue) => {
  if (newValue !== null) {
    caseStore.submitCaseAnswer({ questionId: props.questionId, answerOptionId: newValue })
  }
})
// No onMounted needed; subQuestions are computed from store state
</script>

<style scoped>
.question {
  margin-bottom: 1rem;
  width: 100%;
  /* Indent based on depth; default to 0 when not set */
  padding-left: calc(1rem * var(--sub-question-level, 0));
  margin-top: 5px;
}
</style>