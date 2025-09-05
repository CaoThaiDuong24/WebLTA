'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Eye, 
  EyeOff,
  RefreshCw,
  FileText,
  Code
} from 'lucide-react'
import { validateHtmlContent, sanitizeHtmlContent, htmlToText } from '@/lib/html-content-utils'

interface HtmlContentDebugProps {
  content: string
  title?: string
  showRawContent?: boolean
}

export function HtmlContentDebug({ 
  content, 
  title = "Nội dung HTML",
  showRawContent = false 
}: HtmlContentDebugProps) {
  const [showRaw, setShowRaw] = useState(showRawContent)
  const [showFixed, setShowFixed] = useState(false)

  if (!content || typeof content !== 'string') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Không có nội dung để phân tích
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Phân tích nội dung
  const validation = validateHtmlContent(content)
  const sanitizedContent = sanitizeHtmlContent(content)
  const textContent = htmlToText(content)
  const hasIssues = !validation.isValid || validation.warnings.length > 0
  const hasChanges = content !== sanitizedContent

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{title}</span>
          </div>
          <div className="flex items-center space-x-2">
            {hasIssues ? (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Có vấn đề</span>
              </Badge>
            ) : (
              <Badge variant="default" className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>OK</span>
              </Badge>
            )}
            {hasChanges && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <RefreshCw className="h-3 w-3" />
                <span>Đã sửa</span>
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {content.length}
            </div>
            <div className="text-sm text-gray-600">Ký tự gốc</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {sanitizedContent.length}
            </div>
            <div className="text-sm text-gray-600">Ký tự đã sửa</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {textContent.length}
            </div>
            <div className="text-sm text-gray-600">Ký tự text</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {(content.match(/<[^>]*>/g) || []).length}
            </div>
            <div className="text-sm text-gray-600">Thẻ HTML</div>
          </div>
        </div>

        {/* Cảnh báo và lỗi */}
        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <strong>Lỗi:</strong>
                {validation.errors.map((error, index) => (
                  <div key={index} className="text-sm">• {error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <strong>Cảnh báo:</strong>
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm">• {warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Nút điều khiển */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showRaw ? 'Ẩn nội dung gốc' : 'Xem nội dung gốc'}
          </Button>
          
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFixed(!showFixed)}
            >
              <Code className="h-4 w-4 mr-2" />
              {showFixed ? 'Ẩn nội dung đã sửa' : 'Xem nội dung đã sửa'}
            </Button>
          )}
        </div>

        {/* Nội dung gốc */}
        {showRaw && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Nội dung gốc:</h4>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap border">
              {content}
            </pre>
          </div>
        )}

        {/* Nội dung đã sửa */}
        {showFixed && hasChanges && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Nội dung đã sửa:</h4>
            <pre className="bg-green-50 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap border border-green-200">
              {sanitizedContent}
            </pre>
          </div>
        )}

        {/* Nội dung text thuần */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Nội dung text thuần:</h4>
          <div className="bg-blue-50 p-4 rounded text-sm border border-blue-200 max-h-32 overflow-auto">
            {textContent || 'Không có nội dung text'}
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium hover:text-blue-600">
            Thông tin chi tiết
          </summary>
          <div className="mt-2 space-y-2 text-sm">
            <div>
              <strong>Ký tự null:</strong> {content.includes('\0') ? 'Có' : 'Không'}
            </div>
            <div>
              <strong>HTML entities:</strong> {content.includes('&nbsp;') || content.includes('&amp;') ? 'Có' : 'Không'}
            </div>
            <div>
              <strong>Thẻ img không có alt:</strong> {(content.match(/<img(?!.*alt=)[^>]*>/g) || []).length}
            </div>
            <div>
              <strong>Thẻ p rỗng:</strong> {(content.match(/<p>\s*<\/p>/g) || []).length}
            </div>
            <div>
              <strong>Thẻ div rỗng:</strong> {(content.match(/<div>\s*<\/div>/g) || []).length}
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
