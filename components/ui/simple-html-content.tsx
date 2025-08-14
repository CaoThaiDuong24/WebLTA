'use client'

interface SimpleHtmlContentProps {
  content: string
  className?: string
}

export function SimpleHtmlContent({ 
  content, 
  className = "" 
}: SimpleHtmlContentProps) {
  if (!content || typeof content !== 'string') {
    return (
      <div className="text-center py-4 text-gray-500">
        Không có nội dung
      </div>
    )
  }

  // Xử lý tối thiểu để đảm bảo hiển thị đúng
  const processedContent = content
    .replace(/\0/g, '') // Loại bỏ ký tự null
    .trim()

  return (
    <div 
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
