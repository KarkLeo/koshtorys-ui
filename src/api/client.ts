import axios, { AxiosError } from 'axios'
import router from '@/router'
import { isInNavigationGuard } from '@/api/navigation-guard-flag'

export class ApiError extends Error {
  errorCodes: Record<string, string>

  constructor(message: string, errorCodes: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.errorCodes = errorCodes
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => apiClient(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await apiClient.post('/auth/refresh')
        processQueue()
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        if (!isInNavigationGuard()) {
          router.push({ name: 'login' })
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error instanceof AxiosError && error.response?.data?.errorCodes) {
      return Promise.reject(
        new ApiError(error.response.data.message || error.message, error.response.data.errorCodes),
      )
    }

    return Promise.reject(error)
  },
)

export default apiClient
