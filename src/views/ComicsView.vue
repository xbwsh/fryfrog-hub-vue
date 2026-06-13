<template>
  <div class="media-view">
    <div class="view-header">
      <h1>📚 漫画</h1>
      <p class="view-subtitle">管理你的漫画库</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadComics">重试</button>
    </div>

    <div v-else-if="comics.length === 0" class="empty-state">
      <p>暂无漫画</p>
    </div>

    <div v-else class="content-grid">
      <div v-for="comic in comics" :key="comic.id" class="content-card">
        <div class="card-cover comic-cover">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-title">{{ comic.title }}</div>
          <div class="card-subtitle">{{ comic.author }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Comic } from '@/types/backend'
import { getAllComics } from '@/api/backend'

const comics = ref<Comic[]>([])
const loading = ref(false)
const error = ref('')

async function loadComics() {
  loading.value = true
  error.value = ''
  try {
    comics.value = await getAllComics()
  } catch (e) {
    error.value = '加载漫画失败'
    console.error('Failed to load comics:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadComics)
</script>

<style scoped>
.media-view {
  padding: 24px 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  margin-bottom: 24px;
}

.view-header h1 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.view-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.loading-state,
.error-state,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
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

.error-state button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.error-state button:hover {
  background: var(--accent-hover);
}

.content-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  overflow-y: auto;
}

.content-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
}

.comic-cover {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.card-info {
  padding: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
