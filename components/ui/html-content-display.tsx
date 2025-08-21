'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface HtmlContentDisplayProps {
  content: string
  className?: string
  showRawContent?: boolean
  onContentError?: (error: string) => void
}

export function HtmlContentDisplay({ 
  content, 
  className = "", 
  showRawContent = false,
  onContentError 
}: HtmlContentDisplayProps) {
  const [processedContent, setProcessedContent] = useState<string>('')
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Xử lý nội dung HTML đơn giản và an toàn
  const processHtmlContent = (htmlContent: string): string => {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return ''
    }

    try {
      let processed = htmlContent

      // Loại bỏ các ký tự null
      processed = processed.replace(/\0/g, '')
      
      // Sửa các HTML entities cơ bản
      processed = processed
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

      // Đảm bảo các thẻ img có alt attribute
      processed = processed.replace(/<img([^>]*)>/g, (match, attributes) => {
        if (!attributes.includes('alt=')) {
          return `<img${attributes} alt="Hình ảnh" />`
        }
        return match
      })

      // Đảm bảo các thẻ img có width và height nếu không có
      processed = processed.replace(/<img([^>]*)>/g, (match, attributes) => {
        if (!attributes.includes('width=') && !attributes.includes('height=')) {
          return `<img${attributes} style="max-width: 100%; height: auto;" />`
        }
        return match
      })

      return processed.trim()
    } catch (error) {
      return htmlContent // Trả về nội dung gốc nếu xử lý thất bại
    }
  }

  useEffect(() => {
    if (!content) {
      setProcessedContent('')
      setHasError(false)
      return
    }

    setIsProcessing(true)
    setHasError(false)
    setErrorMessage('')

    try {
      const processed = processHtmlContent(content)
      setProcessedContent(processed)
      
      if (processed && processed.trim() === '') {
        setHasError(true)
        setErrorMessage('Nội dung trống sau khi xử lý')
        onContentError?.('Nội dung trống sau khi xử lý')
      }
    } catch (error) {
      setHasError(true)
      const errorMsg = error instanceof Error ? error.message : 'Lỗi xử lý nội dung'
      setErrorMessage(errorMsg)
      onContentError?.(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }, [content, onContentError])

  const handleRetry = () => {
    if (content) {
      const processed = processHtmlContent(content)
      setProcessedContent(processed)
      setHasError(false)
      setErrorMessage('')
    }
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Đang xử lý nội dung...</span>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Lỗi hiển thị nội dung: {errorMessage}
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
          
          {showRawContent && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Nội dung gốc:</h4>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {content}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!processedContent || processedContent.trim() === '') {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Không có nội dung để hiển thị</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Nội dung đã xử lý */}
      <div 
        className={`html-content ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      
      {/* Debug info (chỉ hiển thị trong development) */}
      {process.env.NODE_ENV === 'development' && showRawContent && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Debug: Xem nội dung gốc
          </summary>
          <div className="mt-2 p-4 bg-gray-50 rounded border">
            <h4 className="text-sm font-medium mb-2">Nội dung gốc:</h4>
            <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
              {content}
            </pre>
            
            <h4 className="text-sm font-medium mb-2 mt-4">Nội dung đã xử lý:</h4>
            <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
              {processedContent}
            </pre>
          </div>
        </details>
      )}
    </div>
  )
}

// Component đơn giản hơn cho trường hợp không cần xử lý phức tạp
export function SimpleHtmlContent({ 
  content, 
  className = "" 
}: { 
  content: string
  className?: string 
}) {
  if (!content || typeof content !== 'string') {
    return (
      <div className="text-center py-4 text-gray-500">
        Không có nội dung
      </div>
    )
  }

  return (
    <div 
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
