<template>
  <div class="videos-view">
    <div class="view-header">
      <div class="header-left">
        <h1>视频管理</h1>
        <p class="view-subtitle">管理视频库中的系列与视频</p>
      </div>
      <div class="header-actions">
        <div class="filter-tabs">
          <button :class="{ active: filterType === 'all' }" @click="filterType = 'all'">全部</button>
          <button :class="{ active: filterType === 'movie' }" @click="filterType = 'movie'">电影</button>
          <button :class="{ active: filterType === 'tv' }" @click="filterType = 'tv'">电视剧</button>
        </div>
        <div class="search-bar">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索视频标题..." @input="handleSearch" />
        </div>
      </div>
    </div>

    <div v-if="showFullLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error && !hasRows" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadSeries">重试</button>
    </div>

    <div v-else-if="!hasRows && !searching && searchActive" class="empty-state">
      <p>未找到相关视频</p>
    </div>

    <div v-else-if="!hasRows && !searching && !searchActive" class="empty-state">
      <p>暂无视频</p>
    </div>

    <div v-else class="table-wrap">
      <div v-if="searching || loading" class="table-loading-bar">
        <div class="spinner-mini"></div>
        <span>{{ searching ? '搜索中...' : '加载中...' }}</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>类型</th>
            <th>年份</th>
            <th>评分</th>
            <th>集数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="searchActive">
            <tr v-for="video in searchResults" :key="'v' + video.id" class="row-clickable" @click="viewVideo(video)">
              <td class="cell-id">{{ video.id }}</td>
              <td class="cell-primary">
                <span class="cell-title">{{ video.title }}</span>
                <span v-if="video.seriesTitle" class="cell-sub">{{ video.seriesTitle }}</span>
              </td>
              <td><span class="type-badge" :class="mediaTypeClass(video.mediaType)">{{ mediaTypeLabel(video.mediaType) }}</span></td>
              <td>{{ video.year || '-' }}</td>
              <td class="cell-rating">{{ video.rating ? video.rating.toFixed(1) : '-' }}</td>
              <td>{{ video.episodeNumber ? `第 ${video.episodeNumber} 集` : '-' }}</td>
              <td>
                <span class="status-badge" :class="video.scraped ? 'on' : 'off'">
                  {{ video.scraped ? '已刮削' : '未刮削' }}
                </span>
              </td>
              <td class="cell-actions">
                <span class="action-btn">管理</span>
              </td>
            </tr>
          </template>
          <tr v-else v-for="series in filteredList" :key="'s' + series.id" class="row-clickable" @click="viewSeries(series)">
            <td class="cell-id">{{ series.id }}</td>
            <td class="cell-primary">
              <span class="cell-title">{{ series.title }}</span>
            </td>
            <td>
              <span class="type-badge" :class="mediaTypeClass(series.mediaType)">
                {{ series.type === 'standalone' ? '独立' : mediaTypeLabel(series.mediaType) }}
              </span>
            </td>
            <td>{{ series.year || '-' }}</td>
            <td class="cell-rating">{{ series.rating ? series.rating.toFixed(1) : '-' }}</td>
            <td>{{ getEpisodeCount(series) }}</td>
            <td>
              <span class="status-badge" :class="series.favorite ? 'on' : 'off'">
                {{ series.favorite ? '已收藏' : '-' }}
              </span>
            </td>
            <td class="cell-actions">
              <span class="action-btn">管理</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="totalPages > 0">
        <button :disabled="page === 0" @click="changePage(page - 1)">上一页</button>
        <span class="page-info">第 {{ page + 1 }} / {{ totalPages }} 页 · 共 {{ totalElements }} 条</span>
        <button :disabled="page >= totalPages - 1" @click="changePage(page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SeriesListDTO, VideoDTO } from '@/types/backend'
import { getSeriesPage, searchVideoByTitle } from '@/api/backend'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()

const seriesList = ref<SeriesListDTO[]>([])
const searchResults = ref<VideoDTO[]>([])
const loading = ref(false)
const searching = ref(false)
const error = ref('')
const searchQuery = ref('')
const showSearch = ref(false)
const filterType = ref<'all' | 'movie' | 'tv'>('all')
const page = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const searchTotalPages = ref(0)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let searchSeq = 0

const searchActive = computed(() => showSearch.value && searchQuery.value.trim().length > 0)

const filteredList = computed(() => {
  if (filterType.value === 'all') return seriesList.value
  return seriesList.value.filter(s => mediaTypeClass(s.mediaType) === filterType.value)
})

const hasRows = computed(() =>
  searchActive.value ? searchResults.value.length > 0 : filteredList.value.length > 0,
)

// 仅在没有任何数据可展示时才显示整页加载态，避免搜索/翻页时表格被替换造成闪烁
const showFullLoading = computed(() => !hasRows.value && (loading.value || searching.value))

function mediaTypeClass(mediaType: string | null): 'movie' | 'tv' {
  return (mediaType || '').toLowerCase().startsWith('movie') ? 'movie' : 'tv'
}

function mediaTypeLabel(mediaType: string | null): string {
  return mediaTypeClass(mediaType) === 'movie' ? '电影' : '电视剧'
}

function getEpisodeCount(series: SeriesListDTO): number {
  return series.totalEpisodes || series.episodeCount || 0
}

async function loadSeries() {
  loading.value = true
  error.value = ''
  try {
    const result = await getSeriesPage(page.value, 20)
    seriesList.value = result.content
    totalPages.value = result.totalPages
    totalElements.value = result.totalElements
  } catch (e) {
    error.value = '加载视频失败'
    console.error('Failed to load series:', e)
  } finally {
    loading.value = false
  }
}

async function doBackendSearch(query: string) {
  const seq = ++searchSeq
  searching.value = true
  error.value = ''
  try {
    const result = await searchVideoByTitle(query, page.value, 20)
    if (seq !== searchSeq) return // 已有更新的搜索请求，丢弃过期响应
    searchResults.value = result?.content || []
    searchTotalPages.value = result?.totalPages || 0
  } catch (e) {
    if (seq !== searchSeq) return
    toast.show('搜索失败', 'error')
    console.error('Search failed:', e)
  } finally {
    if (seq === searchSeq) {
      searching.value = false
    }
  }
}

function handleSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
  const q = searchQuery.value.trim()
  if (!q) {
    searchSeq++ // 使在途的搜索请求失效
    searching.value = false
    showSearch.value = false
    searchResults.value = []
    page.value = 0
    loadSeries()
    return
  }
  showSearch.value = true
  page.value = 0
  searchTimer = setTimeout(() => doBackendSearch(q), 350)
}

function changePage(target: number) {
  if (target < 0) return
  if (!searchActive.value && target >= totalPages.value) return
  if (searchActive.value && target >= searchTotalPages.value) return
  page.value = target
  if (searchActive.value) {
    doBackendSearch(searchQuery.value.trim())
  } else {
    loadSeries()
  }
}

function viewSeries(series: SeriesListDTO) {
  router.push({ name: 'video-detail', params: { id: series.id }, query: { type: series.type } })
}

function viewVideo(video: VideoDTO) {
  router.push({ name: 'video-detail', params: { id: video.id } })
}

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
})

onMounted(loadSeries)
</script>

<style scoped>
.videos-view {
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
  display: flex;
  align-items: center;
  gap: 10px;
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

.filter-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 3px;
}

.filter-tabs button {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.filter-tabs button:hover {
  color: var(--text-primary);
}

.filter-tabs button.active {
  background: var(--accent);
  color: white;
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

.table-loading-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.spinner-mini {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
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

.table-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  font-size: 13px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.data-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-tertiary);
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.row-clickable {
  cursor: pointer;
  transition: var(--transition);
}

.row-clickable:hover {
  background: var(--bg-hover);
}

.cell-id {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  color: var(--text-muted);
}

.cell-primary {
  min-width: 220px;
}

.cell-title {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.cell-sub {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.cell-rating {
  font-family: 'SF Mono', 'Menlo', monospace;
  color: #ffd700;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.type-badge.movie {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.type-badge.tv {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.on {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.status-badge.off {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.cell-actions {
  white-space: nowrap;
}

.action-btn {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
}

.pagination button {
  padding: 6px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}

.pagination button:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text-muted);
}

@media screen and (max-width: 767px) {
  .view-header {
    padding: 20px 16px 12px;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .search-bar {
    flex: 1;
  }

  .search-bar input {
    width: 100%;
  }

  .table-wrap {
    padding: 0 16px 16px;
  }
}
</style>
