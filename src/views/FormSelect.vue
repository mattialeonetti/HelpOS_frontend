<template>
  <div class="form-select">
    <!-- Toolbar -->
    <Toolbar class="topbar nav-toolbar">
      <template #start>
        <Button
          icon="pi pi-plus"
          label="Create Topic"
          text
          plain
          severity="secondary"
          class="create-topic-btn"
          @click="createTopicVisible = true"
        />
      </template>

      <template #end>
        <IconField class="search-field">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="q" placeholder="Search" />
        </IconField>
      </template>
    </Toolbar>

    <!-- loading -->
    <div v-if="isLoading">
      <Skeleton width="50%" height="2rem" />
    </div>

    <Message v-else-if="hasError" severity="error" :closable="false">
      <div class="error-content">
        <p>{{ error }}</p>
        <Button label="Retry" icon="pi pi-refresh" @click="formStore.fetchTopics()" severity="secondary" size="small" />
      </div>
    </Message>

    <!-- Panel -->
    <div v-else class="topics">
      <Panel
        v-for="(topic, idx) in topics"
        :key="topic.id"
        toggleable
        :collapsed="collapsedStates[topic.id] ?? (idx !== 0)"
        class="topic-panel"
        @toggle="onToggle(topic.id)"
        :pt="{
          header:  { class: 'topic-header-pad' },
          content: { class: 'topic-content-pad' }
        }"
      >
        <template #header>
          <div class="topic-header">
            <div class="topic-title">
              <h2 class="m-0">{{ topic.name }}</h2>
              <div class="topic-sub">
                <span class="desc" v-if="topic.description">{{ topic.description }}</span>
                <Tag
                  v-if="(forms[topic.id] || []).length"
                  :value="`${(forms[topic.id] || []).length} forms`"
                  severity="secondary"
                  rounded
                />
              </div>
            </div>
          </div>
        </template>

        <template #icons>
          <Button
            icon="pi pi-plus"
            text
            rounded
            class="p-button-sm create-icon"
            @click.stop="openCreateForm(topic.id)"
            v-tooltip.bottom="'Create Form'"
            aria-label="Create Form"
          />
        </template>

        <template #togglericon>
          <i
            :class="[
              'pi',
              collapsedStates[topic.id] ? 'pi-chevron-down' : 'pi-chevron-up',
              'toggle-arrow'
            ]"
          ></i>
        </template>

        <!-- forms -->
        <div v-if="(forms[topic.id] || []).length" class="forms-list">
          <Card
            v-for="form in forms[topic.id]"
            :key="form.id"
            class="form-card"
            :pt="{
              body:    { class: 'card-body-reset' },
              content: { class: 'card-content-reset' },
              title:   { class: 'card-title-reset' }
            }"
            @click="selectForm(topic.id, form.id)"
          >
            <template #title>
              <h5 class="m-0">{{ form.title }}</h5>
            </template>
            <template #content>
              <p class="m-0 text-muted">{{ form.description }}</p>
            </template>
          </Card>
        </div>

        <div v-else class="empty-forms">
          <i class="pi pi-inbox mr-2" />
          <span>No form yet under this topic.</span>
        </div>
      </Panel>
    </div>

    <!-- Create Topic Dialog -->
    <Dialog v-model:visible="createTopicVisible" modal header="Create topic" class="editor-dialog" :style="{ width: '36rem' }">
      <div class="dialog-form">
        <IftaLabel class="w-full mb-4">
          <InputText id="topicName" v-model="createTopicName" class="w-full" placeholder="Name" />
          <label for="topicName">Name</label>
        </IftaLabel>

        <IftaLabel class="w-full mb-6">
          <InputText id="topicDescription" v-model="createTopicDescription" class="w-full" placeholder="Description" />
          <label for="topicDescription">Description</label>
        </IftaLabel>

        <div class="actions-row">
          <Button type="button" label="Cancel" severity="secondary" @click="createTopicVisible = false" />
          <Button type="button" label="Save" @click="createTopic" />
        </div>
      </div>
    </Dialog>

    <!-- Create Form Dialog -->
    <Dialog v-model:visible="createFormVisible" modal header="Create Form" class="editor-dialog" :style="{ width: '36rem' }">
      <div class="dialog-form">
        <IftaLabel class="w-full mb-4">
          <InputText id="formTitle" v-model="createFormTitle" class="w-full" placeholder="Title" />
          <label for="formTitle">Title</label>
        </IftaLabel>

        <IftaLabel class="w-full mb-6">
          <InputText id="formDescription" v-model="createFormDescription" class="w-full" placeholder="Description" />
          <label for="formDescription">Description</label>
        </IftaLabel>

        <div class="actions-row">
          <Button type="button" label="Cancel" severity="secondary" @click="createFormVisible = false" />
          <Button type="button" label="Save" @click="createForm" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// PrimeVue
import { Panel, Tag, Card, Button, Message, Skeleton, Dialog, InputText, IftaLabel } from 'primevue'
import { Toolbar, IconField, InputIcon } from 'primevue'

import { useFormStore } from '@/stores/formStore'
import { useCaseStore } from '@/stores/caseStore'
import { useProfileStore } from '@/stores/profileStore'
import { useQuestionStore } from '@/stores/questionStore'

const router = useRouter()
const formStore = useFormStore()
const caseStore = useCaseStore()
const profileStore = useProfileStore()
const questionStore = useQuestionStore()
const { topics, forms, isLoading, error, hasError } = storeToRefs(formStore)

const q = ref('') 

const collapsedStates = ref({})
function onToggle(id) {
  collapsedStates.value[id] = !collapsedStates.value[id]
}
function openCreateForm(topicId) {
  createFormTopicId.value = topicId
  createFormVisible.value = true
}
const selectForm = async (topicId, formId) => {
  await caseStore.startCaseRun(topicId, formId, profileStore.profile.id)
  formStore.selectedFormId = formId
  formStore.selectedTopicId = topicId
  questionStore.topicId = topicId
  questionStore.formId = formId
  router.push(`/form/${formId}`)
}

onMounted(async () => {
  await formStore.fetchTopics()
  for (const topic of topics.value) {
    await formStore.fetchFormsForTopic(topic.id)
  }
})

/** Create Topic */
const createTopicVisible = ref(false)
const createTopicName = ref('')
const createTopicDescription = ref('')
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

/** Create Form */
const createFormVisible = ref(false)
const createFormTitle = ref('')
const createFormDescription = ref('')
const createFormTopicId = ref(null)
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
.form-select { padding: 1rem; }


.form-card :deep(.card-body-reset) {
  padding: 0rem 0.6rem;
}
.form-card :deep(.card-content-reset) {
  padding: 0rem 0.6rem;
}
.form-card :deep(.card-title-reset) {
  margin: 0rem 0.6rem;
}

.form-card h5,
.form-card p {
  padding-block: 0.6rem;
}

.topic-panel :deep(.topic-header-pad) {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.topic-panel :deep(.topic-content-pad) {
  padding-top: 0.5rem;
  padding-bottom: 2rem;
}

.nav-toolbar { margin-bottom: 1.0rem; } 

.error-content {
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
}
.topbar {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}
.nav-toolbar {
  border-radius: 3rem;
  padding: 1rem 1rem 1rem 1.5rem;
  background: var(--surface-card);
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
}
.create-topic-btn :deep(.p-button-label) { font-weight: 600; }
.search-field :deep(.p-inputtext) {
  width: 20rem;
  max-width: 36vw;
  border-radius: 9999px;
  padding-left: 2.25rem;
  background: var(--surface-100);
  border-color: transparent;
}
.search-field :deep(.p-inputtext:focus) {
  border-color: var(--primary-color);
  background: var(--surface-card);
}
.search-field :deep(.p-inputicon) {
  left: .75rem;
  color: var(--text-color-secondary);
}
.topics { width: 100%; display: flex; flex-direction: column; gap: 1rem; }
.topic-panel :deep(.p-panel-header) { align-items: center; }
.topic-panel :deep(.p-panel-icons-end) { display: flex; gap: .25rem; }
.topic-header { display: flex; align-items: center; gap: .5rem; }
.topic-title h2 { margin: 0; font-size: 1.5rem; }
.topic-sub { display: flex; align-items: center; gap: .5rem; margin-top: .25rem; }
.topic-sub .desc { color: var(--text-color-secondary); }
.toggle-arrow {
  font-size: 1rem;
  color: var(--text-color-secondary);
  transition: transform 0.2s ease, color 0.2s ease;
}
.toggle-arrow:hover { color: var(--primary-color); }
.create-icon { margin-left: .25rem; }
.forms-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.form-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; width: 100%; }
.form-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,.15); }
.text-muted { color: #666; }
.empty-forms { display: flex; align-items: center; gap: .5rem; color: var(--text-color-secondary); }
.editor-dialog :deep(.p-dialog-content) { padding-top: 1rem; }
.dialog-form { display: flex; flex-direction: column; }
:deep(.p-inputtext) { width: 100%; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.actions-row { display: flex; gap: .5rem; justify-content: flex-end; }
</style>