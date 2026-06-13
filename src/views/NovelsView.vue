<template>
  <div class="media-view">
    <div class="view-header">
      <h1>📖 小说</h1>
      <p class="view-subtitle">管理你的小说库</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadNovels">重试</button>
    </div>

    <div v-else-if="novels.length === 0" class="empty-state">
      <p>暂无小说</p>
    </div>

    <div v-else class="content-grid">
      <div v-for="novel in novels" :key="novel.id" class="content-card">
        <div class="card-cover novel-cover">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-title">{{ novel.title }}</div>
          <div class="card-subtitle">{{ novel.author }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Novel } from '@/types/backend'
import { getAllNovels } from '@/api/backend'

const novels = ref<Novel[]>([])
const loading = ref(false)
const error = ref('')

async function loadNovels() {
  loading.value = true
  error.value = ''
  try {
    novels.value = await getAllNovels()
  } catch (e) {
    error.value = '加载小说失败'
    console.error('Failed to load novels:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadNovels)
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

.novel-cover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
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
