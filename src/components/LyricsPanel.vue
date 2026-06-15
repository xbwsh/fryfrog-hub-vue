<template>
  <div class="lyrics-panel" :class="{ 'split-mode': layoutMode === 'split' }">
    <img v-if="playerStore.currentTrack" :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 600)"
      class="lyrics-bg-image" alt="" />
    <div class="lyrics-bg-overlay" ref="bgOverlay"></div>

    <div class="lyrics-header">
      <h2>歌词</h2>
      <div class="header-actions">
        <span v-if="lyricsSource" class="lyrics-tag">{{ lyricsSource }}</span>
        <button class="mode-toggle-btn" @click="toggleLayoutMode"
          :title="layoutMode === 'full' ? '分屏模式' : '全屏模式'">
          <svg v-if="layoutMode === 'full'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <rect x="3" y="3" width="8" height="18" rx="1" />
            <rect x="13" y="3" width="8" height="18" rx="1" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="1" />
          </svg>
        </button>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <div class="lyrics-body">
      <template v-if="layoutMode === 'split'">
        <div class="left-panel">
          <div class="vinyl-wrapper">
            <div class="vinyl-disc" :class="{ spinning: playerStore.isPlaying }">
              <img v-if="playerStore.currentTrack"
                :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 400)" class="vinyl-cover" alt="封面" />
              <div class="vinyl-hole"></div>
            </div>
          </div>
          <div class="track-meta">
            <h3>{{ playerStore.currentTrack?.title || '未知歌曲' }}</h3>
            <p>{{ playerStore.currentTrack?.artist || '未知艺术家' }}</p>
          </div>
          <div class="controls">
            <button class="ctrl-btn" @click="playerStore.cyclePlayMode" :title="playModeTitle">
              <svg v-if="playerStore.playMode === 'order'" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              <svg v-else-if="playerStore.playMode === 'shuffle'" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                <text v-if="playerStore.playMode === 'repeat_one'" x="12" y="13" text-anchor="middle"
                  font-size="10" font-weight="bold" fill="currentColor" stroke="none">1</text>
              </svg>
            </button>
            <button class="ctrl-btn" @click="playerStore.prevTrack" title="上一首">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button class="ctrl-btn play-btn" @click="playerStore.togglePlay" :disabled="!playerStore.currentTrack">
              <svg v-if="!playerStore.isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
            <button class="ctrl-btn" @click="playerStore.nextTrack" title="下一首">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
            <button class="ctrl-btn" @click="toggleMute" :title="playerStore.volume > 0 ? '静音' : '取消静音'">
              <svg v-if="playerStore.volume > 0" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path v-if="playerStore.volume > 0.5" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path v-if="playerStore.volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </button>
            <div class="volume-slider-wrap">
              <input type="range" class="seek-slider volume-slider" min="0" max="1" step="0.01"
                :value="playerStore.volume" @input="onVolumeInput" />
            </div>
          </div>
          <div class="slider-row">
            <span class="time-label">{{ formatTime(playerStore.currentTime) }}</span>
            <input type="range" class="seek-slider" min="0" :max="playerStore.duration || 0" step="0.1"
              :value="playerStore.currentTime" @input="onSeekInput" />
            <span class="time-label">{{ formatTime(playerStore.duration) }}</span>
          </div>
        </div>
      </template>

      <div class="right-panel">
        <div v-if="layoutMode === 'full'" class="full-track-info">
          <h3>{{ playerStore.currentTrack?.title || '未知歌曲' }}</h3>
          <p>{{ playerStore.currentTrack?.artist || '未知艺术家' }}</p>
        </div>
        <div class="lyrics-scroll" ref="lyricsContainer">
          <div v-for="(lyric, index) in parsedLyrics" :key="index" class="lyric-line" :class="{
            active: index === currentLyricIndex,
            'near-active': Math.abs(index - currentLyricIndex) === 1,
            'far-active': Math.abs(index - currentLyricIndex) === 2
          }" @click="seekToLyric(lyric.time)">
            {{ lyric.text }}
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
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { getLyricsBySongId } from '@/api/navidrome'
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const playerStore = usePlayerStore()
defineEmits(['close'])

const lyricsContainer = ref<HTMLElement>()
const bgOverlay = ref<HTMLElement>()
let bgAnimationFrame: number | null = null

const layoutMode = ref<'full' | 'split'>('full')
const lyricsSource = ref<'内嵌' | '外挂' | ''>('')
const fetchedLyrics = ref('')

function toggleLayoutMode() {
  layoutMode.value = layoutMode.value === 'full' ? 'split' : 'full'
  localStorage.setItem('lyricsLayoutMode', layoutMode.value)
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onSeekInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  playerStore.seekTo(val)
}

function toggleMute() {
  playerStore.setVolume(playerStore.volume > 0 ? 0 : 0.8)
}

function onVolumeInput(e: Event) {
  playerStore.setVolume(parseFloat((e.target as HTMLInputElement).value))
}

const playModeTitle = computed(() => {
  const titles: Record<string, string> = {
    order: '顺序播放', shuffle: '随机播放', repeat_all: '列表循环', repeat_one: '单曲循环'
  }
  return titles[playerStore.playMode]
})

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
    if (bgOverlay.value) bgOverlay.value.style.opacity = '0.6'
  }
})

function handleKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' && playerStore.currentTrack) {
    e.preventDefault()
    playerStore.togglePlay()
  }
}

onMounted(() => {
  const saved = localStorage.getItem('lyricsLayoutMode') as 'full' | 'split' | null
  if (saved) layoutMode.value = saved
  if (playerStore.isPlaying) animateBackground()
  window.addEventListener('keydown', handleKeydown)
  loadLyrics()
})

watch(() => playerStore.currentTrack, () => {
  loadLyrics()
})

onUnmounted(() => {
  if (bgAnimationFrame) cancelAnimationFrame(bgAnimationFrame)
  window.removeEventListener('keydown', handleKeydown)
})

const currentLyrics = computed(() => {
  if (!playerStore.currentTrack) return ''
  if ('lyrics' in playerStore.currentTrack && playerStore.currentTrack.lyrics) {
    return playerStore.currentTrack.lyrics
  }
  return fetchedLyrics.value
})

async function loadLyrics() {
  fetchedLyrics.value = ''
  lyricsSource.value = ''
  if (!playerStore.currentTrack) return

  const track = playerStore.currentTrack
  if ('lyrics' in track && track.lyrics) {
    lyricsSource.value = '内嵌'
    return
  }

  if ('id' in track) {
    try {
      const lyrics = await getLyricsBySongId(String(track.id))
      if (lyrics) {
        fetchedLyrics.value = lyrics
        lyricsSource.value = '外挂'
      }
    } catch {
      // silent
    }
  }
}

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
      if (text) result.push({ time, text })
    }
  }
  return result
})

const currentLyricIndex = computed(() => {
  const lyrics = parsedLyrics.value
  if (!lyrics.length) return -1
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (playerStore.currentTime >= lyrics[i].time) return i
  }
  return -1
})

watch(currentLyricIndex, async (newIndex, oldIndex) => {
  if (newIndex !== oldIndex && lyricsContainer.value) {
    await nextTick()
    const active = lyricsContainer.value.querySelector('.lyric-line.active')
    active?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})

function seekToLyric(time: number) {
  if (playerStore.duration > 0) playerStore.seekTo(time)
}
</script>

<style scoped>
.lyrics-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--bg-primary);
  overflow: hidden;
  color: #fff;
}

.lyrics-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  filter: blur(60px) brightness(0.7);
}

.lyrics-bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 0;
}

.lyrics-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
}

.lyrics-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-toggle-btn,
.close-btn {
  background: none;
  border: none;
  color: #fff;
  opacity: 0.7;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.mode-toggle-btn:hover,
.close-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.lyrics-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* ===== body ===== */
.lyrics-body {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== left panel (split) ===== */
.left-panel {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 32px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.vinyl-wrapper {
  width: 260px;
  height: 260px;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(circle, #222 0%, #111 60%, #000 100%);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-disc::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.vinyl-disc::after {
  content: '';
  position: absolute;
  inset: 30%;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.vinyl-disc.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.vinyl-cover {
  width: 65%;
  height: 65%;
  border-radius: 50%;
  object-fit: cover;
}

.vinyl-hole {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid #333;
  z-index: 1;
}

.track-meta {
  text-align: center;
}

.track-meta h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.track-meta p {
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
}

/* ===== controls ===== */
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctrl-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.play-btn {
  width: 56px;
  height: 56px;
  background: #fff;
  color: #000;
}

.play-btn:hover {
  transform: scale(1.08);
}

.play-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.volume-slider-wrap {
  width: 100px;
  display: flex;
  align-items: center;
}

.volume-slider {
  width: 100%;
}

/* ===== slider row ===== */
.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
}

.time-label {
  font-size: 12px;
  opacity: 0.6;
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.seek-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.seek-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.seek-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
}

/* ===== right panel (lyrics) ===== */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 32px 40px;
}

.full-track-info {
  text-align: center;
  margin-bottom: 24px;
}

.full-track-info h3 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
}

.full-track-info p {
  margin: 0;
  font-size: 15px;
  opacity: 0.7;
}

.lyrics-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  text-align: center;
}

.lyrics-scroll::-webkit-scrollbar {
  width: 0;
}

.lyric-line {
  font-size: 22px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 6px 20px;
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  transform: scale(0.95);
  max-width: 100%;
  word-wrap: break-word;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.lyric-line:hover {
  color: rgba(255, 255, 255, 0.7);
}

.lyric-line.far-active {
  color: rgba(255, 255, 255, 0.5);
  transform: scale(0.98);
}

.lyric-line.near-active {
  color: rgba(255, 255, 255, 0.7);
  transform: scale(1);
}

.lyric-line.active {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  transform: scale(1.05);
}

.lyric-line.active .lyric-text,
.lyric-line.active {
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
    text-shadow:
      0 0 15px rgba(232, 93, 74, 0.9),
      0 0 30px rgba(232, 93, 74, 0.6),
      0 0 45px rgba(232, 93, 74, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.8);
  }

  50% {
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
  opacity: 0.4;
}

.no-lyrics p {
  margin: 0;
  font-size: 16px;
}

/* ===== mobile ===== */
@media screen and (max-width: 900px) {
  .lyrics-body {
    flex-direction: column;
  }

  .left-panel {
    flex: none;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    gap: 12px;
  }

  .vinyl-wrapper {
    width: 160px;
    height: 160px;
  }

  .ctrl-btn {
    width: 40px;
    height: 40px;
  }

  .play-btn {
    width: 50px;
    height: 50px;
  }

  .right-panel {
    padding: 20px;
  }
}
</style>
