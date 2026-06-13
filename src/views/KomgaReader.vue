<template>
  <div class="reader-view">
    <div class="reader-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2>{{ book?.metadata?.title || book?.name }}</h2>
      <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
    </div>
    
    <div class="reader-content" v-if="!loading">
      <img 
        v-if="currentImageUrl"
        :src="currentImageUrl"
        :alt="`Page ${currentPage + 1}`"
        class="page-image"
        @load="onImageLoad"
      />
      <div v-else class="loading-placeholder">加载中...</div>
    </div>
    
    <div v-else class="loading">
      <div class="loading-spinner"></div>
      <p>正在加载漫画...</p>
    </div>
    
    <div class="reader-controls" v-if="!loading">
      <button class="nav-btn prev" @click="prevPage" :disabled="currentPage <= 0">◀ 上一页</button>
      <div class="page-slider">
        <input 
          type="range" 
          :min="0" 
          :max="totalPages - 1" 
          v-model.number="currentPage"
          @change="loadPage"
        />
      </div>
      <button class="nav-btn next" @click="nextPage" :disabled="currentPage >= totalPages - 1">下一页 ▶</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookById, getCurrentConfig } from '@/api/komga'

const route = useRoute()
const router = useRouter()

const book = ref<any>(null)
const pages = ref<any[]>([])
const currentPage = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const currentImageUrl = ref('')
const config = ref<any>(null)

async function loadBook() {
  const bookId = route.query.bookId as string
  if (!bookId) {
    router.back()
    return
  }
  
  try {
    loading.value = true
    config.value = getCurrentConfig()
    book.value = await getBookById(bookId)
    
    if (book.value?.media?.pagesCount) {
      totalPages.value = book.value.media.pagesCount
      pages.value = Array.from({ length: totalPages.value }, (_, i) => i)
    }
    
    await loadPage()
  } catch (error) {
    console.error('Failed to load book:', error)
  } finally {
    loading.value = false
  }
}

async function loadPage() {
  const bookId = route.query.bookId as string
  if (!bookId || totalPages.value === 0 || !config.value?.url) {
    console.log('Missing bookId, totalPages, or config.url')
    return
  }
  
  try {
    currentImageUrl.value = ''
    const pageUrl = `${config.value.url}/api/v1/books/${bookId}/pages/${currentPage.value + 1}`
    
    console.log('Loading page:', pageUrl)
    
    const response = await fetch(pageUrl, {
      headers: getAuthHeaders(),
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const blob = await response.blob()
      console.log('Blob size:', blob.size)
      currentImageUrl.value = URL.createObjectURL(blob)
    } else {
      console.error('Failed to load page:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Failed to load page:', error)
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  
  if (config.value?.apiKey) {
    headers['X-API-Key'] = config.value.apiKey
    console.log('Using API Key auth')
  } else if (config.value?.username && config.value?.password) {
    const auth = btoa(`${config.value.username}:${config.value.password}`)
    headers['Authorization'] = `Basic ${auth}`
    console.log('Using Basic auth')
  }
  
  return headers
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
    loadPage()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    loadPage()
  }
}

function onImageLoad() {
  console.log('Image loaded')
}

function goBack() {
  router.back()
}

watch(currentPage, () => {
  loadPage()
})

onMounted(() => {
  loadBook()
})

onUnmounted(() => {
  if (currentImageUrl.value) {
    URL.revokeObjectURL(currentImageUrl.value)
  }
})
</script>

<style scoped>
.reader-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.reader-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.reader-header h2 {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.reader-content {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: var(--bg-tertiary);
}

.page-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-placeholder {
  color: var(--text-secondary);
  font-size: 14px;
}

.reader-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
}

.nav-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
}

.nav-btn:hover:not(:disabled) {
  background: var(--bg-hover);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-slider {
  flex: 1;
}

.page-slider input[type="range"] {
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.page-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.back-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
}

.back-btn:hover {
  background: var(--bg-hover);
}
</style>
