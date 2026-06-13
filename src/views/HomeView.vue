<template>
  <div class="home-view">
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎回来，{{ connectionStore.username }}</h1>
      <p class="welcome-subtitle">探索你的媒体库</p>
    </div>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon">🎵</span>
          <h2>音乐</h2>
        </div>
        <router-link to="/music" class="see-all">查看全部</router-link>
      </div>
      <div class="content-grid" v-if="musicTracks.length > 0">
        <div v-for="track in musicTracks.slice(0, 6)" :key="track.id" class="content-card">
          <div class="card-cover music-cover">
            <img :src="getMusicCoverArtUrl(track.id)" alt="封面" />
          </div>
          <div class="card-info">
            <span class="card-title">{{ track.title }}</span>
            <span class="card-subtitle">{{ track.artist }}</span>
          </div>
        </div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'music-' + i" class="content-card">
          <div class="card-cover music-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例音乐 {{ i }}</span>
            <span class="card-subtitle">艺术家 {{ i }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon">📚</span>
          <h2>漫画</h2>
        </div>
        <router-link to="/comics" class="see-all">查看全部</router-link>
      </div>
      <div class="content-grid" v-if="comics.length > 0">
        <div v-for="comic in comics.slice(0, 6)" :key="comic.id" class="content-card">
          <div class="card-cover comic-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">{{ comic.title }}</span>
            <span class="card-subtitle">{{ comic.author }}</span>
          </div>
        </div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'comic-' + i" class="content-card">
          <div class="card-cover comic-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例漫画 {{ i }}</span>
            <span class="card-subtitle">作者 {{ i }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon">📖</span>
          <h2>小说</h2>
        </div>
        <router-link to="/novels" class="see-all">查看全部</router-link>
      </div>
      <div class="content-grid" v-if="novels.length > 0">
        <div v-for="novel in novels.slice(0, 6)" :key="novel.id" class="content-card">
          <div class="card-cover novel-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">{{ novel.title }}</span>
            <span class="card-subtitle">{{ novel.author }}</span>
          </div>
        </div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'novel-' + i" class="content-card">
          <div class="card-cover novel-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例小说 {{ i }}</span>
            <span class="card-subtitle">作者 {{ i }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon">🎬</span>
          <h2>影视</h2>
        </div>
        <router-link to="/movies" class="see-all">查看全部</router-link>
      </div>
      <div class="content-grid" v-if="movies.length > 0">
        <div v-for="movie in movies.slice(0, 6)" :key="movie.id" class="content-card">
          <div class="card-cover movie-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">{{ movie.title }}</span>
            <span class="card-subtitle">{{ movie.year }}</span>
          </div>
        </div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'movie-' + i" class="content-card">
          <div class="card-cover movie-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例影视 {{ i }}</span>
            <span class="card-subtitle">2024</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import {
  getAllTracks,
  getAllComics,
  getAllNovels,
  getAllMovies,
  getMusicCoverArtUrl,
} from '@/api/backend'
import type { MusicTrack, Comic, Novel, Movie } from '@/types/backend'

const connectionStore = useConnectionStore()

const musicTracks = ref<MusicTrack[]>([])
const comics = ref<Comic[]>([])
const novels = ref<Novel[]>([])
const movies = ref<Movie[]>([])

onMounted(async () => {
  try {
    const [tracks, comicsData, novelsData, moviesData] = await Promise.allSettled([
      getAllTracks(),
      getAllComics(),
      getAllNovels(),
      getAllMovies(),
    ])

    if (tracks.status === 'fulfilled') musicTracks.value = tracks.value
    if (comicsData.status === 'fulfilled') comics.value = comicsData.value
    if (novelsData.status === 'fulfilled') novels.value = novelsData.value
    if (moviesData.status === 'fulfilled') movies.value = moviesData.value
  } catch (error) {
    console.error('Failed to load home data:', error)
  }
})
</script>

<style scoped>
.home-view {
  padding: 24px 32px;
  overflow-y: auto;
  height: 100%;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-subtitle {
  color: var(--text-secondary);
  font-size: 15px;
}

.content-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 20px;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.see-all {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: var(--transition);
}

.see-all:hover {
  color: var(--accent);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.content-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-cover {
  background: linear-gradient(135deg, #e85d4a, #c0392b);
}

.comic-cover {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.novel-cover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.movie-cover {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.card-info {
  padding: 12px;
}

.card-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
