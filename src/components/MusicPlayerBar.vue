<template>
  <div class="music-player-bar" v-if="playerStore.currentTrack">
    <div class="player-left">
      <div class="track-cover" @click="$emit('toggle-lyrics')">
        <img v-if="playerStore.currentTrack" :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 60)"
          alt="封面" />
      </div>
      <div class="track-info">
        <span class="track-title">{{ playerStore.currentTrack.title }}</span>
        <span class="track-artist">{{ playerStore.currentTrack.artist }}</span>
      </div>
    </div>

    <div class="player-center">
      <div class="player-controls">
        <button class="control-btn star-btn" :class="{ starred: isFavorite }" @click="toggleFavoriteStatus" title="收藏">
          <svg width="16" height="16" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'"
            stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
        <button class="control-btn" @click="playerStore.prevTrack" title="上一首">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button class="control-btn play-btn" @click="playerStore.togglePlay">
          <svg v-if="!playerStore.isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>

        <button class="control-btn" @click="playerStore.nextTrack" title="下一首">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        <button class="control-btn mode-btn" @click="playerStore.cyclePlayMode" :title="playModeTitle">
          <svg v-if="playerStore.playMode === 'order'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <svg v-else-if="playerStore.playMode === 'shuffle'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          <svg v-else-if="playerStore.playMode === 'repeat_all'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            <text x="12" y="14" font-size="8" fill="currentColor" text-anchor="middle" font-weight="bold">1</text>
          </svg>
        </button>
      </div>

      <div class="progress-bar">
        <span class="time">{{ formatTime(playerStore.currentTime) }}</span>
        <div class="progress-track" @click="seek">
          <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
        </div>
        <span class="time">{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>

    <div class="player-right">
      <div class="volume-control">
        <svg v-if="playerStore.volume === 0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
        <svg v-else-if="playerStore.volume < 0.33" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3z"/>
        </svg>
        <svg v-else-if="playerStore.volume < 0.66" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <input type="range" min="0" max="1" step="0.01" :value="playerStore.volume"
          @input="setVolume" class="volume-slider" :style="{ '--volume-percent': (playerStore.volume * 100) + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { toggleFavorite } from '@/api/backend'

const playerStore = usePlayerStore()

defineEmits(['toggle-lyrics'])

const isFavorite = ref(false)

watch(() => playerStore.currentTrack, (track) => {
  if (track && 'favorite' in track) {
    isFavorite.value = track.favorite
  } else {
    isFavorite.value = false
  }
}, { immediate: true })

const playModeTitle = computed(() => {
  const titles = {
    order: '顺序播放',
    shuffle: '随机播放',
    repeat_all: '列表循环',
    repeat_one: '单曲循环',
  }
  return titles[playerStore.playMode]
})

async function toggleFavoriteStatus() {
  if (!playerStore.currentTrack || !('favorite' in playerStore.currentTrack)) return
  const track = playerStore.currentTrack
  try {
    const updated = await toggleFavorite(track.id as number)
    if (updated) {
      isFavorite.value = updated.favorite
      track.favorite = updated.favorite
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

function setVolume(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  playerStore.setVolume(val)
}

function seek(e: MouseEvent) {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  playerStore.seekTo(percent * playerStore.duration)
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.music-player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  gap: 16px;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.track-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: var(--transition);
}

.track-cover:hover {
  transform: scale(1.05);
}

.track-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 2;
  max-width: 500px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.control-btn:hover {
  color: var(--text-primary);
}

.play-btn {
  width: 40px;
  height: 40px;
  background: var(--accent);
  color: white;
}

.play-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.mode-btn.active {
  color: var(--accent);
}

.star-btn {
  color: var(--text-muted);
}

.star-btn.starred {
  color: #f39c12;
}

.star-btn:hover {
  color: #f39c12;
}

.lyrics-btn {
  color: var(--text-muted);
}

.lyrics-btn:hover {
  color: var(--accent);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.time {
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 35px;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
}

.progress-track:hover {
  height: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.player-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--volume-percent, 80%), var(--bg-tertiary) var(--volume-percent, 80%), var(--bg-tertiary) 100%);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .player-right {
    display: none;
  }

  .music-player-bar {
    padding: 0 12px;
  }

  .player-center {
    flex: 1;
  }
}
</style>
