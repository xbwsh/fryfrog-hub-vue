import axios from 'axios'
import type {
  VideoDTO,
  SeriesDTO,
  SeriesListDTO,
  LibrarySeriesGroupDTO,
  TmdbSearchItem,
  ApiResponse,
  BackendConfig,
  VideoProgress,
  VideoActor,
  ExternalSubtitle,
  ScrapeProgress,
  MediaLibrary,
  CreateMediaLibraryRequest,
  UpdateMediaLibraryRequest,
  DirectoryItem,
  LogFileInfo,
  SystemSetting,
  PageResponse,
  VideoMetadataUpdateRequest,
  SeriesMetadataUpdateRequest,
  FrameSelectRequest,
  SeriesFrameSelectRequest,
  PipelineProgressDTO,
  UserDTO,
  CalendarItem,
  LoginResponse,
} from '@/types/backend'

const TOKEN_KEY = 'fryfrog-token'

let onAuthRequired: (() => void) | null = null

export function setOnAuthRequired(handler: () => void) {
  onAuthRequired = handler
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const client = axios.create({
  timeout: 30000,
})

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearStoredToken()
      onAuthRequired?.()
    }
    return Promise.reject(err)
  },
)

let config: BackendConfig = {
  url: '',
  authenticated: false,
}

export function setBackendConfig(newConfig: BackendConfig) {
  config = newConfig
  client.defaults.baseURL = newConfig.url
}

export function resolveApiUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${config.url}${path}`
}

// ---------- 视频 ----------

export async function getVideoById(id: number): Promise<VideoDTO | undefined> {
  const response = await client.get<ApiResponse<VideoDTO>>(`/api/v1/video/${id}`)
  return response.data.data
}

export async function getVideoActors(id: number): Promise<VideoActor[]> {
  const response = await client.get<ApiResponse<VideoActor[]>>(`/api/v1/video/${id}/actors`)
  return response.data.data || []
}

export function getVideoActorImageUrl(actorId: number): string {
  return `${config.url}/api/v1/video/actor/${actorId}/image`
}

export function getVideoCoverUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/cover`
}

export function getVideoFanartUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/fanart`
}

export function getVideoStreamUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/stream`
}

export function getVideoTranscodeStreamUrl(id: number, quality = '1080p', subtitle?: string): string {
  const params = new URLSearchParams({ quality })
  if (subtitle) params.set('subtitle', subtitle)
  return `${config.url}/api/v1/video/${id}/stream/transcode?${params.toString()}`
}

export function getVideoPlaylistUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/playlist.m3u`
}

export async function toggleVideoFavorite(id: number, status: boolean): Promise<VideoDTO | undefined> {
  const response = await client.put<ApiResponse<VideoDTO>>(`/api/v1/video/${id}/favorite`, null, {
    params: { status },
  })
  return response.data.data
}

export async function setVideoWatched(id: number, completed: boolean): Promise<VideoProgress | undefined> {
  const response = await client.put<ApiResponse<VideoProgress>>(`/api/v1/video/${id}/watched`, { completed })
  return response.data.data
}

export async function getVideoProgress(id: number): Promise<VideoProgress | null> {
  const response = await client.get<ApiResponse<VideoProgress>>(`/api/v1/video/${id}/progress`)
  return response.data.data || null
}

export async function saveVideoProgress(id: number, position: number, duration: number): Promise<VideoProgress> {
  const response = await client.put<ApiResponse<VideoProgress>>(`/api/v1/video/${id}/progress`, { position, duration })
  return response.data.data
}

export async function deleteVideoProgress(id: number): Promise<void> {
  await client.delete<ApiResponse<unknown>>(`/api/v1/video/${id}/progress`)
}

export async function searchTmdb(query: string): Promise<TmdbSearchItem[]> {
  const response = await client.get<ApiResponse<TmdbSearchItem[]>>('/api/v1/video/tmdb/search', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function bindTmdb(id: number, tmdbId: number, mediaType: string): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/video/${id}/tmdb/bind`, { tmdbId, mediaType })
  return response.data.data
}

export async function refreshTmdb(id: number): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/video/${id}/tmdb/refresh`)
  return response.data.data
}

export async function unbindTmdb(id: number): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/video/${id}/tmdb/unbind`)
  return response.data.data
}

export async function getNfoContent(id: number): Promise<string> {
  const response = await client.get<ApiResponse<string>>(`/api/v1/video/${id}/nfo`)
  return response.data.data
}

export async function generateNfo(id: number): Promise<Record<string, string>> {
  const response = await client.post<ApiResponse<Record<string, string>>>(`/api/v1/video/${id}/nfo`)
  return response.data.data
}

export async function downloadVideoCovers(id: number): Promise<Record<string, string>> {
  const response = await client.post<ApiResponse<Record<string, string>>>(`/api/v1/video/${id}/covers`)
  return response.data.data
}

export async function updateVideoMetadata(id: number, data: VideoMetadataUpdateRequest): Promise<VideoDTO> {
  const response = await client.put<ApiResponse<VideoDTO>>(`/api/v1/video/${id}/metadata`, data)
  return response.data.data
}

export async function generateFrameCandidates(id: number): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/video/${id}/frames`)
  return response.data.data
}

export function getFrameCandidateImageUrl(id: number, index: number): string {
  return `${config.url}/api/v1/video/${id}/frames/${index}`
}

export async function selectFrame(id: number, data: FrameSelectRequest): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/video/${id}/frames/select`, data)
  return response.data.data
}

export async function refreshAllMovieActors(): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>('/api/v1/video/refresh-all-actors')
  return response.data.data
}

export async function rescrapeByLibrary(libraryId: number): Promise<string> {
  const response = await client.post<ApiResponse<string>>(`/api/v1/video/tmdb/rescrape-library/${libraryId}`)
  return response.data.data
}

export async function getScrapeProgress(module?: string): Promise<ScrapeProgress | null> {
  const response = await client.get<ApiResponse<ScrapeProgress>>('/api/v1/video/scrape/progress', {
    params: module ? { module } : {},
  })
  return response.data.data || null
}

// 外挂字幕
interface SubtitleEntry {
  filename?: string
  fileName?: string
  language?: string
  url?: string
}

export async function getExternalSubtitles(id: number): Promise<ExternalSubtitle[]> {
  const response = await client.get<ApiResponse<SubtitleEntry[]>>(`/api/v1/video/${id}/subtitles`)
  const data = response.data.data || []
  return data.map(item => ({
    fileName: item.filename || item.fileName || '',
    language: item.language || '',
    url: item.url || '',
  }))
}

export function getExternalSubtitleUrl(id: number, fileName: string): string {
  return `${config.url}/api/v1/video/${id}/subtitles/${encodeURIComponent(fileName)}`
}

// ---------- 视频系列 ----------

export async function getAllSeries(): Promise<SeriesListDTO[]> {
  const page = await getSeriesPage(0, 500)
  return page.content
}

export async function getSeriesPage(page = 0, size = 20): Promise<PageResponse<SeriesListDTO>> {
  const response = await client.get<ApiResponse<PageResponse<SeriesListDTO>>>('/api/v1/video/series', {
    params: { page, size },
  })
  return response.data.data
}

export async function getSeriesById(id: number, type?: 'series' | 'standalone'): Promise<SeriesDTO | undefined> {
  const response = await client.get<ApiResponse<SeriesDTO>>(`/api/v1/video/series/${id}`, {
    params: type ? { type } : {},
  })
  return response.data.data
}

export async function getSeriesGroupedByLibrary(): Promise<LibrarySeriesGroupDTO[]> {
  const response = await client.get<ApiResponse<LibrarySeriesGroupDTO[]>>('/api/v1/video/series/grouped-by-library')
  return response.data.data || []
}

export function getSeriesPosterUrl(id: number): string {
  return `${config.url}/api/v1/video/series/${id}/cover`
}

export function getSeriesFanartUrl(id: number): string {
  return `${config.url}/api/v1/video/series/${id}/fanart`
}

export function getSeasonCoverUrl(seriesId: number, seasonNumber: number): string {
  return `${config.url}/api/v1/video/series/${seriesId}/season/${seasonNumber}/cover`
}

export async function getFavoriteSeries(): Promise<SeriesListDTO[]> {
  const response = await client.get<ApiResponse<SeriesListDTO[]>>('/api/v1/video/series/favorites')
  return response.data.data || []
}

export async function getUpcomingCalendar(): Promise<CalendarItem[]> {
  const response = await client.get<ApiResponse<CalendarItem[]>>('/api/v1/video/series/calendar')
  return response.data.data || []
}

export async function updateSeriesMetadata(id: number, data: SeriesMetadataUpdateRequest): Promise<SeriesDTO> {
  const response = await client.put<ApiResponse<SeriesDTO>>(`/api/v1/video/series/${id}/metadata`, data)
  return response.data.data
}

export async function setSeriesFavorite(id: number, status: boolean): Promise<SeriesDTO> {
  const response = await client.put<ApiResponse<SeriesDTO>>(`/api/v1/video/series/${id}/favorite`, null, {
    params: { status },
  })
  return response.data.data
}

export async function refreshSeasonCovers(seriesId: number): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/video/series/${seriesId}/refresh-season-covers`)
  return response.data.data
}

export async function selectSeriesFanart(seriesId: number, data: SeriesFrameSelectRequest): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/video/series/${seriesId}/frames/select`, data)
  return response.data.data
}

export async function refreshAllSeasonCovers(): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>('/api/v1/video/series/refresh-all-season-covers')
  return response.data.data
}

export async function getVideoFavorites(): Promise<VideoDTO[]> {
  const response = await client.get<ApiResponse<PageResponse<VideoDTO>>>('/api/v1/video/favorites', {
    params: { page: 0, size: 500 },
  })
  return response.data.data?.content || []
}

export async function searchVideoByTitle(query: string, page = 0, size = 20): Promise<PageResponse<VideoDTO>> {
  const response = await client.get<ApiResponse<PageResponse<VideoDTO>>>('/api/v1/video/search/title', {
    params: { q: query, page, size },
  })
  return response.data.data
}

export async function searchVideoByDirector(query: string, page = 0, size = 20): Promise<PageResponse<VideoDTO>> {
  const response = await client.get<ApiResponse<PageResponse<VideoDTO>>>('/api/v1/video/search/director', {
    params: { q: query, page, size },
  })
  return response.data.data
}

// ---------- 系统设置 ----------

export async function getAllSettings(): Promise<SystemSetting[]> {
  const response = await client.get<ApiResponse<SystemSetting[]>>('/api/v1/settings')
  return response.data.data || []
}

export async function getSetting(key: string): Promise<SystemSetting | null> {
  try {
    const response = await client.get<ApiResponse<SystemSetting>>(`/api/v1/settings/${key}`)
    return response.data.success ? response.data.data : null
  } catch {
    return null
  }
}

export async function updateSetting(key: string, value: string): Promise<SystemSetting> {
  const response = await client.put<ApiResponse<SystemSetting>>(`/api/v1/settings/${key}`, { value })
  return response.data.data
}

// ---------- 媒体资源库 ----------

export async function getAllMediaLibraries(): Promise<MediaLibrary[]> {
  const response = await client.get<ApiResponse<MediaLibrary[]>>('/api/v1/media-libraries')
  return response.data.data || []
}

export async function getMediaLibraryById(id: number): Promise<MediaLibrary | undefined> {
  const response = await client.get<ApiResponse<MediaLibrary>>(`/api/v1/media-libraries/${id}`)
  return response.data.data
}

export async function createMediaLibrary(data: CreateMediaLibraryRequest): Promise<MediaLibrary> {
  const response = await client.post<ApiResponse<MediaLibrary>>('/api/v1/media-libraries', data)
  return response.data.data
}

export async function updateMediaLibrary(id: number, data: UpdateMediaLibraryRequest): Promise<MediaLibrary> {
  const response = await client.put<ApiResponse<MediaLibrary>>(`/api/v1/media-libraries/${id}`, data)
  return response.data.data
}

export async function deleteMediaLibrary(id: number): Promise<void> {
  await client.delete(`/api/v1/media-libraries/${id}`)
}

export async function toggleMediaLibrary(id: number): Promise<MediaLibrary> {
  const response = await client.put<ApiResponse<MediaLibrary>>(`/api/v1/media-libraries/${id}/toggle`)
  return response.data.data
}

export async function browseDirectory(path?: string): Promise<DirectoryItem[]> {
  const response = await client.get<ApiResponse<DirectoryItem[]>>('/api/v1/media-libraries/browse', {
    params: path ? { path } : {},
  })
  return response.data.data || []
}

export async function scanAllLibraries(): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>('/api/v1/media-libraries/scan')
  return response.data.data
}

export async function scanLibraryById(libraryId: number): Promise<Record<string, unknown>> {
  const response = await client.post<ApiResponse<Record<string, unknown>>>(`/api/v1/media-libraries/${libraryId}/scan`)
  return response.data.data
}

export async function getPipelineProgress(libraryId: number): Promise<PipelineProgressDTO> {
  const response = await client.get<ApiResponse<PipelineProgressDTO>>(`/api/v1/media-libraries/${libraryId}/pipeline-progress`)
  return response.data.data
}

export async function getScanProgress(libraryId?: number): Promise<ScrapeProgress[]> {
  const response = await client.get<ApiResponse<ScrapeProgress[]>>('/api/v1/media-libraries/scan/progress', {
    params: libraryId ? { libraryId } : {},
  })
  return response.data.data || []
}

// ---------- 日志 ----------

export async function getLogFiles(): Promise<LogFileInfo[]> {
  const response = await client.get<ApiResponse<LogFileInfo[]>>('/api/v1/logs')
  return response.data.data || []
}

export function getLogDownloadUrl(fileName: string): string {
  return `${config.url}/api/v1/logs/${encodeURIComponent(fileName)}`
}

// ---------- 认证 ----------

export async function authLogin(username = 'admin', password: string): Promise<LoginResponse> {
  try {
    const response = await client.post<{ token?: string; user?: UserDTO }>('/api/v1/auth/login', {
      username,
      password,
    })
    if (!response.data.token) throw new Error('登录失败：未获取到 token')
    const result: LoginResponse = { token: response.data.token, user: response.data.user }
    setStoredToken(result.token)
    return result
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string } | undefined
      if (data?.message) {
        const retry = (err.response?.data as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds
        const msg = retry
          ? `${data.message}（等待 ${Math.ceil(retry / 60)} 分钟后再试）`
          : data.message
        throw new Error(msg)
      }
    }
    throw err
  }
}

export async function authLogout(): Promise<void> {
  try {
    await client.post('/api/v1/auth/logout')
  } finally {
    clearStoredToken()
  }
}

export async function authStatus(): Promise<boolean> {
  try {
    const response = await client.get<{ enabled?: boolean }>('/api/v1/auth/status')
    return response.data.enabled === true
  } catch {
    return false
  }
}

export async function getCurrentUser(): Promise<UserDTO | undefined> {
  try {
    const response = await client.get<ApiResponse<UserDTO>>('/api/v1/auth/me')
    return response.data.data
  } catch {
    return undefined
  }
}

export async function verifyToken(): Promise<boolean> {
  try {
    await client.get('/api/v1/settings')
    return true
  } catch {
    return false
  }
}
