<template>
  <Toast
    :message="toast.state.value.message"
    :type="toast.state.value.type"
    :visible="toast.state.value.visible"
    @update:visible="toast.hide"
  />
</template>

<script setup lang="ts">
import Toast from './Toast.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()
</script>
