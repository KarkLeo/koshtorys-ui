import { defineStore } from 'pinia'

export type Toast = {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

let toastId = 0

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),

  actions: {
    addToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
      const newToastId = ++toastId
      this.toasts.push({
        id: newToastId,
        message,
        type,
      })

      setTimeout(() => {
        this.removeToast(newToastId)
      }, 5000)
    },

    removeToast(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },

    success(message: string) {
      this.addToast(message, 'success')
    },
    error(message: string) {
      this.addToast(message, 'error')
    },
    warning(message: string) {
      this.addToast(message, 'warning')
    },
    info(message: string) {
      this.addToast(message, 'info')
    },
  },
})
