import { create } from "zustand"

export interface AlertDialogConfig {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
  onCancel?: () => void
}

interface AlertDialogStore {
  isOpen: boolean
  config: AlertDialogConfig | null
  openDialog: (config: AlertDialogConfig) => void
  closeDialog: () => void
}

export const useAlertDialogStore = create<AlertDialogStore>((set) => ({
  isOpen: false,
  config: null,

  openDialog: (config) => {
    set({ isOpen: true, config })
  },

  closeDialog: () => {
    set({ isOpen: false, config: null })
  },
}))

// Helper hook for easier usage - returns a promise-based confirm
export function useConfirm() {
  const { openDialog, closeDialog } = useAlertDialogStore()

  return (config: Omit<AlertDialogConfig, "onConfirm" | "onCancel">) => {
    return new Promise<boolean>((resolve) => {
      openDialog({
        ...config,
        onConfirm: () => {
          resolve(true)
          closeDialog()
        },
        onCancel: () => {
          resolve(false)
          closeDialog()
        },
      })
    })
  }
}
