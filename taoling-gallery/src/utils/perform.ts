/**
 * 创建一个防抖函数，延迟执行回调。
 * 在等待期间再次调用会重置定时器，适用于搜索输入等场景。
 */
export function debounce<T extends (...args: any[]) => void | Promise<void>>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

/**
 * 创建一个节流函数，在指定时间间隔内只执行一次。
 * 适用于滚动、resize 等高频率事件。
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  interval = 300,
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastTime >= interval) {
      lastTime = now
      fn(...args)
    }
  }
}

/**
 * 为异步函数添加防抖保护，防止高频重复调用。
 * 上次调用未完成时再次调用会被跳过，适用于收藏、下载等按钮点击。
 */
export function clickGuard<T extends (...args: any[]) => Promise<void>>(
  fn: T,
): (...args: Parameters<T>) => Promise<void> {
  let pending = false

  return async (...args: Parameters<T>) => {
    if (pending) return

    pending = true

    try {
      await fn(...args)
    } finally {
      pending = false
    }
  }
}
