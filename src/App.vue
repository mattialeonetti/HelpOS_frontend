<template>
  <div id="app">
    <Menubar :model="menuItems" class="app-menubar">
      <template #start>
        <div class="nav-brand">
          <router-link to="/">
            <i class="pi pi-home"></i>
            HelpOS
          </router-link>
        </div>
      </template>
    </Menubar>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Menubar } from 'primevue'

const router = useRouter()

const menuItems = ref([
  {
    label: 'Case Profile',
    icon: 'pi pi-user',
    command: () => router.push('/case-profile')
  },
  {
    label: 'Forms',
    icon: 'pi pi-file',
    command: () => router.push('/form-select')
  }
])
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

#app {
  min-height: 100vh;
}

.app-menubar {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid #e9ecef;
}

.nav-brand a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--p-primary-600);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.nav-brand a:hover {
  background-color: var(--p-surface-100);
  color: var(--p-primary-700);
}

.main-content {
  min-height: calc(100vh - 70px);
  background-color: var(--surface-ground);
}

/* Custom PrimeVue overrides */
.p-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--surface-200);
}

.p-card-content {
  padding: 1.5rem;
}

.p-button {
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .forms-grid {
    grid-template-columns: 1fr;
  }
}
</style>
