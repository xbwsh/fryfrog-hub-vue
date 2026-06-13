<template>
  <nav class="sidebar" :class="{ mobile }" :style="mobile && show === false ? { display: 'none' } : {}">
    <div class="sidebar-header">
      <div class="logo">🐸</div>
      <div class="header-info" v-show="!mobile">
        <span class="logo-text">Fryfrog Hub</span>
        <span class="user-name">{{ connectionStore.username }}</span>
      </div>
    </div>

    <div class="nav-section">
      <h3 class="nav-label">内容</h3>
      <router-link to="/" class="nav-item" active-class="active" :exact="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        首页
      </router-link>
      <router-link to="/music" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
        </svg>
        音乐
      </router-link>
      <router-link to="/favorites" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        收藏
      </router-link>
      <router-link to="/comics" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        漫画
      </router-link>
      <router-link to="/novels" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        小说
      </router-link>
      <router-link to="/movies" class="nav-item" active-class="active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/>
          <line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="7" x2="7" y2="7"/>
          <line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/>
          <line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
        影视
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
      <button class="btn-disconnect" @click="handleDisconnect">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        退出登录
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useConnectionStore } from '@/stores/connection'
import { useRouter } from 'vue-router'

const connectionStore = useConnectionStore()
const router = useRouter()

defineProps<{
  show?: boolean
  mobile?: boolean
}>()

defineEmits<{
  close: []
}>()

function handleDisconnect() {
  connectionStore.disconnect()
  router.push('/')
}
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
  top: 0;
  left: 0;
  z-index: 30;
  height: 100%;
  transform: translateX(-100%);
}

.sidebar.mobile[style*="display: none"] {
  transform: translateX(-100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.logo {
  font-size: 24px;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 11px;
  color: var(--text-muted);
}

.nav-section {
  padding: 12px 8px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 8px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent);
  color: white;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px 8px;
  border-top: 1px solid var(--border);
}

.btn-disconnect {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-disconnect:hover {
  background: var(--bg-hover);
  color: #ff6b6b;
}
</style>
