import axios from 'axios'
import type {
  MusicTrack,
  MusicTrackUpdateRequest,
  Comic,
  Novel,
  Movie,
  ApiResponse,
  BackendConfig,
} from '@/types/backend'

const client = axios.create()

let config: BackendConfig = {
  url: '',
  authenticated: false,
}

export function setBackendConfig(newConfig: BackendConfig) {
  config = newConfig
  client.defaults.baseURL = newConfig.url
}

export async function testConnection(): Promise<boolean> {
  try {
    const response = await client.get<ApiResponse<any[]>>('/api/v1/music', {
      params: { page: 0, size: 1 },
    })
    if (response.data.success) {
      config = {
        url: config.url,
        authenticated: true,
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Backend connection error:', error)
    return false
  }
}

export async function getAllTracks(): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music')
  return response.data.data || []
}

export async function getTrackById(id: number): Promise<MusicTrack | undefined> {
  const response = await client.get<ApiResponse<MusicTrack>>(`/api/v1/music/${id}`)
  return response.data.data
}

export async function updateTrack(id: number, data: MusicTrackUpdateRequest): Promise<boolean> {
  try {
    const response = await client.put<ApiResponse<MusicTrack>>(`/api/v1/music/${id}`, data)
    return response.data.success
  } catch {
    return false
  }
}

export async function deleteTrack(id: number): Promise<boolean> {
  try {
    const response = await client.delete<ApiResponse<void>>(`/api/v1/music/${id}`)
    return response.data.success
  } catch {
    return false
  }
}

export async function scanDirectory(path: string): Promise<string> {
  const response = await client.post<ApiResponse<string>>('/api/v1/music/scan', null, {
    params: { path },
  })
  return response.data.data
}

export async function extractMetadata(filePath: string): Promise<MusicTrack | undefined> {
  const response = await client.post<ApiResponse<MusicTrack>>('/api/v1/music/metadata', null, {
    params: { filePath },
  })
  return response.data.data
}

export async function searchByTitle(query: string): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music/search/title', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchByArtist(query: string): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music/search/artist', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchMusic(query: string): Promise<MusicTrack[]> {
  const [titleResults, artistResults] = await Promise.all([
    searchByTitle(query),
    searchByArtist(query),
  ])

  const seen = new Set<number>()
  const results: MusicTrack[] = []

  for (const track of [...titleResults, ...artistResults]) {
    if (!seen.has(track.id)) {
      seen.add(track.id)
      results.push(track)
    }
  }

  return results
}

export function getStreamUrl(id: number): string {
  return `${config.url}/api/v1/music/${id}/stream`
}

export function getMusicCoverArtUrl(id: number): string {
  return `${config.url}/api/v1/music/${id}/cover`
}

export function getLyrics(id: number): string {
  return `${config.url}/api/v1/music/${id}/lyrics`
}

export async function getAllComics(): Promise<Comic[]> {
  const response = await client.get<ApiResponse<Comic[]>>('/api/v1/comics')
  return response.data.data || []
}

export async function getComicById(id: number): Promise<Comic | undefined> {
  const response = await client.get<ApiResponse<Comic>>(`/api/v1/comics/${id}`)
  return response.data.data
}

export function getComicCoverUrl(id: number): string {
  return `${config.url}/api/v1/comics/${id}/cover`
}

export async function getAllNovels(): Promise<Novel[]> {
  const response = await client.get<ApiResponse<Novel[]>>('/api/v1/novels')
  return response.data.data || []
}

export async function getNovelById(id: number): Promise<Novel | undefined> {
  const response = await client.get<ApiResponse<Novel>>(`/api/v1/novels/${id}`)
  return response.data.data
}

export function getNovelCoverUrl(id: number): string {
  return `${config.url}/api/v1/novels/${id}/cover`
}

export async function getAllMovies(): Promise<Movie[]> {
  const response = await client.get<ApiResponse<Movie[]>>('/api/v1/movies')
  return response.data.data || []
}

export async function getMovieById(id: number): Promise<Movie | undefined> {
  const response = await client.get<ApiResponse<Movie>>(`/api/v1/movies/${id}`)
  return response.data.data
}

export function getMovieCoverUrl(id: number): string {
  return `${config.url}/api/v1/movies/${id}/cover`
}

export function getMovieStreamUrl(id: number): string {
  return `${config.url}/api/v1/movies/${id}/stream`
}

export async function toggleFavorite(id: number): Promise<MusicTrack | undefined> {
  const response = await client.put<ApiResponse<MusicTrack>>(`/api/v1/music/${id}/favorite`)
  return response.data.data
}

export async function getFavorites(): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music/favorites')
  return response.data.data || []
}
