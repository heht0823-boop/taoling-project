export interface CachedPageData<T> {
  list: T[]
  pagination: import('@/types/common').Pagination
}

const CACHE_PREFIX = 'taoling-display-cache'
const RELOAD_MARK_PREFIX = 'taoling-reload-refresh'

function stableStringify(value: unknown): string {
  if (!value || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined && item !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(',')}}`
}

export function createDisplayCacheKey(scope: string, params?: unknown) {
  return `${CACHE_PREFIX}:${scope}:${stableStringify(params || {})}`
}

export function readDisplayCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeDisplayCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 展示缓存写入失败不应阻断页面数据展示。
  }
}

export function removeDisplayCache(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 静默失败。
  }
}

export function clearDisplayCacheScope(scope: string) {
  try {
    const prefix = `${CACHE_PREFIX}:${scope}:`
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index)
      if (key?.startsWith(prefix)) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // 静默失败。
  }
}

export function shouldRefreshForBrowserReload(key: string) {
  const navigation = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined

  if (navigation?.type !== 'reload') {
    return false
  }

  const markKey = `${RELOAD_MARK_PREFIX}:${key}`

  if (sessionStorage.getItem(markKey)) {
    return false
  }

  sessionStorage.setItem(markKey, '1')
  return true
}
