'use client'

import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, User, Clock, AlertCircle } from 'lucide-react'

export function SessionStatus() {
  const { session, isAuthenticated, isLoading } = useAuth(false)

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Đang kiểm tra...</span>
      </div>
    )
  }

  if (!isAuthenticated || !session) {
    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <Badge variant="destructive">Chưa đăng nhập</Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium">{session.user?.name}</span>
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Đang hoạt động
        </Badge>
      </div>
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          Không giới hạn
        </span>
      </div>
    </div>
  )
} 