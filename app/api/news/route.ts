import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptSensitiveData } from '@/lib/security'
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

// Tạo ID duy nhất
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Tạo slug từ title
const generateSlug = (title: string): string => {
  if (!title) return ''
  const withoutDiacritics = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
  return withoutDiacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Kiểm tra slug đã tồn tại chưa
const isSlugExists = (slug: string, excludeId?: string): boolean => {
  const news = loadNews()
  return news.some(item => item.slug === slug && item.id !== excludeId)
}

// Lấy cấu hình Plugin đồng bộ WordPress
const getPluginConfig = () => {
  try {
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt API key if needed
      if (config.apiKey && config.apiKey.startsWith('ENCRYPTED:')) {
        config.apiKey = decryptSensitiveData(config.apiKey.replace('ENCRYPTED:', ''))
      }
      
      return config
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

    // Load local news data
    let news = loadNews()
    
    // Chỉ đồng bộ với WordPress khi cần thiết (có thể thêm cache sau)
    try {
      const pluginConfig = getPluginConfig()
      if (pluginConfig?.apiKey) {
        // Fetch posts from WordPress với timeout
        const response = await fetch(`${request.nextUrl.origin}/api/wordpress/posts`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000) // 10 giây timeout
        })

        if (response.ok) {
          const result = await response.json()
          const wordpressPosts = result.data || []
          
          // Tạo map của WordPress posts để so sánh
          const wpPostMap = new Map()
          wordpressPosts.forEach((post: any) => {
            wpPostMap.set(post.wordpressId || post.id, post)
          })
          
          // Lọc local news, chỉ giữ lại những tin tức còn tồn tại ở WordPress
          const filteredNews = news.filter((localPost: any) => {
            const wpId = localPost.wordpressId || localPost.id?.replace('wp_', '')
            return wpPostMap.has(parseInt(wpId))
          })
          
          // Cập nhật local data nếu có thay đổi
          if (filteredNews.length !== news.length) {
            saveNews(filteredNews)
            news = filteredNews
          }
          
          // Thêm tin tức mới từ WordPress nếu chưa có trong local
          wordpressPosts.forEach((wpPost: any) => {
            const wpId = wpPost.wordpressId || wpPost.id
            const existsInLocal = news.some((localPost: any) => 
              (localPost.wordpressId || localPost.id?.replace('wp_', '')) === wpId
            )
            
            if (!existsInLocal) {
              news.push(wpPost)
            }
          })
        }
      }
    } catch (wordpressError) {
      // Sử dụng local data nếu có lỗi đồng bộ
      console.log('Using local data due to sync error')
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

    // Sắp xếp theo thứ tự mới nhất trước
    news.sort((a, b) => {
      const dateA = new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime()
      const dateB = new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime()
      return dateA - dateB
    })

    // Cập nhật local data với thứ tự đúng
    if (news.length > 0) {
      saveNews(news)
    }

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

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/news - Tạo tin tức mới')
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.excerpt || !body.content) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: title, excerpt, content' },
        { status: 400 }
      )
    }

    // Generate slug if needed
    let slug = body.slug || generateSlug(body.title)
    let counter = 1
    const originalSlug = slug
    while (isSlugExists(slug)) {
      slug = `${originalSlug}-${counter}`
      counter++
    }

    // Prepare images
    const MAX_IMAGE_SIZE = 50 * 1024 * 1024

    let featuredImage = body.featuredImage || ''
    if (featuredImage && typeof featuredImage === 'string' && featuredImage.startsWith('data:') && featuredImage.length > MAX_IMAGE_SIZE) {
      featuredImage = ''
    }

    let additionalImages = Array.isArray(body.additionalImages) ? body.additionalImages : []
    additionalImages = additionalImages.filter((img: string) => {
      if (typeof img === 'string' && img.startsWith('data:') && img.length > MAX_IMAGE_SIZE) {
        return false
      }
      return img && img.trim() !== ''
    })

    // Check plugin configuration
    const pluginConfig = getPluginConfig()
    if (!pluginConfig?.apiKey) {
      return NextResponse.json(
        { 
          error: 'Plugin chưa được cấu hình API key. Vui lòng cấu hình trong WordPress Plugin Manager.',
          warning: 'Không thể lưu tin tức khi WordPress chưa được kết nối.'
        },
        { status: 400 }
      )
    }

    // Publish to WordPress via plugin
    console.log('🔄 Publishing to WordPress via plugin...')
    
    const pluginPayload = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      status: body.status || 'draft',
      category: body.category || '',
      tags: body.tags || '',
      featuredImage: featuredImage || body.image || '',
      additionalImages: additionalImages,
      slug
    }

    // Retry logic cho publish via plugin
    let resp: Response
    let lastError: any = null
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/2: Publishing via plugin...`)
        
        resp = await fetch(`${request.nextUrl.origin}/api/wordpress/publish-via-plugin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pluginPayload),
          signal: AbortSignal.timeout(35000) // 35 giây timeout
        })
        
        // Nếu thành công, thoát khỏi loop
        break
        
      } catch (error) {
        lastError = error
        console.log(`❌ Attempt ${attempt} failed:`, error.message)
        
        if (attempt < 2) {
          // Chờ 3 giây trước khi thử lại
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    }
    
    // Nếu tất cả attempts đều thất bại
    if (!resp) {
      return NextResponse.json(
        { 
          error: 'Không thể đăng bài qua plugin sau 2 lần thử',
          details: lastError?.message || 'Unknown error',
          warning: 'Tin tức không được lưu do lỗi WordPress. Vui lòng thử lại.'
        },
        { status: 502 }
      )
    }

    const text = await resp.text()
    let wordpressResult: any = null
    try {
      wordpressResult = JSON.parse(text)
    } catch (e) {
      return NextResponse.json(
        { 
          error: 'Plugin trả về dữ liệu không hợp lệ', 
          raw: text,
          warning: 'Không thể lưu tin tức do lỗi từ WordPress plugin.'
        },
        { status: 502 }
      )
    }

    if (!resp.ok || !wordpressResult?.success) {
      return NextResponse.json(
        { 
          error: wordpressResult?.error || 'Không thể đăng bài qua plugin', 
          details: wordpressResult,
          warning: 'Tin tức không được lưu do lỗi WordPress. Vui lòng thử lại.'
        },
        { status: 502 }
      )
    }

    // Lấy thông tin user từ session để gán author
    let authorName = 'Admin LTA'
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.name) {
        authorName = session.user.name
      } else if (session?.user?.email) {
        // Nếu chỉ có email, lấy phần trước @ làm tên
        const email = session.user.email
        authorName = email.split('@')[0]
      }
    } catch {}

    // Create news item for local storage
    const newsItem: NewsItem = {
      id: `wp_${wordpressResult.data?.id || ''}`,
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content,
      status: body.status || 'draft',
      featured: body.featured || false,
      category: body.category || '',
      tags: body.tags || '',
      featuredImage: featuredImage || body.image || '',
      additionalImages,
      image: featuredImage || body.image || '',
      imageAlt: body.imageAlt || body.title,
      author: body.author || authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: (body.status === 'published') ? new Date().toISOString() : undefined,
      wordpressId: wordpressResult.data?.id,
      syncedToWordPress: true,
      lastSyncDate: new Date().toISOString()
    }

    // Save to local storage
    const news = loadNews()
    news.push(newsItem)
    saveNews(news)

    console.log('✅ WordPress publish successful')
    return NextResponse.json({
      success: true,
      message: 'Tin tức đã được đăng lên WordPress thành công',
      data: newsItem
    })

  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json(
      { 
        error: 'Không thể tạo tin tức',
        details: error instanceof Error ? error.message : 'Unknown error',
        warning: 'Vui lòng kiểm tra cấu hình và thử lại.'
      },
      { status: 500 }
    )
  }
}
