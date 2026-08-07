<template>
  <div class="favorites-view">
    <div class="view-header">
      <h1>收藏</h1>
      <p class="view-subtitle">你喜欢的视频</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadAll">重试</button>
    </div>

    <div v-else-if="videoList.length === 0" class="empty-state">
      <p>暂无收藏</p>
    </div>

    <div v-else class="content-grid">
      <div
        v-for="item in videoList"
        :key="item.id"
        class="content-card"
        @click="openItem(item)"
      >
        <div class="card-cover">
          <img :src="getVideoCoverUrl(item.id)" :alt="item.title" draggable="false" @error="onCoverError" />
          <button
            class="favorite-btn"
            :class="{ active: item.favorite }"
            @click.stop="handleToggleFavorite(item)"
            :title="item.favorite ? '取消收藏' : '收藏'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="item.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <div class="card-badge" v-if="getBadge(item)">{{ getBadge(item) }}</div>
          <div v-if="item.watchProgressPercent && item.watchProgressPercent > 0" class="card-progress">
            <div class="card-progress-bar">
              <div class="card-progress-fill" :style="{ width: Math.min(item.watchProgressPercent, 100) + '%' }"></div>
            </div>
          </div>
          <div v-if="item.watched" class="card-watched-badge">已看完</div>
        </div>
        <div class="card-info">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">{{ getSubtitle(item) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { VideoDTO } from '@/types/backend'
import {
  getVideoFavorites,
  getVideoCoverUrl,
  toggleVideoFavorite,
} from '@/api/backend'

const router = useRouter()

const loading = ref(false)
const error = ref('')

const videoList = ref<VideoDTO[]>([])

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    videoList.value = await getVideoFavorites()
  } catch (e) {
    error.value = '加载收藏失败'
    console.error('Failed to load favorites:', e)
  } finally {
    loading.value = false
  }
}

function getSubtitle(item: VideoDTO): string {
  return item.director || item.actors || ''
}

function getBadge(item: VideoDTO): string {
  return item.format || ''
}

function onCoverError(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}

function openItem(item: VideoDTO) {
  router.push({ name: 'video-detail', params: { id: item.id } })
}

async function handleToggleFavorite(item: VideoDTO) {
  try {
    const updated = await toggleVideoFavorite(item.id, !item.favorite)
    if (!updated) return
    const index = videoList.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      videoList.value[index] = updated
      if (!updated.favorite) {
        videoList.value.splice(index, 1)
      }
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

onMounted(loadAll)
</script>

<style scoped>
.favorites-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.view-header {
  padding: 24px 32px 16px;
  flex-shrink: 0;
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
  overflow-y: auto;
  padding: 16px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: max-content;
  gap: 20px;
  align-content: start;
}

.content-card {
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition);
}

.content-card:hover {
  transform: translateY(-2px);
}

.card-cover {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-tertiary);
  margin-bottom: 8px;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: var(--transition);
}

.content-card:hover .favorite-btn {
  opacity: 1;
}

.favorite-btn.active {
  opacity: 1;
  color: var(--accent);
  background: rgba(0, 0, 0, 0.7);
}

.card-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 8px 8px;
}

.card-progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.card-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.card-watched-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(46, 204, 113, 0.8);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.card-info {
  padding: 0 4px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
