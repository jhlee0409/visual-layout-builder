"use client"

import { AlertDialog } from "@/components/ui/alert-dialog"
import { useAlertDialogStore } from "@/store/alert-dialog-store"

export function AlertDialogProvider() {
  const { isOpen, config, closeDialog } = useAlertDialogStore()

  if (!config) return null

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={closeDialog}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
      onConfirm={config.onConfirm}
      onCancel={config.onCancel}
    />
  )
}
