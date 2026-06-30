<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast-container" :class="type">
        <div class="toast-icon" v-if="type === 'success'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="toast-icon" v-else-if="type === 'error'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="toast-icon" v-else>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <span v-if="messageHtml" class="toast-message toast-html" v-html="messageHtml"></span>
        <span v-else class="toast-message">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'

const props = defineProps<{
  message: string
  messageHtml?: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

let timer: ReturnType<typeof setTimeout> | null = null

function hide() {
  emit('update:visible', false)
}

watch(() => props.visible, (val) => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (val && props.duration) {
    timer = setTimeout(hide, props.duration)
  }
})

onMounted(() => {
  if (props.visible && props.duration) {
    timer = setTimeout(hide, props.duration)
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  font-size: 14px;
  color: var(--text-primary);
}

.toast-container.success {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}

.toast-container.error {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}

.toast-container.info {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1e40af;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-message {
  white-space: pre-wrap;
  line-height: 1.5;
}

.toast-html :deep(.toast-title) {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.toast-html :deep(.toast-detail) {
  font-size: 13px;
  opacity: 0.85;
}

.toast-html :deep(.toast-time) {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 4px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
