import "./globals.css"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LTA - Logistics Technology Application',
  description: 'Logistics Technology Application',
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 