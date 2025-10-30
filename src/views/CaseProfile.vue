<template>
  <div class="case-profile">
    <Card>
      <template #title>
        <h1>Case Profile</h1>
      </template>
      <template #content>
        <div class="case-info">
          <h2>Case Information</h2>
          <!-- Add your case profile content here -->
          <div class="actions">
            <Button 
              label="Select Form" 
              icon="pi pi-arrow-right" 
              @click="$router.push('/form-select')"
              class="p-button-lg"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { Card, Button } from 'primevue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.case-profile {
  padding: 2rem;
}

.case-info h2 {
  margin-bottom: 1rem;
}

.actions {
  margin-top: 2rem;
}
</style>