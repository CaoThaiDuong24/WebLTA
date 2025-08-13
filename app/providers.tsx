'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={2 * 60} // Refetch session every 2 minutes (giảm xuống)
      refetchOnWindowFocus={true} // Refetch when window gains focus
      refetchWhenOffline={false} // Không refetch khi offline
    >
      {children}
    </SessionProvider>
  )
} 