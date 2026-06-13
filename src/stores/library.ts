import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Album, Artist, Track, Playlist } from '@/types/navidrome'
import {
  getAlbums,
  getArtists,
  getRandomTracks,
  getPlaylists,
  getPlaylistTracks,
  getStarred,
  getAllTracks,
  getLyrics,
  getLyricsBySongId,
  star,
} from '@/api/navidrome'

export const useLibraryStore = defineStore('library', () => {
  const albums = ref<Album[]>([])
  const artists = ref<Artist[]>([])
  const playlists = ref<Playlist[]>([])
  const allTracks = ref<Track[]>([])
  const starredTracks = ref<Track[]>([])
  const featuredTracks = ref<Track[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentLyrics = ref('')

  const albumMap = computed(() => {
    const map = new Map<string, Album>()
    albums.value.forEach(album => map.set(album.id, album))
    return map
  })

  const starredTrackIds = computed(() => {
    return starredTracks.value.map(t => t.id)
  })

  function isTrackStarred(trackId: string): boolean {
    return starredTrackIds.value.includes(trackId)
  }

  async function loadAlbums(page = 0) {
    loading.value = true
    error.value = null
    try {
      albums.value = await getAlbums(page)
    } catch (e) {
      error.value = '加载专辑失败'
    }
    loading.value = false
  }

  async function loadArtists() {
    loading.value = true
    error.value = null
    try {
      artists.value = await getArtists()
    } catch (e) {
      error.value = '加载艺术家失败'
    }
    loading.value = false
  }

  async function loadPlaylists() {
    loading.value = true
    error.value = null
    try {
      playlists.value = await getPlaylists()
    } catch (e) {
      error.value = '加载播放列表失败'
    }
    loading.value = false
  }

  async function loadAllTracks() {
    loading.value = true
    error.value = null
    try {
      allTracks.value = await getAllTracks(0, 500)
    } catch (e) {
      error.value = '加载所有歌曲失败'
    }
    loading.value = false
  }

  async function loadStarred() {
    loading.value = true
    error.value = null
    try {
      starredTracks.value = await getStarred()
    } catch (e) {
      error.value = '加载收藏失败'
    }
    loading.value = false
  }

  async function loadFeatured() {
    try {
      featuredTracks.value = await getRandomTracks(30)
    } catch {
      // silent fail
    }
  }

  async function getPlaylistPlaylist(playlistId: string): Promise<Track[]> {
    return getPlaylistTracks(playlistId)
  }

  async function fetchLyrics(artist: string, title: string, songId?: string): Promise<string> {
    if (songId) {
      const lyrics = await getLyricsBySongId(songId)
      if (lyrics) {
        currentLyrics.value = lyrics
        return lyrics
      }
    }
    const lyrics = await getLyrics(artist, title)
    currentLyrics.value = lyrics
    return lyrics
  }

  async function toggleStar(id: string, currentStarred: boolean, track?: Track): Promise<boolean> {
    const success = await star(id, !currentStarred)
    if (success) {
      if (!currentStarred) {
        let trackToAdd = track
        if (!trackToAdd) {
          trackToAdd = allTracks.value.find(t => t.id === id)
        }
        if (trackToAdd) {
          starredTracks.value = [...starredTracks.value, trackToAdd]
        }
      } else {
        starredTracks.value = starredTracks.value.filter(t => t.id !== id)
      }
    }
    return success
  }

  return {
    albums,
    artists,
    playlists,
    allTracks,
    starredTracks,
    featuredTracks,
    loading,
    error,
    currentLyrics,
    albumMap,
    loadAlbums,
    loadArtists,
    loadPlaylists,
    loadAllTracks,
    loadStarred,
    loadFeatured,
    fetchLyrics,
    toggleStar,
    getPlaylistPlaylist,
    isTrackStarred,
  }
})
