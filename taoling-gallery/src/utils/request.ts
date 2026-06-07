import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import router from '@/router'
import type { ApiResponse } from '@/types/common'
import { notifyError } from '@/utils/notify'
import { clearAuthState } from '@/utils/storage'

export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

request.interceptors.request.use((config) => {
  return config
})

request.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResponse | undefined

    if (result && (result.code < 200 || result.code >= 300)) {
      throw new Error(result.message || '请求失败，请稍后再试')
    }

    return response
  },
  async (error: AxiosError<ApiResponse>) => {
    const config = error.config as RequestConfig | undefined
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '网络异常，请稍后再试'

    if (status === 401) {
      clearAuthState()

      if (config?.showError !== false && router.currentRoute.value.path !== '/auth') {
        await router.push({
          path: '/auth',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }
    }

    if (status === 403) {
      await router.push('/permission')
    }

    if (config?.showError !== false) {
      notifyError(message)
    }

    if (import.meta.env.DEV && config?.showError !== false) {
      console.error('[request error]', error)
    }

    return Promise.reject(error)
  },
)

export async function requestData<T>(config: RequestConfig): Promise<T> {
  const response = await request<ApiResponse<T>>(config)
  return response.data.data
}

export default request
