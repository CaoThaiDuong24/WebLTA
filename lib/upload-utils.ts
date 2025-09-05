import { processImageIfNeeded } from './image-utils'

/**
 * Upload file với nén tự động
 */
export async function uploadFileWithCompression(file: File): Promise<{
  success: boolean
  data?: {
    fileName: string
    fileType: string
    originalSize: number
    originalSizeMB: string
    processedSize: number
    processedSizeMB: string
    compressionApplied: boolean
    reduction: string
    dataUrl: string
  }
  error?: string
}> {
  try {
    console.log('🔄 Starting upload with compression for:', file.name)
    
    // Tạo FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // Gọi API upload với nén
    const response = await fetch('/api/upload-with-compression', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      console.log('✅ Upload successful:', result.data)
      return {
        success: true,
        data: result.data
      }
    } else {
      console.error('❌ Upload failed:', result.error)
      return {
        success: false,
        error: result.error || 'Upload failed'
      }
    }
  } catch (error) {
    console.error('❌ Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Upload nhiều file với nén tự động
 */
export async function uploadMultipleFilesWithCompression(files: File[]): Promise<{
  success: boolean
  data?: Array<{
    fileName: string
    fileType: string
    originalSize: number
    originalSizeMB: string
    processedSize: number
    processedSizeMB: string
    compressionApplied: boolean
    reduction: string
    dataUrl: string
  }>
  errors?: string[]
}> {
  try {
    console.log(`🔄 Starting batch upload for ${files.length} files`)
    
    const results = await Promise.all(
      files.map(file => uploadFileWithCompression(file))
    )
    
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    if (failed.length > 0) {
      console.warn(`⚠️ ${failed.length} files failed to upload`)
      return {
        success: false,
        errors: failed.map(r => r.error || 'Unknown error')
      }
    }
    
    console.log(`✅ All ${files.length} files uploaded successfully`)
    return {
      success: true,
      data: successful.map(r => r.data!).filter(Boolean)
    }
  } catch (error) {
    console.error('❌ Batch upload error:', error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Kiểm tra và xử lý file trước khi upload
 */
export function validateFile(file: File): {
  isValid: boolean
  error?: string
  warning?: string
} {
  // Kiểm tra kích thước
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB). Giới hạn tối đa: 50MB`
    }
  }
  
  // Kiểm tra định dạng
  const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!supportedFormats.includes(file.type)) {
    return {
      isValid: false,
      error: `Định dạng file không được hỗ trợ: ${file.type}`
    }
  }
  
  // Cảnh báo nếu file lớn
  if (file.size > 10 * 1024 * 1024) { // > 10MB
    return {
      isValid: true,
      warning: `File lớn (${(file.size / 1024 / 1024).toFixed(2)}MB) sẽ được nén tự động`
    }
  }
  
  return { isValid: true }
}

/**
 * Chuyển đổi File thành data URL với nén tự động
 */
export async function fileToDataUrlWithCompression(file: File): Promise<string> {
  try {
    // Kiểm tra file
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }
  
    // Nén file nếu cần
    let processedFile = file
    if (file.size > 10 * 1024 * 1024) { // > 10MB
      console.log('🔄 Compressing large file before conversion...')
      processedFile = await processImageIfNeeded(file, 10)
    }
    
    // Chuyển đổi thành data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(processedFile)
    })
  } catch (error) {
    console.error('❌ Error converting file to data URL:', error)
    throw error
  }
}

/**
 * Lấy thông tin cấu hình upload
 */
export async function getUploadConfig(): Promise<{
  success: boolean
  config?: {
    maxFileSize: number
    maxFileSizeMB: number
    supportedFormats: string[]
    compression: {
      enabled: boolean
      maxWidth: number
      maxHeight: number
      quality: number
    }
  }
  error?: string
}> {
  try {
    const response = await fetch('/api/upload-config')
    const result = await response.json()
    
    if (response.ok && result.success) {
      return {
        success: true,
        config: result.data
      }
    } else {
      return {
        success: false,
        error: result.error || 'Failed to get upload config'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Chuyển đổi data URL thành File object
 */
export async function dataUrlToFile(dataUrl: string, filename: string = 'image.jpg'): Promise<File> {
  try {
    // Tách phần data từ data URL
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    
    // Tạo File object từ blob
    const file = new File([blob], filename, { type: blob.type })
    return file
  } catch (error) {
    console.error('❌ Error converting data URL to file:', error)
    throw new Error('Failed to convert data URL to file')
  }
}

/**
 * Chuyển đổi nhiều data URLs thành File objects
 */
export async function dataUrlsToFiles(dataUrls: string[], filenames?: string[]): Promise<File[]> {
  try {
    const files = await Promise.all(
      dataUrls.map(async (dataUrl, index) => {
        const filename = filenames?.[index] || `image-${index + 1}.jpg`
        return await dataUrlToFile(dataUrl, filename)
      })
    )
    return files
  } catch (error) {
    console.error('❌ Error converting data URLs to files:', error)
    throw new Error('Failed to convert data URLs to files')
  }
}

/**
 * Tạo FormData từ news data với images
 */
export async function createNewsFormData(newsData: {
  title: string
  slug: string
  excerpt: string
  content: string
  status: string
  featured: boolean
  category: string
  metaTitle: string
  metaDescription: string
  featuredImage?: string
  additionalImages?: string[]
  author: string
}): Promise<FormData> {
  const formData = new FormData()
  
  // Thêm các trường text
  formData.append('title', newsData.title)
  formData.append('slug', newsData.slug)
  formData.append('excerpt', newsData.excerpt)
  formData.append('content', newsData.content)
  formData.append('status', newsData.status)
  formData.append('featured', newsData.featured.toString())
  formData.append('category', newsData.category)
  formData.append('metaTitle', newsData.metaTitle)
  formData.append('metaDescription', newsData.metaDescription)
  formData.append('author', newsData.author)
  
  // Thêm featured image nếu có
  if (newsData.featuredImage) {
    try {
      const featuredFile = await dataUrlToFile(newsData.featuredImage, 'featured-image.jpg')
      formData.append('featuredImage', featuredFile)
    } catch (error) {
      console.error('❌ Error converting featured image:', error)
    }
  }
  
  // Thêm additional images nếu có
  if (newsData.additionalImages && newsData.additionalImages.length > 0) {
    try {
      const additionalFiles = await dataUrlsToFiles(
        newsData.additionalImages,
        newsData.additionalImages.map((_, index) => `additional-image-${index + 1}.jpg`)
      )
      
      additionalFiles.forEach((file, index) => {
        formData.append(`additionalImages`, file)
      })
    } catch (error) {
      console.error('❌ Error converting additional images:', error)
    }
  }
  
  return formData
}
