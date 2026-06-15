<template>
  <div class="komga-view">
    <div class="library-header">
      <h2>漫画库</h2>
      <span class="series-count">{{ seriesList.length }} 个系列</span>
    </div>
    
    <div class="series-grid">
      <div 
        v-for="series in seriesList" 
        :key="series.id" 
        class="series-card"
        @click="selectSeries(series)"
      >
        <div class="series-cover">
          <img 
            :src="getSeriesCover(series.id)" 
            :alt="series.name"
            class="cover-image"
            @error="handleImageError($event)"
          />
          <div v-if="series.booksUnreadCount > 0" class="unread-badge">
            {{ series.booksUnreadCount }}
          </div>
        </div>
        <div class="series-info">
          <h3 class="series-name">{{ blurTitle(series.name) }}</h3>
          <p class="series-meta">{{ series.booksCount }} 卷</p>
        </div>
      </div>
    </div>
    
    <div v-if="selectedSeries" class="series-detail">
      <button class="back-btn" @click="selectedSeries = null">← 返回</button>
      <h2>{{ blurTitle(selectedSeries.name) }}</h2>
      <div class="books-list">
        <div 
          v-for="book in booksList" 
          :key="book.id" 
          class="book-item"
          :class="{ read: book.readProgress !== null && book.readProgress >= 100 }"
          @click="openReader(book)"
        >
          <img 
            :src="getBookCover(book.id)" 
            :alt="book.title"
            class="book-cover"
            @error="handleImageError($event)"
          />
          <div class="book-info">
            <span class="book-title">{{ blurTitle(book.metadata?.title || book.name) }}</span>
            <span class="book-number">第 {{ book.metadata?.number || book.number }} 卷 · {{ book.media?.pagesCount || 0 }} 页</span>
          </div>
          <div class="book-status">
            <span v-if="book.readProgress !== null" class="status-read">✓ 已读</span>
            <span v-else class="status-unread">未读</span>
          </div>
          <button class="read-btn">阅读</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSeries, getBooks, getSeriesThumbnailBlob, getBookThumbnailBlob } from '@/api/komga'

const router = useRouter()
const seriesList = ref<any[]>([])
const booksList = ref<any[]>([])
const selectedSeries = ref<any>(null)
const seriesCovers = ref<Record<string, string>>({})
const bookCovers = ref<Record<string, string>>({})

async function loadSeries() {
  seriesList.value = await getSeries()
  await loadSeriesCovers()
}

async function loadSeriesCovers() {
  for (const series of seriesList.value) {
    const coverUrl = await getSeriesThumbnailBlob(series.id)
    if (coverUrl) {
      seriesCovers.value[series.id] = coverUrl
    }
  }
}

async function selectSeries(series: any) {
  selectedSeries.value = series
  booksList.value = await getBooks(0, 50, series.id)
  await loadBookCovers()
}

async function loadBookCovers() {
  for (const book of booksList.value) {
    const coverUrl = await getBookThumbnailBlob(book.id)
    if (coverUrl) {
      bookCovers.value[book.id] = coverUrl
    }
  }
}

function getSeriesCover(seriesId: string): string {
  return seriesCovers.value[seriesId] || ''
}

function getBookCover(bookId: string): string {
  return bookCovers.value[bookId] || ''
}

function blurTitle(title: string): string {
  return title
}

function openReader(book: any) {
  router.push({
    path: '/komga/reader',
    query: {
      bookId: book.id,
      seriesId: book.seriesId,
    },
  })
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%233a3a3a" width="200" height="200"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📚%3C/text%3E%3C/svg%3E'
}

onMounted(() => {
  loadSeries()
})
</script>

<style scoped>
.komga-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.library-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.series-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.series-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--border);
}

.series-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.series-cover {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unread-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-full);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.series-info {
  padding: 12px;
}

.series-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.series-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.series-detail {
  margin-top: 32px;
}

.back-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: var(--transition);
}

.back-btn:hover {
  background: var(--bg-hover);
}

.series-detail h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 12px;
  border: 1px solid var(--border);
  transition: var(--transition);
}

.book-item:hover {
  background: var(--bg-hover);
}

.book-item.read {
  opacity: 0.7;
}

.read-btn {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.read-btn:hover {
  opacity: 0.9;
}

.book-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.book-info {
  flex: 1;
}

.book-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.book-number {
  font-size: 12px;
  color: var(--text-secondary);
}

.book-status {
  font-size: 12px;
  font-weight: 500;
}

.status-read {
  color: #4ade80;
}

.status-progress {
  color: #fbbf24;
}

.status-unread {
  color: var(--text-secondary);
}
</style>