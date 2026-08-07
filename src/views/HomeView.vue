<template>
  <div class="home-view">
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎回来</h1>
      <p class="welcome-subtitle">探索你的视频库</p>
    </div>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <h2>视频</h2>
        </div>
        <router-link to="/videos" class="see-all">查看全部</router-link>
      </div>
      <div class="scroll-wrapper" v-if="seriesList.length > 0">
        <button
          v-show="canScrollLeft"
          class="scroll-btn scroll-btn-left"
          @click="scrollLeft"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div
          class="content-grid"
          ref="videosGrid"
          @wheel="handleWheel"
          @scroll="updateScrollState"
        >
          <div v-for="series in seriesList" :key="series.id" class="content-card" @click="watchVideo(series)">
            <div class="card-cover video-cover">
              <img loading="lazy" :src="resolveApiUrl(series.coverUrl) || getSeriesPosterUrl(series.id)" alt="封面" draggable="false" @error="onImageError" />
            </div>
            <div class="card-info">
              <span class="card-title">{{ series.title }}</span>
              <span class="card-subtitle">{{ series.year }} · {{ series.totalEpisodes || series.episodeCount }} 集</span>
            </div>
          </div>
        </div>
        <button
          v-show="canScrollRight"
          class="scroll-btn scroll-btn-right"
          @click="scrollRight"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="fade-mask fade-mask-left" v-show="canScrollLeft"></div>
        <div class="fade-mask fade-mask-right" v-show="canScrollRight"></div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'video-' + i" class="content-card">
          <div class="card-cover video-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例视频 {{ i }}</span>
            <span class="card-subtitle">2024</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  getAllSeries,
  resolveApiUrl,
  getSeriesPosterUrl,
} from '@/api/backend'
import type { SeriesListDTO } from '@/types/backend'

const router = useRouter()

const seriesList = ref<SeriesListDTO[]>([])

const videosGrid = ref<HTMLElement | null>(null)

const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const grid = videosGrid.value
  if (!grid) return
  canScrollLeft.value = grid.scrollLeft > 10
  canScrollRight.value = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 10
}

function scrollLeft() {
  const grid = videosGrid.value
  if (grid) {
    grid.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

function scrollRight() {
  const grid = videosGrid.value
  if (grid) {
    grid.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

onMounted(async () => {
  try {
    const seriesData = await getAllSeries()
    seriesList.value = seriesData.sort((a, b) => (b.year || 0) - (a.year || 0))
    await nextTick()
    updateScrollState()
  } catch (error) {
    console.error('Failed to load home data:', error)
  }
})

function watchVideo(series: SeriesListDTO) {
  router.push({ name: 'video-detail', params: { id: series.id }, query: { type: series.type } })
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function handleWheel(e: WheelEvent) {
  const grid = videosGrid.value
  if (!grid) return

  const canScrollL = grid.scrollLeft > 0
  const canScrollR = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 1

  if (e.deltaY > 0 && canScrollR) {
    e.preventDefault()
    grid.scrollLeft += e.deltaY
  } else if (e.deltaY < 0 && canScrollL) {
    e.preventDefault()
    grid.scrollLeft += e.deltaY
  }
}
</script>

<style scoped>
.home-view {
  padding: 24px 32px 80px;
  overflow-y: auto;
  height: 100%;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-subtitle {
  color: var(--text-secondary);
  font-size: 15px;
}

.content-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.see-all {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: var(--transition);
}

.see-all:hover {
  color: var(--accent);
}

.scroll-wrapper {
  position: relative;
}

.content-grid {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 8px 4px;
  scroll-behavior: smooth;
}

.content-grid::-webkit-scrollbar {
  display: none;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.scroll-btn:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.scroll-btn-left {
  left: -12px;
}

.scroll-btn-right {
  right: -12px;
}

.fade-mask {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  pointer-events: none;
  z-index: 5;
}

.fade-mask-left {
  left: 0;
  background: linear-gradient(to right, var(--bg-primary) 0%, transparent 100%);
}

.fade-mask-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-primary) 0%, transparent 100%);
}

.content-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  min-width: 160px;
  max-width: 160px;
  flex-shrink: 0;
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
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-cover {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.card-info {
  padding: 12px;
  overflow: hidden;
}

.content-card:hover .card-info {
  overflow-x: auto;
  scrollbar-width: none;
}

.content-card:hover .card-info::-webkit-scrollbar {
  display: none;
}

.card-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-card:hover .card-title {
  overflow-x: auto;
  scrollbar-width: none;
}

.content-card:hover .card-title::-webkit-scrollbar {
  display: none;
}

.card-subtitle {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media screen and (max-width: 767px) {
  .welcome-section {
    margin-bottom: 20px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .welcome-subtitle {
    font-size: 13px;
  }

  .content-section {
    margin-bottom: 28px;
  }

  .section-header {
    margin-bottom: 12px;
  }

  .section-header h2 {
    font-size: 16px;
  }

  .content-card {
    min-width: 120px;
    max-width: 120px;
  }

  .content-grid {
    gap: 10px;
  }

  .section-title {
    min-width: 0;
    overflow: hidden;
  }
}
</style>
