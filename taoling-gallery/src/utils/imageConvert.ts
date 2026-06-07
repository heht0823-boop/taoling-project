export interface ConvertToWebpOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

export interface ImageSize {
  width: number
  height: number
}

const allowTypes = ['image/jpeg', 'image/png', 'image/webp']

export function validateUploadImage(file: File, maxSizeMb = 20) {
  if (!allowTypes.includes(file.type)) {
    throw new Error('仅支持 JPG、PNG、WEBP 图片格式')
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`图片不能超过 ${maxSizeMb}MB`)
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败，请换一张图片试试'))
    }
    image.src = url
  })
}

function getTargetSize(image: HTMLImageElement, options: ConvertToWebpOptions): ImageSize {
  const maxWidth = options.maxWidth || image.naturalWidth
  const maxHeight = options.maxHeight || image.naturalHeight
  const ratio = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight)

  return {
    width: Math.max(1, Math.round(image.naturalWidth * ratio)),
    height: Math.max(1, Math.round(image.naturalHeight * ratio)),
  }
}

function getAspectRatio(size: ImageSize) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(size.width, size.height)
  return `${size.width / divisor}:${size.height / divisor}`
}

export async function convertImageToWebp(file: File, options: ConvertToWebpOptions = {}) {
  validateUploadImage(file)

  const image = await loadImage(file)
  const size = getTargetSize(image, options)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('当前浏览器不支持图片转换')
  }

  context.drawImage(image, 0, 0, size.width, size.height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('图片转换失败，请稍后再试'))
          return
        }
        resolve(result)
      },
      'image/webp',
      options.quality ?? 0.86,
    )
  })

  const name = file.name.replace(/\.[^.]+$/, '') || 'taoling-image'
  return {
    file: new File([blob], `${name}.webp`, { type: 'image/webp' }),
    size,
    aspectRatio: getAspectRatio(size),
  }
}
