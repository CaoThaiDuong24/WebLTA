// Utility functions for handling images in news items

export interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  category: string
  tags: string
  featuredImage: string
  additionalImages?: string[]
  image?: string
  imageAlt: string
  relatedImages?: Array<{
    id: string
    url: string
    alt: string
    order: number
  }>
  author: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  wordpressId?: number
  syncedToWordPress?: boolean
  lastSyncDate?: string
}

/**
 * Lấy URL hình ảnh chính từ tin tức
 * Ưu tiên: featuredImage > image > additionalImages[0] > placeholder
 */
export function getMainImageUrl(newsItem: NewsItem): string {
  // Kiểm tra featuredImage trước
  if (newsItem.featuredImage && newsItem.featuredImage.trim() !== '') {
    return newsItem.featuredImage
  }
  
  // Kiểm tra image
  if (newsItem.image && newsItem.image.trim() !== '') {
    return newsItem.image
  }
  
  // Kiểm tra additionalImages
  if (newsItem.additionalImages && newsItem.additionalImages.length > 0) {
    const firstImage = newsItem.additionalImages[0]
    if (firstImage && firstImage.trim() !== '') {
      return firstImage
    }
  }
  
  // Kiểm tra relatedImages
  if (newsItem.relatedImages && newsItem.relatedImages.length > 0) {
    const firstRelatedImage = newsItem.relatedImages[0]
    if (firstRelatedImage && firstRelatedImage.url && firstRelatedImage.url.trim() !== '') {
      return firstRelatedImage.url
    }
  }
  
  // Fallback to placeholder
  return '/placeholder.jpg'
}

/**
 * Lấy alt text cho hình ảnh
 */
export function getImageAlt(newsItem: NewsItem): string {
  if (newsItem.imageAlt && newsItem.imageAlt.trim() !== '') {
    return newsItem.imageAlt
  }
  
  return newsItem.title || 'Hình ảnh tin tức'
}

/**
 * Kiểm tra xem tin tức có hình ảnh hay không
 */
export function hasImage(newsItem: NewsItem): boolean {
  return !!(
    (newsItem.featuredImage && newsItem.featuredImage.trim() !== '') ||
    (newsItem.image && newsItem.image.trim() !== '') ||
    (newsItem.additionalImages && newsItem.additionalImages.length > 0) ||
    (newsItem.relatedImages && newsItem.relatedImages.length > 0)
  )
}

/**
 * Lấy tất cả hình ảnh từ tin tức (bao gồm main image và additional images)
 */
export function getAllImages(newsItem: NewsItem): string[] {
  const images: string[] = []
  
  // Thêm featuredImage
  if (newsItem.featuredImage && newsItem.featuredImage.trim() !== '') {
    images.push(newsItem.featuredImage)
  }
  
  // Thêm image (nếu khác với featuredImage)
  if (newsItem.image && newsItem.image.trim() !== '' && newsItem.image !== newsItem.featuredImage) {
    images.push(newsItem.image)
  }
  
  // Thêm additionalImages
  if (newsItem.additionalImages && newsItem.additionalImages.length > 0) {
    newsItem.additionalImages.forEach(img => {
      if (img && img.trim() !== '' && !images.includes(img)) {
        images.push(img)
      }
    })
  }
  
  // Thêm relatedImages
  if (newsItem.relatedImages && newsItem.relatedImages.length > 0) {
    newsItem.relatedImages.forEach(img => {
      if (img.url && img.url.trim() !== '' && !images.includes(img.url)) {
        images.push(img.url)
      }
    })
  }
  
  return images
}

/**
 * Validate URL hình ảnh
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false
  
  // Kiểm tra data URL
  if (url.startsWith('data:')) {
    return url.length < 10 * 1024 * 1024 // Giới hạn 10MB cho base64
  }
  
  // Kiểm tra HTTP/HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true
  }
  
  // Kiểm tra relative URL
  if (url.startsWith('/')) {
    return true
  }
  
  return false
}

/**
 * Chuyển đổi File thành base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Tạo URL local cho hình ảnh
 */
export function createLocalImageUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Lưu hình ảnh local và trả về URL
 */
export async function saveImageLocal(file: File, newsId: string): Promise<string> {
  try {
    // Tạo tên file duy nhất
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${newsId}_${timestamp}.${fileExtension}`
    
    // Chuyển đổi thành base64 để lưu local
    const dataUrl = await fileToDataUrl(file)
    
    // Trong thực tế, bạn có thể lưu file vào thư mục public/images/
    // Hoặc sử dụng cloud storage như AWS S3, Cloudinary, etc.
    
    // Hiện tại, chúng ta sẽ sử dụng data URL
    return dataUrl
  } catch (error) {
    console.error('Error saving image local:', error)
    throw new Error('Không thể lưu hình ảnh local')
  }
}

/**
 * Xử lý upload nhiều hình ảnh
 */
export async function processImages(
  featuredImage: File | null, 
  additionalImages: File[], 
  newsId: string
): Promise<{
  featuredImageUrl: string
  additionalImageUrls: string[]
  allImageUrls: string[]
}> {
  const allImageUrls: string[] = []
  let featuredImageUrl = ''
  
  // Xử lý featured image
  if (featuredImage) {
    try {
      featuredImageUrl = await saveImageLocal(featuredImage, `${newsId}_featured`)
      allImageUrls.push(featuredImageUrl)
    } catch (error) {
      console.error('Error processing featured image:', error)
    }
  }
  
  // Xử lý additional images
  const additionalImageUrls: string[] = []
  for (let i = 0; i < additionalImages.length; i++) {
    try {
      const imageUrl = await saveImageLocal(additionalImages[i], `${newsId}_additional_${i}`)
      additionalImageUrls.push(imageUrl)
      allImageUrls.push(imageUrl)
    } catch (error) {
      console.error(`Error processing additional image ${i}:`, error)
    }
  }
  
  return {
    featuredImageUrl,
    additionalImageUrls,
    allImageUrls
  }
}

/**
 * Tạo related images array từ URLs
 */
export function createRelatedImages(
  featuredImageUrl: string,
  additionalImageUrls: string[],
  title: string
): Array<{id: string, url: string, alt: string, order: number}> {
  const relatedImages: Array<{id: string, url: string, alt: string, order: number}> = []
  
  // Thêm featured image
  if (featuredImageUrl) {
    relatedImages.push({
      id: 'featured',
      url: featuredImageUrl,
      alt: title,
      order: 0
    })
  }
  
  // Thêm additional images
  additionalImageUrls.forEach((url, index) => {
    relatedImages.push({
      id: `additional_${index}`,
      url,
      alt: `${title} - Hình ảnh ${index + 1}`,
      order: index + 1
    })
  })
  
  return relatedImages
}

/**
 * Kiểm tra và sửa chữa dữ liệu hình ảnh
 */
export function fixImageData(newsItem: NewsItem): NewsItem {
  const fixedItem = { ...newsItem }
  
  // Nếu có relatedImages nhưng không có featuredImage/image
  if (fixedItem.relatedImages && fixedItem.relatedImages.length > 0) {
    const firstImage = fixedItem.relatedImages[0]
    if (firstImage && firstImage.url) {
      if (!fixedItem.featuredImage) {
        fixedItem.featuredImage = firstImage.url
      }
      if (!fixedItem.image) {
        fixedItem.image = firstImage.url
      }
    }
  }
  
  // Nếu có additionalImages nhưng không có featuredImage
  if (fixedItem.additionalImages && fixedItem.additionalImages.length > 0) {
    if (!fixedItem.featuredImage) {
      fixedItem.featuredImage = fixedItem.additionalImages[0]
    }
    if (!fixedItem.image) {
      fixedItem.image = fixedItem.additionalImages[0]
    }
  }
  
  return fixedItem
} 

// Nén hình ảnh lớn
export const compressImage = (file: File, maxSizeMB: number = 5): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Tính toán kích thước mới
      let { width, height } = img
      const maxDimension = 1920 // Giới hạn kích thước tối đa
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Vẽ hình ảnh với kích thước mới
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Nén với chất lượng thấp hơn nếu file vẫn lớn
      let quality = 0.8
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          
          // Kiểm tra kích thước sau khi nén
          if (compressedFile.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
            quality -= 0.1
            canvas.toBlob((newBlob) => {
              if (newBlob) {
                const newFile = new File([newBlob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                resolve(newFile)
              } else {
                resolve(compressedFile)
              }
            }, file.type, quality)
          } else {
            resolve(compressedFile)
          }
        } else {
          reject(new Error('Không thể nén hình ảnh'))
        }
      }, file.type, quality)
    }
    
    img.onerror = () => reject(new Error('Không thể tải hình ảnh'))
    img.src = URL.createObjectURL(file)
  })
}

// Kiểm tra và nén hình ảnh nếu cần
export const processImageIfNeeded = async (file: File, maxSizeMB: number = 5): Promise<File> => {
  const maxSize = maxSizeMB * 1024 * 1024
  
  if (file.size <= maxSize) {
    return file // Không cần nén
  }
  
  console.log(`🔄 Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB -> target: ${maxSizeMB}MB)`)
  
  try {
    const compressedFile = await compressImage(file, maxSizeMB)
    console.log(`✅ Image compressed: ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`)
    return compressedFile
  } catch (error) {
    console.error('❌ Error compressing image:', error)
    return file // Trả về file gốc nếu không thể nén
  }
} 