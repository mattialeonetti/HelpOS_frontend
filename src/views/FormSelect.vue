<template>
  <div class="form-select">
    <div style="display: flex; justify-content: space-between; margin-bottom: 2em;">
      <h1>Select a Form</h1>
      <Button label="Create Topic" icon="pi pi-plus" class="ml-4" @click="createTopicVisible = true" />
    </div>
    <div v-if="isLoading">
      <Skeleton width="50%" height="2rem" />
    </div>

    <Message v-else-if="hasError" severity="error" :closable="false">
      <div class="error-content">
        <p>{{ error }}</p>
        <Button label="Retry" icon="pi pi-refresh" @click="formStore.fetchTopics()" severity="secondary" size="small" />
      </div>
    </Message>

    <div v-else class="accordion-container">
      <Accordion v-model:value="activeAccordionIndex">
        <AccordionPanel v-for="topic in topics" :key="topic.id" :value="topic.id">
          <AccordionHeader>
            <h2>{{ topic.name }}</h2>
          </AccordionHeader>
          <AccordionContent>
            <div style="display: flex;align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <p>{{ topic.description }}</p>
              <Button label="Create Form" icon="pi pi-plus" class="ml-4"
                @click="createFormVisible = true; createFormTopicId = topic.id" />
            </div>
            <div class="forms-list">
              <Card v-for="form in forms[topic.id]" :key="form.id" class="form-card"
                @click="selectForm(topic.id, form.id)">
                <template #title>
                  <h5>{{ form.title }}</h5>
                </template>
                <template #content>
                  <p class="m-0">{{ form.description }}</p>
                </template>
              </Card>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
    <Dialog v-model:visible="createTopicVisible" modal header="Create topic" :style="{ width: '25rem' }">
      <div class="flex items-center gap-4 mb-4">
        <label for="topicName" class="font-semibold w-24">Name</label>
        <InputText id="topicName" v-model="createTopicName" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="topicDescription" class="font-semibold w-24">Description</label>
        <InputText id="topicDescription" v-model="createTopicDescription" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="createTopicVisible = false"></Button>
        <Button type="button" label="Save" @click="createTopic"></Button>
      </div>
    </Dialog>
    <Dialog v-model:visible="createFormVisible" modal header="Create Form" :style="{ width: '25rem' }">
      <div class="flex items-center gap-4 mb-4">
        <label for="formTitle" class="font-semibold w-24">Title</label>
        <InputText id="formTitle" v-model="createFormTitle" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="formDescription" class="font-semibold w-24">Description</label>
        <InputText id="formDescription" v-model="createFormDescription" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="createFormVisible = false"></Button>
        <Button type="button" label="Save" @click="createForm"></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFormStore } from '@/stores/formStore'
import { Card, Button, Message, Skeleton, Accordion, AccordionPanel, AccordionHeader, AccordionContent, Dialog, InputText } from 'primevue'
import { useCaseStore } from '@/stores/caseStore'
import { useQuestionStore } from '@/stores/questionStore'

const router = useRouter()
const formStore = useFormStore()
const caseStore = useCaseStore()
const { topics, forms, isLoading, error, hasError } = storeToRefs(formStore)
const activeAccordionIndex = ref([]) // Array for multiple panels (or use single value for one panel at a time)
const createTopicVisible = ref(false)
const createTopicName = ref('')
const createTopicDescription = ref('')
const createFormVisible = ref(false)
const createFormTitle = ref('')
const createFormDescription = ref('')
const createFormTopicId = ref(null)

const selectForm = async (topicId, formId) => {
  await caseStore.startCaseRun(topicId, formId)
  router.push(`/form/${formId}`)
}

onMounted(async () => {
  await formStore.fetchTopics()
  for (const topic of topics.value) {
    await formStore.fetchFormsForTopic(topic.id)
  }
})

const createTopic = async () => {
  try {
    formStore.addTopic({ name: createTopicName.value, description: createTopicDescription.value })
    createTopicVisible.value = false
    createTopicName.value = ''
    createTopicDescription.value = ''
  } catch (err) {
    console.error('Failed to create topic:', err)
  }
}

const createForm = async () => {
  try {
    formStore.addForm(createFormTopicId.value, { title: createFormTitle.value, description: createFormDescription.value })
    createFormVisible.value = false
    createFormTitle.value = ''
    createFormDescription.value = ''
    createFormTopicId.value = null
  } catch (err) {
    console.error('Failed to create form:', err)
  }
}
</script>

<style scoped>
.form-select {
  padding: 1rem;
}

.error-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.accordion-container {
  width: 100%;
}

.forms-list {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.form-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
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
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>