<template>
  <div class="lyrics-panel">
    <img v-if="playerStore.currentTrack" :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 600)"
      class="lyrics-bg-image" alt="" />
    <div class="lyrics-bg-overlay" ref="bgOverlay"></div>
    <div class="lyrics-header">
      <h2>歌词</h2>
      <button class="close-btn" @click="$emit('close')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div class="lyrics-content-wrapper">
      <div class="lyrics-track-info">
        <div class="lyrics-track-details">
          <h3>{{ playerStore.currentTrack?.title || '未知歌曲' }}</h3>
          <p>{{ playerStore.currentTrack?.artist || '未知艺术家' }}</p>
          <p class="track-album">{{ playerStore.currentTrack?.album || '' }}</p>
        </div>
      </div>

      <div class="lyrics-scroll-container" ref="lyricsContainer">
        <div v-for="(lyric, index) in parsedLyrics" :key="index" class="lyric-line" :class="{
          active: index === currentLyricIndex,
          'near-active': Math.abs(index - currentLyricIndex) === 1,
          'far-active': Math.abs(index - currentLyricIndex) === 2
        }" @click="seekToLyric(lyric.time)">
          <span class="lyric-text">{{ lyric.text }}</span>
        </div>
        <div v-if="parsedLyrics.length === 0" class="no-lyrics">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <p>暂无歌词</p>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const playerStore = usePlayerStore()

defineEmits(['close'])

const lyricsContainer = ref<HTMLElement>()
const bgOverlay = ref<HTMLElement>()
let bgAnimationFrame: number | null = null

function animateBackground() {
  if (!bgOverlay.value) return
  const wave = Math.sin(Date.now() / 2000) * 0.1 + 0.95
  bgOverlay.value.style.opacity = String(0.5 + wave * 0.1)
  bgAnimationFrame = requestAnimationFrame(animateBackground)
}

watch(() => playerStore.isPlaying, (isPlaying) => {
  if (isPlaying) {
    animateBackground()
  } else if (bgAnimationFrame) {
    cancelAnimationFrame(bgAnimationFrame)
    if (bgOverlay.value) {
      bgOverlay.value.style.opacity = '0.6'
    }
  }
})

function handleKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' && playerStore.currentTrack) {
    e.preventDefault()
    playerStore.togglePlay()
  }
}

onMounted(() => {
  if (playerStore.isPlaying) {
    animateBackground()
  }
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (bgAnimationFrame) {
    cancelAnimationFrame(bgAnimationFrame)
  }
  window.removeEventListener('keydown', handleKeydown)
})

const currentLyrics = computed(() => {
  if (!playerStore.currentTrack) return ''
  if ('lyrics' in playerStore.currentTrack) {
    return playerStore.currentTrack.lyrics || ''
  }
  return ''
})

const parsedLyrics = computed(() => {
  if (!currentLyrics.value) return []
  const lines = currentLyrics.value.split('\n')
  const result: { time: number; text: string }[] = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

  for (const line of lines) {
    const match = line.match(timeRegex)
    if (match) {
      const mins = parseInt(match[1])
      const secs = parseInt(match[2])
      const ms = parseInt(match[3])
      const time = mins * 60 + secs + ms / 1000
      const text = line.replace(timeRegex, '').trim()
      if (text) {
        result.push({ time, text })
      }
    }
  }

  return result
})

const currentLyricIndex = computed(() => {
  const lyrics = parsedLyrics.value
  if (!lyrics.length) return -1
  const currentTime = playerStore.currentTime
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i
    }
  }
  return -1
})

watch(currentLyricIndex, async (newIndex, oldIndex) => {
  if (newIndex !== oldIndex && lyricsContainer.value) {
    await nextTick()
    const activeLine = lyricsContainer.value.querySelector('.lyric-line.active')
    if (activeLine) {
      activeLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
})

function seekToLyric(time: number) {
  if (playerStore.duration > 0) {
    playerStore.seekTo(time)
  }
}
</script>

<style scoped>
.lyrics-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.lyrics-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  filter: blur(60px) brightness(0.7);
}

.lyrics-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 0;
}

.lyrics-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex-shrink: 0;
  z-index: 1;
}

.lyrics-header h2 {
  font-family: var(--font-display);
  font-size: var(--lyrics-font-title);
  font-weight: 700;
  color: var(--text-on-dark);
  margin: 0;
  line-height: calc(var(--lyrics-font-title) + 4px);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-on-dark);
  opacity: 0.7;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.3);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.8), 0 0 24px rgba(255, 255, 255, 0.5);
}

.lyrics-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 40px;
  overflow: hidden;
}

.lyrics-track-details {
  text-align: center;
}

.lyrics-track-details h3 {
  font-size: var(--lyrics-font-track);
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.lyrics-track-details p {
  font-size: var(--lyrics-font-artist);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.track-album {
  font-size: var(--lyrics-font-album) !important;
  color: rgba(255, 255, 255, 0.6) !important;
}

.lyrics-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  text-align: center;
}

.lyrics-scroll-container::-webkit-scrollbar {
  width: 0;
}

.lyric-line {
  font-size: var(--lyrics-font-normal);
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 8px 24px;
  border-radius: var(--radius-md);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  transform: scale(0.95);
  max-width: 100%;
  word-wrap: break-word;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  opacity: 0.5;
}

.lyric-line:hover {
  color: rgba(255, 255, 255, 0.8);
  opacity: 0.8;
}

.lyric-line.far-active {
  color: rgba(255, 255, 255, 0.55);
  opacity: 0.7;
  transform: scale(0.98);
}

.lyric-line.near-active {
  color: rgba(255, 255, 255, 0.75);
  opacity: 0.9;
  transform: scale(1);
}

.lyric-line.active {
  font-size: var(--lyrics-font-active);
  font-weight: 700;
  color: #ffffff;
  transform: scale(1.05);
  background: transparent;
  opacity: 1;
}

.lyric-line.active .lyric-text {
  text-shadow:
    0 0 15px rgba(232, 93, 74, 0.9),
    0 0 30px rgba(232, 93, 74, 0.6),
    0 0 45px rgba(232, 93, 74, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    filter: brightness(1);
    text-shadow:
      0 0 15px rgba(232, 93, 74, 0.9),
      0 0 30px rgba(232, 93, 74, 0.6),
      0 0 45px rgba(232, 93, 74, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.8);
  }

  50% {
    filter: brightness(1.15);
    text-shadow:
      0 0 20px rgba(232, 93, 74, 1),
      0 0 40px rgba(232, 93, 74, 0.8),
      0 0 60px rgba(232, 93, 74, 0.5),
      0 2px 8px rgba(0, 0, 0, 0.8);
  }
}

.no-lyrics {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-tertiary);
}

.no-lyrics p {
  font-size: var(--lyrics-font-empty);
  margin: 0;
}
</style>
