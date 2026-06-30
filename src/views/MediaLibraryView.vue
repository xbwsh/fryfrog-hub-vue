<template>
  <div class="media-library-view">
    <div class="view-header">
      <div class="header-left">
        <h1>媒体资源库</h1>
        <p class="view-subtitle">管理媒体文件目录和刮削类型</p>
      </div>
      <div class="header-actions">
        <button class="btn-scan" :disabled="scanningAll" @click="handleScanAll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {{ scanningAll ? '扫描中...' : '扫描全部' }}
        </button>
        <button class="btn-add" @click="showAddDialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加资源库
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadLibraries">重试</button>
    </div>

    <div v-else-if="libraries.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      <p>暂无资源库</p>
      <button class="btn-add-empty" @click="showAddDialog">添加第一个资源库</button>
    </div>

    <div v-else class="library-table">
      <table>
        <thead>
          <tr>
            <th class="col-sort">排序</th>
            <th class="col-name">名称</th>
            <th class="col-path">路径</th>
            <th class="col-type">类型</th>
            <th class="col-status">状态</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="lib in sortedLibraries"
            :key="lib.id"
            :class="{ disabled: !lib.enabled, 'drag-over': dragOverId === lib.id, dragging: draggingId === lib.id }"
            draggable="true"
            @dragstart="onDragStart($event, lib)"
            @dragover="onDragOver($event, lib)"
            @dragleave="onDragLeave"
            @drop="onDrop($event, lib)"
            @dragend="onDragEnd"
          >
            <td class="col-sort">
              <span class="sort-handle">☰</span>
              <span class="sort-number">{{ lib.sortOrder }}</span>
            </td>
            <td class="col-name">
              <span class="lib-name">{{ lib.name }}</span>
              <span v-if="lib.description" class="lib-desc">{{ lib.description }}</span>
            </td>
            <td class="col-path">
              <code class="lib-path">{{ lib.path }}</code>
            </td>
            <td class="col-type">
              <span class="type-badge" :class="lib.type.toLowerCase()">
                {{ getTypeLabel(lib.type, lib.subType) }}
              </span>
            </td>
            <td class="col-status">
              <button
                class="toggle-switch"
                :class="{ active: lib.enabled }"
                @click="handleToggle(lib)"
                :disabled="togglingId === lib.id"
              >
                <span class="toggle-thumb"></span>
              </button>
            </td>
            <td class="col-actions">
              <button
                class="action-btn scan-btn"
                @click="handleScanOne(lib)"
                :disabled="scanningId !== null"
                title="扫描"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </button>
              <button class="action-btn edit-btn" @click="showEditDialog(lib)" title="编辑">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="action-btn delete-btn" @click="confirmDelete(lib)" title="删除">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h2>{{ editingLibrary ? '编辑资源库' : '添加资源库' }}</h2>
          <button class="dialog-close" @click="closeDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">名称 <span class="required">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="例如：电影库、日剧库"
            />
          </div>
          <div class="form-group">
            <label class="form-label">路径 <span class="required">*</span></label>
            <div class="path-input-group">
              <input
                v-model="form.path"
                type="text"
                class="form-input"
                placeholder="/media/movies"
              />
              <button class="btn-browse" @click="openDirBrowser" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                浏览
              </button>
            </div>
            <p class="form-hint">填写服务器上的绝对路径，或点击浏览选择</p>
          </div>
          <div class="form-group">
            <label class="form-label">类型 <span class="required">*</span></label>
            <select v-model="form.type" class="form-select">
              <option value="VIDEO">VIDEO - 视频</option>
              <option value="MUSIC">MUSIC - 音乐</option>
              <option value="COMIC">COMIC - 漫画</option>
              <option value="EBOOK">EBOOK - 电子书</option>
            </select>
            <div v-if="form.type === 'VIDEO'" class="sub-type-group">
              <label class="form-label">视频子类型</label>
              <select v-model="form.subType" class="form-select">
                <option value="MOVIE">电影 - TMDB 搜电影</option>
                <option value="TV">电视剧 - TMDB 搜电视剧</option>
                <option value="MIXED">混合 - 两者都搜</option>
              </select>
            </div>
            <div class="type-info">
              <div v-if="form.type === 'VIDEO'" class="type-desc">
                <svg class="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
                <span>扫描视频文件，按子类型刮削 TMDB 元数据</span>
              </div>
              <div v-else-if="form.type === 'MUSIC'" class="type-desc">
                <svg class="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
                <span>扫描音频文件，提取标签信息</span>
              </div>
              <div v-else-if="form.type === 'COMIC'" class="type-desc">
                <svg class="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span>扫描漫画文件，支持 CBZ/CBR 格式</span>
              </div>
              <div v-else-if="form.type === 'EBOOK'" class="type-desc">
                <svg class="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <line x1="8" y1="7" x2="16" y2="7"/>
                  <line x1="8" y1="11" x2="16" y2="11"/>
                </svg>
                <span>扫描电子书文件，支持 EPUB/MOBI 格式</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <input
              v-model="form.description"
              type="text"
              class="form-input"
              placeholder="可选的备注说明"
            />
          </div>
          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="form.enabled" type="checkbox" />
              <span class="checkbox-mark"></span>
              <span class="checkbox-label">启用此资源库</span>
            </label>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">取消</button>
          <button class="btn-confirm" @click="handleSubmit" :disabled="!isFormValid || submitting">
            {{ submitting ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="dialog-overlay" @click.self="cancelDelete">
      <div class="dialog delete-confirm-dialog">
        <div class="dialog-header">
          <h2>确认删除</h2>
        </div>
        <div class="dialog-body">
          <p class="delete-message">
            确定要删除资源库「<strong>{{ deletingLibrary?.name }}</strong>」吗？
          </p>
          <p class="delete-warning">删除后，已扫描入库的视频的资源库关联将被解除，但视频文件不会被删除。</p>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="cancelDelete">取消</button>
          <button class="btn-confirm btn-danger" @click="handleDelete" :disabled="deleting">
            {{ deleting ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDirBrowser" class="dialog-overlay" @click.self="closeDirBrowser">
      <div class="dialog dir-browser-dialog">
        <div class="dialog-header">
          <h2>选择目录</h2>
          <button class="dialog-close" @click="closeDirBrowser">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body dir-browser-body">
          <div class="dir-path-bar">
            <span class="dir-current-path">{{ currentDirPath || '/' }}</span>
          </div>
          <div class="dir-list">
            <div v-if="dirLoading" class="dir-loading">
              <div class="loading-spinner small"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="dirError" class="dir-error">
              <span>{{ dirError }}</span>
              <button @click="loadDirectories(currentDirPath || undefined)">重试</button>
            </div>
            <div v-else-if="directories.length === 0" class="dir-empty">
              <span>此目录下没有子目录</span>
            </div>
            <template v-else>
              <div
                v-for="dir in directories"
                :key="dir.path"
                class="dir-item"
                :class="{ 'not-writable': !dir.writable }"
                @click="enterDirectory(dir)"
              >
                <svg class="dir-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="dir-name">{{ dir.name }}</span>
                <svg v-if="!dir.writable" class="dir-lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
              </div>
            </template>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDirBrowser">取消</button>
          <button
            class="btn-confirm"
            @click="goToParent"
            :disabled="!currentDirPath || currentDirPath === '/'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            返回上级
          </button>
          <button class="btn-confirm btn-primary" @click="selectCurrentDir">
            选择此目录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MediaLibrary, MediaLibraryType, VideoSubType, DirectoryItem } from '@/types/backend'
import { useToast } from '@/composables/useToast'
import {
  getAllMediaLibraries,
  createMediaLibrary,
  updateMediaLibrary,
  deleteMediaLibrary,
  toggleMediaLibrary,
  browseDirectory,
  scanAllLibraries,
  scanLibraryById,
} from '@/api/backend'

const toast = useToast()

const libraries = ref<MediaLibrary[]>([])
const loading = ref(false)
const error = ref('')
const showDialog = ref(false)
const editingLibrary = ref<MediaLibrary | null>(null)
const submitting = ref(false)
const togglingId = ref<number | null>(null)
const showDeleteConfirm = ref(false)
const deletingLibrary = ref<MediaLibrary | null>(null)
const deleting = ref(false)

const showDirBrowser = ref(false)
const currentDirPath = ref('')
const directories = ref<DirectoryItem[]>([])
const dirLoading = ref(false)
const dirError = ref('')
const draggingId = ref<number | null>(null)
const dragOverId = ref<number | null>(null)
const scanningAll = ref(false)
const scanningId = ref<number | null>(null)

const form = ref({
  name: '',
  path: '',
  type: 'VIDEO' as MediaLibraryType,
  subType: 'MOVIE' as VideoSubType,
  enabled: true,
  description: '',
})

const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.path.trim() && form.value.type
})

const sortedLibraries = computed(() => {
  return [...libraries.value].sort((a, b) => a.sortOrder - b.sortOrder)
})

function getTypeLabel(type: MediaLibraryType, subType?: VideoSubType | null): string {
  const labels: Record<MediaLibraryType, string> = {
    VIDEO: '视频',
    MUSIC: '音乐',
    COMIC: '漫画',
    EBOOK: '电子书',
  }
  if (type === 'VIDEO' && subType) {
    const subLabels: Record<VideoSubType, string> = { MOVIE: '电影', TV: '电视剧', MIXED: '混合' }
    return `${labels[type]}·${subLabels[subType]}`
  }
  return labels[type]
}

async function loadLibraries() {
  loading.value = true
  error.value = ''
  try {
    const list = await getAllMediaLibraries()
    const needsInit = list.every(l => l.sortOrder === 0)
    if (needsInit) {
      list.forEach((lib, i) => { lib.sortOrder = i })
      await Promise.all(list.map((lib, i) => updateMediaLibrary(lib.id, { sortOrder: i })))
    }
    libraries.value = list
  } catch (e) {
    error.value = '加载资源库失败'
    console.error('Failed to load libraries:', e)
  } finally {
    loading.value = false
  }
}

function onDragStart(e: DragEvent, lib: MediaLibrary) {
  draggingId.value = lib.id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(lib.id))
  }
}

function onDragOver(e: DragEvent, lib: MediaLibrary) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverId.value = lib.id
}

function onDragLeave() {
  dragOverId.value = null
}

function onDragEnd() {
  draggingId.value = null
  dragOverId.value = null
}

async function onDrop(e: DragEvent, targetLib: MediaLibrary) {
  e.preventDefault()
  dragOverId.value = null
  if (draggingId.value === null || draggingId.value === targetLib.id) return

  const fromIdx = libraries.value.findIndex(l => l.id === draggingId.value)
  const toIdx = libraries.value.findIndex(l => l.id === targetLib.id)
  if (fromIdx === -1 || toIdx === -1) return

  const reordered = [...libraries.value]
  const [moved] = reordered.splice(fromIdx, 1)
  reordered.splice(toIdx, 0, moved)

  reordered.forEach((lib, i) => { lib.sortOrder = i })
  libraries.value = reordered

  try {
    await Promise.all(reordered.map((lib, i) => updateMediaLibrary(lib.id, { sortOrder: i })))
  } catch (err) {
    console.error('Failed to save sort order:', err)
    await loadLibraries()
  }
  draggingId.value = null
}

async function loadDirectories(path?: string, type?: MediaLibraryType) {
  dirLoading.value = true
  dirError.value = ''
  try {
    directories.value = await browseDirectory(path, type)
    currentDirPath.value = path || ''
  } catch (e) {
    dirError.value = '加载目录失败'
    console.error('Failed to load directories:', e)
  } finally {
    dirLoading.value = false
  }
}

function openDirBrowser() {
  showDirBrowser.value = true
  if (form.value.path) {
    loadDirectories(form.value.path)
  } else {
    loadDirectories(undefined, form.value.type)
  }
}

function closeDirBrowser() {
  showDirBrowser.value = false
  directories.value = []
  currentDirPath.value = ''
  dirError.value = ''
}

function enterDirectory(dir: DirectoryItem) {
  if (!dir.writable) return
  loadDirectories(dir.path)
}

function goToParent() {
  const parts = currentDirPath.value.split('/').filter(Boolean)
  parts.pop()
  const parentPath = parts.length > 0 ? '/' + parts.join('/') : ''
  loadDirectories(parentPath || undefined)
}

function selectCurrentDir() {
  form.value.path = currentDirPath.value
  closeDirBrowser()
}

function showAddDialog() {
  editingLibrary.value = null
  form.value = {
    name: '',
    path: '',
    type: 'VIDEO',
    subType: 'MOVIE',
    enabled: true,
    description: '',
  }
  showDialog.value = true
}

function showEditDialog(lib: MediaLibrary) {
  editingLibrary.value = lib
  form.value = {
    name: lib.name,
    path: lib.path,
    type: lib.type,
    subType: lib.subType || 'MOVIE',
    enabled: lib.enabled,
    description: lib.description || '',
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingLibrary.value = null
}

async function handleSubmit() {
  if (!isFormValid.value || submitting.value) return

  submitting.value = true
  try {
    if (editingLibrary.value) {
      const updated = await updateMediaLibrary(editingLibrary.value.id, {
        name: form.value.name.trim(),
        path: form.value.path.trim(),
        type: form.value.type,
        subType: form.value.type === 'VIDEO' ? form.value.subType : undefined,
        enabled: form.value.enabled,
        description: form.value.description.trim() || undefined,
      })
      const index = libraries.value.findIndex(l => l.id === editingLibrary.value!.id)
      if (index !== -1) {
        libraries.value[index] = updated
      }
    } else {
      const created = await createMediaLibrary({
        name: form.value.name.trim(),
        path: form.value.path.trim(),
        type: form.value.type,
        subType: form.value.type === 'VIDEO' ? form.value.subType : undefined,
        enabled: form.value.enabled,
        description: form.value.description.trim() || undefined,
      })
      libraries.value.push(created)
    }
    closeDialog()
  } catch (e) {
    console.error('Failed to save library:', e)
    toast.error(editingLibrary.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

async function handleToggle(lib: MediaLibrary) {
  togglingId.value = lib.id
  try {
    const updated = await toggleMediaLibrary(lib.id)
    const index = libraries.value.findIndex(l => l.id === lib.id)
    if (index !== -1) {
      libraries.value[index] = updated
    }
  } catch (e) {
    console.error('Failed to toggle library:', e)
  } finally {
    togglingId.value = null
  }
}

function confirmDelete(lib: MediaLibrary) {
  deletingLibrary.value = lib
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deletingLibrary.value = null
}

async function handleDelete() {
  if (!deletingLibrary.value || deleting.value) return

  deleting.value = true
  try {
    await deleteMediaLibrary(deletingLibrary.value.id)
    libraries.value = libraries.value.filter(l => l.id !== deletingLibrary.value!.id)
    cancelDelete()
  } catch (e) {
    console.error('Failed to delete library:', e)
    toast.error('删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(loadLibraries)

async function handleScanAll() {
  if (scanningAll.value) return
  scanningAll.value = true
  try {
    const result = await scanAllLibraries()
    toast.htmlSuccess(`<div class="toast-title">扫描完成</div><div class="toast-time">耗时 ${result.elapsedMs}ms</div>`, 3000)
  } catch {
    toast.error('扫描失败，请检查后端连接')
  } finally {
    scanningAll.value = false
  }
}

async function handleScanOne(lib: MediaLibrary) {
  if (scanningId.value !== null) return
  scanningId.value = lib.id
  try {
    const result = await scanLibraryById(lib.id)
    toast.htmlSuccess(`<div class="toast-title">「${lib.name}」扫描完成</div><div class="toast-time">耗时 ${result.elapsedMs}ms</div>`, 3000)
  } catch {
    toast.error('扫描失败，请检查后端连接')
  } finally {
    scanningId.value = null
  }
}
</script>

<style scoped>
.media-library-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.view-header {
  padding: 24px 32px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.view-header h1 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.view-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.header-actions {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.btn-add:hover {
  background: var(--accent-hover);
}

.btn-scan {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.btn-scan:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-scan:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-muted);
  opacity: 0.5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state button,
.btn-add-empty {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.error-state button:hover,
.btn-add-empty:hover {
  background: var(--accent-hover);
}

.library-table {
  flex: 1;
  padding: 0 32px 32px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

thead {
  background: var(--bg-tertiary);
}

th {
  text-align: center;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}

tr:last-child td {
  border-bottom: none;
}

tr.disabled {
  opacity: 0.5;
}

tr.dragging {
  opacity: 0.4;
}

tr.drag-over {
  box-shadow: inset 0 -2px 0 var(--accent);
}

.col-sort {
  width: 80px;
}

.sort-handle {
  color: var(--text-muted);
  cursor: grab;
  margin-right: 8px;
}

.sort-number {
  color: var(--text-secondary);
  font-size: 13px;
}

.col-name {
  min-width: 150px;
}

.lib-name {
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
  text-align: center;
}

.lib-desc {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
  text-align: center;
}

.col-path {
  min-width: 200px;
}

.lib-path {
  font-family: monospace;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.col-type {
  width: 120px;
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.type-badge.video {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.type-badge.music {
  background: rgba(232, 197, 71, 0.15);
  color: #e8c547;
}

.type-badge.comic {
  background: rgba(240, 108, 108, 0.15);
  color: #f06c6c;
}

.type-badge.ebook {
  background: rgba(61, 214, 200, 0.15);
  color: #3dd6c8;
}

.col-status {
  width: 80px;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  position: relative;
  cursor: pointer;
  transition: var(--transition);
}

.toggle-switch.active {
  background: var(--success);
  border-color: var(--success);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: var(--transition);
}

.toggle-switch.active .toggle-thumb {
  left: 22px;
}

.toggle-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.col-actions {
  width: 150px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: var(--transition);
  margin-right: 4px;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.edit-btn:hover {
  color: var(--accent);
}

.delete-btn:hover {
  color: #e74c3c;
}

.scan-btn:hover {
  color: var(--success);
}

.dialog-overlay {
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
}

.dialog {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.dialog-header h2 {
  font-size: 18px;
  font-weight: 600;
}

.dialog-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: var(--transition);
}

.dialog-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-body {
  padding: 20px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.required {
  color: var(--accent);
}

.form-input {
  width: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary);
  transition: var(--transition);
}

.form-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

.form-select {
  width: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.form-select:focus {
  border-color: var(--accent);
  outline: none;
}

.type-info {
  margin-top: 8px;
}

.sub-type-group {
  margin-top: 10px;
}

.type-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.type-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.btn-cancel {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  transition: var(--transition);
}

.btn-cancel:hover {
  background: var(--bg-hover);
}

.btn-confirm {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: var(--accent);
  transition: var(--transition);
}

.btn-confirm:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: #e74c3c;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.delete-confirm-dialog .dialog-body {
  padding: 20px 24px;
}

.delete-message {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.delete-warning {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.path-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.path-input-group .form-input {
  flex: 1;
}

.btn-browse {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.btn-browse:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.dir-browser-dialog {
  max-width: 500px;
}

.dir-browser-body {
  padding: 0 !important;
}

.dir-path-bar {
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
}

.dir-current-path {
  font-family: monospace;
  font-size: 13px;
  color: var(--text-primary);
}

.dir-list {
  max-height: 300px;
  overflow-y: auto;
}

.dir-loading,
.dir-error,
.dir-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 12px;
  color: var(--text-muted);
}

.dir-loading {
  flex-direction: row;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.dir-error button {
  font-size: 13px;
  color: var(--accent);
  text-decoration: underline;
}

.dir-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: var(--transition);
}

.dir-item:hover {
  background: var(--bg-hover);
}

.dir-item.not-writable {
  opacity: 0.5;
  cursor: not-allowed;
}

.dir-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.dir-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.dir-lock {
  color: var(--text-muted);
  flex-shrink: 0;
}

.btn-primary {
  background: var(--success);
}

.btn-primary:hover:not(:disabled) {
  background: #15803d;
}

@media screen and (max-width: 767px) {
  .view-header {
    padding: 20px 16px 12px;
    flex-direction: column;
  }

  .library-table {
    padding: 0 16px 16px;
  }

  table {
    display: block;
    overflow-x: auto;
  }

  .col-path,
  .col-sort {
    display: none;
  }

  .dialog {
    width: 95%;
    margin: 16px;
  }
}
</style>
