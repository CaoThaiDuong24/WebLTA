import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Định nghĩa interface cho tin tức
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

// Đường dẫn đến file JSON lưu tin tức
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')
const TRASH_FILE_PATH = path.join(process.cwd(), 'data', 'trash-news.json')
const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

// Đảm bảo thư mục data tồn tại
const ensureDataDirectory = () => {
  const dataDir = path.dirname(NEWS_FILE_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Đọc danh sách tin tức từ file
const loadNews = (): NewsItem[] => {
  try {
    ensureDataDirectory()
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

// Lưu danh sách tin tức vào file
const saveNews = (news: NewsItem[]) => {
  try {
    ensureDataDirectory()
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(news, null, 2))
  } catch (error) {
    console.error('Error saving news:', error)
    throw error
  }
}

// Lấy cấu hình Plugin đồng bộ WordPress
const getPluginConfig = () => {
  try {
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      return JSON.parse(configData)
    }
    return null
  } catch (error) {
    console.error('Error loading Plugin config:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const trashed = searchParams.get('trashed') === 'true'
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Nếu yêu cầu danh sách thùng rác, trả về từ file local
    if (trashed) {
      try {
        if (fs.existsSync(TRASH_FILE_PATH)) {
          const trashData = fs.readFileSync(TRASH_FILE_PATH, 'utf8')
          const list = JSON.parse(trashData)
          return NextResponse.json({ 
            success: true, 
            data: list, 
            pagination: { page, limit, total: list.length, totalPages: Math.ceil(list.length / limit) } 
          })
        } else {
          return NextResponse.json({ 
            success: true, 
            data: [], 
            pagination: { page, limit, total: 0, totalPages: 0 } 
          })
        }
      } catch (e) {
        return NextResponse.json({ error: 'Không thể đọc thùng rác' }, { status: 500 })
      }
    }

    // Ưu tiên dữ liệu local, chỉ sync từ WordPress nếu local trống
    let news = loadNews()
    
    // Nếu local trống, thử lấy từ WordPress
    if (news.length === 0) {
      console.log('📡 Local data empty, fetching from WordPress...')
      
      try {
        const pluginConfig = getPluginConfig()
        if (pluginConfig?.apiKey) {
          // Fetch posts from WordPress via plugin
          const response = await fetch(`${request.nextUrl.origin}/api/wordpress/posts`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })

          if (response.ok) {
            const result = await response.json()
            news = result.data || []
            console.log(`✅ Fetched ${news.length} posts from WordPress`)
          } else {
            console.log('❌ Failed to fetch from WordPress')
          }
        }
      } catch (wordpressError) {
        console.error('❌ Error fetching from WordPress:', wordpressError)
      }
    } else {
      console.log(`📋 Using ${news.length} posts from local data`)
    }
    
    // Lọc theo trạng thái
    if (status) {
      news = news.filter(item => item.status === status)
    }

    // Lọc theo danh mục
    if (category) {
      news = news.filter(item => item.category === category)
    }

    // Lọc tin nổi bật
    if (featured === 'true') {
      news = news.filter(item => item.featured)
    }

    // Sắp xếp
    news.sort(
      (a, b) =>
        new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime()
    )

    // Phân trang
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNews = news.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedNews,
      pagination: {
        page,
        limit,
        total: news.length,
        totalPages: Math.ceil(news.length / limit)
      },
      source: 'local'
    })

  } catch (error) {
    console.error('Error getting news:', error)
    return NextResponse.json(
      { error: 'Không thể lấy danh sách tin tức' },
      { status: 500 }
    )
  }
}
