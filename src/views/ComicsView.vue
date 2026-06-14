<template>
  <div class="comics-view">
    <div class="view-header">
      <div class="header-left">
        <h1>📚 漫画</h1>
        <p class="view-subtitle">管理你的漫画库</p>
      </div>
      <div class="header-actions">
        <div class="search-bar">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索漫画..." @input="handleSearch" />
        </div>
      </div>
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
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
      <p>暂无漫画</p>
    </div>

    <div v-else class="content-grid">
      <div
        v-for="comic in comics"
        :key="comic.id"
        class="content-card"
        @click="viewComic(comic)"
      >
        <div class="card-cover comic-cover">
          <img
            :src="getComicCoverUrl(comic.id)"
            :alt="comic.title"
            @error="onImageError"
          />
          <button
            class="favorite-btn"
            :class="{ active: comic.favorite }"
            @click.stop="handleToggleFavorite(comic)"
            :title="comic.favorite ? '取消收藏' : '收藏'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="comic.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <div class="card-badge" v-if="comic.series">{{ comic.series }}</div>
        </div>
        <div class="card-info">
          <div class="card-title">{{ comic.title }}</div>
          <div class="card-meta">
            <span v-if="comic.author">{{ comic.author }}</span>
            <span v-if="comic.volume" class="meta-sep">·</span>
            <span v-if="comic.volume">Vol.{{ comic.volume }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Comic } from '@/types/backend'
import { getAllComics, searchComics, toggleComicFavorite, getComicCoverUrl } from '@/api/backend'

const router = useRouter()
const comics = ref<Comic[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

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

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    await loadComics()
    return
  }

  loading.value = true
  error.value = ''
  try {
    comics.value = await searchComics(searchQuery.value)
  } catch (e) {
    error.value = '搜索失败'
    console.error('Search failed:', e)
  } finally {
    loading.value = false
  }
}

async function handleToggleFavorite(comic: Comic) {
  try {
    const updated = await toggleComicFavorite(comic.id, !comic.favorite)
    if (updated) {
      const index = comics.value.findIndex(c => c.id === comic.id)
      if (index !== -1) {
        comics.value[index] = updated
      }
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

function viewComic(comic: Comic) {
  router.push({ name: 'comic-detail', params: { id: comic.id } })
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(loadComics)
</script>

<style scoped>
.comics-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.view-header {
  padding: 24px 32px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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

.header-actions {
  flex-shrink: 0;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-bar input {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 12px 8px 36px;
  font-size: 14px;
  color: var(--text-primary);
  width: 240px;
  transition: var(--transition);
}

.search-bar input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
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

.empty-state svg {
  color: var(--text-muted);
  opacity: 0.5;
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
  grid-auto-rows: max-content;
  gap: 16px;
  padding: 0 32px 32px;
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
  overflow: hidden;
  position: relative;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comic-cover {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
}

.content-card:hover .favorite-btn {
  opacity: 1;
}

.favorite-btn.active {
  opacity: 1;
  color: #ff6b6b;
  background: rgba(0, 0, 0, 0.5);
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.card-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.card-info {
  padding: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-sep {
  margin: 0 4px;
}

@media screen and (max-width: 767px) {
  .view-header {
    padding: 20px 16px 12px;
    flex-direction: column;
  }

  .search-bar input {
    width: 100%;
  }

  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    padding: 0 16px 16px;
  }
}
</style>
