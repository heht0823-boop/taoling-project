const ALIYUN_IMAGE_HOSTS = ['gw.alipayobjects.com', 'mdn.alipayobjects.com', 'img.alicdn.com']

interface ImageDeliveryOptions {
  width?: number
  quality?: number
  format?: 'webp' | 'avif'
}

interface ThumbnailSource {
  id?: number
  image_url?: string | null
  thumbnail_url?: string | null
}

function clampNumber(value: number | undefined, min: number, max: number) {
  if (!value) return undefined
  return Math.min(Math.max(Math.round(value), min), max)
}

function resolveApiUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (baseUrl.startsWith('http')) {
    const url = new URL(baseUrl)
    return `${url.origin}${url.pathname.replace(/\/$/, '')}${normalizedPath}`
  }

  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`
}

export function normalizeImageUrl(url?: string | null) {
  if (!url) {
    return ''
  }

  return String(url).trim().replace(/\/+([?#]|$)/, '$1')
}

function appendAliyunImageProcess(src: string, options: ImageDeliveryOptions) {
  const width = clampNumber(options.width, 24, 1600)
  const quality = clampNumber(options.quality ?? 82, 45, 95)

  if (!width && !quality && !options.format) {
    return src
  }

  try {
    const url = new URL(src)

    if (!ALIYUN_IMAGE_HOSTS.some((host) => url.hostname.endsWith(host))) {
      return src
    }

    if (url.searchParams.has('x-oss-process')) {
      return url.toString()
    }

    const processParts = ['image']

    if (width) {
      processParts.push(`resize,w_${width}`)
    }

    if (options.format) {
      processParts.push(`format,${options.format}`)
    }

    if (quality) {
      processParts.push(`quality,q_${quality}`)
    }

    url.searchParams.set('x-oss-process', processParts.join('/'))
    return url.toString()
  } catch {
    return src
  }
}

export function resolveImageUrl(src?: string | null) {
  const normalizedSrc = normalizeImageUrl(src)

  if (!normalizedSrc) {
    return ''
  }

  if (normalizedSrc.startsWith('http') || normalizedSrc.startsWith('/static')) {
    return normalizedSrc
  }

  if (normalizedSrc.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const origin = baseUrl.startsWith('http') ? new URL(baseUrl).origin : ''
    return `${origin}${normalizedSrc}`
  }

  return normalizedSrc
}

export function resolveResponsiveImageUrl(src?: string | null, options: ImageDeliveryOptions = {}) {
  const resolved = resolveImageUrl(src)

  if (!resolved) {
    return ''
  }

  return appendAliyunImageProcess(resolved, options)
}

export function resolveImageThumbnailUrl(image: ThumbnailSource, options: ImageDeliveryOptions = {}) {
  if (!image.id) {
    return resolveResponsiveImageUrl(image.thumbnail_url || image.image_url, options)
  }

  const width = clampNumber(options.width ?? 320, 32, 2000) ?? 320
  const quality = clampNumber(options.quality ?? 72, 35, 95) ?? 72
  const format = options.format || 'webp'
  return resolveApiUrl(`/images/${image.id}/thumbnail?w=${width}&format=${format}&q=${quality}`)
}

export function resolveImageThumbnailSrcset(
  image: ThumbnailSource,
  widths = [320, 420, 520],
  options: Omit<ImageDeliveryOptions, 'width'> = {},
) {
  if (!image.id) return undefined

  return widths
    .map((width) => `${resolveImageThumbnailUrl(image, { ...options, width })} ${width}w`)
    .join(', ')
}

export function resolveAvatarImageUrl(avatarUrl?: string | null, thumbnailUrl?: string | null) {
  const src = thumbnailUrl || avatarUrl
  return resolveImageUrl(src)
}

export function resolveAvatarSrcset(srcset?: string | null) {
  if (!srcset) {
    return undefined
  }

  return (
    srcset
      .split(',')
      .map((entry) => {
        const [url, descriptor] = entry.trim().split(/\s+/)
        if (!url || !descriptor) return null
        return `${resolveImageUrl(url)} ${descriptor}`
      })
      .filter((item): item is string => item !== null)
      .join(', ') || undefined
  )
}

export function formatCount(value = 0) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return String(value)
}

export function formatDateTime(value?: string) {
  if (!value) {
    return '刚刚'
  }

  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getAspectRatioSize(aspectRatio?: string, base = 400) {
  const [widthRatio, heightRatio] = (aspectRatio || '1:1').split(':').map(Number)

  if (!widthRatio || !heightRatio) {
    return {
      width: base,
      height: base,
    }
  }

  if (widthRatio >= heightRatio) {
    return {
      width: base,
      height: Math.round((base * heightRatio) / widthRatio),
    }
  }

  return {
    width: Math.round((base * widthRatio) / heightRatio),
    height: base,
  }
}
