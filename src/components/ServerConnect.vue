<template>
  <div class="server-connect">
    <div v-if="confirmDialog.visible" class="confirm-overlay" @click.self="closeConfirm">
      <div class="confirm-dialog">
        <div class="confirm-icon">{{ confirmDialog.icon }}</div>
        <h3 class="confirm-title">{{ confirmDialog.title }}</h3>
        <p class="confirm-message">{{ confirmDialog.message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="closeConfirm">取消</button>
          <button class="btn-confirm" @click="confirmAction">确定</button>
        </div>
      </div>
    </div>
    
    <div class="connect-card">
      <div class="logo">
        <div class="logo-icon">{{ currentServiceIcon }}</div>
        <h1>{{ currentServiceTitle }}</h1>
        <p class="subtitle">{{ currentServiceSubtitle }}</p>
      </div>

      <div v-if="connectionStore.savedServers.length" class="saved-servers">
        <div class="section-title">已保存的服务器</div>
        <div v-for="server in connectionStore.savedServers" :key="server.id" class="server-card">
          <div class="server-info">
            <span class="server-name">{{ server.name }}</span>
            <span class="server-url">{{ server.url }}</span>
          </div>
          <div class="server-actions">
            <button type="button" class="btn-edit" :disabled="connecting" @click="editServer(server)">
              编辑
            </button>
            <button type="button" class="btn-delete" :disabled="connecting" @click="deleteServer(server)">
              删除
            </button>
            <button type="button" class="btn-enter" :disabled="connecting" @click="handleSavedConnect(server)">
              进入
            </button>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleConnect" class="connect-form">
        <div class="section-title">添加或更新服务器</div>

        <div class="form-group">
          <label>服务类型</label>
          <div class="service-selector">
            <button v-for="tab in serviceTabs" :key="tab.type" type="button" class="service-option"
              :class="{ active: selectedService === tab.type }" @click="selectService(tab.type)">
              <span class="option-icon">{{ tab.icon }}</span>
              <span class="option-label">{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>服务器地址</label>
          <div class="url-input-row">
            <div class="protocol-port-row">
              <div class="protocol-wrapper">
                <span class="protocol-label">协议</span>
                <div class="protocol-selector">
                  <button
                    v-for="proto in protocols"
                    :key="proto.value"
                    type="button"
                    class="protocol-option"
                    :class="{ active: selectedProtocol === proto.value }"
                    @click="selectedProtocol = proto.value"
                  >
                    {{ proto.label }}
                  </button>
                </div>
              </div>
              <div class="port-wrapper">
                <span class="port-label">端口</span>
                <input v-model="localPort" type="number" :placeholder="currentServiceDefaultPort" min="1" max="65535"
                  required aria-label="服务器端口" />
              </div>
            </div>
            <div class="host-wrapper">
              <span class="host-label">主机</span>
              <input v-model="localHost" type="text" :placeholder="getCurrentHost()" required aria-label="服务器主机地址" />
            </div>
          </div>
        </div>

        <div v-if="selectedService === 'komga'" class="form-group">
          <label class="checkbox-label">
            <input v-model="useApiKey" type="checkbox" />
            <span>使用 API Key 认证</span>
          </label>
        </div>

        <div v-if="!useApiKey" class="form-group">
          <label>用户名</label>
          <input v-model="localUsername" type="text" placeholder="用户名" :required="!useApiKey" />
        </div>

        <div v-if="!useApiKey" class="form-group">
          <label>密码</label>
          <input v-model="localPassword" type="password" placeholder="密码" :required="!useApiKey" />
        </div>

        <div v-if="useApiKey" class="form-group">
          <label>API Key</label>
          <input v-model="localApiKey" type="password" placeholder="输入您的 Komga API Key" required />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-connect" :disabled="connecting">
            <span v-if="!connecting">{{ editingServer ? '保存修改并连接' : '保存并连接' }}</span>
            <span v-else class="loading-text">连接中...</span>
          </button>
          <button v-if="editingServer" type="button" class="btn-cancel" @click="resetForm">
            取消
          </button>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useConnectionStore, type SavedServer, type ServiceType } from '@/stores/connection'

const emit = defineEmits<{
  connected: []
}>()

const connectionStore = useConnectionStore()

const selectedService = ref<ServiceType>(connectionStore.serviceType || 'navidrome')
const selectedProtocol = ref('http')
const localHost = ref(getCurrentHost())
const localPort = ref('')
const localUsername = ref(connectionStore.username)
const localPassword = ref(connectionStore.password)
const localApiKey = ref('')
const useApiKey = ref(false)
const connecting = ref(false)
const errorMsg = ref('')
const editingServer = ref<SavedServer | null>(null)

// 获取当前页面的主机名
function getCurrentHost(): string {
  const hostname = window.location.hostname
  // 如果是 localhost 或 IP 地址或域名，都返回当前主机名
  return hostname || 'localhost'
}

const serviceTabs = [
  { type: 'navidrome' as ServiceType, label: '音乐', icon: '🎵', defaultPort: '4533' },
  { type: 'komga' as ServiceType, label: '漫画', icon: '📚', defaultPort: '25600' },
]

const protocols = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
]

const confirmDialog = ref({
  visible: false,
  icon: '',
  title: '',
  message: '',
  onConfirm: null as (() => void) | null,
})

const currentServiceIcon = computed(() => {
  return selectedService.value === 'navidrome' ? '♪' : '📖'
})

const currentServiceTitle = computed(() => {
  return selectedService.value === 'navidrome' ? 'Navidrome Player' : 'Komga Reader'
})

const currentServiceSubtitle = computed(() => {
  return selectedService.value === 'navidrome' ? '连接你的音乐服务器' : '连接你的漫画服务器'
})

const currentServiceDefaultPort = computed(() => {
  const service = serviceTabs.find(tab => tab.type === selectedService.value)
  return service?.defaultPort || '4533'
})

const fullUrl = computed(() => {
  return `${selectedProtocol.value}://${localHost.value}:${localPort.value}`
})

watch(selectedService, (newType, oldType) => {
  if (newType !== oldType && !editingServer.value) {
    localPort.value = currentServiceDefaultPort.value
    localHost.value = getCurrentHost()
    localUsername.value = ''
    localPassword.value = ''
    errorMsg.value = ''
  } else if (newType !== oldType && editingServer.value) {
    localPort.value = currentServiceDefaultPort.value
  }
})

function selectService(type: ServiceType) {
  selectedService.value = type
}

function resetForm() {
  editingServer.value = null
  selectedService.value = 'navidrome'
  selectedProtocol.value = 'http'
  localHost.value = getCurrentHost()
  localPort.value = currentServiceDefaultPort.value
  localUsername.value = ''
  localPassword.value = ''
  localApiKey.value = ''
  useApiKey.value = false
  errorMsg.value = ''
}

function showConfirm(icon: string, title: string, message: string, onConfirm: () => void) {
  confirmDialog.value = {
    visible: true,
    icon,
    title,
    message,
    onConfirm,
  }
}

function closeConfirm() {
  confirmDialog.value = {
    visible: false,
    icon: '',
    title: '',
    message: '',
    onConfirm: null,
  }
}

function confirmAction() {
  if (confirmDialog.value.onConfirm) {
    confirmDialog.value.onConfirm()
  }
  closeConfirm()
}

async function connect(url: string, username: string, password: string, serviceType: ServiceType, apiKey?: string) {
  connecting.value = true
  errorMsg.value = ''

  try {
    const existingId = editingServer.value?.id
    const success = await connectionStore.connect(url, username, password, serviceType, existingId, apiKey)
    if (success) {
      editingServer.value = null
      emit('connected')
    } else {
      errorMsg.value = serviceType === 'navidrome'
        ? '连接失败，请检查地址和凭据'
        : '连接失败，请检查Komga服务器地址和凭据'
    }
  } catch {
    errorMsg.value = serviceType === 'navidrome'
      ? '无法连接到服务器'
      : '无法连接到Komga服务器'
  } finally {
    connecting.value = false
  }
}

async function handleConnect() {
  if (selectedService.value === 'komga' && useApiKey.value) {
    await connect(fullUrl.value, '', '', 'komga', localApiKey.value)
  } else {
    await connect(fullUrl.value, localUsername.value, localPassword.value, selectedService.value)
  }
}

async function handleSavedConnect(server: SavedServer) {
  selectedService.value = server.serviceType
  try {
    const url = new URL(server.url)
    selectedProtocol.value = url.protocol.replace(':', '')
    localHost.value = url.hostname
    localPort.value = url.port || (selectedService.value === 'navidrome' ? '4533' : '25600')
  } catch {
    selectedProtocol.value = 'http'
    localHost.value = 'localhost'
    localPort.value = currentServiceDefaultPort.value
  }
  localUsername.value = server.username
  localPassword.value = server.password
  await connect(server.url, server.username, server.password, server.serviceType)
}

function editServer(server: SavedServer) {
  editingServer.value = server
  selectedService.value = server.serviceType
  try {
    const url = new URL(server.url)
    selectedProtocol.value = url.protocol.replace(':', '')
    localHost.value = url.hostname
    localPort.value = url.port || (server.serviceType === 'navidrome' ? '4533' : '25600')
  } catch {
    selectedProtocol.value = 'http'
    localHost.value = 'localhost'
    localPort.value = currentServiceDefaultPort.value
  }
  localUsername.value = server.username
  localPassword.value = server.password
  localApiKey.value = server.apiKey || ''
  useApiKey.value = !!server.apiKey
  errorMsg.value = ''
}

function deleteServer(server: SavedServer) {
  const serviceName = server.serviceType === 'navidrome' ? '音乐' : '漫画'
  const message = `服务类型: ${serviceName}\n服务器名称: ${server.name}\n服务器地址: ${server.url}\n\n此操作无法撤销`
  
  showConfirm('⚠️', '确认删除服务器', message, () => {
    connectionStore.removeSavedServer(server.id)
    if (editingServer.value?.id === server.id) {
      editingServer.value = null
    }
  })
}
</script>

<style scoped>
.server-connect {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--bg-primary);
  position: relative;
}

.server-connect::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  opacity: 0.3;
  pointer-events: none;
}

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 90%;
  max-width: 360px;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.confirm-message {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: pre-line;
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-actions .btn-cancel {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.confirm-actions .btn-cancel:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
}

.confirm-actions .btn-confirm {
  background: #ff6b6b;
  border: 1px solid #ff6b6b;
  color: white;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.confirm-actions .btn-confirm:hover {
  background: #ff5252;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.connect-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
  position: relative;
  z-index: 1;
}

@media (max-width: 480px) {
  .connect-card {
    padding: 16px;
    margin: 0 12px;
    max-width: calc(100vw - 24px);
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .connect-card {
    padding: 20px;
    margin: 0 24px;
    max-width: calc(100vw - 48px);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .connect-card {
    padding: 32px;
    max-width: 500px;
  }
}

@media (min-width: 1025px) {
  .connect-card {
    padding: 48px;
    max-width: 560px;
  }
}

.logo {
  text-align: center;
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 48px;
  color: var(--accent);
  margin-bottom: 12px;
  font-family: var(--font-display);
  text-shadow: 0 0 40px var(--accent-glow);
}

.logo h1 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.service-selector {
  display: flex;
  gap: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 4px;
}

.service-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.service-option:hover {
  background: var(--bg-hover);
}

.service-option.active {
  background: var(--accent);
  color: white;
}

.option-icon {
  font-size: 18px;
}

.option-label {
  font-weight: 600;
}

.saved-servers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.server-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 10px;
  transition: var(--transition);
}

.server-card:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.server-info {
  flex: 1;
  min-width: 0;
}

.server-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.server-url {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.server-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  margin-left: 12px;
}

.btn-edit,
.btn-delete,
.btn-enter {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  transition: var(--transition);
  border: 1px solid var(--border);
}

.btn-edit {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-edit:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--accent);
}

.btn-delete {
  background: transparent;
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.1);
}

.btn-enter {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-enter:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--accent-glow);
}

.btn-edit:disabled,
.btn-delete:disabled,
.btn-enter:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.connect-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  cursor: pointer;
  accent-color: var(--accent);
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.url-input-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.protocol-port-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  width: 100%;
}

.protocol-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 50%;
}

.protocol-selector {
  display: flex;
  gap: 6px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 4px;
}

.protocol-option {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.protocol-option:hover {
  background: var(--bg-hover);
}

.protocol-option.active {
  background: var(--accent);
  color: white;
}

.port-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 50%;
}

.protocol-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 4px;
}

.host-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.host-label,
.port-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 4px;
}

@media (min-width: 769px) {
  .host-label {
    display: none;
  }
}

.url-input-row input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 15px;
  color: var(--text-primary);
  transition: var(--transition);
  width: 100%;
  box-sizing: border-box;
}

.url-input-row input::placeholder {
  color: var(--text-muted);
}

.url-input-row input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
  outline: none;
}

.url-input-row input::-webkit-outer-spin-button,
.url-input-row input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.url-input-row input[type=number] {
  -moz-appearance: textfield;
}

.form-group input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 15px;
  color: var(--text-primary);
  transition: var(--transition);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.form-group input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.btn-connect {
  flex: 1;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-md);
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: var(--transition);
}

.btn-cancel {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 500;
  transition: var(--transition);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--accent);
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-connect:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--accent-glow);
}

.btn-connect:disabled,
.server-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
}

.loading-text {
  display: inline-block;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>