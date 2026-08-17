import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vImgCache } from './directives/imageCache'
import { useThemeStore } from '@/stores/theme'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.directive('img-cache', vImgCache)

useThemeStore(pinia)

app.mount('#app')
