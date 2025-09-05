'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Image, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react'
import { getUploadConfig } from '@/lib/upload-utils'

export function UploadInfo() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const result = await getUploadConfig()
        if (result.success && result.config) {
          setConfig(result.config)
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Đang tải thông tin upload...</span>
        </CardContent>
      </Card>
    )
  }

  if (!config) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải thông tin cấu hình upload
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Thông Tin Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Giới hạn kích thước */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Kích thước tối đa:</span>
          <Badge variant="outline" className="font-mono">
            {config.maxFileSizeMB}MB
          </Badge>
        </div>

        {/* Định dạng hỗ trợ */}
        <div>
          <span className="text-sm font-medium">Định dạng hỗ trợ:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {config.supportedFormats.map((format: string) => (
              <Badge key={format} variant="secondary" className="text-xs">
                {format.split('/')[1].toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tính năng nén */}
        {config.compression?.enabled && (
          <Alert>
            <Image className="h-4 w-4" />
            <AlertDescription>
              <strong>Nén tự động:</strong> Hình ảnh lớn hơn 10MB sẽ được nén tự động
              <br />
              <span className="text-xs text-muted-foreground">
                Kích thước tối đa: {config.compression.maxWidth}x{config.compression.maxHeight}px
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Tính năng khác */}
        <div className="grid grid-cols-2 gap-2">
          {config.features?.localStorage && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Lưu trữ local</span>
            </div>
          )}
          {config.features?.wordpressUpload && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Upload WordPress</span>
            </div>
          )}
          {config.features?.imageOptimization && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Tối ưu hình ảnh</span>
            </div>
          )}
          {config.features?.multipleFiles && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Nhiều file</span>
            </div>
          )}
        </div>

        {/* Lưu ý */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Lưu ý:</strong> Hình ảnh sẽ được nén tự động nếu kích thước vượt quá 10MB để đảm bảo hiệu suất tốt nhất.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
