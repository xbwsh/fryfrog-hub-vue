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

function show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  state.value = { message, messageHtml: '', type, visible: true }

  if (duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, duration)
  }
}

function showHtml(html: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  state.value = { message: '', messageHtml: html, type, visible: true }

  if (duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, duration)
  }
}

function hide() {
  state.value.visible = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function success(message: string, duration?: number) {
  show(message, 'success', duration)
}

function htmlSuccess(html: string, duration?: number) {
  showHtml(html, 'success', duration)
}

function error(message: string, duration?: number) {
  show(message, 'error', duration)
}

function info(message: string, duration?: number) {
  show(message, 'info', duration)
}

export function useToast() {
  return {
    state: readonly(state),
    show,
    showHtml,
    hide,
    success,
    htmlSuccess,
    error,
    info,
  }
}
