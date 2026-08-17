export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface BackendConfig {
  url: string
  authenticated: boolean
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface UserDTO {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
  role: string
  enabled: boolean
  createdAt: string | null
  lastLoginAt: string | null
}

export interface LoginResponse {
  token: string
  user?: UserDTO
}

export interface VideoDTO {
  id: number
  title: string
  logoUrl: string | null
  coverUrl: string | null
  fanartUrl: string | null
  streamUrl: string | null
  originalTitle: string | null
  director: string | null
  actors: string | null
  genre: string | null
  year: number | null
  durationMinutes: number | null
  overview: string | null
  fileName: string | null
  originalFileName: string | null
  fileSize: number | null
  format: string | null
  favorite: boolean
  tmdbId: number | null
  mediaType: string | null
  imdbId: string | null
  rating: number | null
  voteCount: number | null
  status: string | null
  metadataSource: string | null
  metadataUpdatedAt: string | null
  hasMetadataDir: boolean
  hasNfo: boolean
  hasPoster: boolean
  hasFanart: boolean
  releaseDate: string | null
  tags: string | null
  scraped: boolean
  isSeries: boolean
  libraryId: number | null
  seriesId: number | null
  seriesTitle: string | null
  seasonNumber: number | null
  episodeNumber: number | null
  watchPosition: number | null
  watchProgressPercent: number | null
  watched: boolean | null
  isAdult: boolean | null
  resolution: string | null
  resolutionLabel: string | null
}

export interface VideoProgress {
  videoId: number
  positionSeconds: number
  durationSeconds: number
  completed: boolean
  progressPercent: number
  updatedAt: string
}

export interface SeasonDTO {
  seasonNumber: number
  coverUrl: string | null
  episodes: VideoDTO[]
}

export interface SeriesDTO {
  id: number
  type: 'series' | 'standalone'
  title: string
  logoUrl: string | null
  coverUrl: string | null
  fanartUrl: string | null
  originalTitle: string | null
  overview: string | null
  mediaType: string | null
  tmdbId: number | null
  rating: number | null
  year: number | null
  releaseDate: string | null
  seasonNumber: number | null
  numberOfSeasons: number | null
  totalEpisodes: number
  status: string | null
  isAdult: boolean | null
  favorite: boolean
  episodeCount: number
  seasons: SeasonDTO[]
}

export interface SeriesListDTO {
  id: number
  type: 'series' | 'standalone'
  title: string
  logoUrl: string | null
  coverUrl: string | null
  fanartUrl: string | null
  originalTitle: string | null
  mediaType: string | null
  rating: number | null
  year: number | null
  releaseDate: string | null
  numberOfSeasons: number | null
  totalEpisodes: number
  episodeCount: number
  isAdult: boolean | null
  favorite: boolean
  hasAdultEpisodes: boolean | null
}

export interface LibrarySeriesGroupDTO {
  libraryId: number
  libraryName: string
  libraryPath: string
  subType: string | null
  series: SeriesListDTO[]
  standaloneVideos: SeriesListDTO[]
  seriesCount: number
  standaloneCount: number
}

export interface CalendarItem {
  seriesId: number
  title: string
  coverUrl: string | null
  fanartUrl: string | null
  nextEpisodeDate: string | null
  nextEpisodeNumber: string | null
}

export interface TmdbSearchItem {
  id: number
  year: number | null
  title: string
  original_title: string
  name: string
  original_name: string
  overview: string
  release_date: string
  first_air_date: string
  poster_path: string
  backdrop_path: string
  genre_ids: number[]
  vote_average: number
  vote_count: number
  media_type: string
  popularity: number
  adult: boolean
}

export interface VideoActor {
  id: number
  createdAt: string
  updatedAt: string
  name: string
  character: string | null
  sourceActorId: number | null
  imageUrl: string | null
}

export interface ExternalSubtitle {
  fileName: string
  language: string
  url?: string
}

export interface ScrapeItemStatus {
  name: string
  status: string
  error: string | null
  processedAt: string | null
}

export interface ScrapeProgress {
  module: string
  stage: string | null
  running: boolean
  total: number
  completed: number
  failed: number
  skipped: number
  pending: number
  startedAt: string | null
  updatedAt: string | null
  currentItem: string | null
  items: ScrapeItemStatus[]
  percent: number
}

export type MediaLibraryType = 'VIDEO' | 'MUSIC' | 'COMIC' | 'EBOOK'
export type VideoSubType = 'MOVIE' | 'TV' | 'MIXED'

export interface MediaLibrary {
  id: number
  name: string
  path: string
  type: MediaLibraryType
  subType: VideoSubType | null
  enabled: boolean
  enableScraping: boolean
  isAdult: boolean
  sortOrder: number
  description: string | null
  mediaTypeFilter: string | null
  movieSubType: boolean
  tvSubType: boolean
  videoType: boolean
  mixedSubType: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMediaLibraryRequest {
  name: string
  path: string
  type: MediaLibraryType
  subType?: VideoSubType
  enabled?: boolean
  enableScraping?: boolean
  isAdult?: boolean
  sortOrder?: number
  description?: string
}

export interface UpdateMediaLibraryRequest {
  name?: string
  path?: string
  type?: MediaLibraryType
  subType?: VideoSubType
  enabled?: boolean
  enableScraping?: boolean
  isAdult?: boolean
  sortOrder?: number
  description?: string
}

export interface DirectoryItem {
  name: string
  path: string
  writable: boolean
}

export interface SystemSetting {
  id: number
  key: string
  value: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface LogFileInfo {
  name: string
  size: number
  lastModified: string
}

export interface VideoMetadataUpdateRequest {
  title?: string
  overview?: string
  rating?: number
  year?: number
  releaseDate?: string
  genre?: string
  director?: string
  actors?: string
  originalTitle?: string
  tags?: string
}

export interface SeriesMetadataUpdateRequest {
  title?: string
  overview?: string
  rating?: number
  year?: number
  releaseDate?: string
  originalTitle?: string
  status?: string
}

export interface FrameSelectRequest {
  index?: number
  type?: 'poster' | 'fanart'
}

export interface SeriesFrameSelectRequest {
  videoId?: number
  index?: number
}

export interface PipelineProgressDTO {
  libraryId: number
  stage: string
  running: boolean
  percent: number
  currentItem: string
  scrapingEnabled: boolean
  scanPercent: number
  scrapePercent: number
}
