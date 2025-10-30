<template>
  <div class="form-select">
    <Card>
      <template #title>
        <h1>Select a Form</h1>
      </template>
      <template #content>
        <div v-if="isLoading" class="loading">
          <ProgressSpinner />
          <p>Loading forms...</p>
        </div>
        
        <Message v-else-if="hasError" severity="error" :closable="false">
          <div class="error-content">
            <p>{{ error }}</p>
            <Button 
              label="Retry" 
              icon="pi pi-refresh" 
              @click="formStore.fetchForms()" 
              severity="secondary"
              size="small"
            />
          </div>
        </Message>
        
        <div v-else class="forms-grid">
          <Card 
            v-for="form in forms" 
            :key="form.id" 
            class="form-card"
            @click="selectForm(form.id)"
          >
            <template #title>
              <h3>{{ form.title }}</h3>
            </template>
            <template #content>
              <p>{{ form.description }}</p>
            </template>
            <template #footer>
              <div class="form-meta">
                <Tag :value="form.type" severity="info" />
                <span class="form-duration">
                  <i class="pi pi-clock"></i>
                  {{ form.estimatedTime }}min
                </span>
              </div>
            </template>
          </Card>
        </div>
        
        <div class="actions">
          <Button 
            label="Back to Case Profile" 
            icon="pi pi-arrow-left" 
            @click="$router.push('/case-profile')"
            severity="secondary"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFormStore } from '@/stores/formStore'
import { Card, Button, Message, ProgressSpinner, Tag } from 'primevue'

const router = useRouter()
const formStore = useFormStore()
const { forms, isLoading, error, hasError } = storeToRefs(formStore)

const selectForm = (formId) => {
  router.push(`/form/${formId}`)
}

onMounted(() => {
  formStore.fetchForms()
})
</script>

<style scoped>
.form-select {
  padding: 2rem;
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

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.form-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.form-card h3 {
  margin: 0;
  color: #333;
}

.form-card p {
  color: #666;
  margin: 0;
}

.form-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-duration {
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.actions {
  margin-top: 2rem;
}
</style>