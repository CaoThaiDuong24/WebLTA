import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { Providers } from "@/app/providers"
import { ChatBoxWrapper } from "@/components/chat-box-wrapper"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LTA - Logistics Technology Application',
  description: 'Ứng dụng công nghệ logistics thông minh',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light">
            <LanguageProvider>
              {children}
              <ChatBoxWrapper />
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
