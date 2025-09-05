'use client'

import { useSession } from 'next-auth/react'

export function useAuth(requireAuth: boolean = true) {
  const { data: session, status } = useSession({
    required: false,
  })

  return {
    session,
    status,
    isRedirecting: false,
    isRefreshing: false,
    isAuthenticated: status === 'authenticated' && !!session,
    isLoading: status === 'loading',
    refreshSession: async () => {},
    checkSessionValidity: async () => status === 'authenticated' && !!session
  }
} 