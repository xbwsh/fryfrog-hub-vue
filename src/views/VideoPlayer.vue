<template>
  <div
    class="video-player"
    tabindex="0"
    ref="playerRef"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @dblclick="toggleFullscreen"
    @keydown="onKeydown"
  >
    <video
      ref="videoEl"
      :src="streamUrl"
      autoplay
      class="video-element"
      @loadedmetadata="onMetadataLoaded"
      @durationchange="onDurationChange"
      @timeupdate="onTimeUpdate"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @volumechange="syncVolume"
      @progress="onBufferProgress"
      @ratechange="playbackRate = videoEl?.playbackRate ?? 1"
    >
      <track
        v-if="activeSubtitle"
        kind="subtitles"
        :src="activeSubtitleUrl"
        :srclang="activeSubtitle.language"
        :label="activeSubtitle.label"
        default
        @load="onTrackLoad"
      />
      您的浏览器不支持视频播放
    </video>

    <!-- 中央播放按钮 -->
    <transition name="fade">
      <button v-if="!isPlaying && !isDragging" class="center-play-btn" @click="togglePlay">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
          <polygon points="6,3 20,12 6,21"/>
        </svg>
      </button>
    </transition>

    <!-- 顶栏 -->
    <transition name="fade">
      <div v-show="controlsVisible" class="top-bar">
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <span class="video-title">{{ videoTitle }}</span>
        <span v-if="progressPercent > 0 && !watched" class="progress-badge">{{ Math.round(progressPercent) }}%</span>
        <span v-if="watched" class="progress-badge watched">已看完</span>
      </div>
    </transition>

    <!-- 底栏 -->
    <transition name="fade">
      <div v-show="controlsVisible" class="bottom-bar">
        <!-- 播放/暂停 -->
        <button class="ctrl-btn" @click="togglePlay">
          <svg v-if="isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="white">
            <polygon points="6,3 20,12 6,21"/>
          </svg>
        </button>

        <!-- 进度条 -->
        <div
          class="progress-container"
          ref="progressRef"
          @mouseenter="onProgressHover"
          @mouseleave="onProgressLeave"
          @mousemove="onProgressMouseMove"
          @mousedown="onProgressMouseDown"
        >
          <div class="progress-track">
            <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
            <div class="progress-played" :style="{ width: progressPercent + '%' }">
              <div class="progress-thumb"></div>
            </div>
          </div>
          <div v-if="showHoverTime" class="hover-time" :style="{ left: hoverX + 'px' }">
            {{ formatTime(hoverTimeValue) }}
          </div>
        </div>

        <!-- 时间 -->
        <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>

        <!-- 音量 -->
        <div class="hover-group" @mouseenter="showVolumeSlider = true" @mouseleave="showVolumeSlider = false">
          <button class="ctrl-btn" @click="toggleMute">
            <svg v-if="isMuted || volume === 0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
              <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
            <svg v-else-if="volume < 0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          </button>
          <transition name="fade">
            <div v-if="showVolumeSlider" class="volume-menu hover-panel">
              <div class="volume-menu-label">{{ Math.round(volume * 100) }}%</div>
              <input
                type="range"
                class="volume-slider"
                min="0"
                max="1"
                step="0.05"
                :value="volume"
                @input="onVolumeChange"
              />
            </div>
          </transition>
        </div>

        <!-- 倍速 -->
        <div class="speed-group" @mouseenter="showSpeedMenu = true" @mouseleave="showSpeedMenu = false">
          <button class="ctrl-btn speed-btn">
            {{ playbackRate === 1 ? '倍速' : playbackRate + 'x' }}
          </button>
          <transition name="fade">
            <div v-if="showSpeedMenu" class="speed-menu">
              <button
                v-for="s in speedOptions"
                :key="s"
                class="speed-option"
                :class="{ active: playbackRate === s }"
                @click="setSpeed(s)"
              >
                {{ s === 1 ? '正常' : s + 'x' }}
              </button>
            </div>
          </transition>
        </div>

        <!-- 选集 (hover) -->
        <div v-if="episodes && episodes.length > 0" class="hover-group" @mouseenter="showEpisodes = true" @mouseleave="showEpisodes = false">
          <button class="ctrl-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <transition name="fade">
            <div v-if="showEpisodes" class="side-panel episode-panel hover-panel">
              <div class="panel-header">
                <span>选集 ({{ episodes?.length || 0 }})</span>
                <div class="panel-header-right">
                  <div class="view-mode-toggle">
                    <button :class="{ active: episodeViewMode === 'poster' }" @click="episodeViewMode = 'poster'" title="海报预览">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/></svg>
                    </button>
                    <button :class="{ active: episodeViewMode === 'compact' }" @click="episodeViewMode = 'compact'" title="紧凑视图">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 海报预览视图 -->
              <div v-if="episodeViewMode === 'poster'" class="episode-poster-grid">
                <div
                  v-for="ep in episodes || []"
                  :key="ep.id"
                  class="episode-poster-card"
                  :class="{ active: ep.id === currentEpisodeId }"
                  @click="switchEpisode(ep)"
                >
                  <div class="poster-thumb">
                    <img v-if="ep.backdropUrl" :src="ep.backdropUrl" :alt="'第 ' + ep.episodeNumber + ' 集'" draggable="false" />
                    <img v-else :src="getVideoFanartUrl(ep.id)" :alt="'第 ' + ep.episodeNumber + ' 集'" draggable="false" />
                    <div class="poster-overlay">
                      <div class="poster-play-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    </div>
                    <div v-if="ep.watchProgressPercent! > 0" class="poster-progress">
                      <div class="poster-progress-bar">
                        <div class="poster-progress-fill" :style="{ width: Math.min(ep.watchProgressPercent!, 100) + '%' }"></div>
                      </div>
                    </div>
                    <div v-if="ep.watched" class="poster-watched-badge">已看完</div>
                  </div>
                  <div class="poster-info">
                    <div class="poster-ep-num">第 {{ ep.episodeNumber }} 集</div>
                    <div class="poster-title">{{ ep.title }}</div>
                  </div>
                </div>
              </div>

              <!-- 紧凑视图 -->
              <div v-else class="episode-compact-grid">
                <button
                  v-for="ep in episodes || []"
                  :key="ep.id"
                  class="compact-item"
                  :class="{ active: ep.id === currentEpisodeId, watched: ep.watched }"
                  @click="switchEpisode(ep)"
                >
                  {{ ep.episodeNumber }}
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- 字幕 (hover) -->
        <div v-if="hasSubtitles" class="hover-group" @mouseenter="showSubtitles = true" @mouseleave="showSubtitles = false">
          <button class="ctrl-btn" :class="{ active: activeSubtitle }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="13" rx="2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="6" y1="15" x2="18" y2="15"/>
            </svg>
          </button>
          <transition name="fade">
            <div v-if="showSubtitles" class="side-panel hover-panel">
              <div class="panel-header">
                <span>字幕</span>
              </div>
              <div class="panel-list">
                <button class="panel-item" :class="{ active: !activeSubtitle }" @click="disableSubtitles">
                  <span class="item-title">关闭字幕</span>
                </button>
                <template v-if="subtitleTracks && subtitleTracks.length > 0">
                  <div class="panel-section-label">内封字幕</div>
                  <button
                    v-for="track in subtitleTracks"
                    :key="'internal-' + track.index"
                    class="panel-item"
                    :class="{ active: activeSubtitle?.type === 'internal' && activeSubtitle?.index === track.index }"
                    @click="selectSubtitle({ type: 'internal', index: track.index, language: track.language, label: track.title || track.language })"
                  >
                    <span class="item-title">{{ track.title || track.language }}</span>
                  </button>
                </template>
                <template v-if="externalSubtitles && externalSubtitles.length > 0">
                  <div class="panel-section-label">外挂字幕</div>
                  <button
                    v-for="sub in externalSubtitles"
                    :key="'external-' + sub.fileName"
                    class="panel-item"
                    :class="{ active: activeSubtitle?.type === 'external' && activeSubtitle?.fileName === sub.fileName }"
                    @click="selectSubtitle({ type: 'external', fileName: sub.fileName, language: sub.language, label: sub.fileName })"
                  >
                    <span class="item-title">{{ sub.fileName }}</span>
                  </button>
                </template>
              </div>
            </div>
          </transition>
        </div>

        <!-- 全屏 -->
        <button class="ctrl-btn" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
            <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import type { VideoDTO, SubtitleTrack, ExternalSubtitle } from '@/types/backend'
import { getVideoStreamUrl, getSubtitleVttUrl, getExternalSubtitleVttUrl, getVideoProgress, saveVideoProgress, getVideoFanartUrl } from '@/api/backend'

interface SubtitleOption {
  type: 'internal' | 'external'
  index?: number
  fileName?: string
  language: string
  label: string
}

const props = defineProps<{
  videoId: number
  videoTitle: string
  episodes?: VideoDTO[]
  currentEpisodeId?: number
  subtitleTracks?: SubtitleTrack[]
  externalSubtitles?: ExternalSubtitle[]
}>()

const emit = defineEmits<{
  close: []
  'episode-change': [episode: VideoDTO]
}>()

// refs
const playerRef = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const progressRef = ref<HTMLElement>()

// state
const streamUrl = getVideoStreamUrl(props.videoId)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(1)
const playbackRate = ref(1)
const isFullscreen = ref(false)
const controlsVisible = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const progressPercent = ref(0)
const bufferedPercent = ref(0)
const watched = ref(false)
const isDragging = ref(false)

// subtitle
const showEpisodes = ref(false)
const showSubtitles = ref(false)
const activeSubtitle = ref<SubtitleOption | null>(null)

// speed
const showSpeedMenu = ref(false)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

// episode view mode
type EpisodeViewMode = 'poster' | 'compact'
const episodeViewMode = ref<EpisodeViewMode>('compact')

// volume slider
const showVolumeSlider = ref(false)

// hover time preview
const showHoverTime = ref(false)
const hoverTimeValue = ref(0)
const hoverX = ref(0)

// timers
let saveTimer: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let controlsTimer: ReturnType<typeof setTimeout> | null = null

const hasSubtitles = computed(() => {
  const hasInternal = props.subtitleTracks && props.subtitleTracks.length > 0
  const hasExternal = props.externalSubtitles && props.externalSubtitles.length > 0
  return hasInternal || hasExternal
})

const activeSubtitleUrl = computed(() => {
  if (!activeSubtitle.value) return ''
  if (activeSubtitle.value.type === 'internal' && activeSubtitle.value.index != null) {
    return getSubtitleVttUrl(props.videoId, activeSubtitle.value.index)
  }
  if (activeSubtitle.value.type === 'external' && activeSubtitle.value.fileName) {
    return getExternalSubtitleVttUrl(props.videoId, activeSubtitle.value.fileName)
  }
  return ''
})

// --- format ---
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// --- play/pause ---
function togglePlay() {
  if (!videoEl.value) return
  if (videoEl.value.paused) {
    videoEl.value.play()
  } else {
    videoEl.value.pause()
  }
}

// --- volume ---
function syncVolume() {
  if (!videoEl.value) return
  volume.value = videoEl.value.volume
  isMuted.value = videoEl.value.muted
}

function toggleMute() {
  if (!videoEl.value) return
  videoEl.value.muted = !videoEl.value.muted
}

function onVolumeChange(e: Event) {
  if (!videoEl.value) return
  const val = parseFloat((e.target as HTMLInputElement).value)
  videoEl.value.volume = val
  if (val > 0) videoEl.value.muted = false
}

// --- speed ---
function setSpeed(rate: number) {
  if (!videoEl.value) return
  videoEl.value.playbackRate = rate
  showSpeedMenu.value = false
}

// --- fullscreen ---
function toggleFullscreen() {
  if (!playerRef.value) return
  if (!document.fullscreenElement) {
    playerRef.value.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

// --- progress bar ---
function onMetadataLoaded() {
  if (!videoEl.value) return
  duration.value = videoEl.value.duration
  loadProgress()
}

function onDurationChange() {
  if (!videoEl.value) return
  const d = videoEl.value.duration
  if (isFinite(d) && d > 0) {
    duration.value = d
  }
}

function onTimeUpdate() {
  if (!videoEl.value || duration.value <= 0) return
  currentTime.value = videoEl.value.currentTime
  progressPercent.value = (currentTime.value / duration.value) * 100
  if (progressPercent.value >= 90) watched.value = true
}

function onBufferProgress() {
  if (!videoEl.value || !videoEl.value.buffered.length) return
  const end = videoEl.value.buffered.end(videoEl.value.buffered.length - 1)
  bufferedPercent.value = (end / duration.value) * 100
}

// --- seek ---
function onProgressHover() {
  showHoverTime.value = true
}

function onProgressLeave() {
  showHoverTime.value = false
}

function onProgressMouseMove(e: MouseEvent) {
  if (!progressRef.value || !videoEl.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  hoverX.value = Math.max(24, Math.min(x, rect.width - 24))
  const ratio = Math.max(0, Math.min(x / rect.width, 1))
  hoverTimeValue.value = ratio * duration.value
}

function onProgressMouseDown(e: MouseEvent) {
  if (!progressRef.value || !videoEl.value) return
  isDragging.value = true
  seekToEvent(e)
  const onMove = (ev: MouseEvent) => seekToEvent(ev)
  const onUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function seekToEvent(e: MouseEvent) {
  if (!progressRef.value || !videoEl.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
  videoEl.value.currentTime = ratio * duration.value
}

// --- controls auto-hide ---
function onMouseMove() {
  controlsVisible.value = true
  resetHideTimer()
}

function onMouseLeave() {
  if (isPlaying.value) {
    startHideTimer()
  }
}

function resetHideTimer() {
  if (hideTimer) clearTimeout(hideTimer)
  if (isPlaying.value) {
    hideTimer = setTimeout(() => {
      if (isPlaying.value && !showEpisodes.value && !showSubtitles.value) {
        controlsVisible.value = false
      }
    }, 3000)
  }
}

function startHideTimer() {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (isPlaying.value && !showEpisodes.value && !showSubtitles.value) {
      controlsVisible.value = false
    }
  }, 1500)
}

// --- keyboard ---
function onKeydown(e: KeyboardEvent) {
  if (!videoEl.value) return
  switch (e.key) {
    case ' ':
    case 'k':
    case 'K':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      e.preventDefault()
      videoEl.value.currentTime = Math.max(0, videoEl.value.currentTime - 5)
      break
    case 'ArrowRight':
      e.preventDefault()
      videoEl.value.currentTime = Math.min(duration.value, videoEl.value.currentTime + 5)
      break
    case 'ArrowUp':
      e.preventDefault()
      videoEl.value.volume = Math.min(1, videoEl.value.volume + 0.1)
      break
    case 'ArrowDown':
      e.preventDefault()
      videoEl.value.volume = Math.max(0, videoEl.value.volume - 0.1)
      break
    case 'f':
    case 'F':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'm':
    case 'M':
      e.preventDefault()
      toggleMute()
      break
    case 'c':
    case 'C':
      e.preventDefault()
      if (hasSubtitles.value) showSubtitles.value = !showSubtitles.value
      break
    case 'Escape':
      e.preventDefault()
      if (showSubtitles.value) showSubtitles.value = false
      else if (showEpisodes.value) showEpisodes.value = false
      else handleClose()
      break
  }
}

// --- subtitle ---
function selectSubtitle(option: SubtitleOption) {
  activeSubtitle.value = option
  showSubtitles.value = false
  nextTick(() => { enableSubtitles() })
}

function disableSubtitles() {
  activeSubtitle.value = null
  showSubtitles.value = false
  disableAllSubtitles()
}

function enableSubtitles() {
  if (!videoEl.value) return
  const tracks = videoEl.value.textTracks
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].mode = 'hidden'
  }
  if (tracks.length > 0) {
    tracks[tracks.length - 1].mode = 'showing'
  }
}

function disableAllSubtitles() {
  if (!videoEl.value) return
  const tracks = videoEl.value.textTracks
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].mode = 'hidden'
  }
}

function onTrackLoad() {
  enableSubtitles()
}

// --- progress ---
async function loadProgress() {
  try {
    const progress = await getVideoProgress(props.videoId)
    if (progress && videoEl.value && progress.positionSeconds > 0) {
      const percent = progress.progressPercent || 0
      if (percent >= 90) {
        watched.value = true
        return
      }
      videoEl.value.currentTime = progress.positionSeconds
      progressPercent.value = percent
    }
  } catch (e) {
    console.error('Failed to load video progress:', e)
  }
}

async function saveProgress() {
  if (!videoEl.value || duration.value <= 0) return
  const position = videoEl.value.currentTime
  try {
    await saveVideoProgress(props.videoId, Math.floor(position), Math.floor(duration.value))
  } catch (e) {
    console.error('Failed to save video progress:', e)
  }
}

function switchEpisode(episode: VideoDTO) {
  if (episode.id === props.currentEpisodeId) return
  saveProgress()
  emit('episode-change', episode)
}

function handleClose() {
  saveProgress()
  emit('close')
}

// --- lifecycle ---
onMounted(() => {
  playerRef.value?.focus()
  saveTimer = setInterval(saveProgress, 10000)
  document.addEventListener('fullscreenchange', onFullscreenChange)

  // auto-select first available subtitle
  if (props.subtitleTracks && props.subtitleTracks.length > 0) {
    const defaultTrack = props.subtitleTracks.find(t => t.default) || props.subtitleTracks[0]
    selectSubtitle({ type: 'internal', index: defaultTrack.index, language: defaultTrack.language, label: defaultTrack.title || defaultTrack.language })
  }
})

onUnmounted(() => {
  if (saveTimer) { clearInterval(saveTimer); saveTimer = null }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  if (controlsTimer) { clearTimeout(controlsTimer); controlsTimer = null }
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<style scoped>
.video-player {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #000;
  outline: none;
  user-select: none;
}

.video-element {
  width: 100%;
  height: 100%;
  background: #000;
  display: block;
  cursor: pointer;
}

/* --- 中央播放按钮 --- */
.center-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}
.center-play-btn:hover {
  background: rgba(0, 0, 0, 0.65);
  transform: translate(-50%, -50%) scale(1.08);
}
.center-play-btn svg {
  margin-left: 4px;
}

/* --- 顶栏 --- */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
  pointer-events: auto;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.close-btn:hover { background: rgba(255, 255, 255, 0.2); }

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}
.progress-badge.watched { background: rgba(46, 204, 113, 0.6); }

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.control-btn:hover { background: rgba(255, 255, 255, 0.2); }
.control-btn.active { background: rgba(234, 122, 122, 0.4); color: #ea7a7a; }

/* --- 底栏 --- */
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  pointer-events: auto;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
}
.ctrl-btn:hover { background: rgba(255, 255, 255, 0.15); }
.ctrl-btn.active svg { color: #ea7a7a; stroke: #ea7a7a; }

.speed-btn {
  width: auto;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* speed menu */
.hover-group,
.speed-group {
  position: relative;
}

.hover-panel {
  position: absolute;
  bottom: 42px;
  right: 0;
}

.speed-menu {
  position: absolute;
  bottom: 42px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(16px);
  border-radius: 10px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 200;
  min-width: 72px;
}

.speed-option {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s;
}
.speed-option:hover { background: rgba(255, 255, 255, 0.1); color: white; }
.speed-option.active { color: var(--accent, #e85d4a); font-weight: 600; }

.time-display {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

/* --- 进度条 --- */
.progress-container {
  flex: 1;
  height: 28px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  overflow: visible;
  transition: height 0.15s ease;
}

.progress-container:hover .progress-track {
  height: 6px;
}

.progress-buffered {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  pointer-events: none;
}

.progress-played {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--accent, #e85d4a);
  border-radius: 2px;
  pointer-events: none;
}

.progress-thumb {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent, #e85d4a);
  box-shadow: 0 0 6px rgba(232, 93, 74, 0.5);
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}

.progress-container:hover .progress-thumb {
  opacity: 1;
}

.hover-time {
  position: absolute;
  bottom: 24px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* --- 音量 --- */
.volume-menu {
  position: absolute;
  bottom: 42px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(16px);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 200;
  min-width: 60px;
}

.volume-menu-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-variant-numeric: tabular-nums;
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent, #e85d4a);
  box-shadow: 0 0 4px rgba(232, 93, 74, 0.4);
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent, #e85d4a);
  box-shadow: 0 0 4px rgba(232, 93, 74, 0.4);
  border: none;
  cursor: pointer;
}

/* --- 侧边面板 --- */
.side-panel {
  width: 320px;
  max-height: calc(100vh - 120px);
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.panel-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel-close:hover { background: rgba(255, 255, 255, 0.2); }

.panel-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.panel-list::-webkit-scrollbar { width: 4px; }
.panel-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 2px; }

.panel-section-label {
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.panel-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}
.panel-item:hover { background: rgba(255, 255, 255, 0.08); color: white; }
.panel-item.active { background: rgba(234, 122, 122, 0.25); color: #ea7a7a; }
.panel-item.watched { opacity: 0.6; }

.item-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}
.panel-item.active .item-num { background: #ea7a7a; color: white; }

.item-title {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* --- episode panel --- */
.episode-panel {
  width: 380px;
}

.panel-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-mode-toggle {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 2px;
}

.view-mode-toggle button {
  width: 28px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.view-mode-toggle button svg {
  width: 16px;
  height: 16px;
}
.view-mode-toggle button:hover { color: rgba(255, 255, 255, 0.7); }
.view-mode-toggle button.active { background: rgba(234, 122, 122, 0.5); color: white; }

/* poster grid */
.episode-poster-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

.episode-poster-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.2s;
}
.episode-poster-card:hover { transform: translateY(-2px); }
.episode-poster-card.active { outline: 2px solid var(--accent, #e85d4a); }

.poster-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}
.poster-thumb img { width: 100%; height: 100%; object-fit: cover; }

.poster-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.episode-poster-card:hover .poster-overlay { opacity: 1; }

.poster-play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.poster-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.3);
}
.poster-progress-bar { height: 100%; background: rgba(255, 255, 255, 0.3); }
.poster-progress-fill { height: 100%; background: var(--accent, #e85d4a); }

.poster-watched-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 1px 6px;
  background: rgba(46, 204, 113, 0.85);
  color: white;
  font-size: 10px;
  font-weight: 500;
  border-radius: 3px;
}

.poster-info { padding: 6px 8px; }
.poster-ep-num { font-size: 11px; color: var(--accent, #e85d4a); font-weight: 500; }
.poster-title { font-size: 12px; color: rgba(255, 255, 255, 0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* compact grid */
.episode-compact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
  gap: 6px;
  padding: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.compact-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.compact-item:hover { background: rgba(255, 255, 255, 0.12); color: white; }
.compact-item.active { background: var(--accent, #e85d4a); color: white; }
.compact-item.watched { opacity: 0.45; }

/* --- transitions --- */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

.slide-right-enter-active, .slide-right-leave-active { transition: all 0.2s ease; }
.slide-right-enter-from, .slide-right-leave-to { opacity: 0; width: 0; }
</style>

<style>
.video-player video::cue {
  font-size: 0.8em;
  line-height: 1.2;
  background: transparent;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9), -1px -1px 2px rgba(0, 0, 0, 0.9), 1px -1px 2px rgba(0, 0, 0, 0.9), -1px 1px 2px rgba(0, 0, 0, 0.9);
  padding: 0;
  margin: 0;
}
</style>
