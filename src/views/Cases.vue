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
            <h3>Exact matches</h3>
            <Card v-for="caseItem in caseStore.cases" :key="caseItem.id" class="case-item">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h4>{{ caseItem.title }}</h4>
                    <i v-if="caseItem.outcome === 'accepted'" class="pi pi-check-circle" style="color: green;"></i>
                    <i v-else-if="caseItem.outcome === 'rejected'" class="pi pi-times-circle" style="color: red;"></i>
                </div>
                <p>{{ caseItem.closureNotes }}</p>
            </Card>
        </div>
    </div>
</template>
<script setup>
import { useCaseStore } from '@/stores/caseStore';
import { Card, Divider, Skeleton } from 'primevue';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const caseStore = useCaseStore();

onMounted(() => {
    console.log(caseStore.cases);
});
</script>