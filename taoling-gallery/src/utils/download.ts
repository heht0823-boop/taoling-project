function sanitizeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '').trim() || 'taoling-image'
}

function getFilenameExtension(url: string, contentType?: string | null) {
  const pathname = (() => {
    try {
      return new URL(url, window.location.origin).pathname
    } catch {
      return url
    }
  })()
  const matched = pathname.match(/\.([a-zA-Z0-9]+)$/)

  if (matched?.[1]) {
    return matched[1]
  }

  if (contentType?.includes('png')) return 'png'
  if (contentType?.includes('webp')) return 'webp'
  if (contentType?.includes('gif')) return 'gif'
  return 'jpg'
}

function triggerAnchorDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noreferrer'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export async function downloadFileFromUrl(url: string, filenameBase: string) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('download request failed')
    }

    const contentType = response.headers.get('content-type')
    const blob = await response.blob()
    const extension = getFilenameExtension(url, contentType)
    const filename = `${sanitizeFilename(filenameBase)}.${extension}`
    const objectUrl = URL.createObjectURL(blob)

    try {
      triggerAnchorDownload(objectUrl, filename)
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    }
  } catch {
    const extension = getFilenameExtension(url)
    triggerAnchorDownload(url, `${sanitizeFilename(filenameBase)}.${extension}`)
  }
}
