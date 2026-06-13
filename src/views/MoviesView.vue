<template>
  <div class="media-view">
    <div class="view-header">
      <h1>🎬 影视</h1>
      <p class="view-subtitle">管理你的影视库</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadMovies">重试</button>
    </div>

    <div v-else-if="movies.length === 0" class="empty-state">
      <p>暂无影视</p>
    </div>

    <div v-else class="content-grid">
      <div v-for="movie in movies" :key="movie.id" class="content-card">
        <div class="card-cover movie-cover">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-title">{{ movie.title }}</div>
          <div class="card-subtitle">{{ movie.year }} · {{ movie.director }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Movie } from '@/types/backend'
import { getAllMovies } from '@/api/backend'

const movies = ref<Movie[]>([])
const loading = ref(false)
const error = ref('')

async function loadMovies() {
  loading.value = true
  error.value = ''
  try {
    movies.value = await getAllMovies()
  } catch (e) {
    error.value = '加载影视失败'
    console.error('Failed to load movies:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadMovies)
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

.movie-cover {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
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
