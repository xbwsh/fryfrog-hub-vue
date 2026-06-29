<template>
  <div class="video-player" @keydown.esc="handleClose" tabindex="0" ref="playerRef">
    <video
      ref="videoEl"
      :src="streamUrl"
      controls
      autoplay
      class="video-element"
      @loadedmetadata="onMetadataLoaded"
      @timeupdate="onTimeUpdate"
    >
      <track
        v-if="activeSubtitleUrl"
        kind="subtitles"
        :src="activeSubtitleUrl"
        :srclang="getSubtitleLang(selectedSubtitle)"
        label="字幕"
        default
        @load="onTrackLoad"
      />
      您的浏览器不支持视频播放
    </video>

    <div class="top-bar">
      <button class="close-btn" @click="handleClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <span class="video-title">{{ videoTitle }}</span>
      <span v-if="progressPercent > 0 && !watched" class="progress-badge">{{ Math.round(progressPercent) }}%</span>
      <span v-if="watched" class="progress-badge watched">已看完</span>
      <button v-if="episodes && episodes.length > 0" class="control-btn" @click="showEpisodes = !showEpisodes">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        选集
      </button>
      <button v-if="subtitleFiles && subtitleFiles.length > 0" class="control-btn" @click="showSubtitles = !showSubtitles">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="13" rx="2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="6" y1="15" x2="18" y2="15"/>
        </svg>
        字幕
      </button>
    </div>

    <transition name="slide">
      <div v-if="showEpisodes" class="side-panel">
        <div class="panel-header">
          <span>选集 ({{ episodes?.length || 0 }})</span>
          <button class="panel-close" @click="showEpisodes = false">&times;</button>
        </div>
        <div class="panel-list">
          <button
            v-for="ep in episodes || []"
            :key="ep.id"
            class="panel-item"
            :class="{ active: ep.id === currentEpisodeId, watched: ep.watched }"
            @click="switchEpisode(ep)"
          >
            <span class="item-num">{{ ep.episodeNumber }}</span>
            <span class="item-title">{{ ep.title }}</span>
          </button>
        </div>
      </div>
    </transition>

    <transition name="slide">
      <div v-if="showSubtitles" class="side-panel">
        <div class="panel-header">
          <span>字幕</span>
          <button class="panel-close" @click="showSubtitles = false">&times;</button>
        </div>
        <div class="panel-list">
          <button class="panel-item" :class="{ active: !selectedSubtitle }" @click="disableSubtitles">
            <span class="item-title">关闭字幕</span>
          </button>
          <button
            v-for="file in subtitleFiles || []"
            :key="file"
            class="panel-item"
            :class="{ active: selectedSubtitle === file }"
            @click="loadSubtitle(file)"
          >
            <span class="item-title">{{ file }}</span>
          </button>
          <button class="panel-item extract-btn" @click="$emit('extract-subtitles')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span class="item-title">提取内嵌字幕</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import type { VideoDTO } from '@/types/backend'
import { getVideoStreamUrl, getVideoSubtitleUrl, getVideoProgress, saveVideoProgress } from '@/api/backend'

const props = defineProps<{
  videoId: number
  videoTitle: string
  episodes?: VideoDTO[]
  currentEpisodeId?: number
  subtitleFiles?: string[]
}>()

const emit = defineEmits<{
  close: []
  'episode-change': [episode: VideoDTO]
  'extract-subtitles': []
}>()

const playerRef = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const streamUrl = getVideoStreamUrl(props.videoId)
const progressPercent = ref(0)
const watched = ref(false)
const showEpisodes = ref(false)
const showSubtitles = ref(false)
const selectedSubtitle = ref('')
let saveTimer: ReturnType<typeof setInterval> | null = null
let duration = 0

const activeSubtitleUrl = computed(() => {
  if (!selectedSubtitle.value) return ''
  return getVideoSubtitleUrl(props.videoId, selectedSubtitle.value)
})

function getSubtitleLang(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.includes('zh') || lower.includes('chs') || lower.includes('cht') || lower.includes('chinese')) return 'zh'
  if (lower.includes('en') || lower.includes('eng') || lower.includes('english')) return 'en'
  if (lower.includes('ja') || lower.includes('jpn') || lower.includes('japanese')) return 'ja'
  return 'zh'
}

function onMetadataLoaded() {
  if (!videoEl.value) return
  duration = videoEl.value.duration
  loadProgress()
}

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

function onTimeUpdate() {
  if (!videoEl.value || duration <= 0) return
  const current = videoEl.value.currentTime
  const percent = (current / duration) * 100
  progressPercent.value = percent
  if (percent >= 90) {
    watched.value = true
  }
}

async function saveProgress() {
  if (!videoEl.value || duration <= 0) return
  const position = videoEl.value.currentTime
  try {
    await saveVideoProgress(props.videoId, Math.floor(position), Math.floor(duration))
  } catch (e) {
    console.error('Failed to save video progress:', e)
  }
}

function switchEpisode(episode: VideoDTO) {
  if (episode.id === props.currentEpisodeId) return
  saveProgress()
  emit('episode-change', episode)
}

function loadSubtitle(fileName: string) {
  selectedSubtitle.value = fileName
  showSubtitles.value = false
  nextTick(() => {
    enableSubtitles()
  })
}

function disableSubtitles() {
  selectedSubtitle.value = ''
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

function handleClose() {
  saveProgress()
  emit('close')
}

onMounted(() => {
  playerRef.value?.focus()
  saveTimer = setInterval(saveProgress, 10000)
})

onUnmounted(() => {
  if (saveTimer) {
    clearInterval(saveTimer)
    saveTimer = null
  }
})
</script>

<style scoped>
.video-player {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #000;
  outline: none;
}

.video-element {
  width: 100%;
  height: 100%;
  background: #000;
  display: block;
}

.top-bar {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.9);
}

.progress-badge.watched {
  background: rgba(46, 204, 113, 0.6);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.side-panel {
  position: absolute;
  top: 60px;
  right: 12px;
  width: 320px;
  max-height: calc(100vh - 100px);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(12px);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

.panel-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.panel-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.panel-list::-webkit-scrollbar {
  width: 4px;
}

.panel-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
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
  transition: var(--transition);
  text-align: left;
}

.panel-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.panel-item.active {
  background: rgba(234, 122, 122, 0.3);
  color: #ea7a7a;
}

.panel-item.watched {
  opacity: 0.6;
}

.item-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.panel-item.active .item-num {
  background: #ea7a7a;
  color: white;
}

.item-title {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.extract-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ea7a7a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 12px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
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
