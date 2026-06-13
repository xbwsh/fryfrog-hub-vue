<template>
  <div class="albums-view">
    <div class="view-header">
      <h1>专辑</h1>
    </div>

    <div class="albums-content" v-if="!libraryStore.loading">
      <AlbumGrid :albums="libraryStore.albums" @select="selectAlbum" />
    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>加载专辑中...</p>
    </div>

    <div v-if="libraryStore.error" class="error-banner">
      {{ libraryStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLibraryStore } from '@/stores/library'
import AlbumGrid from '@/components/AlbumGrid.vue'
import { useRouter } from 'vue-router'
import type { Album } from '@/types/navidrome'

const libraryStore = useLibraryStore()
const router = useRouter()

function selectAlbum(album: Album) {
  router.push({
    name: 'album-detail',
    params: { id: album.id },
    query: { name: album.name, artist: album.artist },
  })
}

onMounted(() => {
  libraryStore.loadAlbums()
})
</script>

<style scoped>
.albums-view {
  padding: 24px 32px;
  overflow-y: auto;
  height: 100%;
}

.view-header h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 24px;
}

.albums-content {
  padding: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
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

.error-banner {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-top: 16px;
  font-size: 14px;
}
</style>
