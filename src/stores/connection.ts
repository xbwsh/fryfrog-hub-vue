import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setServerConfig, authenticate as navidromeAuthenticate } from '@/api/navidrome'
import { setKomgaConfig, authenticate as komgaAuthenticate } from '@/api/komga'

export type ServiceType = 'navidrome' | 'komga'

const currentStorageKey = 'navidrome-connection'
const serversStorageKey = 'navidrome-servers'

export interface SavedServer {
  id: string
  name: string
  url: string
  username: string
  password: string
  apiKey: string
  serviceType: ServiceType
}

interface SavedConnection {
  url: string
  username: string
  password: string
  apiKey: string
  serviceType: ServiceType
}

function createServerId(url: string, username: string, serviceType: ServiceType): string {
  return `${serviceType}::${url}::${username}`
}

function createServerName(url: string, username: string, serviceType: ServiceType): string {
  const serviceLabel = serviceType === 'navidrome' ? '🎵' : '📚'
  try {
    return `${serviceLabel} ${username}@${new URL(url).host}`
  } catch {
    return `${serviceLabel} ${username}@${url}`
  }
}

function loadSavedConnection(): SavedConnection | null {
  const saved = localStorage.getItem(currentStorageKey)
  if (!saved) return null

  try {
    return JSON.parse(saved) as SavedConnection
  } catch {
    localStorage.removeItem(currentStorageKey)
    return null
  }
}

function loadSavedServers(): SavedServer[] {
  const saved = localStorage.getItem(serversStorageKey)
  const legacyConnection = loadSavedConnection()

  try {
    const servers = saved ? JSON.parse(saved) as SavedServer[] : []
    if (!legacyConnection) return servers

    const normalizedUrl = legacyConnection.url.replace(/\/$/, '')
    const id = createServerId(normalizedUrl, legacyConnection.username, legacyConnection.serviceType || 'navidrome')
    if (servers.some(server => server.id === id)) return servers

    return [
      ...servers,
      {
        id,
        name: createServerName(normalizedUrl, legacyConnection.username, legacyConnection.serviceType || 'navidrome'),
        url: normalizedUrl,
        username: legacyConnection.username,
        password: legacyConnection.password,
        apiKey: legacyConnection.apiKey || '',
        serviceType: legacyConnection.serviceType || 'navidrome',
      },
    ]
  } catch {
    localStorage.removeItem(serversStorageKey)
    return legacyConnection
      ? [{
        id: createServerId(legacyConnection.url, legacyConnection.username, legacyConnection.serviceType || 'navidrome'),
        name: createServerName(legacyConnection.url, legacyConnection.username, legacyConnection.serviceType || 'navidrome'),
        url: legacyConnection.url,
        username: legacyConnection.username,
        password: legacyConnection.password,
        apiKey: legacyConnection.apiKey || '',
        serviceType: legacyConnection.serviceType || 'navidrome',
      }]
      : []
  }
}

function saveServers(servers: SavedServer[]) {
  localStorage.setItem(serversStorageKey, JSON.stringify(servers))
}

function loadPrivacyMode(): boolean {
  const saved = localStorage.getItem('komga-privacy-mode')
  return saved === 'true'
}

function savePrivacyMode(value: boolean) {
  localStorage.setItem('komga-privacy-mode', String(value))
}

export const useConnectionStore = defineStore('connection', () => {
  const savedConnection = loadSavedConnection()
  const savedServers = ref<SavedServer[]>(loadSavedServers())
  const serverUrl = ref(savedConnection?.url || '')
  const username = ref(savedConnection?.username || '')
  const password = ref(savedConnection?.password || '')
  const serviceType = ref<ServiceType>(savedConnection?.serviceType || 'navidrome')
  const isAuthenticated = ref(false)
  const connected = ref(false)
  const _privacyMode = ref(loadPrivacyMode())

  const privacyMode = computed({
    get: () => _privacyMode.value,
    set: (value: boolean) => {
      _privacyMode.value = value
      savePrivacyMode(value)
    }
  })

  function rememberServer(url: string, user: string, pass: string, type: ServiceType, existingId?: string, apiKey?: string) {
    const normalizedUrl = url.replace(/\/$/, '')
    const newId = createServerId(normalizedUrl, user || 'api-key', type)
    
    if (existingId) {
      const existingIndex = savedServers.value.findIndex(s => s.id === existingId)
      if (existingIndex !== -1) {
        savedServers.value[existingIndex] = {
          id: newId,
          name: createServerName(normalizedUrl, user || 'api-key', type),
          url: normalizedUrl,
          username: user,
          password: pass,
          apiKey: apiKey || '',
          serviceType: type,
        }
        saveServers(savedServers.value)
        return
      }
    }
    
    const server = {
      id: newId,
      name: createServerName(normalizedUrl, user || 'api-key', type),
      url: normalizedUrl,
      username: user,
      password: pass,
      apiKey: apiKey || '',
      serviceType: type,
    }
    savedServers.value = [server, ...savedServers.value.filter(item => item.id !== newId)]
    saveServers(savedServers.value)
  }

  async function connect(url: string, user: string, pass: string, type: ServiceType, existingId?: string, apiKey?: string): Promise<boolean> {
    const normalizedUrl = url.replace(/\/$/, '')
    serverUrl.value = normalizedUrl
    username.value = user
    password.value = pass
    serviceType.value = type

    let success = false

    if (type === 'navidrome') {
      setServerConfig({
        url: normalizedUrl,
        username: user,
        password: pass,
        authenticated: false,
      })
      success = await navidromeAuthenticate(user, pass)
    } else {
      setKomgaConfig({
        url: normalizedUrl,
        username: user,
        password: pass,
        apiKey: apiKey || '',
        authenticated: false,
      })
      success = await komgaAuthenticate(user, pass, apiKey)
    }

    isAuthenticated.value = success
    connected.value = success

    if (success) {
      localStorage.setItem(currentStorageKey, JSON.stringify({
        url: normalizedUrl,
        username: user,
        password: pass,
        apiKey: apiKey || '',
        serviceType: type,
      }))
      rememberServer(normalizedUrl, user, pass, type, existingId, apiKey)
    }

    return success
  }

  async function connectSavedServer(server: SavedServer): Promise<boolean> {
    return connect(server.url, server.username, server.password, server.serviceType)
  }

  async function restoreConnection(): Promise<boolean> {
    if (!serverUrl.value || !username.value || !password.value) {
      return false
    }

    let success = false

    if (serviceType.value === 'navidrome') {
      setServerConfig({
        url: serverUrl.value,
        username: username.value,
        password: password.value,
        authenticated: false,
      })
      success = await navidromeAuthenticate(username.value, password.value)
    } else {
      setKomgaConfig({
        url: serverUrl.value,
        username: username.value,
        password: password.value,
        apiKey: '',
        authenticated: false,
      })
      success = await komgaAuthenticate(username.value, password.value)
    }

    isAuthenticated.value = success
    connected.value = success
    return success
  }

  function removeSavedServer(id: string) {
    savedServers.value = savedServers.value.filter(server => server.id !== id)
    saveServers(savedServers.value)
  }

  function disconnect() {
    serverUrl.value = ''
    username.value = ''
    password.value = ''
    serviceType.value = 'navidrome'
    isAuthenticated.value = false
    connected.value = false
    localStorage.removeItem(currentStorageKey)
    setServerConfig({
      url: '',
      username: '',
      password: '',
      authenticated: false,
    })
    setKomgaConfig({
      url: '',
      username: '',
      password: '',
      apiKey: '',
      authenticated: false,
    })
  }

  return {
    serverUrl,
    username,
    password,
    serviceType,
    savedServers,
    isAuthenticated,
    connected,
    privacyMode,
    connect,
    connectSavedServer,
    removeSavedServer,
    restoreConnection,
    disconnect,
  }
})