<template>
  <div class="form-view">
    <Card>
      <template #title>
        <div class="form-header">
          <h1>{{ currentForm?.title || 'Form' }}</h1>
          <p v-if="currentForm?.description">{{ currentForm.description }}</p>
        </div>
      </template>
      <template #content>
        <div v-if="isLoading" class="loading">
          <ProgressSpinner />
          <p>Loading form...</p>
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
        
        <form v-else @submit.prevent="submitForm" class="dynamic-form">
          <!-- Dynamic form fields -->
          <div v-for="field in formFields" :key="field.id" class="form-group">
            <label :for="field.id">
              {{ field.label }}
              <span v-if="field.required" class="required">*</span>
            </label>
            
            <!-- Text Input -->
            <InputText 
              v-if="field.type === 'text'"
              :id="field.id"
              v-model="formData[field.id]"
              :placeholder="field.placeholder"
              :class="{ 'p-invalid': fieldErrors[field.id] }"
            />
            
            <!-- Textarea -->
            <Textarea 
              v-else-if="field.type === 'textarea'"
              :id="field.id"
              v-model="formData[field.id]"
              :placeholder="field.placeholder"
              rows="4"
              :class="{ 'p-invalid': fieldErrors[field.id] }"
            />
            
            <!-- Dropdown -->
            <Dropdown 
              v-else-if="field.type === 'select'"
              :id="field.id"
              v-model="formData[field.id]"
              :options="field.options"
              optionLabel="label"
              optionValue="value"
              placeholder="Select an option"
              :class="{ 'p-invalid': fieldErrors[field.id] }"
            />
            
            <!-- Checkbox -->
            <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
              <Checkbox 
                :id="field.id"
                v-model="formData[field.id]"
                :binary="true"
              />
              <label :for="field.id">{{ field.label }}</label>
            </div>
            
            <small v-if="fieldErrors[field.id]" class="p-error">
              {{ fieldErrors[field.id] }}
            </small>
          </div>
          
          <div class="form-actions">
            <Button 
              type="submit" 
              :label="isSubmitting ? 'Submitting...' : 'Submit Form'"
              icon="pi pi-check"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            />
            <Button 
              label="Back to Forms" 
              icon="pi pi-arrow-left" 
              @click="$router.push('/form-select')"
              severity="secondary"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFormStore } from '@/stores/formStore'
import { 
  Card, Button, InputText, Textarea, Dropdown, 
  Checkbox, Message, ProgressSpinner 
} from 'primevue'

const route = useRoute()
const router = useRouter()
const formStore = useFormStore()
const { forms, isLoading, error, hasError } = storeToRefs(formStore)

// Form state
const formData = ref({})
const fieldErrors = ref({})
const isSubmitting = ref(false)

// Get current form
const currentForm = computed(() => {
  const formId = route.params.id
  return forms.value.find(form => form.id === formId)
})

// Mock form fields (replace with real data from your API)
const formFields = computed(() => {
  // This would typically come from your form definition
  return currentForm.value?.fields || [
    {
      id: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      id: 'email',
      type: 'text',
      label: 'Email',
      required: true,
      placeholder: 'Enter your email'
    },
    {
      id: 'message',
      type: 'textarea',
      label: 'Message',
      required: false,
      placeholder: 'Enter your message'
    },
    {
      id: 'category',
      type: 'select',
      label: 'Category',
      required: true,
      options: [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Support Request' },
        { value: 'feedback', label: 'Feedback' }
      ]
    },
    {
      id: 'terms',
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      required: true
    }
  ]
})

const validateForm = () => {
  fieldErrors.value = {}
  let isValid = true

  formFields.value.forEach(field => {
    if (field.required) {
      const value = formData.value[field.id]
      if (!value || (typeof value === 'string' && !value.trim())) {
        fieldErrors.value[field.id] = `${field.label} is required`
        isValid = false
      }
    }
  })

  return isValid
}

const loadForm = async () => {
  if (forms.value.length === 0) {
    await formStore.fetchForms()
  }
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  try {
    isSubmitting.value = true
    
    // Here you would submit the form data
    // await api.post(`forms/${route.params.id}/submissions`, formData.value)
    
    console.log('Form submitted:', formData.value)
    
    // Show success and redirect
    router.push('/form-select')
  } catch (error) {
    console.error('Failed to submit form:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form data when form changes
watch(formFields, (newFields) => {
  const initialData = {}
  newFields.forEach(field => {
    initialData[field.id] = field.type === 'checkbox' ? false : ''
  })
  formData.value = initialData
}, { immediate: true })

onMounted(() => {
  loadForm()
})
</script>

<style scoped>
.form-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header h1 {
  margin: 0 0 0.5rem 0;
}

.form-header p {
  color: #6c757d;
  margin: 0;
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
  margin-top: 2rem;
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
</style>