export interface MusicTrack {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  artist: string
  album: string
  albumArtist: string
  trackNumber: number
  discNumber: number
  year: number
  genre: string
  filePath: string
  fileName: string
  fileSize: number
  durationSeconds: number
  bitrateKbps: number
  format: string
  coverArtPath: string
  lyrics: string
  favorite: boolean
}

export interface MusicTrackUpdateRequest {
  title: string
  artist?: string
  album?: string
  albumArtist?: string
  trackNumber?: number
  discNumber?: number
  year?: number
  genre?: string
}

export interface Comic {
  id: number
  title: string
  author: string
  description: string
  coverPath: string
  status: string
  genres: string[]
  createdAt: string
  updatedAt: string
}

export interface Novel {
  id: number
  title: string
  author: string
  description: string
  coverPath: string
  status: string
  genres: string[]
  wordCount: number
  createdAt: string
  updatedAt: string
}

export interface Movie {
  id: number
  title: string
  director: string
  description: string
  coverPath: string
  year: number
  duration: number
  genres: string[]
  rating: number
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface BackendConfig {
  url: string
  authenticated: boolean
}
