<template>
  <div class="album-detail">
    <div class="album-header" v-if="album">
      <div class="album-cover-large">
        <img
          :src="getCoverArt(album.coverArt, 400)"
          :alt="album.name"
        />
      </div>
      <div class="album-meta">
        <span class="meta-label">专辑</span>
        <h1 class="album-title">{{ album.name }}</h1>
        <p class="album-meta-text">{{ album.artist }} · {{ album.year }}</p>
        <p class="album-meta-text">{{ album.songCount }} 首歌曲</p>
        <button class="btn-play-all" @click="playAll">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          播放全部
        </button>
      </div>
    </div>

    <TrackList
      :tracks="loading ? [] : tracks"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import type { Album, Track } from '@/types/navidrome'
import { ref, onMounted } from 'vue'
import { getCoverArt, getTracksByAlbum } from '@/api/navidrome'
import { usePlayerStore } from '@/stores/player'
import TrackList from './TrackList.vue'

const props = defineProps<{
  album: Album
}>()

const playerStore = usePlayerStore()
const tracks = ref<Track[]>([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    tracks.value = await getTracksByAlbum(props.album.id)
  } catch (e) {
    console.error('加载歌曲失败:', e)
  } finally {
    loading.value = false
  }
})

function playAll() {
  if (tracks.value.length > 0) {
    playerStore.playTrack(tracks.value[0], tracks.value)
  }
}
</script>

<style scoped>
.album-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.album-header {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.album-cover-large {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.album-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.meta-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.album-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta-text {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-play-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: white;
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  transition: var(--transition);
  width: fit-content;
  margin-top: 6px;
}

.btn-play-all:hover {
  background: var(--accent-hover);
  transform: scale(1.03);
}

@media (max-width: 768px) {
  .album-header {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 12px;
  }

  .album-cover-large {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }

  .album-title {
    font-size: 16px;
  }

  .album-meta-text {
    font-size: 11px;
  }

  .btn-play-all {
    padding: 6px 12px;
    font-size: 11px;
    border-radius: 12px;
  }

  .meta-label {
    font-size: 9px;
  }
}
</style>
