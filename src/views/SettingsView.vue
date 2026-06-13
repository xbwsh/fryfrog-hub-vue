<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>设置</h1>
    </div>

    <div class="settings-section">
      <h2 class="section-title">播放设置</h2>
      <div class="settings-item">
        <div class="item-info">
          <h3 class="item-label">边听边存</h3>
          <p class="item-description">开启后，播放的歌曲会自动缓存到本地，再次播放时无需重复请求服务器</p>
        </div>
        <button 
          class="toggle-switch"
          :class="{ active: playerStore.downloadEnabled }"
          @click="toggleDownload"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">主题设置</h2>
      <div class="settings-item">
        <div class="item-info">
          <h3 class="item-label">主题模式</h3>
          <p class="item-description">选择应用的主题外观</p>
        </div>
        <select v-model="themeMode" class="theme-select">
          <option value="system">跟随系统</option>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">缓存管理</h2>
      <div class="settings-item">
        <div class="item-info">
          <h3 class="item-label">清除缓存</h3>
          <p class="item-description">清除所有已缓存的歌曲数据（{{ cachedTrackCount }} 首歌曲）</p>
        </div>
        <button class="btn-clear" @click="clearCache">
          清除
        </button>
      </div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">漫画设置</h2>
      <div class="settings-item">
        <div class="item-info">
          <h3 class="item-label">隐私模式</h3>
          <p class="item-description">开启后，漫画封面将被替换为默认封面，保护隐私</p>
        </div>
        <button 
          class="toggle-switch"
          :class="{ active: connectionStore.privacyMode }"
          @click="togglePrivacyMode"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { useConnectionStore } from '@/stores/connection'

const playerStore = usePlayerStore()
const themeStore = useThemeStore()
const connectionStore = useConnectionStore()

const themeMode = computed({
  get: () => themeStore.mode,
  set: (value: ThemeMode) => themeStore.setMode(value),
})

const cachedTrackCount = computed(() => playerStore.downloadedTracks.size)

function toggleDownload() {
  playerStore.setDownloadEnabled(!playerStore.downloadEnabled)
}

function togglePrivacyMode() {
  connectionStore.privacyMode = !connectionStore.privacyMode
}

function clearCache() {
  if (confirm('确定要清除所有缓存的歌曲吗？')) {
    playerStore.downloadedTracks = new Map()
    localStorage.removeItem('downloadedTracks')
  }
}
</script>

<style scoped>
.settings-view {
  padding: 24px 32px;
  overflow-y: auto;
  height: 100%;
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
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.settings-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.item-description {
  font-size: 12px;
  color: var(--text-muted);
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--bg-hover);
  cursor: pointer;
  transition: var(--transition);
  border: none;
  padding: 0;
}

.toggle-switch.active {
  background: var(--accent);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: var(--transition);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(20px);
}

.theme-select {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
  min-width: 140px;
}

.theme-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.btn-clear {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-clear:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}
</style>