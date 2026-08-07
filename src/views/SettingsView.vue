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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { useConnectionStore } from '@/stores/connection'

const themeStore = useThemeStore()
const connectionStore = useConnectionStore()

const sections = reactive({
  server: true,
  appearance: true,
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

.url-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* 平板横屏 */
@media screen and (min-width: 768px) and (max-width: 1279px) {
  .section-body {
    grid-template-columns: 1fr 1fr;
  }

  .setting-item {
    padding: 8px 8px;
  }

  .url-input {
    width: 160px;
  }
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
}
</style>
