<template>
  <div class="case-profile">
    <Card>
      <template #title>
        <h1>Case Profile</h1>
      </template>

      <template #content>
        <div class="form-section">
          <h3>Client Information</h3>

          <!-- grid -->
          <div class="p-fluid p-formgrid p-grid">

            <!-- First Name -->
            <div class="p-field p-col-12 p-md-6">
              <IftaLabel class="w-full">
                <InputText id="firstName" v-model="form.firstName" class="w-full" />
                <label for="firstName">First Name</label>
              </IftaLabel>
            </div>

            <!-- Last Name -->
            <div class="p-field p-col-12 p-md-6">
              <IftaLabel class="w-full">
                <InputText id="lastName" v-model="form.lastName" class="w-full" />
                <label for="lastName">Last Name</label>
              </IftaLabel>
            </div>

            <!-- Gender (SelectButton, no label text) -->
            <div class="p-field p-col-12 p-md-6">
              <SelectButton
                v-model="form.gender"
                :options="genderOptions"
                optionLabel="label"
                optionValue="value"
                :allowEmpty="false"
                aria-label="Select gender"
                class="w-full"
              />
            </div>

            <!-- Country (Dropdown + Emoji flag with IftaLabel) -->
            <div class="p-field p-col-12 p-md-6">
              <IftaLabel class="w-full">
                <Dropdown
                  id="country"
                  v-model="form.country"
                  :options="countries"
                  optionLabel="name"
                  dataKey="code"
                  placeholder="Select a Country"
                  class="w-full"
                >
                  <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center">
                      <span class="mr-2">{{ flagEmoji(slotProps.value.code) }}</span>
                      <span>{{ slotProps.value.name }}</span>
                    </div>
                    <span v-else>Select a Country</span>
                  </template>
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
            <div class="p-field p-col-12 p-md-6">
              <IftaLabel class="w-full">
                <InputText id="contact" v-model="form.contact" class="w-full" placeholder="email@example.org" />
                <label for="contact">Contact (optional)</label>
              </IftaLabel>
            </div>

          </div>

          <!-- Confirm Button -->
          <div class="actions">
            <Button
              label="Confirm and Continue"
              icon="pi pi-check"
              class="p-button-lg p-button-primary"
              :disabled="!canContinue"
              @click="goToNext"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import IftaLabel from 'primevue/iftalabel'

const router = useRouter()

// form state
const form = ref({
  firstName: '',
  lastName: '',
  gender: '',
  country: null, // { name, code }
  contact: ''
})

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

// Emoji flag
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

// navigate
function goToNext() {
  const fullName = `${form.value.firstName} ${form.value.lastName}`.trim()
  router.push({
    name: 'FormSelect',
    query: {
      name: fullName,
      gender: form.value.gender,
      country: form.value.country.name,
      countryCode: form.value.country.code,
      contact: form.value.contact
    }
  })
}
</script>

<style scoped>
.case-profile { max-width: 860px; margin: 0 auto; padding: 2rem; }
.form-section h3 { margin-bottom: 1rem; color: var(--text-color); }

/* Grid field spacing */
.p-formgrid .p-field { margin-bottom: 1rem; }

/* Adjust SelectButton padding */
:deep(.p-selectbutton .p-button) { padding: .5rem 1rem; }

.actions { margin-top: 2rem; display: flex; justify-content: center; }
</style>