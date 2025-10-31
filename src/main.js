import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
import './assets/custom-theme.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
});

app.mount('#app')
// Runtime override: ensure our primary color variable takes precedence over theme CSS
// This sets the CSS variables directly on the root element (highest precedence for custom properties)
const _root = document.documentElement
_root.style.setProperty('--p-primary-color', '#0072bc')
_root.style.setProperty('--p-primary-contrast-color', '#ffffff')
_root.style.setProperty('--p-primary-500', '#0072bc')
_root.style.setProperty('--p-primary-600', '#005f8c')
