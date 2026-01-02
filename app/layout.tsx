import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AlertDialogProvider } from "@/components/ui/alert-dialog-provider"

export const metadata: Metadata = {
  title: "Visual Layout Builder",
  description: "Drag-and-drop layout builder with AI-powered code generation",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/vsl_logo.png", type: "image/png", sizes: "32x32" },
      { url: "/images/vsl_logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/images/vsl_logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
