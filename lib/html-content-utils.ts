/**
 * Utility functions để xử lý và sửa lỗi nội dung HTML
 */

/**
 * Làm sạch nội dung HTML từ Quill Editor
 */
export function sanitizeHtmlContent(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return ''
  }

  try {
    let cleaned = htmlContent

    // Loại bỏ các ký tự null hoặc undefined
    cleaned = cleaned.replace(/\0/g, '')
    
    // Sửa các ký tự HTML entities
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')

    // Đảm bảo các thẻ HTML được đóng đúng cách
    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']
    
    cleaned = cleaned.replace(/<([^>]+)>/g, (match, tagContent) => {
      const tagName = tagContent.split(' ')[0].toLowerCase()
      
      // Kiểm tra nếu là self-closing tag
      if (selfClosingTags.includes(tagName)) {
        // Đảm bảo self-closing tag có dấu / ở cuối
        if (!match.endsWith('/>')) {
          return match.replace('>', ' />')
        }
      }
      
      return match
    })

    // Sửa các thẻ Quill Editor
    cleaned = cleaned
      .replace(/class="ql-([^"]*)"/g, 'class="ql-$1"')
      .replace(/style="([^"]*)"/g, (match, style) => {
        // Làm sạch style attributes nhưng giữ lại các ký tự hợp lệ cho CSS
        // Bao gồm: # , % . / ' " để hỗ trợ các giá trị như #fff, rgba(0,0,0,0.5), 100%, font-family với dấu phẩy/nháy
        const cleanStyle = style.replace(/[^\w\s\-:;()#%,.\/\'\"]/g, '')
        return `style="${cleanStyle}"`
      })

    // Đảm bảo các thẻ p không rỗng
    cleaned = cleaned.replace(/<p><\/p>/g, '')
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '')

    // Sửa các thẻ div rỗng
    cleaned = cleaned.replace(/<div><\/div>/g, '')
    cleaned = cleaned.replace(/<div>\s*<\/div>/g, '')

    return cleaned.trim()
  } catch (error) {
    console.error('Error sanitizing HTML content:', error)
    return htmlContent // Trả về nội dung gốc nếu xử lý thất bại
  }
}

/**
 * Kiểm tra nội dung HTML có hợp lệ không
 */
export function validateHtmlContent(htmlContent: string): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!htmlContent || typeof htmlContent !== 'string') {
    errors.push('Nội dung không hợp lệ hoặc rỗng')
    return { isValid: false, errors, warnings }
  }

  // Kiểm tra các ký tự null
  if (htmlContent.includes('\0')) {
    errors.push('Nội dung chứa ký tự null')
  }

  // Kiểm tra các thẻ HTML không đóng
  const openTags = htmlContent.match(/<([^/][^>]*)>/g) || []
  const closeTags = htmlContent.match(/<\/([^>]*)>/g) || []
  
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']
  
  const openTagNames = openTags
    .map(tag => tag.match(/<(\w+)/)?.[1]?.toLowerCase())
    .filter(name => name && !selfClosingTags.includes(name))
  
  const closeTagNames = closeTags
    .map(tag => tag.match(/<\/(\w+)/)?.[1]?.toLowerCase())
    .filter(Boolean)

  // Kiểm tra số lượng thẻ mở và đóng
  if (openTagNames.length !== closeTagNames.length) {
    warnings.push(`Số lượng thẻ mở (${openTagNames.length}) và đóng (${closeTagNames.length}) không khớp`)
  }

  // Kiểm tra nội dung quá ngắn
  const textContent = htmlContent.replace(/<[^>]*>/g, '').trim()
  if (textContent.length < 10) {
    warnings.push('Nội dung văn bản quá ngắn')
  }

  // Kiểm tra các ký tự đặc biệt
  if (htmlContent.includes('&nbsp;') || htmlContent.includes('&amp;')) {
    warnings.push('Nội dung chứa HTML entities có thể gây lỗi hiển thị')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Chuyển đổi nội dung HTML thành text thuần túy
 */
export function htmlToText(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return ''
  }

  try {
    // Loại bỏ tất cả thẻ HTML
    let text = htmlContent.replace(/<[^>]*>/g, '')
    
    // Thay thế các HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')

    // Loại bỏ khoảng trắng thừa
    text = text.replace(/\s+/g, ' ').trim()
    
    return text
  } catch (error) {
    console.error('Error converting HTML to text:', error)
    return htmlContent
  }
}

/**
 * Tạo excerpt từ nội dung HTML
 */
export function createExcerptFromHtml(htmlContent: string, maxLength: number = 200): string {
  const text = htmlToText(htmlContent)
  
  if (text.length <= maxLength) {
    return text
  }
  
  // Cắt tại từ cuối cùng trong giới hạn
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

/**
 * Kiểm tra và sửa lỗi nội dung HTML từ Quill Editor
 */
export function fixQuillEditorContent(htmlContent: string): {
  fixed: string
  hasChanges: boolean
  issues: string[]
} {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return {
      fixed: '',
      hasChanges: false,
      issues: ['Nội dung không hợp lệ hoặc rỗng']
    }
  }

  const original = htmlContent
  const issues: string[] = []
  let fixed = htmlContent

  // Sửa các vấn đề phổ biến
  if (fixed.includes('\0')) {
    fixed = fixed.replace(/\0/g, '')
    issues.push('Đã loại bỏ ký tự null')
  }

  if (fixed.includes('&nbsp;')) {
    fixed = fixed.replace(/&nbsp;/g, ' ')
    issues.push('Đã thay thế &nbsp; bằng khoảng trắng')
  }

  if (fixed.includes('&amp;')) {
    fixed = fixed.replace(/&amp;/g, '&')
    issues.push('Đã thay thế &amp; bằng &')
  }

  // Sửa các thẻ img không có alt
  fixed = fixed.replace(/<img([^>]*)>/g, (match, attributes) => {
    if (!attributes.includes('alt=')) {
      return `<img${attributes} alt="Hình ảnh" />`
    }
    return match
  })

  // Sửa các thẻ p rỗng
  fixed = fixed.replace(/<p>\s*<\/p>/g, '')
  fixed = fixed.replace(/<div>\s*<\/div>/g, '')

  const hasChanges = original !== fixed

  return {
    fixed,
    hasChanges,
    issues
  }
}
