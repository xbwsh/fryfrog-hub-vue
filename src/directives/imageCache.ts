import type { Directive } from 'vue'

interface ImgCacheEl extends HTMLImageElement {
  _imgCacheUrl?: string
}

const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string | null>>()
const MAX_ENTRIES = 400

function getCached(url: string): Promise<string | null> {
  const hit = cache.get(url)
  if (hit) return Promise.resolve(hit)

  const running = inflight.get(url)
  if (running) return running

  const pending = fetch(url)
    .then(resp => {
      if (!resp.ok) return null
      return resp.blob()
    })
    .then(blob => {
      if (!blob) return null
      const existing = cache.get(url)
      if (existing) return existing
      if (cache.size >= MAX_ENTRIES) {
        cache.clear()
      }
      const objectUrl = URL.createObjectURL(blob)
      cache.set(url, objectUrl)
      return objectUrl
    })
    .catch(() => null)
    .finally(() => inflight.delete(url))

  inflight.set(url, pending)
  return pending
}

function apply(el: ImgCacheEl, urlValue: string) {
  const url = typeof urlValue === 'string' ? urlValue : ''
  el._imgCacheUrl = url
  if (!url) {
    el.src = ''
    return
  }
  const hit = cache.get(url)
  if (hit) {
    el.src = hit
    return
  }
  getCached(url).then(cached => {
    if (el._imgCacheUrl !== url) return
    if (cached) el.src = cached
  })
}

export const vImgCache: Directive<ImgCacheEl> = {
  mounted(el, binding) {
    apply(el, binding.value)
  },
  updated(el, binding) {
    if (el._imgCacheUrl !== binding.value) {
      apply(el, binding.value)
    }
  },
  unmounted(el) {
    el._imgCacheUrl = undefined
  },
}