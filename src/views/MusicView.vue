<template>
  <div class="music-view">
    <div class="view-header">
      <div class="header-left">
        <h1>音乐</h1>
        <p class="view-subtitle">管理你的音乐库</p>
      </div>
      <div class="header-actions">
        <button class="scrape-all-btn" @click="handleScrapeAll" :disabled="scraping">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 0 1-15.36 6.36"/>
            <path d="M3 12a9 9 0 0 1 15.36-6.36"/>
            <polyline points="12 3 12 9 16 11"/>
            <polyline points="12 21 12 15 8 13"/>
          </svg>
          {{ scraping ? '刮削中...' : '批量刮削' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadTracks">重试</button>
    </div>

    <div v-else-if="tracks.length === 0" class="empty-state">
      <p>暂无音乐</p>
    </div>

    <div v-else class="track-list">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="track-item"
        :class="{ active: playerStore.currentTrack?.id === track.id }"
        @click="playTrack(track)"
      >
        <div class="track-cover-small">
          <img :src="getMusicCoverArtUrl(track.id)" alt="封面" />
        </div>
        <div class="track-playing" v-if="playerStore.currentTrack?.id === track.id && playerStore.isPlaying">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
        <div class="track-index" v-else>{{ tracks.indexOf(track) + 1 }}</div>
        <div class="track-info">
          <div class="track-title">{{ track.title }}</div>
          <div class="track-artist">{{ track.artist }} - {{ track.album }}</div>
        </div>
        <div class="track-duration">{{ formatDuration(track.durationSeconds) }}</div>
        <button
          class="scrape-btn"
          :class="{ scraping: scrapingIds.has(track.id) }"
          :disabled="scrapingIds.has(track.id)"
          @click.stop="handleScrapeTrack(track)"
          :title="scrapingIds.has(track.id) ? '刮削中...' : '刮削元数据'"
        >
          <svg v-if="!scrapingIds.has(track.id)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 0 1-15.36 6.36"/>
            <path d="M3 12a9 9 0 0 1 15.36-6.36"/>
            <polyline points="12 3 12 9 16 11"/>
          </svg>
          <div v-else class="scrape-spinner"></div>
        </button>
      </div>
    </div>

    <MusicPlayerBar @toggle-lyrics="showLyrics = !showLyrics" />

    <transition name="lyrics-fade">
      <div class="lyrics-overlay" v-show="showLyrics">
        <LyricsPanel @close="showLyrics = false" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MusicTrack } from '@/types/backend'
import { getAllTracks, getMusicCoverArtUrl, scrapeMusicTrack, scrapeAllMusic } from '@/api/backend'
import { usePlayerStore } from '@/stores/player'
import MusicPlayerBar from '@/components/MusicPlayerBar.vue'
import LyricsPanel from '@/components/LyricsPanel.vue'

const playerStore = usePlayerStore()
const tracks = ref<MusicTrack[]>([])
const loading = ref(false)
const error = ref('')
const showLyrics = ref(false)
const scraping = ref(false)
const scrapingIds = ref(new Set<number>())

async function loadTracks() {
  loading.value = true
  error.value = ''
  try {
    tracks.value = await getAllTracks()
  } catch (e) {
    error.value = '加载音乐失败'
    console.error('Failed to load tracks:', e)
  } finally {
    loading.value = false
  }
}

function playTrack(track: MusicTrack) {
  playerStore.playTrack(track, tracks.value)
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

async function handleScrapeTrack(track: MusicTrack) {
  if (scrapingIds.value.has(track.id)) return
  scrapingIds.value.add(track.id)
  try {
    const updated = await scrapeMusicTrack(track.id)
    if (updated) {
      const idx = tracks.value.findIndex(t => t.id === track.id)
      if (idx !== -1) tracks.value[idx] = updated
    }
  } catch (e) {
    console.error('Failed to scrape track:', e)
  } finally {
    scrapingIds.value.delete(track.id)
  }
}

async function handleScrapeAll() {
  if (scraping.value) return
  scraping.value = true
  try {
    const updated = await scrapeAllMusic()
    if (updated.length > 0) {
      const updatedMap = new Map(updated.map(t => [t.id, t]))
      tracks.value = tracks.value.map(t => updatedMap.get(t.id) || t)
    }
  } catch (e) {
    console.error('Failed to scrape all:', e)
  } finally {
    scraping.value = false
  }
}

onMounted(loadTracks)
</script>

<style scoped>
.music-view {
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

.scrape-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.scrape-all-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--accent);
}

.scrape-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.track-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.track-item:hover {
  background: var(--bg-hover);
}

.track-item.active {
  background: var(--accent-glow);
}

.track-cover-small {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
}

.track-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-playing {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  width: 24px;
  height: 16px;
}

.eq-bar {
  width: 3px;
  background: var(--accent);
  border-radius: 1px;
  animation: eq 0.5s ease-in-out infinite alternate;
}

.eq-bar:nth-child(1) { height: 8px; animation-delay: 0s; }
.eq-bar:nth-child(2) { height: 12px; animation-delay: 0.15s; }
.eq-bar:nth-child(3) { height: 6px; animation-delay: 0.3s; }

@keyframes eq {
  0% { height: 4px; }
  100% { height: 14px; }
}

.track-index {
  width: 24px;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  flex-shrink: 0;
}

.track-item:hover .track-index {
  color: var(--accent);
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-item.active .track-title {
  color: var(--accent);
}

.track-artist {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-duration {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.scrape-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0;
  transition: var(--transition);
}

.track-item:hover .scrape-btn {
  opacity: 1;
}

.scrape-btn:hover:not(:disabled) {
  color: var(--accent);
  background: var(--accent-glow);
}

.scrape-btn:disabled {
  opacity: 1;
  cursor: not-allowed;
}

.scrape-btn.scraping {
  opacity: 1;
}

.scrape-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.lyrics-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.lyrics-fade-enter-active,
.lyrics-fade-leave-active {
  transition: all 0.3s ease;
}

.lyrics-fade-enter-from,
.lyrics-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.lyrics-fade-enter-to,
.lyrics-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media screen and (max-width: 767px) {
  .view-header {
    padding: 20px 16px 12px;
    flex-direction: column;
  }

  .track-item {
    padding: 10px 12px;
  }

  .scrape-btn {
    opacity: 1;
  }
}
</style>
