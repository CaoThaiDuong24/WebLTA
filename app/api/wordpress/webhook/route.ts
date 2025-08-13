import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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
          lastSyncDate: new Date().toISOString()
        }
        
        if (existingIndex >= 0) {
          // Cập nhật tin tức hiện có
          news[existingIndex] = { ...news[existingIndex], ...newsItem }
          console.log('✅ Updated existing news:', newsItem.title)
        } else if (duplicateIndex >= 0) {
          // Cập nhật tin tức duplicate
          news[duplicateIndex] = { ...news[duplicateIndex], ...newsItem }
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