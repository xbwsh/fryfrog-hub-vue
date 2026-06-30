<script setup lang="ts">
import { computed, ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'

const themeStore = useThemeStore()
const toast = useToast()
const isDark = computed(() => themeStore.resolvedTheme === 'dark')

const colorVars = computed(() => {
  if (isDark.value) {
    return {
      '--cp-bg': '#0a0a0a',
      '--cp-surface': '#121212',
      '--cp-surface-alt': '#1a1a1a',
      '--cp-border': 'rgba(255, 255, 255, 0.06)',
      '--cp-text': '#f0ece2',
      '--cp-text-secondary': '#a8a09e',
      '--cp-text-muted': '#6b6564',
    }
  }
  return {
    '--cp-bg': '#f8f5ef',
    '--cp-surface': '#fffaf2',
    '--cp-surface-alt': '#f0e8dc',
    '--cp-border': 'rgba(33, 28, 26, 0.1)',
    '--cp-text': '#211c1a',
    '--cp-text-secondary': '#625853',
    '--cp-text-muted': '#958982',
  }
})

interface ColorShade {
  label: string
  hex: string
  shades: { hex: string; label: string }[]
}

const brandColor: ColorShade = {
  label: 'Brand Color',
  hex: '#d84f3f',
  shades: [
    { hex: '#fef2f0', label: '95%' },
    { hex: '#fde0dc', label: '90%' },
    { hex: '#fbbfb7', label: '80%' },
    { hex: '#f89e92', label: '70%' },
    { hex: '#e87d6c', label: '60%' },
    { hex: '#d84f3f', label: 'Base' },
    { hex: '#b83f32', label: '60%' },
    { hex: '#9a3228', label: '70%' },
    { hex: '#7d2820', label: '80%' },
    { hex: '#5e1d18', label: '90%' },
  ],
}

const auxiliaryColors: ColorShade[] = [
  {
    label: 'Success',
    hex: '#16a34a',
    shades: [
      { hex: '#f0fdf4', label: '95%' },
      { hex: '#dcfce7', label: '90%' },
      { hex: '#bbf7d0', label: '80%' },
      { hex: '#86efac', label: '70%' },
      { hex: '#4ade80', label: '60%' },
      { hex: '#16a34a', label: 'Base' },
      { hex: '#15803d', label: '60%' },
      { hex: '#166534', label: '70%' },
      { hex: '#14532d', label: '80%' },
      { hex: '#052e16', label: '90%' },
    ],
  },
  {
    label: 'Warning',
    hex: '#e8a047',
    shades: [
      { hex: '#fefce8', label: '95%' },
      { hex: '#fef9c3', label: '90%' },
      { hex: '#fef08a', label: '80%' },
      { hex: '#fde047', label: '70%' },
      { hex: '#facc15', label: '60%' },
      { hex: '#e8a047', label: 'Base' },
      { hex: '#ca8a04', label: '60%' },
      { hex: '#a16207', label: '70%' },
      { hex: '#854d0e', label: '80%' },
      { hex: '#713f12', label: '90%' },
    ],
  },
  {
    label: 'Danger',
    hex: '#f06c6c',
    shades: [
      { hex: '#fef2f2', label: '95%' },
      { hex: '#fee2e2', label: '90%' },
      { hex: '#fecaca', label: '80%' },
      { hex: '#fca5a5', label: '70%' },
      { hex: '#f87171', label: '60%' },
      { hex: '#f06c6c', label: 'Base' },
      { hex: '#dc2626', label: '60%' },
      { hex: '#b91c1c', label: '70%' },
      { hex: '#991b1b', label: '80%' },
      { hex: '#7f1d1d', label: '90%' },
    ],
  },
  {
    label: 'Info',
    hex: '#7e8cf0',
    shades: [
      { hex: '#f5f3ff', label: '95%' },
      { hex: '#ede9fe', label: '90%' },
      { hex: '#ddd6fe', label: '80%' },
      { hex: '#c4b5fd', label: '70%' },
      { hex: '#a78bfa', label: '60%' },
      { hex: '#7e8cf0', label: 'Base' },
      { hex: '#6366f1', label: '60%' },
      { hex: '#4f46e5', label: '70%' },
      { hex: '#4338ca', label: '80%' },
      { hex: '#3730a3', label: '90%' },
    ],
  },
]

const categoryColors = [
  { label: '通用 / 系统', hex: '#b0a89c', usage: 'general' },
  { label: '音乐', hex: '#e8c547', usage: 'music' },
  { label: '漫画', hex: '#f06c6c', usage: 'comic' },
  { label: '有声书', hex: '#e8a047', usage: 'audiobook' },
  { label: '电子书', hex: '#3dd6c8', usage: 'ebook' },
  { label: '视频', hex: '#7e8cf0', usage: 'video' },
]

const neutralColors = [
  { label: '主文本', hex: '#211c1a', darkHex: '#f0ece2' },
  { label: '次级文本', hex: '#625853', darkHex: '#a8a09e' },
  { label: '辅助文本', hex: '#958982', darkHex: '#6b6564' },
  { label: '主背景', hex: '#f8f5ef', darkHex: '#0a0a0a' },
  { label: '次级背景', hex: '#fffaf2', darkHex: '#121212' },
  { label: '三级背景', hex: '#f0e8dc', darkHex: '#1a1a1a' },
  { label: '悬停背景', hex: '#eadfce', darkHex: '#222222' },
  { label: '边框', hex: 'rgba(33, 28, 26, 0.1)', darkHex: 'rgba(255, 255, 255, 0.06)' },
  { label: '纯黑', hex: '#000000', darkHex: '#000000' },
  { label: '纯白', hex: '#ffffff', darkHex: '#ffffff' },
  { label: '透明', hex: 'transparent', darkHex: 'transparent' },
]

const copiedHex = ref('')
let copyTimer: ReturnType<typeof setTimeout> | null = null

function isLight(hex: string) {
  if (hex === 'transparent') return false
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (!match) return false
    const [, r, g, b, a = '1'] = match
    const alpha = parseFloat(a)
    const bgR = isDark.value ? 10 : 248
    const bgG = isDark.value ? 10 : 245
    const bgB = isDark.value ? 10 : 239
    const cr = Math.round(parseInt(r) * alpha + bgR * (1 - alpha))
    const cg = Math.round(parseInt(g) * alpha + bgG * (1 - alpha))
    const cb = Math.round(parseInt(b) * alpha + bgB * (1 - alpha))
    return (cr * 0.299 + cg * 0.587 + cb * 0.114) > 150
  }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 0.299 + g * 0.587 + b * 0.114) > 150
}

function getDisplayHex(hex: string, darkHex?: string) {
  if (darkHex && isDark.value) return darkHex
  return hex
}

async function copyColor(hex: string) {
  const value = hex === 'transparent' ? 'transparent' : hex.toUpperCase()
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = value
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  toast.success(`已复制 ${value}`)
  copiedHex.value = hex
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copiedHex.value = '' }, 1500)
}
</script>

<template>
  <div class="cp-page" :style="colorVars">
    <header class="cp-header">
      <h1>Color <span>色彩</span></h1>
      <p>Fryfrog Hub 使用温暖的大地色调，为产品提供一致的外观视觉感受</p>
    </header>

    <div class="cp-scroll-area">
    <section class="cp-section">
      <h2>主色</h2>
      <p>品牌色是温暖的赤陶红，传递热情与活力。</p>
      <div class="cp-brand">
        <div class="cp-brand-main" :style="{ background: brandColor.hex }">
          <span class="cp-brand-label">Brand Color</span>
          <span class="cp-brand-hex">{{ brandColor.hex }}</span>
        </div>
        <div class="cp-shades-row">
          <div
            v-for="shade in brandColor.shades"
            :key="shade.label"
            class="cp-shade-cell"
            :style="{ background: shade.hex }"
            @click="copyColor(shade.hex)"
          >
            <span class="cp-shade-label" :style="{ color: isLight(shade.hex) ? '#211c1a' : '#fff' }">
              {{ shade.label }}
            </span>
            <span class="cp-shade-hex" :style="{ color: isLight(shade.hex) ? '#625853' : 'rgba(255,255,255,0.7)' }">
              {{ shade.hex }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="cp-section">
      <h2>辅助色</h2>
      <p>在不同的场景中使用不同的场景颜色（例如，危险的颜色表示危险的操作）</p>
      <div class="cp-aux-grid">
        <div v-for="color in auxiliaryColors" :key="color.label" class="cp-aux-card">
          <div class="cp-aux-main" :style="{ background: color.hex }">
            <span class="cp-aux-label">{{ color.label }}</span>
            <span class="cp-aux-hex">{{ color.hex }}</span>
          </div>
          <div class="cp-aux-shades">
            <div
              v-for="shade in color.shades"
              :key="shade.label"
              class="cp-aux-shade"
              :style="{ background: shade.hex }"
              @click="copyColor(shade.hex)"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="cp-section">
      <h2>分类色</h2>
      <p>每个媒体分类都有独特的标识色，用于区分不同内容类型。</p>
      <div class="cp-category-grid">
        <div
          v-for="color in categoryColors"
          :key="color.usage"
          class="cp-category-card"
          @click="copyColor(color.hex)"
        >
          <div class="cp-category-swatch" :style="{ background: color.hex }" />
          <div class="cp-category-info">
            <span class="cp-category-name">{{ color.label }}</span>
            <span class="cp-category-hex">{{ color.hex }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="cp-section">
      <h2>中性色</h2>
      <p>中性色用于文本、背景和边框。通过运用不同的中性色，来表现层次结构。</p>
      <div class="cp-neutral-grid">
        <div
          v-for="color in neutralColors"
          :key="color.label"
          class="cp-neutral-card"
          :class="{ 'is-light': isLight(getDisplayHex(color.hex, color.darkHex)), 'is-transparent': color.hex === 'transparent', copied: copiedHex === color.hex }"
          :style="{ background: getDisplayHex(color.hex, color.darkHex) }"
          @click="copyColor(getDisplayHex(color.hex, color.darkHex))"
        >
          <span class="cp-neutral-label">{{ color.label }}</span>
          <span class="cp-neutral-hex">{{ getDisplayHex(color.hex, color.darkHex) }}</span>
          <transition name="fade">
            <span v-if="copiedHex === getDisplayHex(color.hex, color.darkHex)" class="cp-copied-badge">Copied!</span>
          </transition>
        </div>
      </div>
    </section>

    <section class="cp-section">
      <h2>CSS 变量</h2>
      <p>项目中实际使用的 CSS 变量名和对应颜色。</p>
      <div class="cp-vars-grid">
        <div class="cp-var-group">
          <h3>背景</h3>
          <div class="cp-var-item" v-for="v in [
            { name: '--bg-primary', light: '#f8f5ef', dark: '#0a0a0a' },
            { name: '--bg-secondary', light: '#fffaf2', dark: '#121212' },
            { name: '--bg-tertiary', light: '#f0e8dc', dark: '#1a1a1a' },
            { name: '--bg-hover', light: '#eadfce', dark: '#222222' },
          ]" :key="v.name">
            <span class="cp-var-swatch" :style="{ background: isDark ? v.dark : v.light }" />
            <span class="cp-var-name">{{ v.name }}</span>
            <span class="cp-var-value">{{ isDark ? v.dark : v.light }}</span>
          </div>
        </div>
        <div class="cp-var-group">
          <h3>文本</h3>
          <div class="cp-var-item" v-for="v in [
            { name: '--text-primary', light: '#211c1a', dark: '#f0ece2' },
            { name: '--text-secondary', light: '#625853', dark: '#a8a09e' },
            { name: '--text-muted', light: '#958982', dark: '#6b6564' },
          ]" :key="v.name">
            <span class="cp-var-swatch" :style="{ background: isDark ? v.dark : v.light }" />
            <span class="cp-var-name">{{ v.name }}</span>
            <span class="cp-var-value">{{ isDark ? v.dark : v.light }}</span>
          </div>
        </div>
        <div class="cp-var-group">
          <h3>功能色</h3>
          <div class="cp-var-item" v-for="v in [
            { name: '--accent', light: '#d84f3f', dark: '#e85d4a' },
            { name: '--accent-hover', light: '#b83f32', dark: '#ff6b52' },
            { name: '--success', light: '#16a34a', dark: '#4ade80' },
          ]" :key="v.name">
            <span class="cp-var-swatch" :style="{ background: isDark ? v.dark : v.light }" />
            <span class="cp-var-name">{{ v.name }}</span>
            <span class="cp-var-value">{{ isDark ? v.dark : v.light }}</span>
          </div>
        </div>
      </div>
    </section>
    </div>

    <footer class="cp-footer">
      <p>Fryfrog Hub 设计语言 · 色彩调色板</p>
    </footer>
  </div>
</template>

<style scoped>
.cp-page {
  position: relative;
  z-index: 1;
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 30px 0;
  background: var(--cp-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.cp-header {
  margin-bottom: 20px;
  text-align: center;
  flex-shrink: 0;
}

.cp-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-top: 8px;
}

.cp-header h1 {
  font-family: 'Instrument Serif', serif;
  font-size: 2.8rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--cp-text);
  line-height: 1.2;
  margin-bottom: 10px;
}

.cp-header h1 span {
  color: #d84f3f;
  font-style: italic;
}

.cp-header p {
  font-size: 0.82rem;
  color: var(--cp-text-muted);
  letter-spacing: 0.04em;
}

.cp-section {
  margin-bottom: 48px;
  flex-shrink: 0;
}

.cp-section h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--cp-text);
  margin-bottom: 8px;
}

.cp-section > p {
  font-size: 0.82rem;
  color: var(--cp-text-muted);
  margin-bottom: 20px;
}

/* Brand color */
.cp-brand {
  background: var(--cp-surface);
  border: 1px solid var(--cp-border);
  border-radius: 12px;
  overflow: hidden;
}

.cp-brand-main {
  padding: 32px 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cp-brand-label {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.cp-brand-hex {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'DM Mono', monospace;
}

.cp-shades-row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
}

.cp-shade-cell {
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.cp-shade-cell:hover {
  transform: scaleY(1.15);
  z-index: 1;
}

.cp-shade-label {
  font-size: 0.55rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.cp-shade-hex {
  font-size: 0.5rem;
  font-family: 'DM Mono', monospace;
  opacity: 0.7;
}

.cp-shade-cell:hover .cp-shade-hex {
  opacity: 1;
}

/* Auxiliary colors */
.cp-aux-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.cp-aux-card {
  background: var(--cp-surface);
  border: 1px solid var(--cp-border);
  border-radius: 12px;
  overflow: hidden;
}

.cp-aux-main {
  padding: 20px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cp-aux-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}

.cp-aux-hex {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'DM Mono', monospace;
}

.cp-aux-shades {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
}

.cp-aux-shade {
  height: 28px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.cp-aux-shade:hover {
  transform: scaleY(1.3);
  z-index: 1;
}

/* Category colors */
.cp-category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.cp-category-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--cp-surface);
  border: 1px solid var(--cp-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cp-category-card:hover {
  border-color: var(--cp-text-muted);
  transform: translateY(-1px);
}

.cp-category-swatch {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.cp-category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cp-category-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--cp-text);
}

.cp-category-hex {
  font-size: 0.7rem;
  font-family: 'DM Mono', monospace;
  color: var(--cp-text-muted);
}

/* Neutral colors */
.cp-neutral-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.cp-neutral-card {
  padding: 20px 16px;
  border-radius: 10px;
  border: 1px solid var(--cp-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.cp-neutral-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.cp-neutral-card.is-transparent {
  background-image: linear-gradient(45deg, #e8e4dc 25%, transparent 25%, transparent 75%, #e8e4dc 75%),
    linear-gradient(45deg, #e8e4dc 25%, transparent 25%, transparent 75%, #e8e4dc 75%);
  background-size: 12px 12px;
  background-position: 0 0, 6px 6px;
}

.cp-neutral-card.is-transparent .cp-neutral-label,
.cp-neutral-card.is-transparent .cp-neutral-hex {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.cp-neutral-card.is-light .cp-neutral-label {
  color: #211c1a;
}

.cp-neutral-card.is-light .cp-neutral-hex {
  color: #625853;
}

.cp-neutral-card:not(.is-light):not(.is-transparent) .cp-neutral-label {
  color: #f0ece2;
}

.cp-neutral-card:not(.is-light):not(.is-transparent) .cp-neutral-hex {
  color: rgba(240, 236, 226, 0.7);
}

.cp-neutral-label {
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.3;
}

.cp-neutral-hex {
  font-size: 0.65rem;
  font-family: 'DM Mono', monospace;
}

.cp-copied-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #16a34a;
  color: #fff;
  font-size: 0.6rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* CSS Variables */
.cp-vars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.cp-var-group h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cp-text);
  margin-bottom: 12px;
}

.cp-var-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--cp-border);
}

.cp-var-item:last-child {
  border-bottom: none;
}

.cp-var-swatch {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  border: 1px solid var(--cp-border);
}

.cp-var-name {
  font-size: 0.75rem;
  font-family: 'DM Mono', monospace;
  color: var(--cp-text);
  flex: 1;
}

.cp-var-value {
  font-size: 0.7rem;
  font-family: 'DM Mono', monospace;
  color: var(--cp-text-muted);
}

/* Footer */
.cp-footer {
  padding: 16px 0;
  border-top: 1px solid var(--cp-border);
  font-size: 0.7rem;
  color: var(--cp-text-muted);
  text-align: center;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .cp-aux-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cp-neutral-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cp-vars-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .cp-page {
    padding: 30px 16px 0;
  }
  .cp-header h1 {
    font-size: 1.8rem;
  }
  .cp-aux-grid {
    grid-template-columns: 1fr;
  }
  .cp-neutral-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .cp-category-grid {
    grid-template-columns: 1fr;
  }
  .cp-shades-row {
    grid-template-columns: repeat(5, 1fr);
  }
  .cp-aux-shades {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
