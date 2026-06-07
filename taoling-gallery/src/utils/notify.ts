type MessageType = 'success' | 'warning' | 'error'

const colorMap: Record<MessageType, string> = {
  success: '#54a36f',
  warning: '#d08a32',
  error: '#d85f75',
}

function ensureContainer() {
  let container = document.querySelector<HTMLElement>('.taoling-message-stack')

  if (!container) {
    container = document.createElement('div')
    container.className = 'taoling-message-stack'
    container.style.cssText = [
      'position:fixed',
      'top:24px',
      'left:50%',
      'z-index:3000',
      'display:grid',
      'gap:10px',
      'width:min(420px,calc(100vw - 32px))',
      'transform:translateX(-50%)',
      'pointer-events:none',
    ].join(';')
    document.body.appendChild(container)
  }

  return container
}

function showMessage(type: MessageType, message: string) {
  if (typeof document === 'undefined') return

  const item = document.createElement('div')
  item.textContent = message
  item.style.cssText = [
    'min-height:42px',
    'padding:11px 16px',
    'color:#4b3344',
    'font-size:14px',
    'line-height:1.45',
    'background:rgba(255,255,255,.96)',
    `border:1px solid ${colorMap[type]}33`,
    `border-left:4px solid ${colorMap[type]}`,
    'border-radius:14px',
    'box-shadow:0 16px 36px rgba(161,72,120,.16)',
    'backdrop-filter:blur(12px)',
    'opacity:0',
    'transform:translateY(-8px)',
    'transition:opacity .18s ease, transform .18s ease',
  ].join(';')

  const container = ensureContainer()
  container.appendChild(item)
  window.requestAnimationFrame(() => {
    item.style.opacity = '1'
    item.style.transform = 'translateY(0)'
  })
  window.setTimeout(() => {
    item.style.opacity = '0'
    item.style.transform = 'translateY(-8px)'
    window.setTimeout(() => item.remove(), 220)
  }, 2600)
}

export function notifySuccess(message: string) {
  showMessage('success', message)
}

export function notifyWarning(message: string) {
  showMessage('warning', message)
}

export function notifyError(message: string) {
  showMessage('error', message)
}
