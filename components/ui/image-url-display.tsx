import React from 'react'
import { Badge } from './badge'
import { FileImage, ExternalLink, Link } from 'lucide-react'

interface ImageUrlDisplayProps {
  url: string
  showIcon?: boolean
  className?: string
  maxLength?: number
}

export function ImageUrlDisplay({ 
  url, 
  showIcon = true, 
  className = "",
  maxLength = 50 
}: ImageUrlDisplayProps) {
  if (!url) {
    return (
      <span className={`text-muted-foreground ${className}`}>
        {showIcon && <FileImage className="inline h-3 w-3 mr-1" />}
        Không có
      </span>
    )
  }

  // Nếu là Base64 data URL
  if (url.startsWith('data:')) {
    const type = url.split(';')[0].split(':')[1]
    const size = Math.round(url.length * 0.75) // Ước tính kích thước
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showIcon && <FileImage className="h-3 w-3 text-blue-500" />}
        <Badge variant="outline" className="text-xs">
          {type} ({size} bytes)
        </Badge>
        <span className="text-xs text-muted-foreground">Base64 Data</span>
      </div>
    )
  }

  // Nếu là URL thông thường
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const displayUrl = url.length > maxLength ? `${url.substring(0, maxLength)}...` : url
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showIcon && <ExternalLink className="h-3 w-3 text-green-500" />}
        <span className="text-xs font-mono break-all">{displayUrl}</span>
      </div>
    )
  }

  // Nếu là đường dẫn tương đối
  if (url.startsWith('/')) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showIcon && <Link className="h-3 w-3 text-blue-500" />}
        <span className="text-xs font-mono">{url}</span>
      </div>
    )
  }

  // Trường hợp khác
  const displayUrl = url.length > maxLength ? `${url.substring(0, maxLength)}...` : url
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <FileImage className="h-3 w-3 text-gray-500" />}
      <span className="text-xs break-all">{displayUrl}</span>
    </div>
  )
}

// Hàm utility để format URL (có thể sử dụng độc lập)
export function formatImageUrl(url: string, maxLength: number = 50): string {
  if (!url) return 'Không có'
  
  // Nếu là Base64 data URL
  if (url.startsWith('data:')) {
    const type = url.split(';')[0].split(':')[1]
    const size = Math.round(url.length * 0.75)
    return `${type} (${size} bytes) - Base64 Data`
  }
  
  // Nếu là URL thông thường
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url
  }
  
  // Nếu là đường dẫn tương đối
  if (url.startsWith('/')) {
    return url
  }
  
  // Trường hợp khác
  return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url
}
