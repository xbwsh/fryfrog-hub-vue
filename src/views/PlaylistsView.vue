<template>
  <div class="playlists-view">
    <div class="view-header">
      <h1>播放列表</h1>
    </div>

    <div class="playlists-grid">
      <div
        class="playlist-card"
        :class="{ active: selectedPlaylist === 'all' }"
        @click="selectAllTracks"
      >
        <div class="playlist-icon all-songs">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="10 8 16 12 10 16 10 8"/>
            <line x1="21" y1="12" x2="15" y2="12"/>
          </svg>
        </div>
        <div class="playlist-info">
          <h4 class="playlist-name">所有歌曲</h4>
          <p>{{ libraryStore.allTracks.length }} 首歌曲</p>
        </div>
      </div>

      <div
        v-for="playlist in libraryStore.playlists"
        :key="playlist.id"
        class="playlist-card"
        :class="{ active: selectedPlaylist === playlist.id }"
        @click="selectPlaylist(playlist.id)"
      >
        <div class="playlist-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10"/>
            <polygon points="8 6 8 8 11 8 11 6"/>
            <polygon points="8 12 8 14 11 14 11 12"/>
          </svg>
        </div>
        <div class="playlist-info">
          <h4 class="playlist-name">{{ playlist.name }}</h4>
          <p>{{ playlist.size }} 首歌曲</p>
        </div>
      </div>
    </div>

    <div v-if="selectedPlaylist && tracks.length > 0" class="tracks-section">
      <h3>{{ selectedPlaylist === 'all' ? '所有歌曲' : currentPlaylistName }}</h3>
      <TrackList :tracks="tracks" />
    </div>

    <div v-if="libraryStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLibraryStore } from '@/stores/library'
import TrackList from '@/components/TrackList.vue'
import type { Track } from '@/types/navidrome'

const libraryStore = useLibraryStore()
const selectedPlaylist = ref<string | null>('all')
const tracks = ref<Track[]>([])

const currentPlaylistName = computed(() => {
  const playlist = libraryStore.playlists.find(p => p.id === selectedPlaylist.value)
  return playlist?.name || ''
})

async function selectAllTracks() {
  selectedPlaylist.value = 'all'
  if (libraryStore.allTracks.length === 0) {
    await libraryStore.loadAllTracks()
  }
  tracks.value = libraryStore.allTracks
}

async function selectPlaylist(playlistId: string) {
  selectedPlaylist.value = playlistId
  try {
    tracks.value = await libraryStore.getPlaylistPlaylist(playlistId)
  } catch {
    tracks.value = []
  }
}

onMounted(() => {
  libraryStore.loadPlaylists()
  selectAllTracks()
})
</script>

<style scoped>
.playlists-view {
  padding: 24px 32px;
  overflow-y: auto;
  height: 100%;
}

.view-header h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 24px;
}

.playlists-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  cursor: pointer;
}

.playlist-card:hover {
  background: var(--bg-hover);
}

.playlist-card.active {
  background: rgba(232, 93, 74, 0.12);
}

.playlist-card.active .playlist-icon {
  color: var(--accent);
}

.playlist-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-muted);
}

.playlist-info {
  overflow: hidden;
}

.playlist-name {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p {
  font-size: 13px;
  color: var(--text-muted);
}

.playlist-icon.all-songs {
  background: linear-gradient(135deg, var(--accent) 0%, #c0392b 100%);
  color: white;
}

.tracks-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.tracks-section h3 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: var(--text-muted);
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-hover);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
