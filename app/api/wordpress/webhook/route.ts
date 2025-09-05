import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getWordPressConfig } from '@/lib/wordpress-config'

const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

interface NewsItem {
  id: string
  wordpressId?: number
  title: string
  slug: string
  excerpt?: string
  content: string
  status?: string
  featured?: boolean
  author?: string
  createdAt: string
  updatedAt?: string
  syncedFromWordPress?: boolean
  lastSyncDate?: string
  featuredImage?: string
  image?: string
  imageAlt?: string
  additionalImages?: string[]
  relatedImages?: Array<{ id: string; url: string; alt: string; order: number }>
}

// Đọc danh sách tin tức
function loadNews(): NewsItem[] {
  try {
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      fs.writeFileSync(NEWS_FILE_PATH, '[]')
      return []
    }
    const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading news:', error)
    return []
  }
}

// Lưu danh sách tin tức
function saveNews(news: NewsItem[]) {
  try {
    const dataDir = path.dirname(NEWS_FILE_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(news, null, 2))
  } catch (error) {
    console.error('Error saving news:', error)
    throw error
  }
}

// use centralized getWordPressConfig from lib

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 WordPress webhook received')
    
    const body = await request.json()
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2))
    
    const { action, post } = body
    
    if (!action || !post) {
      console.log('❌ Invalid webhook data')
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }
    
    const news = loadNews()
    const wpConfig = getWordPressConfig()
    const siteUrl: string | null = wpConfig?.siteUrl ? String(wpConfig.siteUrl).replace(/\/$/, '') : null
    const credentials: string | null = wpConfig?.username && wpConfig?.applicationPassword
      ? Buffer.from(`${wpConfig.username}:${wpConfig.applicationPassword}`).toString('base64')
      : null
    
    switch (action) {
      case 'post_created':
      case 'post_updated':
        // Tìm tin tức hiện có hoặc tạo mới
        const existingIndex = news.findIndex(item => item.wordpressId === post.id)
        
        // Kiểm tra duplicate theo tiêu đề nếu không tìm thấy theo wordpressId
        let duplicateIndex = -1
        if (existingIndex === -1) {
          duplicateIndex = news.findIndex(item => 
            item.title === (post.title?.rendered || post.title) ||
            item.slug === post.slug
          )
        }
        
        // Ảnh đại diện và ảnh nhúng trong content
        let featuredImage = ''
        let image = ''
        let imageAlt = ''
        let additionalImages: string[] = []

        // Từ embedded nếu có
        if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
          const media = post._embedded['wp:featuredmedia'][0]
          featuredImage = media.source_url || ''
          image = media.source_url || ''
          imageAlt = media.alt_text || ''
        }
        
        // Nếu không có embedded, thử lấy theo featured_media id
        if (!featuredImage && siteUrl && credentials && post.featured_media) {
          try {
            const mediaResp = await fetch(`${siteUrl}/wp-json/wp/v2/media/${post.featured_media}`, {
              headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
              },
              signal: AbortSignal.timeout(8000)
            })
            if (mediaResp.ok) {
              const mediaJson: any = await mediaResp.json()
              featuredImage = mediaJson?.source_url || ''
              image = image || featuredImage
              imageAlt = mediaJson?.alt_text || imageAlt
            }
          } catch (e) {}
        }

        // Quét ảnh trong nội dung
        try {
          const contentHtml: string = post.content?.rendered || post.content || ''
          const matches = contentHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
          for (const m of matches) {
            const url = m[1]
            if (url && url !== featuredImage && !additionalImages.includes(url)) {
              additionalImages.push(url)
            }
          }
        } catch (e) {}

        // Lấy attachments (media) thuộc post
        if (siteUrl && credentials) {
          try {
            const listResp = await fetch(`${siteUrl}/wp-json/wp/v2/media?parent=${post.id}&per_page=100`, {
              headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
              },
              signal: AbortSignal.timeout(12000)
            })
            if (listResp.ok) {
              const items: any[] = await listResp.json()
              for (const it of items) {
                const url = it?.source_url
                if (url && url !== featuredImage && !additionalImages.includes(url)) {
                  additionalImages.push(url)
                }
              }
            }
          } catch (e) {}
        }
        
        const newsItem = {
          id: existingIndex >= 0 ? news[existingIndex].id : 
              duplicateIndex >= 0 ? news[duplicateIndex].id : 
              Date.now().toString(36),
          wordpressId: post.id,
          title: post.title?.rendered || post.title,
          slug: post.slug,
          excerpt: post.excerpt?.rendered || post.excerpt,
          content: post.content?.rendered || post.content,
          status: post.status === 'publish' ? 'published' : 'draft',
          featured: post.sticky || false,
          author: 'WordPress',
          createdAt: post.date,
          updatedAt: post.modified,
          syncedFromWordPress: true,
          lastSyncDate: new Date().toISOString(),
          featuredImage: featuredImage,
          image: image,
          imageAlt: imageAlt,
          additionalImages: additionalImages,
          relatedImages: additionalImages.map((url, idx) => ({ id: `${post.id}_${idx}`, url, alt: '', order: idx }))
        }
        
        if (existingIndex >= 0) {
          // Cập nhật tin tức hiện có, hợp nhất ảnh
          const existing = news[existingIndex]
          const merged = {
            ...existing,
            ...newsItem,
            featuredImage: newsItem.featuredImage || existing.featuredImage || existing.image || '',
            image: newsItem.image || existing.image || existing.featuredImage || '',
            imageAlt: newsItem.imageAlt || existing.imageAlt || existing.title || '',
            additionalImages: Array.from(new Set([...(existing.additionalImages || []), ...(newsItem.additionalImages || [])])),
            relatedImages: (() => {
              const byUrl = new Map()
              ;(existing.relatedImages || []).forEach((img: any) => { if (img?.url) byUrl.set(img.url, img) })
              ;(newsItem.relatedImages || []).forEach((img: any) => { if (img?.url) byUrl.set(img.url, img) })
              return Array.from(byUrl.values())
            })()
          }
          news[existingIndex] = merged
          console.log('✅ Updated existing news:', newsItem.title)
        } else if (duplicateIndex >= 0) {
          // Cập nhật tin tức duplicate, hợp nhất ảnh
          const existing = news[duplicateIndex]
          const merged = {
            ...existing,
            ...newsItem,
            featuredImage: newsItem.featuredImage || existing.featuredImage || existing.image || '',
            image: newsItem.image || existing.image || existing.featuredImage || '',
            imageAlt: newsItem.imageAlt || existing.imageAlt || existing.title || '',
            additionalImages: Array.from(new Set([...(existing.additionalImages || []), ...(newsItem.additionalImages || [])])),
            relatedImages: (() => {
              const byUrl = new Map()
              ;(existing.relatedImages || []).forEach((img: any) => { if (img?.url) byUrl.set(img.url, img) })
              ;(newsItem.relatedImages || []).forEach((img: any) => { if (img?.url) byUrl.set(img.url, img) })
              return Array.from(byUrl.values())
            })()
          }
          news[duplicateIndex] = merged
          console.log('✅ Updated duplicate news:', newsItem.title)
        } else {
          // Thêm tin tức mới
          news.push(newsItem)
          console.log('✅ Added new news from WordPress:', newsItem.title)
        }
        
        saveNews(news)
        break
        
      case 'post_deleted':
        // Xóa tin tức khỏi local database
        const deleteIndex = news.findIndex(item => item.wordpressId === post.id)
        if (deleteIndex >= 0) {
          const deletedNews = news.splice(deleteIndex, 1)[0]
          saveNews(news)
          console.log('🗑️ Deleted news from local:', deletedNews.title)
        }
        break
        
      default:
        console.log('⚠️ Unknown webhook action:', action)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Webhook verification endpoint
  return NextResponse.json({ 
    message: 'WordPress webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 