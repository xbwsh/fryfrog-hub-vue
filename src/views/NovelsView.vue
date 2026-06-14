<template>
  <div class="ebooks-view">
    <div class="view-header">
      <div class="header-left">
        <h1>📖 电子书</h1>
        <p class="view-subtitle">管理你的电子书库</p>
      </div>
      <div class="header-actions">
        <div class="search-bar">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索电子书..." @input="handleSearch" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadEbooks">重试</button>
    </div>

    <div v-else-if="ebooks.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <p>暂无电子书</p>
    </div>

    <div v-else class="content-grid">
      <div v-for="book in ebooks" :key="book.id" class="content-card">
        <div class="card-cover ebook-cover">
          <img :src="getEbookCoverUrl(book.id)" :alt="book.title" @error="onImageError" />
          <div class="card-actions">
            <button
              class="action-btn read-btn"
              @click.stop="readEbook(book)"
              title="在线阅读"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </button>
            <button
              class="action-btn download-btn"
              @click.stop="downloadEbook(book)"
              title="下载"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button
              class="action-btn favorite-btn"
              :class="{ active: book.favorite }"
              @click.stop="handleToggleFavorite(book)"
              :title="book.favorite ? '取消收藏' : '收藏'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" :fill="book.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
          <div class="card-badge" v-if="book.format">{{ book.format }}</div>
        </div>
        <div class="card-info">
          <div class="card-title">{{ book.title }}</div>
          <div class="card-meta">{{ book.author }}</div>
        </div>
      </div>
    </div>

    <EbookReader
      v-if="readingBook"
      :ebook-id="readingBook.id"
      :ebook-title="readingBook.title"
      @close="readingBook = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ebook } from '@/types/backend'
import { getAllEbooks, searchEbooks, toggleEbookFavorite, getEbookCoverUrl, getEbookDownloadUrl } from '@/api/backend'
import EbookReader from '@/views/EbookReader.vue'

const ebooks = ref<Ebook[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const readingBook = ref<Ebook | null>(null)

async function loadEbooks() {
  loading.value = true
  error.value = ''
  try {
    ebooks.value = await getAllEbooks()
  } catch (e) {
    error.value = '加载电子书失败'
    console.error('Failed to load ebooks:', e)
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    await loadEbooks()
    return
  }
  loading.value = true
  error.value = ''
  try {
    ebooks.value = await searchEbooks(searchQuery.value)
  } catch (e) {
    error.value = '搜索失败'
    console.error('Search failed:', e)
  } finally {
    loading.value = false
  }
}

async function handleToggleFavorite(book: Ebook) {
  try {
    const updated = await toggleEbookFavorite(book.id, !book.favorite)
    if (updated) {
      const index = ebooks.value.findIndex(b => b.id === book.id)
      if (index !== -1) ebooks.value[index] = updated
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function downloadEbook(book: Ebook) {
  const url = getEbookDownloadUrl(book.id)
  const a = document.createElement('a')
  a.href = url
  a.download = book.fileName
  a.click()
}

function readEbook(book: Ebook) {
  readingBook.value = book
}

onMounted(loadEbooks)
</script>

<style scoped>
.ebooks-view {
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

.ebook-cover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.favorite-btn {
  position: static;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: var(--transition);
}

.content-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.action-btn:hover {
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #ff6b6b;
  background: rgba(0, 0, 0, 0.5);
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
