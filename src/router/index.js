import { createRouter, createWebHistory } from 'vue-router'
import CaseProfile from '@/views/CaseProfile.vue'
import FormSelect from '@/views/FormSelect.vue'
import Form from '@/views/Form.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/case-profile'
  },
  {
    path: '/case-profile',
    name: 'CaseProfile',
    component: CaseProfile,
    meta: {
      title: 'Case Profile'
    }
  },
  {
    path: '/form-select',
    name: 'FormSelect',
    component: FormSelect,
    meta: {
      title: 'Select Form'
    }
  },
  {
    path: '/form/:id?',
    name: 'Form',
    component: Form,
    props: true,
    meta: {
      title: 'Form'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Optional: Set page titles
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'HelpOS'
  next()
})

export default router