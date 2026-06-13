<template>
  <div class="album-grid">
    <div
      v-for="album in albums"
      :key="album.id"
      class="album-card"
      @click="$emit('select', album)"
    >
      <div class="album-cover">
        <img
          :src="getCoverArt(album.coverArt, 300)"
          :alt="album.name"
          loading="lazy"
        />
        <div class="overlay">
          <button class="play-btn" @click.stop="playAlbum(album)">
            ♪
          </button>
        </div>
      </div>
      <div class="album-info">
        <h4 class="album-name">{{ album.name }}</h4>
        <p class="album-artist">{{ album.artist }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '@/types/navidrome'
import { usePlayerStore } from '@/stores/player'
import { getCoverArt, getTracksByAlbum } from '@/api/navidrome'

defineProps<{
  albums: Album[]
}>()

defineEmits<{
  select: [album: Album]
  play: [album: Album]
}>()

const playerStore = usePlayerStore()

async function playAlbum(album: Album) {
  const tracks = await getTracksByAlbum(album.id)
  if (tracks.length > 0) {
    playerStore.playTrack(tracks[0], tracks)
  }
}
</script>

<style scoped>
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 8px;
}

.album-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 12px;
  background: var(--bg-tertiary);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-cover img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.album-card:hover .overlay {
  opacity: 1;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px var(--accent-glow);
  transition: var(--transition);
}

.play-btn:hover {
  transform: scale(1.1);
  background: var(--accent-hover);
}

.album-info {
  overflow: hidden;
}

.album-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.album-artist {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
