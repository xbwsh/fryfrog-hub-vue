<template>
  <div class="app-container navidrome-layout" v-if="connected && isNavidrome">
    <header class="mobile-header" v-show="showMobileMenuBtn">
      <button class="mobile-menu-btn" @click="toggleSidebar">
        <svg v-if="!showMobileSidebar" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <h1 class="mobile-title">Navidrome</h1>
    </header>
    <Sidebar 
      @disconnect="disconnect" 
      :mobile="showMobileMenuBtn"
      :show="showMobileSidebar"
      @close="showMobileSidebar = false"
    />
    <div class="main-area">
      <main class="main-content">
        <router-view v-if="!showLyricsPanel" />
        <transition name="lyrics-fade">
          <div class="lyrics-overlay" v-show="showLyricsPanel">
            <LyricsPanel @close="showLyricsPanel = false" />
          </div>
        </transition>
      </main>
      <PlayerBar @toggle-lyrics="showLyricsPanel = !showLyricsPanel" />
    </div>
    <transition name="fade">
      <div class="sidebar-overlay" v-show="showMobileMenuBtn && showMobileSidebar" @click="showMobileSidebar = false"></div>
    </transition>
  </div>

  <div class="app-container komga-layout" v-else-if="connected && isKomga">
    <header class="mobile-header" v-show="showMobileMenuBtn">
      <button class="mobile-menu-btn" @click="toggleSidebar">
        <svg v-if="!showMobileSidebar" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <h1 class="mobile-title">Komga</h1>
    </header>
    <Sidebar 
      @disconnect="disconnect" 
      :mobile="showMobileMenuBtn"
      :show="showMobileSidebar"
      @close="showMobileSidebar = false"
    />
    <div class="main-area">
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <transition name="fade">
      <div class="sidebar-overlay" v-show="showMobileMenuBtn && showMobileSidebar" @click="showMobileSidebar = false"></div>
    </transition>
  </div>

  <ServerConnect v-else-if="!restoring" @connected="onConnected" />
  <div v-else class="loading-screen">
    <div class="loading-content">
      <div class="loading-icon">{{ isKomga ? '📚' : '♪' }}</div>
      <p>正在恢复连接...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useLibraryStore } from '@/stores/library'
import ServerConnect from '@/components/ServerConnect.vue'
import Sidebar from '@/components/Sidebar.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import LyricsPanel from '@/components/LyricsPanel.vue'
import { useRouter } from 'vue-router'

const connectionStore = useConnectionStore()
const libraryStore = useLibraryStore()
const router = useRouter()

const connected = computed(() => connectionStore.connected)
const isNavidrome = computed(() => connectionStore.serviceType === 'navidrome')
const isKomga = computed(() => connectionStore.serviceType === 'komga')
const restoring = ref(false)
const showLyricsPanel = ref(false)
const showMobileSidebar = ref(false)
const showMobileMenuBtn = ref(false)

function checkMobile() {
  const isMobile = window.innerWidth < 768 || 
                   (window.innerWidth >= 768 && window.innerWidth <= 1024 && window.innerHeight < 1024)
  
  showMobileMenuBtn.value = isMobile
  if (showMobileMenuBtn.value) {
    showMobileSidebar.value = false
  } else {
    showMobileSidebar.value = true
  }
}

function toggleSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value
}

async function onConnectionSuccess() {
  if (isNavidrome.value) {
    await libraryStore.loadStarred()
    router.push('/navidrome')
  } else if (isKomga.value) {
    router.push('/komga')
  }
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  restoring.value = true
  const restored = await connectionStore.restoreConnection()
  restoring.value = false

  if (restored) {
    await nextTick()
    await onConnectionSuccess()
  }
})

watch(showMobileSidebar, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

watch(connected, (isConnected, wasConnected) => {
  if (wasConnected && !isConnected) {
    router.push('/')
  }
})

function onConnected() {
  onConnectionSuccess()
}

function disconnect() {
  connectionStore.disconnect()
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: row;
  height: 100dvh;
  height: 100vh; /* Fallback */
  width: 100vw;
  width: 100%; /* Fallback */
  overflow: hidden;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  padding-top: env(safe-area-inset-top);
  box-sizing: border-box;
}

.mobile-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.mobile-menu-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.mobile-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-display);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  position: relative;
  background: var(--bg-primary);
}

@media screen and (max-width: 767px) {
  .main-content {
    padding-top: 56px;
  }
}

.lyrics-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 20;
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: var(--accent);
  animation: bounce 1s ease-in-out infinite;
  font-family: var(--font-display);
}

.loading-content p {
  color: var(--text-secondary);
  font-size: 14px;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.lyrics-fade-enter-active,
.lyrics-fade-leave-active {
  transition: all 0.3s ease;
}

.lyrics-fade-enter-from,
.lyrics-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.lyrics-fade-enter-to,
.lyrics-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
