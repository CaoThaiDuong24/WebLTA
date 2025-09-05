'use client'

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  ExternalLink, 
  Mail, 
  Settings, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

interface WordPressErrorNotificationProps {
  error?: {
    reason?: string
    solution?: string
    recommendations?: string[]
    originalError?: string
    fallbackError?: string
  }
  onRetry?: () => void
  onContactSupport?: () => void
}

export function WordPressErrorNotification({ 
  error, 
  onRetry, 
  onContactSupport 
}: WordPressErrorNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!error) return null

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-red-800">
        Không thể kết nối WordPress
      </AlertTitle>
      <AlertDescription className="text-red-700">
        <div className="space-y-3">
          <p>
            <strong>Nguyên nhân:</strong> {error.reason || 'Không thể đồng bộ qua REST API'}
          </p>
          
          <p>
            <strong>Giải pháp:</strong> {error.solution || 'Sử dụng đồng bộ qua plugin WordPress'}
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </Button>
            
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            )}
          </div>

          {isExpanded && (
            <Card className="mt-3 border-red-200 bg-red-25">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-800">Chi tiết lỗi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                {error.recommendations && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Khuyến nghị:</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      {error.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator className="bg-red-200" />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-red-700 border-red-300">
                      <Mail className="w-3 h-3 mr-1" />
                      Liên hệ hỗ trợ
                    </Badge>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-red-700 p-0 h-auto"
                      onClick={() => window.open('mailto:apisupport@xecurify.com?subject=WordPress REST API Issue&body=Hi, I need help enabling WordPress REST API for my site.')}
                    >
                      apisupport@xecurify.com
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-red-700 border-red-300">
                      <Settings className="w-3 h-3 mr-1" />
                      WordPress Admin
                    </Badge>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-red-700 p-0 h-auto"
                      onClick={() => window.open('https://wp2.ltacv.com/wp-admin/')}
                    >
                      Truy cập wp-admin
                    </Button>
                  </div>
                </div>

                {error.originalError && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Lỗi gốc:</h4>
                    <code className="block text-xs bg-red-100 p-2 rounded text-red-800">
                      {error.originalError}
                    </code>
                  </div>
                )}

                {error.fallbackError && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Lỗi fallback:</h4>
                    <code className="block text-xs bg-red-100 p-2 rounded text-red-800">
                      {error.fallbackError}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Component cho thông báo thành công
export function WordPressSuccessNotification({ 
  message, 
  method = 'rest-api',
  data 
}: {
  message: string
  method?: 'rest-api' | 'fallback' | 'admin'
  data?: any
}) {
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">
        {message}
      </AlertTitle>
      <AlertDescription className="text-green-700">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-700 border-green-300">
              <Info className="w-3 h-3 mr-1" />
              Phương thức: {method === 'fallback' ? 'Fallback' : 'Admin/Plugin'}
            </Badge>
          </div>

          {data && (
            <div className="text-sm">
              <p><strong>ID:</strong> {data.id}</p>
              <p><strong>Tiêu đề:</strong> {data.title}</p>
              <p><strong>Trạng thái:</strong> {data.status}</p>
              {data.url && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-green-700 p-0 h-auto"
                  onClick={() => window.open(data.url)}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Xem trong WordPress
                </Button>
              )}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
