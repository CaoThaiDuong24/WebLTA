import { NextRequest, NextResponse } from 'next/server'
import { fixImageData } from '@/lib/image-utils'
import fs from 'fs'
import path from 'path'

// Định nghĩa interface NewsItem
interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: 'draft' | 'published'
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  category?: string
  tags?: string
  featuredImage?: string
  additionalImages?: string[]
  image?: string
  imageAlt?: string
  relatedImages?: Array<{
    id: string
    url: string
    alt: string
    order: number
  }>
  author: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  wordpressId?: number
  syncedToWordPress?: boolean
  lastSyncDate?: string
}

// Hàm load news từ file JSON
const loadNews = (): NewsItem[] => {
  try {
    const newsFilePath = path.join(process.cwd(), 'data', 'news.json')
    if (fs.existsSync(newsFilePath)) {
      const data = fs.readFileSync(newsFilePath, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error loading news:', error)
    return []
  }
}

// Hàm save news vào file JSON
const saveNews = (news: NewsItem[]) => {
  try {
    const newsFilePath = path.join(process.cwd(), 'data', 'news.json')
    fs.writeFileSync(newsFilePath, JSON.stringify(news, null, 2))
  } catch (error) {
    console.error('Error saving news:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting image data fix process...')
    
    // Load current news data
    const currentNews = loadNews()
    console.log(`📊 Found ${currentNews.length} news items to process`)
    
    let fixedCount = 0
    let totalImages = 0
    
    // Process each news item
    const updatedNews = currentNews.map(newsItem => {
      const originalItem = { ...newsItem }
      const fixedItem = fixImageData(newsItem)
      
      // Check if any changes were made
      const hasChanges = 
        fixedItem.featuredImage !== originalItem.featuredImage ||
        fixedItem.image !== originalItem.image ||
        JSON.stringify(fixedItem.relatedImages) !== JSON.stringify(originalItem.relatedImages)
      
      if (hasChanges) {
        fixedCount++
        console.log(`✅ Fixed image data for: ${fixedItem.title}`)
        console.log(`  - Featured Image: ${originalItem.featuredImage || 'None'} → ${fixedItem.featuredImage || 'None'}`)
        console.log(`  - Main Image: ${originalItem.image || 'None'} → ${fixedItem.image || 'None'}`)
        console.log(`  - Related Images: ${originalItem.relatedImages?.length || 0} → ${fixedItem.relatedImages?.length || 0}`)
      }
      
      // Count total images
      if (fixedItem.featuredImage) totalImages++
      if (fixedItem.additionalImages) totalImages += fixedItem.additionalImages.length
      if (fixedItem.relatedImages) totalImages += fixedItem.relatedImages.length
      
      return fixedItem
    })
    
    // Save updated data
    saveNews(updatedNews)
    
    console.log(`🎉 Image fix process completed:`)
    console.log(`  - Items processed: ${currentNews.length}`)
    console.log(`  - Items fixed: ${fixedCount}`)
    console.log(`  - Total images found: ${totalImages}`)
    
    return NextResponse.json({
      success: true,
      message: `Đã sửa chữa dữ liệu hình ảnh cho ${fixedCount}/${currentNews.length} tin tức`,
      data: {
        totalItems: currentNews.length,
        fixedItems: fixedCount,
        totalImages: totalImages
      }
    })
    
  } catch (error) {
    console.error('❌ Error fixing image data:', error)
    return NextResponse.json(
      { error: 'Lỗi khi sửa chữa dữ liệu hình ảnh' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('📊 Getting image statistics...')
    
    // Load current news data
    const currentNews = loadNews()
    
    // Analyze image data
    const stats = {
      totalItems: currentNews.length,
      itemsWithImages: 0,
      itemsWithFeaturedImage: 0,
      itemsWithAdditionalImages: 0,
      itemsWithRelatedImages: 0,
      totalImages: 0,
      brokenImageData: 0
    }
    
    currentNews.forEach(item => {
      const hasAnyImage = !!(item.featuredImage || item.image || 
        (item.additionalImages && item.additionalImages.length > 0) ||
        (item.relatedImages && item.relatedImages.length > 0))
      
      if (hasAnyImage) {
        stats.itemsWithImages++
      }
      
      if (item.featuredImage) {
        stats.itemsWithFeaturedImage++
        stats.totalImages++
      }
      
      if (item.image) {
        stats.totalImages++
      }
      
      if (item.additionalImages && item.additionalImages.length > 0) {
        stats.itemsWithAdditionalImages++
        stats.totalImages += item.additionalImages.length
      }
      
      if (item.relatedImages && item.relatedImages.length > 0) {
        stats.itemsWithRelatedImages++
        stats.totalImages += item.relatedImages.length
      }
      
      // Check for broken data (empty arrays or null values)
      if ((item.additionalImages && item.additionalImages.length === 0) ||
          (item.relatedImages && item.relatedImages.length === 0) ||
          (item.featuredImage === '' && item.image === '')) {
        stats.brokenImageData++
      }
    })
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error('❌ Error getting image statistics:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy thống kê hình ảnh' },
      { status: 500 }
    )
  }
}
