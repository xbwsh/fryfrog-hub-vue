<template>
  <div class="home-view">
    <section class="section">
      <div class="section-header">
        <h2>为你推荐</h2>
        <button class="refresh-btn" @click="loadFeatured">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          刷新
        </button>
      </div>
      <div class="featured-playlist" v-if="featuredTracks.length > 0">
        <div class="featured-card" @click="playFeatured">
          <div class="featured-cover">
            <img
              v-if="featuredTracks[0]?.coverArt"
              :src="getCoverArt(featuredTracks[0].coverArt, 400)"
              alt="推荐封面"
            />
          </div>
          <div class="featured-info">
            <span class="featured-label">精选播放</span>
            <h3>随机推荐</h3>
            <p>{{ featuredTracks.length }} 首歌曲</p>
          </div>
        </div>
        <button class="show-tracks-btn" @click="showTracks = !showTracks">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: showTracks }">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {{ showTracks ? '收起列表' : '查看歌曲列表' }}
        </button>
        <div v-if="showTracks" class="featured-tracks-list">
          <div
            v-for="(track, index) in featuredTracks"
            :key="track.id"
            class="featured-track-item"
            @click="playTrack(track)"
          >
            <span class="track-index">{{ index + 1 }}</span>
            <div class="track-info">
              <span class="track-title">{{ track.title }}</span>
              <span class="track-artist">{{ track.artist }}</span>
            </div>
            <span class="track-duration">{{ formatDuration(track.duration) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="loading-placeholder">加载中...</div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>最近添加</h2>
        <router-link to="/navidrome/albums" class="see-all">查看全部</router-link>
      </div>
      <AlbumGrid
        :albums="recentAlbums"
        @select="selectAlbum"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Album as AlbumType, Track } from '@/types/navidrome'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import AlbumGrid from '@/components/AlbumGrid.vue'
import { useRouter } from 'vue-router'
import { getCoverArt } from '@/api/navidrome'

const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const router = useRouter()

const featuredTracks = computed(() => libraryStore.featuredTracks)
const showTracks = ref(false)

const recentAlbums = computed(() => libraryStore.albums.slice(0, 10))

function loadFeatured() {
  libraryStore.loadFeatured()
}

function playFeatured() {
  if (featuredTracks.value.length > 0) {
    playerStore.playTrack(featuredTracks.value[0], featuredTracks.value)
  }
}

function playTrack(track: Track) {
  playerStore.playTrack(track, featuredTracks.value)
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function selectAlbum(album: AlbumType) {
  router.push({ name: 'album-detail', params: { id: album.id }, query: { name: album.name, artist: album.artist } })
}

onMounted(() => {
  libraryStore.loadAlbums()
  libraryStore.loadFeatured()
})
</script>

<style scoped>
.home-view {
  padding: 24px 32px;
  overflow-y: auto;
  height: 100%;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
}

.see-all {
  font-size: 13px;
  color: var(--text-muted);
  transition: var(--transition);
}

.see-all:hover {
  color: var(--accent);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.refresh-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.featured-playlist {
  margin: 0 -8px;
}

.featured-card {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, var(--accent) 0%, #c0392b 100%);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition);
}

.featured-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(232, 93, 74, 0.3);
}

.featured-cover {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.featured-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.featured-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.featured-info h3 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
}

.featured-info p {
  font-size: 14px;
  opacity: 0.8;
}

.loading-placeholder {
  color: var(--text-muted);
  padding: 40px;
  text-align: center;
}

.show-tracks-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}

.show-tracks-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.show-tracks-btn svg {
  transition: transform 0.2s ease;
}

.show-tracks-btn svg.rotated {
  transform: rotate(180deg);
}

.featured-tracks-list {
  margin-top: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.featured-track-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  cursor: pointer;
  transition: var(--transition);
}

.featured-track-item:hover {
  background: var(--bg-hover);
}

.track-index {
  width: 24px;
  font-size: 13px;
  color: var(--text-muted);
  text-align: right;
  flex-shrink: 0;
}

.featured-track-item:hover .track-index {
  color: var(--accent);
}

.featured-track-item .track-info {
  flex: 1;
  min-width: 0;
}

.featured-track-item .track-title {
  display: block;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.featured-track-item .track-artist {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.track-duration {
  font-size: 13px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
</style>
