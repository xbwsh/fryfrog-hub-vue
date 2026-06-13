<template>
  <div class="artists-view">
    <div class="view-header">
      <h1>艺术家</h1>
    </div>

    <div v-if="!libraryStore.loading" class="artists-grid">
      <div
        v-for="artist in libraryStore.artists"
        :key="artist.id"
        class="artist-card"
      >
        <div class="artist-avatar">
          {{ artist.name.charAt(0).toUpperCase() }}
        </div>
        <div class="artist-info">
          <h4 class="artist-name">{{ artist.name }}</h4>
          <p>{{ artist.albumCount }} 张专辑</p>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>加载艺术家中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLibraryStore } from '@/stores/library'

const libraryStore = useLibraryStore()

onMounted(() => {
  libraryStore.loadArtists()
})
</script>

<style scoped>
.artists-view {
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

.artists-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.artist-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  cursor: pointer;
}

.artist-card:hover {
  background: var(--bg-hover);
}

.artist-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #c0392b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.artist-info {
  overflow: hidden;
}

.artist-name {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-info p {
  font-size: 13px;
  color: var(--text-muted);
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
</style>
