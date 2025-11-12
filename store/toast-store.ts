import { create } from "zustand"

export type ToastType = "default" | "destructive" | "success" | "warning"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastType
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      variant: "default",
      ...toast,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}))

// Helper hook for easier usage
export function useToast() {
  const { addToast, removeToast } = useToastStore()

  return {
    toast: addToast,
    dismiss: removeToast,
    success: (message: string, title?: string) =>
      addToast({
        title,
        description: message,
        variant: "success",
      }),
    error: (message: string, title?: string) =>
      addToast({
        title: title || "오류",
        description: message,
        variant: "destructive",
      }),
    warning: (message: string, title?: string) =>
      addToast({
        title: title || "경고",
        description: message,
        variant: "warning",
      }),
    info: (message: string, title?: string) =>
      addToast({
        title,
        description: message,
        variant: "default",
      }),
  }
}
