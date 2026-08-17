<template>
  <nav class="sidebar" :class="{ mobile, tablet, open: mobile && show }">
    <div class="sidebar-header">
      <span class="logo-text">Fryfrog Hub</span>
    </div>

    <div class="nav-section" @click="emit('close')">
      <h3 class="nav-label">概览</h3>
      <router-link to="/" class="nav-item" active-class="active" :exact="true">
        <AppIcon name="home" :size="20" />
        仪表盘
      </router-link>
    </div>

    <div class="nav-section" @click="emit('close')">
      <h3 class="nav-label">媒体管理</h3>
      <router-link to="/videos" class="nav-item" active-class="active">
        <AppIcon name="film" :size="20" />
        视频管理
      </router-link>
      <router-link to="/media-libraries" class="nav-item" active-class="active">
        <AppIcon name="folder" :size="20" />
        媒体库
      </router-link>
    </div>

    <div class="nav-section" @click="emit('close')">
      <h3 class="nav-label">系统管理</h3>
      <router-link to="/settings" class="nav-item" active-class="active">
        <AppIcon name="settings" :size="20" />
        系统设置
      </router-link>
      <router-link to="/logs" class="nav-item" active-class="active">
        <AppIcon name="file-text" :size="20" />
        日志管理
      </router-link>
    </div>

    <div class="nav-section" @click="emit('close')">
      <h3 class="nav-label">开发工具</h3>
      <router-link to="/icons" class="nav-item" active-class="active">
        <AppIcon name="grid" :size="20" />
        图标库
      </router-link>
      <router-link to="/colors" class="nav-item" active-class="active">
        <AppIcon name="dropper" :size="20" />
        色彩
      </router-link>
    </div>

    <div class="sidebar-footer">
      <button class="btn-disconnect" @click="handleDisconnect">
        <AppIcon name="logout" :size="18" />
        退出登录
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useConnectionStore } from '@/stores/connection'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const connectionStore = useConnectionStore()
const router = useRouter()

defineProps<{
  show?: boolean
  mobile?: boolean
  tablet?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

async function handleDisconnect() {
  await connectionStore.disconnect()
  emit('close')
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

.sidebar.tablet {
  width: 150px;
}

.sidebar.mobile {
  width: 150px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  height: 100%;
  transform: translateX(-100%);
}

.sidebar.mobile.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
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
  margin-bottom: 4px;
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
