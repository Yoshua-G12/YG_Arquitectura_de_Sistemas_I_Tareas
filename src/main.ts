import './style.css'

interface TelemetryData {
  localTime: string
  protocol: string
  host: string
  connectionStatus: string
}

function updateTelemetry(): void {
  const timeElem = document.getElementById('client-time')
  const protoElem = document.getElementById('client-protocol')
  const hostElem = document.getElementById('client-host')
  const statusElem = document.getElementById('client-status')

  const now = new Date()
  const formattedTime = now.toLocaleTimeString('es-ES', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ` (${Intl.DateTimeFormat().resolvedOptions().timeZone})`

  const isHttps = window.location.protocol === 'https:'
  const isCloudFront = window.location.hostname.includes('cloudfront.net')
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  let statusText = 'En línea (Conectado)'
  if (isCloudFront) {
    statusText = 'Activo en CloudFront Edge CDN'
  } else if (isLocal) {
    statusText = 'Ambiente de desarrollo local'
  }

  const telemetry: TelemetryData = {
    localTime: formattedTime,
    protocol: `${window.location.protocol.toUpperCase().replace(':', '')} ${isHttps ? '(Cifrado TLS)' : '(Sin cifrar)'}`,
    host: window.location.host || 'localhost:5173',
    connectionStatus: navigator.onLine ? statusText : 'Modo fuera de línea'
  }

  if (timeElem) timeElem.textContent = telemetry.localTime
  if (protoElem) protoElem.textContent = telemetry.protocol
  if (hostElem) hostElem.textContent = telemetry.host
  if (statusElem) {
    statusElem.textContent = telemetry.connectionStatus
    statusElem.style.color = navigator.onLine ? '#34d399' : '#f87171'
  }
}

function initApp(): void {
  console.info('==========================================')
  console.info('HW-04: Arquitectura de Sistemas I')
  console.info('Página desplegada mediante pipeline CI/CD')
  console.info('Tecnologías: Vite + GitHub Actions + S3 + CloudFront')
  console.info('==========================================')

  updateTelemetry()

  // Actualizar telemetría cada segundo
  setInterval(() => {
    const timeElem = document.getElementById('client-time')
    if (timeElem) {
      const now = new Date()
      timeElem.textContent = now.toLocaleTimeString('es-ES', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ` (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
    }
  }, 1000)

  const refreshBtn = document.getElementById('refresh-telemetry-btn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      updateTelemetry()
      refreshBtn.textContent = '¡Actualizado!'
      setTimeout(() => {
        refreshBtn.textContent = 'Actualizar Métricas'
      }, 1200)
    })
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

