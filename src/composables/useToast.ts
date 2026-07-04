import { ref, readonly } from 'vue'

interface ToastState {
  message: string
  messageHtml: string
  type: 'success' | 'error' | 'info'
  visible: boolean
}

const state = ref<ToastState>({
  message: '',
  messageHtml: '',
  type: 'info',
  visible: false,
})

let timer: ReturnType<typeof setTimeout> | null = null

function hide() {
  state.value.visible = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  state.value = { message, messageHtml: '', type, visible: true }
  if (duration > 0) {
    timer = setTimeout(hide, duration)
  }
}

function showHtml(html: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  state.value = { message: '', messageHtml: html, type, visible: true }
  if (duration > 0) {
    timer = setTimeout(hide, duration)
  }
}

export function useToast() {
  return {
    state: readonly(state),
    show,
    showHtml,
    hide,
  }
}
