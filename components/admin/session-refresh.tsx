'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function SessionRefresh() {
  const { data: session, update } = useSession()

  useEffect(() => {
    if (!session) return

    // Refresh session every 12 hours to keep it alive
    const refreshInterval = setInterval(async () => {
      try {
        await update()
      } catch (error) {
        // swallow to avoid noisy logs in client
      }
    }, 12 * 60 * 60 * 1000) // 12 hours

    return () => {
      clearInterval(refreshInterval)
    }
  }, [session, update])

  // This component doesn't render anything
  return null
} 