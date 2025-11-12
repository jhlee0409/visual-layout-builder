import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AlertDialogProvider } from "@/components/ui/alert-dialog-provider"

export const metadata: Metadata = {
  title: "Laylder - AI Layout Builder",
  description: "Visual layout builder with AI-powered code generation",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
        <AlertDialogProvider />
      </body>
    </html>
  )
}
