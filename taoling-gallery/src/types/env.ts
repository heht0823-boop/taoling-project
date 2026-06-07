interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_UPLOAD_BASE_URL: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ROUTER_MODE: 'history'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
