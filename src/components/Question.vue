<template>
  <div class="question">
    <Card>
      <template #title>{{ question?.text }}</template>
      <template #content>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <SelectButton v-model="selectedOption" :options="question.answerOptions"></SelectButton>
          <Button label="Source" icon="pi pi-external-link" class="ml-4" :url="question.source" target="_blank" />
        </div>
      </template>
    </Card>
    <Question v-for="subQuestion in question.subQuestions" :key="subQuestion.id" :questionId="subQuestion.id" :sub-question-level="subQuestionLevel + 1" />
  </div>
</template>

<script setup>
import { useCaseStore } from '@/stores/caseStore'
import { useQuestionStore } from '@/stores/questionStore'
import { Button, Card, SelectButton } from 'primevue'
import { computed, onMounted, watch } from 'vue'

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
const questionStore = UseQuestionStore()
const caseStore = useCaseStore()
const question = computed(() => {
  return questionStore.questions.find(q => q.id === props.questionId)
})
const selectedOption = ref(null)

watch(selectedOption, (newValue) => {
  if (newValue !== null) {
    caseStore.submitCaseAnswer(props.questionId, newValue)
  }
})
</script>

<style scoped>
.question {
  margin-bottom: 1rem;
  width: 100%;
  padding-left: calc(1rem * var(--sub-question-level));
}
</style>