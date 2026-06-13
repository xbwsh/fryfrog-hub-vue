export interface Album {
  id: string
  name: string
  artist: string
  artistId: string
  coverArt: string
  year?: number
  songCount: number
  playCount?: number
  song?: Track[]
}

export interface Artist {
  id: string
  name: string
  avatar: string
  albumCount: number
}

export interface Track {
  id: string
  title: string
  album: string
  albumId: string
  artist: string
  artistId: string
  duration: number
  trackNum: number
  discNum: number
  coverArt: string
  genre?: string
  year?: number
  bitrate: number
  path: string
  suffix?: string
  lyrics?: string
}

export interface Playlist {
  id: string
  name: string
  size: number
  duration: number
  public: boolean
}

export interface NowPlaying {
  id: string
  title: string
  album: string
  artist: string
  coverArt: string
  duration: number
  currentTime: number
  volume: number
  isPlaying: boolean
  shuffle: boolean
  repeat: string
}

export interface SearchResults {
  albums: Album[]
  artists: Artist[]
  songs: Track[]
  playlists: Playlist[]
}

export interface ServerConfig {
  url: string
  username: string
  password: string
  authenticated: boolean
}
