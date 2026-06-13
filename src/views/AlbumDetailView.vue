<template>
  <div class="album-detail-view">
    <div v-if="album" class="detail-container">
      <router-link to="/navidrome/albums" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        返回专辑列表
      </router-link>
      <AlbumDetail :album="album" />
    </div>
    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>加载专辑详情...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Album } from '@/types/navidrome'
import { getAlbumById } from '@/api/navidrome'
import AlbumDetail from '@/components/AlbumDetail.vue'

const route = useRoute()
const album = ref<Album | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    try {
      album.value = await getAlbumById(id) || null
    } catch (e) {
      console.error('加载专辑失败:', e)
    }
  }
})
</script>

<style scoped>
.album-detail-view {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
  padding: 16px 32px 0;
  transition: var(--transition);
  width: fit-content;
}

.back-btn:hover {
  color: var(--accent);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-hover);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
