<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLogFiles, getLogDownloadUrl } from '@/api/backend'
import type { LogFileInfo } from '@/types/backend'
import AppIcon from '@/components/AppIcon.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const logs = ref<LogFileInfo[]>([])
const loading = ref(true)

onMounted(async () => {
  await fetchLogs()
})

async function fetchLogs() {
  loading.value = true
  try {
    logs.value = await getLogFiles()
  } catch (error) {
    toast.error('获取日志列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function downloadLog(fileName: string) {
  const url = getLogDownloadUrl(fileName)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="logs-view">
    <div class="logs-header">
      <h1>日志导出</h1>
      <button class="btn-refresh" @click="fetchLogs" :disabled="loading">
        <AppIcon name="refresh" :size="18" />
        刷新
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <AppIcon name="clock" :size="32" />
      <p>加载中...</p>
    </div>

    <div v-else-if="logs.length === 0" class="empty-state">
      <AppIcon name="info" :size="32" />
      <p>暂无日志文件</p>
    </div>

    <div v-else class="logs-table-wrapper">
      <table class="logs-table">
        <thead>
          <tr>
            <th>文件名</th>
            <th>大小</th>
            <th>修改时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.name">
            <td class="file-name">
              <AppIcon name="file" :size="16" />
              {{ log.name }}
            </td>
            <td class="file-size">{{ formatFileSize(log.size) }}</td>
            <td class="file-date">{{ formatDate(log.lastModified) }}</td>
            <td class="file-action">
              <button class="btn-download" @click="downloadLog(log.name)" title="下载日志文件">
                <AppIcon name="download" :size="16" />
                下载
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.logs-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.logs-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: white;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-refresh:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
  gap: 12px;
}

.loading-state p,
.empty-state p {
  margin: 0;
  font-size: 14px;
}

.logs-table-wrapper {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.logs-table th,
.logs-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.logs-table th {
  background: var(--bg-secondary);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.logs-table tbody tr:hover {
  background: var(--bg-hover);
}

.logs-table tbody tr:last-child td {
  border-bottom: none;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 13px;
  color: var(--text-primary);
}

.file-size {
  font-size: 13px;
  color: var(--text-secondary);
}

.file-date {
  font-size: 13px;
  color: var(--text-secondary);
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-download:hover {
  background: var(--accent);
  color: white;
}
</style>