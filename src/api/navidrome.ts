import axios from 'axios'
import type {
  Album,
  Artist,
  Track,
  Playlist,
  SearchResults,
  ServerConfig,
} from '@/types/navidrome'

const client = axios.create()

let config: ServerConfig = {
  url: '',
  username: '',
  password: '',
  authenticated: false,
}

type ParamValue = string | number | boolean | Array<string | number | boolean>

function getAuthParams() {
  return {
    u: config.username,
    p: config.password,
    v: '1.16.1',
    c: 'navidrome-player',
    f: 'json',
  }
}

function buildUrl(action: string, params: Record<string, ParamValue> = {}): string {
  const searchParams = new URLSearchParams()
  const allParams = { ...getAuthParams(), ...params }

  Object.entries(allParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, String(item)))
    } else {
      searchParams.append(key, String(value))
    }
  })

  return `/rest/${action}.view?${searchParams.toString()}`
}

function getResponseData(response: { data: any }) {
  return response.data['subsonic-response'] || response.data
}

export function setServerConfig(newConfig: ServerConfig) {
  config = newConfig
  client.defaults.baseURL = newConfig.url
}

export async function authenticate(username: string, password: string): Promise<boolean> {
  try {
    const response = await client.get('/rest/ping.view', {
      params: {
        u: username,
        p: password,
        v: '1.16.1',
        c: 'navidrome-player',
        f: 'json',
      },
    })
    const data = getResponseData(response)
    if (data.status === 'ok') {
      config = {
        url: config.url,
        username,
        password,
        authenticated: true,
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Navidrome authentication error:', error)
    return false
  }
}

export async function getAlbums(page = 0, pageSize = 50): Promise<Album[]> {
  const response = await client.get(buildUrl('getAlbumList2', {
    type: 'newest',
    offset: page * pageSize,
    size: pageSize,
  }))
  return getResponseData(response).albumList2?.album || []
}

export async function getAlbumById(id: string): Promise<Album | undefined> {
  const response = await client.get(buildUrl('getAlbum', { id }))
  return getResponseData(response).album
}

export async function getTracksByAlbum(albumId: string): Promise<Track[]> {
  const album = await getAlbumById(albumId)
  return (album?.song || []) as Track[]
}

export async function getArtists(): Promise<Artist[]> {
  const response = await client.get(buildUrl('getArtists'))
  const artists = getResponseData(response).artists?.index || []
  return artists.flatMap((index: { artist?: Artist[] }) => index.artist || [])
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const response = await client.get(buildUrl('getArtist', { id }))
  return getResponseData(response).artist
}

export async function getRandomTracks(size = 20): Promise<Track[]> {
  const response = await client.get(buildUrl('getRandomSongs', { size }))
  return getResponseData(response).randomSongs?.song || []
}

export async function search(query: string, limit = 20): Promise<SearchResults> {
  const response = await client.get(buildUrl('search3', {
    query,
    artistCount: limit,
    albumCount: limit,
    songCount: limit,
  }))
  const data = getResponseData(response).searchResult3 || {}
  return {
    albums: (data.album || []) as Album[],
    artists: (data.artist || []) as Artist[],
    songs: (data.song || []) as Track[],
    playlists: [],
  }
}

export async function getPlaylists(): Promise<Playlist[]> {
  const response = await client.get(buildUrl('getPlaylists'))
  return getResponseData(response).playlists?.playlist || []
}

export async function getAllTracks(page = 0, pageSize = 50): Promise<Track[]> {
  const response = await client.get(buildUrl('getAllSongs', {
    offset: page * pageSize,
    size: pageSize,
  }))
  return getResponseData(response).songs?.song || []
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const response = await client.get(buildUrl('getPlaylist', { id: playlistId }))
  return (getResponseData(response).playlist?.entry || []) as Track[]
}

export function getCoverArt(id: string, size = 300): string {
  return `${config.url}${buildUrl('getCoverArt', { id, size })}`
}

export function streamTrack(id: string, format: 'raw' | 'mp3' = 'mp3', bitrate?: number): string {
  const searchParams = new URLSearchParams()
  searchParams.append('u', config.username)
  searchParams.append('p', config.password)
  searchParams.append('v', '1.16.1')
  searchParams.append('c', 'navidrome-player')
  searchParams.append('id', id)
  searchParams.append('format', format)
  if (bitrate !== undefined && bitrate > 0) {
    searchParams.append('maxBitRate', String(bitrate))
  }
  const url = `${config.url}/rest/stream.view?${searchParams.toString()}`
  return url
}

export function detectBestFormat(): 'raw' | 'mp3' {
  const audio = document.createElement('audio')
  if (audio.canPlayType('audio/flac') === 'probably' || audio.canPlayType('audio/flac') === 'maybe') {
    return 'raw'
  }
  if (audio.canPlayType('audio/wav') === 'probably' || audio.canPlayType('audio/wav') === 'maybe') {
    return 'raw'
  }
  return 'mp3'
}

export function getSupportedFormats(): { format: string; name: string; quality: string }[] {
  const audio = document.createElement('audio')
  const formats: { format: string; name: string; quality: string }[] = []
  
  if (audio.canPlayType('audio/flac') !== '') {
    formats.push({ format: 'flac', name: 'FLAC', quality: '无损' })
  }
  if (audio.canPlayType('audio/wav') !== '') {
    formats.push({ format: 'wav', name: 'WAV', quality: '无损' })
  }
  formats.push({ format: 'mp3', name: 'MP3', quality: '有损' })
  
  return formats
}

export async function getStarred(): Promise<Track[]> {
  const response = await client.get(buildUrl('getStarred2'))
  return getResponseData(response).starred2?.song || []
}

export async function getLyrics(artist: string, title: string): Promise<string> {
  const response = await client.get(buildUrl('getLyrics', { artist, title }))
  const lyrics = getResponseData(response).lyrics
  return lyrics?.value || lyrics?.text || ''
}

export async function getLyricsBySongId(songId: string): Promise<string> {
  try {
    const response = await client.get(buildUrl('getLyricsBySongId', { id: songId }))
    const data = getResponseData(response)
    
    let syl = data.lyricsList?.structuredLyrics
    if (!syl) syl = data.structuredLyrics
    
    if (syl && Array.isArray(syl) && syl.length > 0) {
      const lines = syl[0].line || []
      const result = lines.map((line: { start: number; value: string }) => {
        const time = line.start
        const mins = Math.floor(time / 60000)
        const secs = Math.floor((time % 60000) / 1000)
        const ms = time % 1000
        return `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}]${line.value}`
      }).join('\n')
      return result
    }
    
    let lyrics = data.lyricsList?.lyrics
    if (!lyrics) lyrics = data.lyrics
    if (lyrics) {
      return lyrics.text || lyrics.value || lyrics || ''
    }
    return ''
  } catch {
    return ''
  }
}

export async function star(id: string, starred: boolean): Promise<boolean> {
  try {
    const action = starred ? 'star' : 'unstar'
    const response = await client.get(buildUrl(action, { id }))
    const data = getResponseData(response)
    return data.status === 'ok'
  } catch {
    return false
  }
}