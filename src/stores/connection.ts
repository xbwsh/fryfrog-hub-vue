import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  setBackendConfig,
  authLogin,
  authLogout,
  getStoredToken,
  setOnAuthRequired,
  verifyToken,
  getCurrentUser,
} from '@/api/backend'
import type { UserDTO } from '@/types/backend'

const DEFAULT_BACKEND_URL = 'http://localhost:20058'

const backendUrlStorageKey = 'fryfrog-backend-url'
const showServerAddressStorageKey = 'fryfrog-show-server-address'

export const useConnectionStore = defineStore('connection', () => {
  const backendUrl = ref(localStorage.getItem(backendUrlStorageKey) || DEFAULT_BACKEND_URL)
  const isAuthenticated = ref(false)
  const connected = ref(false)
  const showServerAddress = ref(localStorage.getItem(showServerAddressStorageKey) !== 'false')
  const user = ref<UserDTO | null>(null)

  function applyBackendConfig() {
    setBackendConfig({ url: backendUrl.value, authenticated: isAuthenticated.value })
  }

  function setBackendUrl(url: string) {
    backendUrl.value = url
    localStorage.setItem(backendUrlStorageKey, url)
    applyBackendConfig()
  }

  async function login(username: string, password: string): Promise<boolean> {
    applyBackendConfig()
    const result = await authLogin(username, password)
    const loggedUser = result.user || null
    if (!loggedUser || loggedUser.role !== 'ADMIN') {
      await authLogout()
      user.value = null
      isAuthenticated.value = false
      connected.value = false
      throw new Error('仅管理员可访问此后台')
    }
    user.value = loggedUser
    isAuthenticated.value = true
    connected.value = true
    return true
  }

  async function restoreConnection(): Promise<boolean> {
    const token = getStoredToken()
    if (!token) return false

    applyBackendConfig()
    const valid = await verifyToken()
    if (!valid) {
      isAuthenticated.value = false
      connected.value = false
      return false
    }

    const loggedUser = (await getCurrentUser()) || null
    if (!loggedUser || loggedUser.role !== 'ADMIN') {
      await authLogout()
      user.value = null
      isAuthenticated.value = false
      connected.value = false
      return false
    }

    user.value = loggedUser
    isAuthenticated.value = true
    connected.value = true
    return true
  }

  async function disconnect() {
    try {
      await authLogout()
    } finally {
      isAuthenticated.value = false
      connected.value = false
      user.value = null
    }
  }

  function setShowServerAddress(value: boolean) {
    showServerAddress.value = value
    localStorage.setItem(showServerAddressStorageKey, String(value))
  }

  setOnAuthRequired(() => {
    isAuthenticated.value = false
    connected.value = false
    user.value = null
  })

  return {
    backendUrl,
    isAuthenticated,
    connected,
    showServerAddress,
    user,
    login,
    restoreConnection,
    disconnect,
    setBackendUrl,
    setShowServerAddress,
  }
})
