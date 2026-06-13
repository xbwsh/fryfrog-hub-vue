<template>
  <nav class="sidebar" :class="{ 'mobile': mobile }" :style="mobile && show === false ? { display: 'none' } : {}">
    <div class="sidebar-header">
      <div class="logo" v-show="!mobile">{{ isKomga ? '📚' : '♪' }}</div>
      <span class="logo-text" v-show="!mobile">{{ isKomga ? 'Komga' : 'Navidrome' }}</span>
    </div>

    <div v-if="isNavidrome" class="nav-section">
      <h3 class="nav-label">发现</h3>
      <router-link to="/navidrome" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
        </svg>
        推荐
      </router-link>
      <router-link to="/navidrome/albums" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="2"/>
          <path d="M4.5 9.5a5 5 0 0 1 15 0"/>
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 4v2M12 18v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4 12h2M18 12h2"/>
        </svg>
        专辑
      </router-link>
      <router-link to="/navidrome/artists" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        艺术家
      </router-link>
    </div>

    <div v-if="isNavidrome" class="nav-section">
      <h3 class="nav-label">收藏</h3>
      <router-link to="/navidrome/starred" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        收藏歌曲
      </router-link>
    </div>

    <div v-if="isNavidrome" class="nav-section">
      <h3 class="nav-label">播放列表</h3>
      <router-link to="/navidrome/playlists" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10"/>
          <polygon points="8 6 8 8 11 8 11 6"/>
          <polygon points="8 12 8 14 11 14 11 12"/>
          <polygon points="15 6 15 8 18 8 18 6"/>
          <polygon points="15 12 15 14 18 14 18 12"/>
        </svg>
        所有列表
      </router-link>
    </div>

    <div v-if="isKomga" class="nav-section">
      <h3 class="nav-label">漫画</h3>
      <router-link to="/komga" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        漫画库
      </router-link>
    </div>

    <div class="nav-section">
      <h3 class="nav-label">系统</h3>
      <router-link to="/settings" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        设置
      </router-link>
    </div>

    <div class="sidebar-footer">
      <button class="btn-disconnect" @click="$emit('disconnect')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        断开连接
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnectionStore } from '@/stores/connection'

const connectionStore = useConnectionStore()

defineProps<{
  show?: boolean
  mobile?: boolean
}>()

defineEmits<{
  disconnect: []
  close: []
}>()

const isNavidrome = computed(() => connectionStore.serviceType === 'navidrome')
const isKomga = computed(() => connectionStore.serviceType === 'komga')
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.sidebar.mobile {
  position: fixed;
  top: 56px;
  left: 0;
  z-index: 30;
  height: calc(100dvh - 56px - env(safe-area-inset-bottom));
  transform: translateX(-100%);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.sidebar.mobile:not([style*="display: none"]) {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid var(--border);
}

.sidebar.mobile .sidebar-header {
  display: none;
}

.logo {
  font-size: 28px;
  color: var(--accent);
  font-family: var(--font-display);
  text-shadow: 0 0 20px var(--accent-glow);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}

.nav-section {
  padding: 16px 12px;
}

.nav-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  padding: 0 12px;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(232, 93, 74, 0.12);
  color: var(--accent);
}

.nav-item svg {
  opacity: 0.7;
  flex-shrink: 0;
}

.nav-item.active svg {
  opacity: 1;
}

.sidebar-footer {
  margin-top: auto;
  padding: 24px 12px;
}

.theme-switcher {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 12px;
}

.theme-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
}

.theme-select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 8px 10px;
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
}

.theme-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.btn-disconnect {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 13px;
  width: 100%;
  transition: var(--transition);
}

.btn-disconnect:hover {
  background: var(--bg-hover);
  color: #ff6b6b;
}
</style>
