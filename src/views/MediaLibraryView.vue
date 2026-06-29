<template>
  <div class="media-library-view">
    <div class="view-header">
      <div class="header-left">
        <h1>媒体资源库</h1>
        <p class="view-subtitle">管理媒体文件目录和刮削类型</p>
      </div>
      <div class="header-actions">
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
          <tr v-for="lib in sortedLibraries" :key="lib.id" :class="{ disabled: !lib.enabled }">
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
                {{ getTypeLabel(lib.type) }}
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
              <option value="MOVIE">MOVIE - 电影</option>
              <option value="TV">TV - 电视剧</option>
              <option value="MIXED">MIXED - 混合影片</option>
            </select>
            <div class="type-info">
              <div v-if="form.type === 'MOVIE'" class="type-desc">
                <span class="type-icon">🎬</span>
                <span>仅搜索 TMDB 电影，避免误匹配电视剧</span>
              </div>
              <div v-else-if="form.type === 'TV'" class="type-desc">
                <span class="type-icon">📺</span>
                <span>仅搜索 TMDB 电视剧，避免误匹配电影</span>
              </div>
              <div v-else class="type-desc">
                <span class="type-icon">🎥</span>
                <span>同时搜索两者，按评分排序选择最佳匹配</span>
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
                <span v-if="!dir.writable" class="dir-lock">🔒</span>
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
import type { MediaLibrary, MediaLibraryType, DirectoryItem } from '@/types/backend'
import {
  getAllMediaLibraries,
  createMediaLibrary,
  updateMediaLibrary,
  deleteMediaLibrary,
  toggleMediaLibrary,
  browseDirectory,
} from '@/api/backend'

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

const form = ref({
  name: '',
  path: '',
  type: 'MOVIE' as MediaLibraryType,
  enabled: true,
  description: '',
})

const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.path.trim() && form.value.type
})

const sortedLibraries = computed(() => {
  return [...libraries.value].sort((a, b) => a.sortOrder - b.sortOrder)
})

function getTypeLabel(type: MediaLibraryType): string {
  const labels: Record<MediaLibraryType, string> = {
    MOVIE: '电影',
    TV: '电视剧',
    MIXED: '混合',
  }
  return labels[type]
}

async function loadLibraries() {
  loading.value = true
  error.value = ''
  try {
    libraries.value = await getAllMediaLibraries()
  } catch (e) {
    error.value = '加载资源库失败'
    console.error('Failed to load libraries:', e)
  } finally {
    loading.value = false
  }
}

async function loadDirectories(path?: string) {
  dirLoading.value = true
  dirError.value = ''
  try {
    directories.value = await browseDirectory(path)
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
  loadDirectories(form.value.path || undefined)
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
    type: 'MOVIE',
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
        enabled: form.value.enabled,
        description: form.value.description.trim() || undefined,
      })
      libraries.value.push(created)
    }
    closeDialog()
  } catch (e) {
    console.error('Failed to save library:', e)
    alert(editingLibrary.value ? '更新失败' : '创建失败')
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
    alert('删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(loadLibraries)
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
  text-align: left;
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
}

tr:last-child td {
  border-bottom: none;
}

tr.disabled {
  opacity: 0.5;
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
}

.lib-desc {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
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
  width: 100px;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.movie {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.type-badge.tv {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.type-badge.mixed {
  background: rgba(155, 89, 182, 0.15);
  color: #9b59b6;
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
  width: 100px;
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

.type-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.type-icon {
  font-size: 16px;
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
  font-size: 12px;
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
