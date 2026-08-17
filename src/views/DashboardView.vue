<template>
  <div class="dashboard-view">
    <div class="view-header">
      <h1>概览</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="loadAll" :disabled="loading">
          <AppIcon name="refresh" :size="16" />
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div v-if="loadErrors.length > 0" class="load-warning">
      <span v-for="msg in loadErrors" :key="msg">{{ msg }}，请检查后端服务</span>
    </div>

    <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <AppIcon name="folder" :size="22" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ libraries.length }}</span>
            <span class="stat-label">媒体库</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <AppIcon name="film" :size="22" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ seriesTotal }}</span>
            <span class="stat-label">视频系列</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <AppIcon name="file-text" :size="22" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ logFiles.length }}</span>
            <span class="stat-label">日志文件</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" :class="{ running: scrape?.running }">
            <AppIcon name="refresh" :size="22" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ scrape?.running ? Math.round(scrape.percent) + '%' : '空闲' }}</span>
            <span class="stat-label">刮削任务</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <section class="panel">
          <div class="panel-header">
            <h2>媒体库状态</h2>
            <button class="link-btn" @click="scanAll" :disabled="scanning">
              <AppIcon name="refresh" :size="14" />
              {{ scanning ? '扫描中...' : '扫描全部' }}
            </button>
          </div>
          <div v-if="libraries.length === 0" class="panel-empty">暂无媒体库</div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>路径</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lib in libraries" :key="lib.id">
                <td class="cell-primary">{{ lib.name }}</td>
                <td><span class="type-badge">{{ typeLabel(lib.type) }}</span></td>
                <td class="cell-path">{{ lib.path }}</td>
                <td>
                  <span class="status-badge" :class="lib.enabled ? 'on' : 'off'">
                    {{ lib.enabled ? '启用' : '停用' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>最近日志</h2>
            <router-link to="/logs" class="link-btn">查看全部</router-link>
          </div>
          <div v-if="logFiles.length === 0" class="panel-empty">暂无日志文件</div>
          <div v-else class="log-list">
            <div v-for="log in recentLogs" :key="log.name" class="log-item">
              <div class="log-name">{{ log.name }}</div>
              <div class="log-meta">
                <span>{{ formatFileSize(log.size) }}</span>
                <span>{{ formatTime(log.lastModified) }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import {
  getAllMediaLibraries,
  getSeriesPage,
  getScrapeProgress,
  getLogFiles,
  scanAllLibraries,
} from '@/api/backend'
import type { MediaLibrary, ScrapeProgress, LogFileInfo } from '@/types/backend'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const loading = ref(false)
const loadErrors = ref<string[]>([])
const libraries = ref<MediaLibrary[]>([])
const seriesTotal = ref(0)
const scrape = ref<ScrapeProgress | null>(null)
const logFiles = ref<LogFileInfo[]>([])
const scanning = ref(false)

const recentLogs = computed(() =>
  [...logFiles.value].sort((a, b) => b.lastModified.localeCompare(a.lastModified)).slice(0, 8),
)

function typeLabel(type: MediaLibrary['type']): string {
  return { VIDEO: '视频', MUSIC: '音乐', COMIC: '漫画', EBOOK: '电子书' }[type] || type
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

function formatTime(iso: string): string {
  if (!iso) return ''
  return iso.replace('T', ' ').substring(0, 16)
}

// 某些后端接口（如刮削进度）可能长时间不返回，超时后按无数据处理，避免阻塞整个仪表盘
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        clearTimeout(timer)
        resolve(null)
      },
    )
  })
}

async function loadAll() {
  loading.value = true
  loadErrors.value = []
  await Promise.all([
    getAllMediaLibraries()
      .then((libs) => {
        libraries.value = libs
      })
      .catch(() => loadErrors.value.push('媒体库列表加载失败')),
    getSeriesPage(0, 1)
      .then((page) => {
        seriesTotal.value = page?.totalElements ?? 0
      })
      .catch(() => loadErrors.value.push('视频统计加载失败')),
    withTimeout(getScrapeProgress(), 3000).then((p) => {
      scrape.value = p
    }),
    getLogFiles()
      .then((logs) => {
        logFiles.value = logs
      })
      .catch(() => loadErrors.value.push('日志列表加载失败')),
  ])
  loading.value = false
}

async function scanAll() {
  if (scanning.value) return
  scanning.value = true
  try {
    await scanAllLibraries()
    toast.show('已触发全部媒体库扫描', 'success')
  } catch (e) {
    toast.show('扫描失败', 'error')
    console.error('Scan failed:', e)
  } finally {
    scanning.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.dashboard-view {
  padding: 24px 32px 48px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.view-header h1 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.load-warning {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: var(--radius-md);
  color: #e74c3c;
  font-size: 13px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.running {
  color: #2ecc71;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-variant-numeric: lining-nums tabular-nums;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  align-items: start;
}

@media screen and (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
}

.link-btn:hover {
  color: var(--accent);
}

.panel-empty {
  padding: 32px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.cell-primary {
  font-weight: 500;
  color: var(--text-primary);
}

.cell-path {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  color: var(--text-muted);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.on {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.status-badge.off {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-item {
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.log-name {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
