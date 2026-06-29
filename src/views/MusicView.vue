<template>
  <div class="music-view" :style="{ '--dynamic-color': dynamicColor }">
    <div class="top-header">
      <div class="header-left">
        <h1>音乐</h1>
        <p class="view-subtitle">管理你的音乐库</p>
      </div>
      <div class="header-actions">
        <button class="rescan-btn" :disabled="rescanning" @click="handleRescan">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {{ rescanning ? '扫描中...' : '扫描音乐' }}
        </button>
        <button class="rescan-btn" :disabled="reorganizing" @click="handleReorganize">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          {{ reorganizing ? '整理中...' : '整理文件' }}
        </button>
        <SearchBar v-model="searchQuery" placeholder="搜索音乐、歌手、专辑..." @debounced="handleSearch" />
      </div>
    </div>

    <div class="content-area">
      <!-- 左侧歌曲列表 -->
      <div class="list-panel">
        <div class="list-header">
          <div class="list-title-row">
            <span class="list-title">{{ activeCategory || '全部歌曲' }} ({{ tracks.length }})</span>
            <div class="list-actions">
              <button class="play-all-btn" @click="playAll">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                播放全部
              </button>
              <button class="play-all-btn shuffle-btn" @click="shufflePlay">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 3 21 3 21 8"/>
                  <line x1="4" y1="20" x2="21" y2="3"/>
                  <polyline points="21 16 21 21 16 21"/>
                  <line x1="15" y1="15" x2="21" y2="21"/>
                  <line x1="4" y1="4" x2="9" y2="9"/>
                </svg>
                随机播放
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="tracks.length === 0" class="empty-state">
          <p>暂无音乐</p>
        </div>

        <div v-else class="track-list">
          <div
            v-for="(track, index) in tracks"
            :key="track.id"
            class="track-item"
            :class="{ active: playerStore.currentTrack?.id === track.id }"
            @click="playTrack(track)"
            @contextmenu="onContextMenu($event, track)"
          >
            <div class="track-cover-small">
              <img loading="lazy" :src="getMusicCoverArtUrl(track.id)" alt="封面" draggable="false" />
            </div>
            <div class="track-playing" v-if="playerStore.currentTrack?.id === track.id && playerStore.isPlaying">
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
            </div>
            <div class="track-index" v-else>{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="track-info">
              <div class="track-title">{{ track.title }}</div>
              <div class="track-artist">{{ track.artist }} · {{ track.album }}</div>
            </div>
            <div class="track-duration">{{ formatDuration(track.durationSeconds) }}</div>
          </div>
        </div>
      </div>

      <!-- 中间主内容 -->
      <div class="main-panel">
        <div class="main-scroll">
          <!-- Banner -->
          <div class="banner">
            <div class="banner-text">
              <h2>音乐，<br>是生活的调色板</h2>
              <p>发掘 · 收藏 · 享受</p>
            </div>
            <div class="banner-visual">
              <img src="/photo-1508700115892-45ecd05ae2ad.avif" alt="" class="banner-img banner-img-left" draggable="false" />
              <img src="/banner-804-400x200.jpg" alt="banner" class="banner-img banner-img-right" draggable="false" />
            </div>
          </div>

          <!-- 快速分类 -->
          <div class="section">
            <div class="section-header">
              <h3>快速分类</h3>
            </div>
            <div v-if="loadingCategories" class="section-loading">
              <div class="loading-spinner"></div>
            </div>
            <div v-else class="category-grid">
              <div class="category-card" v-for="cat in categories" :key="cat.name" :class="{ active: activeCategory === cat.name }" @click="filterByCategory(cat.name)">
                <div class="cat-icon" :style="{ background: cat.bg, color: cat.color }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="cat.icon"/>
                </div>
                <div class="cat-info">
                  <h4>{{ cat.name }}</h4>
                  <p>{{ cat.count }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 推荐歌单 -->
          <div class="section">
            <div class="section-header">
              <h3>推荐歌单</h3>
            </div>
            <div v-if="loadingRecommendations" class="section-loading">
              <div class="loading-spinner"></div>
            </div>
            <div v-else-if="Object.keys(recommendations).length === 0" class="section-empty">
              <p>暂无推荐</p>
            </div>
            <div v-else class="playlist-scroll">
              <div
                v-for="(tracks, category) in recommendations"
                :key="category"
                class="playlist-card"
                @click="playRecommendation(tracks)"
              >
                <div class="pl-img-wrap">
                  <img
                    v-if="tracks.length > 0"
                    :src="getMusicCoverArtUrl(tracks[0].id)"
                    alt=""
                    draggable="false"
                  />
                  <div class="pl-play">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
                <div class="pl-info">
                  <h4>{{ category }}</h4>
                  <p>{{ tracks.length }} 首歌曲</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div v-if="loadingRightPanel" class="panel-loading">
          <div class="loading-spinner"></div>
        </div>
        <template v-else>
          <div class="panel-section">
            <div class="panel-header">
              <h3>歌手榜</h3>
            </div>
            <div class="rank-scroll">
              <div v-for="(artist, index) in artistRanking" :key="artist.name" class="rank-item">
                <div class="rank-num">{{ index + 1 }}</div>
                <div class="rank-avatar" :style="{ background: artist.color }">
                  <img :src="getArtistImageUrl(artist.trackId)" :alt="artist.name" @error="($event.target as HTMLImageElement).style.display='none'" />
                </div>
                <div class="rank-info">
                  <div class="rank-name">{{ artist.name }}</div>
                  <div class="rank-count">{{ artist.count }} 首歌曲</div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <div class="panel-header">
              <h3>音乐风格</h3>
            </div>
            <div class="tags">
              <span v-for="(tag, index) in genreTags" :key="tag.name" class="tag" :class="'tag-' + (index % 4)">
                {{ tag.name }} ({{ tag.count }})
              </span>
            </div>
          </div>

          <div class="panel-section stats-panel">
            <div class="panel-header">
              <h3>音乐统计</h3>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-num">{{ tracks.length.toLocaleString() }}</div>
                <div class="stat-label">歌曲总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-num">{{ albumCount }}</div>
                <div class="stat-label">专辑数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-num">{{ artistCount }}</div>
                <div class="stat-label">歌手数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-num">{{ totalSize }}</div>
                <div class="stat-label">占用空间</div>
              </div>
            </div>
            <div class="stats-footer">最后更新：{{ lastUpdateTime }}</div>
          </div>
        </template>
      </div>
    </div>

    <MusicPlayerBar :accent-color="dynamicColor" @toggle-lyrics="showLyrics = !showLyrics" @favorite-changed="() => { loadFavoriteCount(); loadCategoryCounts() }" />

    <transition name="lyrics-fade">
      <div class="lyrics-overlay" v-show="showLyrics">
        <LyricsPanel :accent-color="dynamicColor" @close="showLyrics = false" @favorite-changed="() => { loadFavoriteCount(); loadCategoryCounts() }" />
      </div>
    </transition>

    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { MusicTrack } from '@/types/backend'
import { getAllTracks, getMusicCoverArtUrl, getArtistImageUrl, searchMusic, getFavorites, getRecentlyPlayed, getMostPlayed, getRecentlyAdded, recordMusicPlay, getMusicRecommendations, rescanMusic, reorganizeMusic } from '@/api/backend'
import { usePlayerStore } from '@/stores/player'
import MusicPlayerBar from '@/components/MusicPlayerBar.vue'
import LyricsPanel from '@/components/LyricsPanel.vue'
import SearchBar from '@/components/SearchBar.vue'

const playerStore = usePlayerStore()
const tracks = ref<MusicTrack[]>([])
const loading = ref(false)
const error = ref('')
const showLyrics = ref(false)
const rescanning = ref(false)
const reorganizing = ref(false)
const searchQuery = ref('')
const loadingRecommendations = ref(false)
const loadingCategories = ref(false)
const loadingRightPanel = ref(false)

const trackColors: Record<string, string> = {
  'LiSA': '#d63031',
  '中岛美嘉': '#ff7675',
  '蔡健雅': '#e17055',
  '陈奕迅': '#0984e3',
  '张碧晨': '#00b894',
  '郭顶': '#6c5ce7',
  '许嵩': '#fdcb6e',
  '毛不易': '#e17055',
  '汪苏泷': '#e84393',
  '周杰伦': '#ea7a7a',
  '张杰': '#00cec9',
}

const defaultColors = ['#ea7a7a', '#74b9ff', '#a29bfe', '#55efc4', '#ffeaa7', '#fab1a0', '#fd79a8', '#00b894']

const dynamicColor = computed(() => {
  const track = playerStore.currentTrack
  if (!track) return 'var(--accent)'
  if (trackColors[track.artist]) return trackColors[track.artist]
  const hash = track.artist.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return defaultColors[hash % defaultColors.length]
})

const favoriteCount = ref(0)
const recentlyPlayedCount = ref(0)
const mostPlayedCount = ref(0)
const recentlyAddedCount = ref(0)
const activeCategory = ref<string | null>(null)
const allTracks = ref<MusicTrack[]>([])

const categories = computed(() => [
  { name: '最近播放', count: `${recentlyPlayedCount.value} 首歌曲`, bg: '#eaf2ff', color: '#4a82ff', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
  { name: '我喜欢的', count: `${favoriteCount.value} 首歌曲`, bg: '#ffeff2', color: '#ea7a7a', icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
  { name: '最常播放', count: `${mostPlayedCount.value} 首歌曲`, bg: '#f2fcf5', color: '#45b883', icon: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>' },
  { name: '最近添加', count: `${recentlyAddedCount.value} 首歌曲`, bg: '#faf0ff', color: '#a44aff', icon: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
  { name: '本地音乐', count: `${allTracks.value.length.toLocaleString()} 首歌曲`, bg: '#fcf5f0', color: '#ff8744', icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' },
])

const recommendations = ref<Record<string, MusicTrack[]>>({})

const artistRanking = computed(() => {
  const map = new Map<string, { count: number; trackId: number }>()
  for (const track of tracks.value) {
    const existing = map.get(track.artist)
    if (existing) {
      existing.count++
    } else {
      map.set(track.artist, { count: 1, trackId: track.id })
    }
  }
  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      trackId: data.trackId,
      color: trackColors[name] || defaultColors[name.charCodeAt(0) % defaultColors.length],
    }))
    .sort((a, b) => b.count - a.count)
})

const albumCount = computed(() => {
  const albums = new Set(tracks.value.map(t => t.album).filter(Boolean))
  return albums.size
})

const artistCount = computed(() => {
  return new Set(tracks.value.map(t => t.artist)).size
})

const totalSize = computed(() => {
  const total = tracks.value.reduce((sum, t) => sum + (t.fileSize || 0), 0)
  const gb = total / (1024 * 1024 * 1024)
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(total / (1024 * 1024)).toFixed(0)} MB`
})

const lastUpdateTime = computed(() => {
  if (tracks.value.length === 0) return '-'
  const latest = tracks.value.reduce((latest, t) => {
    const time = new Date(t.updatedAt || t.createdAt).getTime()
    return time > latest ? time : latest
  }, 0)
  if (!latest) return '-'
  const d = new Date(latest)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

const genreTags = computed(() => {
  const map = new Map<string, number>()
  for (const track of tracks.value) {
    if (track.genre) {
      map.set(track.genre, (map.get(track.genre) || 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
})

const contextMenu = ref({ visible: false, x: 0, y: 0, trackId: 0 })

function onContextMenu(e: MouseEvent, track: MusicTrack) {
  e.preventDefault()
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, trackId: track.id }
}

function closeContextMenu() {
  contextMenu.value = { ...contextMenu.value, visible: false }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    if (activeCategory.value) {
      await filterByCategory(activeCategory.value)
    } else {
      tracks.value = allTracks.value
    }
    return
  }
  error.value = ''
  try {
    tracks.value = await searchMusic(searchQuery.value)
  } catch (e) {
    error.value = '搜索失败'
    console.error('Search failed:', e)
  }
}

async function loadTracks() {
  loading.value = true
  loadingRightPanel.value = true
  error.value = ''
  try {
    allTracks.value = await getAllTracks()
    tracks.value = allTracks.value
  } catch (e) {
    error.value = '加载音乐失败'
    console.error('Failed to load tracks:', e)
  } finally {
    loading.value = false
    loadingRightPanel.value = false
  }
}

async function loadFavoriteCount() {
  loadingCategories.value = true
  try {
    const favorites = await getFavorites()
    favoriteCount.value = favorites.length
  } catch (e) {
    console.error('Failed to load favorites:', e)
  } finally {
    loadingCategories.value = false
  }
}

async function loadCategoryCounts() {
  loadingCategories.value = true
  try {
    const [recent, popular, added] = await Promise.all([
      getRecentlyPlayed(),
      getMostPlayed(),
      getRecentlyAdded(),
    ])
    recentlyPlayedCount.value = recent.length
    mostPlayedCount.value = popular.length
    recentlyAddedCount.value = added.length
  } catch (e) {
    console.error('Failed to load category counts:', e)
  } finally {
    loadingCategories.value = false
  }
}

async function filterByCategory(name: string) {
  if (activeCategory.value === name) {
    activeCategory.value = null
    tracks.value = allTracks.value
    return
  }
  activeCategory.value = name
  try {
    switch (name) {
      case '本地音乐':
        tracks.value = allTracks.value
        break
      case '我喜欢的':
        tracks.value = await getFavorites()
        break
      case '最近播放':
        tracks.value = await getRecentlyPlayed()
        break
      case '最常播放':
        tracks.value = await getMostPlayed()
        break
      case '最近添加':
        tracks.value = await getRecentlyAdded()
        break
    }
  } catch (e) {
    console.error('Failed to filter:', e)
  }
}

function playTrack(track: MusicTrack) {
  playerStore.playTrack(track, tracks.value)
  recordMusicPlay(track.id).catch(() => {})
}

function playAll() {
  if (tracks.value.length > 0) {
    playerStore.playTrack(tracks.value[0], tracks.value)
  }
}

function shufflePlay() {
  if (tracks.value.length > 0) {
    const shuffled = [...tracks.value].sort(() => Math.random() - 0.5)
    playerStore.playTrack(shuffled[0], shuffled)
  }
}

function playRecommendation(trackList: MusicTrack[]) {
  if (trackList.length > 0) {
    playerStore.playTrack(trackList[0], trackList)
  }
}

async function handleRescan() {
  if (rescanning.value) return
  rescanning.value = true
  try {
    await rescanMusic()
    await loadTracks()
    loadCategoryCounts()
    loadFavoriteCount()
    loadRecommendations()
  } catch (e) {
    console.error('Rescan failed:', e)
  } finally {
    rescanning.value = false
  }
}

async function handleReorganize() {
  if (reorganizing.value) return
  reorganizing.value = true
  try {
    await reorganizeMusic()
    await loadTracks()
  } catch (e) {
    console.error('Reorganize failed:', e)
  } finally {
    reorganizing.value = false
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

async function loadRecommendations() {
  loadingRecommendations.value = true
  try {
    recommendations.value = await getMusicRecommendations()
  } catch (e) {
    console.error('Failed to load recommendations:', e)
  } finally {
    loadingRecommendations.value = false
  }
}

onMounted(() => {
  loadTracks()
  loadFavoriteCount()
  loadCategoryCounts()
  loadRecommendations()
  document.addEventListener('click', closeContextMenu)
})
onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.music-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  --dynamic-color: var(--accent);
}

.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  flex-shrink: 0;
  background: var(--bg-primary);
}

.header-left h1 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 2px;
}

.view-subtitle {
  color: var(--text-secondary);
  font-size: 13px;
}

.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rescan-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.rescan-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.rescan-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 12px;
  padding: 0 8px;
  padding-bottom: 50px;
}

/* 左侧歌曲列表 */
.list-panel {
  width: 550px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-radius: 16px;
  margin: 0 8px;
}

.track-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 0;
}

.list-header {
  padding: 16px 20px 12px;
  flex-shrink: 0;
}

.list-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.list-actions {
  display: flex;
  gap: 8px;
}

.play-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: var(--dynamic-color);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.play-all-btn:hover {
  opacity: 0.85;
}

.shuffle-btn {
  background: transparent;
  color: var(--dynamic-color);
  border: 1px solid var(--dynamic-color);
}

.shuffle-btn:hover {
  background: var(--dynamic-color);
  color: #fff;
  opacity: 1;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 2px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.track-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}

.track-item.active {
  background: color-mix(in srgb, var(--dynamic-color) 10%, transparent);
}

.track-cover-small {
  width: 40px;
  height: 40px;
  border-radius: 6px;
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
  background: var(--dynamic-color);
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
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  flex-shrink: 0;
}

.track-item:hover .track-index {
  color: var(--dynamic-color);
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-item.active .track-title {
  color: var(--dynamic-color);
}

.track-artist {
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-duration {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* 中间主内容 */
.main-panel {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
}

.main-scroll {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 100px;
}

.banner {
  background: linear-gradient(135deg, #6b3e3e, #b25d5d);
  border-radius: 16px;
  padding: 40px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  margin: 0 0 24px 0;
  position: relative;
  overflow: hidden;
}

.banner-text h2 {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 12px;
  line-height: 1.3;
}

.banner-text p {
  font-size: 15px;
  opacity: 0.8;
}

.banner-visual {
  flex-shrink: 0;
  display: flex;
  gap: 12px;
  align-items: center;
}

.banner-img {
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.banner-img-left {
  width: 140px;
  transform: rotate(-8deg);
}

.banner-img-right {
  width: 220px;
  transform: rotate(-3deg);
}

.section {
  margin-bottom: 28px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.see-all {
  font-size: 13px;
  color: var(--dynamic-color);
  cursor: pointer;
}

.see-all:hover {
  opacity: 0.8;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.category-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
}

.category-card.active {
  background: color-mix(in srgb, var(--dynamic-color) 10%, transparent);
  border-color: var(--dynamic-color);
}

.cat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cat-info h4 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.cat-info p {
  font-size: 12px;
  color: var(--text-muted);
}

.playlist-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.playlist-scroll::-webkit-scrollbar {
  height: 4px;
}

.playlist-card {
  flex-shrink: 0;
  width: 140px;
  cursor: pointer;
}

.pl-img-wrap {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
  background: var(--bg-tertiary);
}

.pl-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pl-play {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #fff;
  color: #000;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card:hover .pl-play {
  opacity: 1;
}

.pl-info h4 {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-info p {
  font-size: 11px;
  color: var(--text-muted);
}

.playlist-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.playlist-scroll::-webkit-scrollbar {
  height: 4px;
}

.playlist-card {
  flex-shrink: 0;
  width: 140px;
  cursor: pointer;
}

.pl-img-wrap {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.pl-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pl-play {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #fff;
  color: #000;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card:hover .pl-play {
  opacity: 1;
}

.pl-info h4 {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-info p {
  font-size: 11px;
  color: var(--text-muted);
}

/* 右侧面板 */
.right-panel {
  width: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  margin: 0 8px;
}

.panel-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 4px 0;
}

.rank-item:last-child {
  margin-bottom: 0;
}

.rank-num {
  width: 18px;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 13px;
}

.rank-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  flex-shrink: 0;
}

.rank-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.rank-count {
  font-size: 11px;
  color: var(--text-muted);
}

.tags {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.tag {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: 0.2s;
  text-align: center;
}

.tag:hover {
  opacity: 0.8;
}

.tag-0 { background: #f0f7ff; color: #4a82ff; }
.tag-1 { background: #fff5f0; color: #ff7a4a; }
.tag-2 { background: #f0fcf5; color: #2db87a; }
.tag-3 { background: #faf0ff; color: #a44aff; }

.rank-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 8px 0;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

.stats-footer {
  font-size: 12px;
  color: var(--text-muted);
  padding-top: 12px;
  margin-top: 16px;
  border-top: 1px solid var(--border);
}

/* 其他 */
.loading-state,
.empty-state,
.section-loading,
.section-empty,
.panel-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.section-loading,
.section-empty {
  min-height: 120px;
}

.panel-loading {
  min-height: 200px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--dynamic-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
}

.context-menu {
  position: fixed;
  z-index: 200;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 4px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.context-menu-item:hover {
  background: var(--bg-hover);
}

/* 响应式 */
@media screen and (max-width: 1200px) {
  .right-panel {
    display: none;
  }
}

@media screen and (max-width: 900px) {
  .list-panel {
    width: 100%;
  }

  .main-panel {
    display: none;
  }
}
</style>
