<template>
  <div class="case-profile">
    <Skeleton v-if="isLoading" width="100%" height="3rem" />
    <Card v-else>
      <template #title>
        <h3 class="card-title">Case Profile</h3>
      </template>

      <template #content>
        <div class="form-section">
          <h3>Client Information</h3>

          <div class="p-fluid p-formgrid p-grid">
            <!-- First & Last -->
            <div class="p-field p-col-12">
              <div class="name-row">
                <div class="name-col">
                  <IftaLabel class="w-full">
                    <InputText id="firstName" v-model="form.firstName" placeholder="First Name" showClear fluid />
                    <label for="firstName">First Name</label>
                  </IftaLabel>
                </div>

                <div class="name-col">
                  <IftaLabel class="w-full">
                    <InputText id="lastName" v-model="form.lastName" placeholder="Last Name" showClear fluid />
                    <label for="lastName">Last Name</label>
                  </IftaLabel>
                </div>
              </div>
            </div>

            <!-- Gender -->
            <div class="p-field p-col-12">
              <SelectButton v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value"
                :allowEmpty="false" aria-label="Select biological sex" class="w-full" />
            </div>

            <!-- Country -->
            <div class="p-field p-col-12">
              <IftaLabel class="w-full">
                <Dropdown id="country" v-model="form.country" :options="countries" optionLabel="name" dataKey="code"
                  placeholder="Select a Country" showClear fluid>
                  <!-- selected value -->
                  <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center">
                      <span class="mr-2">{{ flagEmoji(slotProps.value.code) }}</span>
                      <span>{{ slotProps.value.name }}</span>
                    </div>
                    <span v-else>Select a Country</span>
                  </template>

                  <!-- dropdown options -->
                  <template #option="slotProps">
                    <div class="flex items-center">
                      <span class="mr-2">{{ flagEmoji(slotProps.option.code) }}</span>
                      <span>{{ slotProps.option.name }}</span>
                    </div>
                  </template>
                </Dropdown>
                <label for="country">Country of Origin</label>
              </IftaLabel>
            </div>

            <!-- Contact -->
            <div class="p-field p-col-12">
              <IftaLabel class="w-full">
                <InputText id="contact" v-model="form.contact" placeholder="email@example.org" showClear fluid />
                <label for="contact">Contact (optional)</label>
              </IftaLabel>
            </div>
          </div>

          <!-- Confirm Button -->
          <div class="actions">
            <Button label="Confirm and Continue" icon="pi pi-check" class="p-button-lg p-button-primary"
              :disabled="!canContinue" @click="goToNext" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// PrimeVue components
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import IftaLabel from 'primevue/iftalabel'

// Your store
import { useProfileStore } from '@/stores/profileStore'
import { Skeleton } from 'primevue'

const router = useRouter()
const profileStore = useProfileStore()
const isLoading = computed(() => profileStore.isLoading)

// form state
const form = ref({
  firstName: '',
  lastName: '',
  gender: '',
  country: null,
  contact: ''
})

// gender & country options
const genderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' }
]

const countries = [
  { name: 'Switzerland', code: 'CH' },
  { name: 'Germany', code: 'DE' },
  { name: 'Italy', code: 'IT' },
  { name: 'France', code: 'FR' },
  { name: 'Eritrea', code: 'ER' },
  { name: 'Syria', code: 'SY' },
  { name: 'Afghanistan', code: 'AF' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'Turkey', code: 'TR' }
]

// emoji flag generator
function flagEmoji(code) {
  const s = String(code).toUpperCase()
  const cc = s === 'UK' ? 'GB' : s
  const base = 0x1F1E6
  const toRegional = c => String.fromCodePoint(base + (c.charCodeAt(0) - 65))
  return toRegional(cc[0]) + toRegional(cc[1])
}

// validation
const canContinue = computed(() =>
  form.value.firstName.trim() &&
  form.value.lastName.trim() &&
  form.value.gender &&
  form.value.country?.code
)

// next page
async function goToNext() {
  const fullName = `${form.value.firstName} ${form.value.lastName}`.trim()
  await profileStore.postProfile({
    name: fullName,
    biologicalSex: form.value.gender,
    country: form.value.country.name,
    countryRequested: form.value.country.code,
    contact: form.value.contact
  })
  router.push({ name: 'FormSelect' })
}
</script>

<style scoped>
.case-profile {
  max-width: 980px;
  margin: 0 auto;
  padding: 2rem;
}

.form-section h3 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

/* First & Last inline layout */
.name-row {
  display: flex;
  gap: 1.5rem;
}

.name-col {
  flex: 1;
}

/* unified spacing */
.p-formgrid .p-field {
  margin-bottom: 1.2rem;
}

/* selectbutton layout */
:deep(.p-selectbutton) {
  display: flex;
  gap: 0.5rem;
}

:deep(.p-selectbutton .p-button) {
  flex: 1;
  padding: 0.6rem 1rem;
}


:deep(.p-inputtext),
:deep(.p-dropdown) {
  width: 100%;
}

/* responsive layout */
@media (max-width: 768px) {
  .name-row {
    flex-direction: column;
    gap: 1rem;
  }
}

/* centered button */
.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

/* Increase space between flag and country name in dropdown */
.mr-2 {
  margin-right: 0.5rem;
}

/* Center the Card title */
.card-title {
  text-align: center;
  margin: 0;
}
</style>
