'use client'

import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, status, isAuthenticated, isLoading } = useAuth(true)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoading) {
      const currentPath = window.location.pathname
      const loginUrl = `/admin/login?callbackUrl=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
    }
  }, [status, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Đang tải...
          </span>
        </div>
      </div>
    )
  }

  if (isAuthenticated && session) {
    return <>{children}</>
  }

  // Nếu chưa xác thực, hiển thị loading trong khi redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Đang chuyển hướng...
        </span>
      </div>
    </div>
  )
} 