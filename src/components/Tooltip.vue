<template>
  <div class="tooltip-wrapper" @mouseenter="show = true" @mouseleave="show = false" @focus="show = true" @blur="show = false">
    <slot />
    <Transition name="tooltip">
      <div v-if="show" class="tooltip" :class="[placement]" role="tooltip">
        {{ content }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}>()

const show = ref(false)
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.tooltip {
  position: absolute;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.tooltip.top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip.right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
