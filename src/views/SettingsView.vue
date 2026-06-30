<template>
  <div class="settings-view">
    <div class="settings-inner">
      <div class="settings-header">
        <h1>设置</h1>
      </div>

      <div class="settings-section">
        <div class="section-title" @click="toggleSection('server')">
          <span class="section-chevron" :class="{ collapsed: !sections.server }"></span>
          服务器
        </div>
        <div class="section-body" :class="{ collapsed: !sections.server }">
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">后端地址</h3>
              <p class="item-description">Fryfrog Hub 后端服务的访问地址</p>
            </div>
            <div class="url-input-group">
              <input
                v-model="backendUrlInput"
                type="text"
                class="url-input"
                placeholder="http://localhost:20058"
                @blur="saveBackendUrl"
                @keydown.enter="saveBackendUrl"
              />
              <button class="btn-save" :disabled="backendUrlInput === connectionStore.backendUrl" @click="saveBackendUrl">
                保存
              </button>
            </div>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">显示服务器地址</h3>
              <p class="item-description">在侧边栏显示当前连接的服务器地址</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: connectionStore.showServerAddress }"
              @click="connectionStore.setShowServerAddress(!connectionStore.showServerAddress)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title" @click="toggleSection('tmdb')">
          <span class="section-chevron" :class="{ collapsed: !sections.tmdb }"></span>
          TMDB
        </div>
        <div class="section-body" :class="{ collapsed: !sections.tmdb }">
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">API Key</h3>
              <p class="item-description">The Movie Database API 密钥</p>
            </div>
            <div class="url-input-group">
              <input
                v-model="tmdbApiKey"
                type="password"
                class="url-input"
                placeholder="输入 TMDB API Key"
                @blur="saveTmdbApiKey"
              />
            </div>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">语言</h3>
              <p class="item-description">TMDB 元数据语言</p>
            </div>
            <select v-model="tmdbLanguage" class="theme-select" @change="saveTmdbSetting('tmdb.language', tmdbLanguage)">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">图片尺寸</h3>
              <p class="item-description">TMDB 图片加载尺寸</p>
            </div>
            <select v-model="tmdbImageSize" class="theme-select" @change="saveTmdbSetting('tmdb.image-size', tmdbImageSize)">
              <option value="original">原始</option>
              <option value="w500">中等</option>
              <option value="w342">较小</option>
            </select>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">自动刮削</h3>
              <p class="item-description">扫描视频时自动从 TMDB 获取元数据</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: tmdbAutoScrape }"
              @click="toggleTmdbSetting('tmdb.auto-scrape', tmdbAutoScrape)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">包含成人内容</h3>
              <p class="item-description">在搜索结果中包含成人内容</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: tmdbIncludeAdult }"
              @click="toggleTmdbSetting('tmdb.include-adult', tmdbIncludeAdult)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">最低评分</h3>
              <p class="item-description">自动刮削时的最低评分阈值</p>
            </div>
            <div class="range-group">
              <input
                v-model.number="tmdbMinScore"
                type="range"
                class="range-input"
                min="0"
                max="10"
                step="0.5"
                :style="{ background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(tmdbMinScore / 10) * 100}%, var(--bg-tertiary) ${(tmdbMinScore / 10) * 100}%, var(--bg-tertiary) 100%)` }"
                @change="saveTmdbSetting('tmdb.min-score', String(tmdbMinScore))"
              />
              <span class="range-value">{{ tmdbMinScore }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title" @click="toggleSection('proxy')">
          <span class="section-chevron" :class="{ collapsed: !sections.proxy }"></span>
          代理
        </div>
        <div class="section-body" :class="{ collapsed: !sections.proxy }">
          <div v-if="proxyStatus !== 'idle'" class="proxy-status-bar span-2" :class="proxyStatus">
            <span class="status-dot"></span>
            <span v-if="proxyStatus === 'testing'">检测中...</span>
            <span v-else-if="proxyStatus === 'ok'">代理连接畅通</span>
            <span v-else-if="proxyStatus === 'fail'">无法连接代理</span>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">地址</h3>
              <p class="item-description">代理服务器地址（修改后需重启）</p>
            </div>
            <input
              v-model="proxyHost"
              type="text"
              class="url-input"
              placeholder="127.0.0.1"
              @blur="saveProxySetting('proxy.host', proxyHost)"
            />
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">端口</h3>
              <p class="item-description">代理服务器端口（修改后需重启）</p>
            </div>
            <div class="url-input-group">
              <input
                v-model.number="proxyPort"
                type="number"
                class="url-input"
                placeholder="7890"
                @blur="saveProxySetting('proxy.port', String(proxyPort))"
              />
              <button class="btn-action" :disabled="proxyStatus === 'testing' || !proxyHost || !proxyPort" @click="testProxy">
                {{ proxyStatus === 'testing' ? '检测中...' : '测试' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title" @click="toggleSection('comic')">
          <span class="section-chevron" :class="{ collapsed: !sections.comic }"></span>
          漫画
        </div>
        <div class="section-body" :class="{ collapsed: !sections.comic }">
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">自动刮削</h3>
              <p class="item-description">扫描漫画时自动从 Bangumi/AniList 获取元数据</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: comicAutoScrape }"
              @click="toggleComicSetting('comic.auto-scrape', comicAutoScrape)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">最低评分</h3>
              <p class="item-description">漫画刮削最低评分</p>
            </div>
            <div class="range-group">
              <input
                v-model.number="comicMinScore"
                type="range"
                class="range-input"
                min="0"
                max="10"
                step="0.5"
                :style="{ background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(comicMinScore / 10) * 100}%, var(--bg-tertiary) ${(comicMinScore / 10) * 100}%, var(--bg-tertiary) 100%)` }"
                @change="saveComicSetting('comic.min-score', String(comicMinScore))"
              />
              <span class="range-value">{{ comicMinScore }}</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">AniList 自动刮削</h3>
              <p class="item-description">扫描漫画时自动从 AniList 获取元数据</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: anilistAutoScrape }"
              @click="toggleAnilistSetting('anilist.auto-scrape', anilistAutoScrape)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">AniList 最低评分</h3>
              <p class="item-description">AniList 自动刮削最低评分</p>
            </div>
            <div class="range-group">
              <input
                v-model.number="anilistMinScore"
                type="range"
                class="range-input"
                min="0"
                max="10"
                step="0.5"
                :style="{ background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(anilistMinScore / 10) * 100}%, var(--bg-tertiary) ${(anilistMinScore / 10) * 100}%, var(--bg-tertiary) 100%)` }"
                @change="saveAnilistSetting('anilist.min-score', String(anilistMinScore))"
              />
              <span class="range-value">{{ anilistMinScore }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title" @click="toggleSection('music')">
          <span class="section-chevron" :class="{ collapsed: !sections.music }"></span>
          音乐
        </div>
        <div class="section-body" :class="{ collapsed: !sections.music }">
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">按文件夹整理</h3>
              <p class="item-description">按艺术家文件夹结构整理音乐</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: musicUseFolderStructure }"
              @click="toggleMusicSetting('music.use-folder-structure', musicUseFolderStructure)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">未知艺术家名</h3>
              <p class="item-description">未知艺术家的默认显示名称</p>
            </div>
            <input
              v-model="musicDefaultArtist"
              type="text"
              class="url-input"
              placeholder="未知艺术家"
              @blur="saveMusicSetting('music.default-artist', musicDefaultArtist)"
            />
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">歌词源回退</h3>
              <p class="item-description">主歌词源失败时尝试其他源</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: musicLyricsFallback }"
              @click="toggleMusicSetting('music.scrape.lyrics-fallback', musicLyricsFallback)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">封面源回退</h3>
              <p class="item-description">主封面源失败时尝试其他源</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: musicCoverFallback }"
              @click="toggleMusicSetting('music.scrape.cover-fallback', musicCoverFallback)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title" @click="toggleSection('appearance')">
          <span class="section-chevron" :class="{ collapsed: !sections.appearance }"></span>
          外观
        </div>
        <div class="section-body" :class="{ collapsed: !sections.appearance }">
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">主题模式</h3>
              <p class="item-description">选择你喜欢的外观主题</p>
            </div>
            <select v-model="themeMode" class="theme-select">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title" @click="toggleSection('library')">
          <span class="section-chevron" :class="{ collapsed: !sections.library }"></span>
          媒体库
        </div>
        <div class="section-body" :class="{ collapsed: !sections.library }">
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">定时扫描</h3>
              <p class="item-description">开启后自动扫描文件变更</p>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: periodicScan }"
              @click="toggleWatcherSetting('watcher.periodic-scan', periodicScan)"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="setting-item">
            <div class="item-info">
              <h3 class="item-label">扫描间隔</h3>
              <p class="item-description">定时扫描的间隔时间（秒），修改后立即生效</p>
            </div>
            <div class="url-input-group">
              <input
                v-model.number="periodicScanInterval"
                type="number"
                class="url-input url-input-narrow"
                min="10"
                max="3600"
                placeholder="300"
                @blur="savePerformanceSetting('watcher.periodic-scan-interval', String(periodicScanInterval))"
                @keydown.enter="savePerformanceSetting('watcher.periodic-scan-interval', String(periodicScanInterval))"
              />
              <span class="input-suffix">秒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { useConnectionStore } from '@/stores/connection'
import {
  getSetting,
  updateSetting,
} from '@/api/backend'

const themeStore = useThemeStore()
const connectionStore = useConnectionStore()

const sections = reactive({
  server: true,
  tmdb: true,
  proxy: true,
  comic: true,
  music: true,
  appearance: true,
  library: true,
})

function toggleSection(key: keyof typeof sections) {
  sections[key] = !sections[key]
}

const backendUrlInput = ref(connectionStore.backendUrl)

function saveBackendUrl() {
  const url = backendUrlInput.value.trim()
  if (url && url !== connectionStore.backendUrl) {
    connectionStore.setBackendUrl(url)
  }
}

const themeMode = computed({
  get: () => themeStore.mode,
  set: (value: ThemeMode) => themeStore.setMode(value),
})

// TMDB settings
const tmdbApiKey = ref('')
const tmdbLanguage = ref('zh-CN')
const tmdbImageSize = ref('original')
const tmdbAutoScrape = ref(false)
const tmdbIncludeAdult = ref(true)
const tmdbMinScore = ref(0)

// Proxy settings
const proxyHost = ref('')
const proxyPort = ref(0)
const proxyStatus = ref<'idle' | 'testing' | 'ok' | 'fail'>('idle')

// Anilist settings
const anilistAutoScrape = ref(false)
const anilistMinScore = ref(0)

// Comic settings
const comicAutoScrape = ref(false)
const comicMinScore = ref(0)

// Music settings
const musicUseFolderStructure = ref(true)
const musicDefaultArtist = ref('')
const musicLyricsFallback = ref(true)
const musicCoverFallback = ref(true)

// Watcher settings
const periodicScan = ref(false)

// Performance settings
const periodicScanInterval = ref(300)

async function loadSettings() {
  try {
    const settings = await Promise.all([
      getSetting('tmdb.api-key'),
      getSetting('tmdb.language'),
      getSetting('tmdb.image-size'),
      getSetting('tmdb.auto-scrape'),
      getSetting('tmdb.include-adult'),
      getSetting('tmdb.min-score'),
      getSetting('proxy.host'),
      getSetting('proxy.port'),
      getSetting('anilist.auto-scrape'),
      getSetting('anilist.min-score'),
      getSetting('comic.auto-scrape'),
      getSetting('comic.min-score'),
      getSetting('music.use-folder-structure'),
      getSetting('music.default-artist'),
      getSetting('music.scrape.lyrics-fallback'),
      getSetting('music.scrape.cover-fallback'),
      getSetting('watcher.periodic-scan'),
      getSetting('watcher.periodic-scan-interval'),
    ])

    if (settings[0]) tmdbApiKey.value = settings[0].value
    if (settings[1]) tmdbLanguage.value = settings[1].value
    if (settings[2]) tmdbImageSize.value = settings[2].value
    if (settings[3]) tmdbAutoScrape.value = settings[3].value === 'true'
    if (settings[4]) tmdbIncludeAdult.value = settings[4].value === 'true'
    if (settings[5]) tmdbMinScore.value = parseFloat(settings[5].value) || 0
    if (settings[6]) proxyHost.value = settings[6].value
    if (settings[7]) proxyPort.value = parseInt(settings[7].value) || 0
    if (settings[8]) anilistAutoScrape.value = settings[8].value === 'true'
    if (settings[9]) anilistMinScore.value = parseFloat(settings[9].value) || 0
    if (settings[10]) comicAutoScrape.value = settings[10].value === 'true'
    if (settings[11]) comicMinScore.value = parseFloat(settings[11].value) || 0
    if (settings[12]) musicUseFolderStructure.value = settings[12].value !== 'false'
    if (settings[13]) musicDefaultArtist.value = settings[13].value
    if (settings[14]) musicLyricsFallback.value = settings[14].value !== 'false'
    if (settings[15]) musicCoverFallback.value = settings[15].value !== 'false'
    if (settings[16]) periodicScan.value = settings[16].value === 'true'
    if (settings[17]) periodicScanInterval.value = parseInt(settings[17].value) || 300
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

async function saveTmdbApiKey() {
  if (tmdbApiKey.value) {
    await updateSetting('tmdb.api-key', tmdbApiKey.value)
  }
}

async function saveTmdbSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleTmdbSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'tmdb.auto-scrape') tmdbAutoScrape.value = newValue
  if (key === 'tmdb.include-adult') tmdbIncludeAdult.value = newValue
}

async function saveProxySetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function testProxy() {
  if (!proxyHost.value || !proxyPort.value) return
  proxyStatus.value = 'testing'
  try {
    const url = `http://${proxyHost.value}:${proxyPort.value}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors',
    })
    clearTimeout(timeout)
    proxyStatus.value = 'ok'
  } catch {
    proxyStatus.value = 'fail'
  }
}

async function saveAnilistSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleAnilistSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'anilist.auto-scrape') anilistAutoScrape.value = newValue
}

async function saveComicSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleComicSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'comic.auto-scrape') comicAutoScrape.value = newValue
}

async function saveMusicSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleMusicSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'music.use-folder-structure') musicUseFolderStructure.value = newValue
  if (key === 'music.scrape.lyrics-fallback') musicLyricsFallback.value = newValue
  if (key === 'music.scrape.cover-fallback') musicCoverFallback.value = newValue
}

async function toggleWatcherSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'watcher.periodic-scan') periodicScan.value = newValue
}

async function savePerformanceSetting(key: string, value: string) {
  await updateSetting(key, value)
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-view {
  padding: 24px 32px 80px;
  overflow-y: auto;
  height: 100%;
  scroll-behavior: smooth;
}

.settings-inner {
  width: 100%;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h1 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
}

.settings-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
  overflow: hidden;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: var(--transition);
}

.section-title:hover {
  color: var(--text-secondary);
}

.section-chevron {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid currentColor;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.section-chevron.collapsed {
  transform: rotate(-90deg);
}

.section-body {
  overflow: hidden;
  max-height: 1200px;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease,
              padding 0.35s ease;
  opacity: 1;
  padding: 0 20px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0;
}

.section-body.collapsed {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  transition: var(--transition);
}

.setting-item:hover {
  background: var(--bg-hover);
}

.span-2 {
  grid-column: 1 / -1;
  position: relative;
  z-index: 2;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.item-description {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.theme-select {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 32px 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23958982' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  flex-shrink: 0;
}

.theme-select:hover {
  border-color: var(--accent);
}

.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  position: relative;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.toggle-switch:hover {
  border-color: var(--text-muted);
}

.toggle-switch.active {
  background: var(--accent);
  border-color: var(--accent);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: var(--transition);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-switch.active .toggle-thumb {
  left: 22px;
}

.btn-action {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  height: 36px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.btn-action:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-action:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-save {
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  height: 36px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-save:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.url-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.url-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  width: 280px;
  font-family: monospace;
  transition: var(--transition);
  -moz-appearance: textfield;
  flex-shrink: 0;
}

.url-input-narrow {
  width: 100px;
  font-family: var(--font-body);
}

.input-suffix {
  font-size: 13px;
  color: var(--text-muted);
}

.url-input::-webkit-outer-spin-button,
.url-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.url-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.range-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.range-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  min-width: 28px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.range-input {
  -webkit-appearance: none;
  appearance: none;
  width: 140px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.range-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.proxy-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
}

.proxy-status-bar.testing {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.proxy-status-bar.ok {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.proxy-status-bar.fail {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.proxy-status-bar.testing .status-dot {
  background: #f39c12;
  animation: pulse 1s ease-in-out infinite;
}

.proxy-status-bar.ok .status-dot {
  background: #2ecc71;
}

.proxy-status-bar.fail .status-dot {
  background: #e74c3c;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media screen and (max-width: 767px) {
  .settings-view {
    padding: 16px 16px 60px;
  }

  .settings-header h1 {
    font-size: 24px;
  }

  .section-title {
    padding: 14px 16px;
  }

  .section-body {
    padding: 0 16px 14px;
    grid-template-columns: 1fr;
  }

  .setting-item {
    padding: 8px 8px;
    flex-wrap: wrap;
  }

  .item-info {
    min-width: 100%;
    margin-bottom: 6px;
  }

  .url-input {
    width: 180px;
  }

  .url-input-narrow {
    width: 80px;
  }

  .range-input {
    width: 110px;
  }

  .range-group {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
