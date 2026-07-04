import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  setBackendConfig,
  authLogin,
  authLogout,
  getStoredToken,
  setOnAuthRequired,
  verifyToken,
} from '@/api/backend'

const DEFAULT_BACKEND_URL = 'http://localhost:20058'

const backendUrlStorageKey = 'fryfrog-backend-url'
const showServerAddressStorageKey = 'fryfrog-show-server-address'

export const useConnectionStore = defineStore('connection', () => {
  const backendUrl = ref(localStorage.getItem(backendUrlStorageKey) || DEFAULT_BACKEND_URL)
  const isAuthenticated = ref(false)
  const connected = ref(false)
  const showServerAddress = ref(localStorage.getItem(showServerAddressStorageKey) !== 'false')

  function applyBackendConfig() {
    setBackendConfig({ url: backendUrl.value, authenticated: isAuthenticated.value })
  }

  function setBackendUrl(url: string) {
    backendUrl.value = url
    localStorage.setItem(backendUrlStorageKey, url)
    applyBackendConfig()
  }

  async function login(user: string, pass: string): Promise<boolean> {
    applyBackendConfig()
    await authLogin(user, pass)
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

    isAuthenticated.value = true
    connected.value = true
    return true
  }

  async function disconnect() {
    await authLogout()
    isAuthenticated.value = false
    connected.value = false
  }

  function setShowServerAddress(value: boolean) {
    showServerAddress.value = value
    localStorage.setItem(showServerAddressStorageKey, String(value))
  }

  setOnAuthRequired(() => {
    isAuthenticated.value = false
    connected.value = false
  })

  return {
    backendUrl,
    isAuthenticated,
    connected,
    showServerAddress,
    login,
    restoreConnection,
    disconnect,
    setBackendUrl,
    setShowServerAddress,
  }
})
