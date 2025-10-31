<template>
    <div class="cases-view">
        <div v-if="caseStore.error">
            <p class="error-message">Error loading cases: {{ caseStore.error }}</p>
        </div>
        <div v-if="caseStore.isLoading">
            <Skeleton width="100%" height="2rem" />
        </div>
        <div v-else-if="caseStore.cases.length === 0" class="cases-placeholder">
            <h3>No cases available</h3>
            <p class="placeholder-text">There are no cases associated with this form yet.</p>
        </div>
        <div v-else class="cases">
            <h3 style="margin-bottom: 1em;">Matching cases</h3>
            <Card v-for="caseItem in caseStore.cases" :key="caseItem.id" class="case-item">
                <template #content>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                        <p>{{ new Date(caseItem.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric', month:
                                'long', day: 'numeric'
                        }) }}</p>
                        <i v-if="caseItem.outcome === 'approved'" class="pi pi-check-circle"
                            style="color: green; font-size: 2em;"></i>
                        <i v-else-if="caseItem.outcome === 'rejected'" class="pi pi-times-circle"
                            style="color: red; font-size: 2em;"></i>
                    </div>
                    <p style="margin-top: 1em; font-style: italic; color: gray;">{{ caseItem.closureNotes }}</p>
                    <div v-for="step in caseItem.steps" :key="step.questionId">
                        <Divider />
                        <p>{{allQuestionsFlat.find(q => q.id === step.questionId)?.text}}</p>
                        <Chip class="answer-item">{{ step.answer }}</Chip>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
<script setup>
import { useCaseStore } from '@/stores/caseStore';
import { useQuestionStore } from '@/stores/questionStore';
import { Chip, Divider } from 'primevue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import { onMounted, computed } from 'vue'

const caseStore = useCaseStore();
const questionStore = useQuestionStore();
const allQuestionsFlat = computed(() => Object.values(questionStore.questions || {}).flat())

onMounted(() => {
    console.log(caseStore.cases);
});
</script>

<style scoped>
.case-item {
    margin-bottom: 1rem;
}

.answer-item {
    margin-top: 2px;
}
</style>