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

// Đường dẫn cấu hình plugin (vẫn dùng để đọc apiKey, nhưng KHÔNG lưu news local nữa)
const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

// KHÔNG còn load/save tin tức local

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

// KHÔNG kiểm tra slug trên local nữa (WordPress xử lý trùng)
const isSlugExists = (_slug: string, _excludeId?: string): boolean => false

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || 'all' // Thêm parameter status

    const pluginConfig = getPluginConfig()
    if (!pluginConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Plugin chưa được cấu hình' },
        { status: 400 }
      )
    }

    // Lấy danh sách bài viết trực tiếp từ WordPress thông qua endpoint nội bộ
    const response = await fetch(`${request.nextUrl.origin}/api/wordpress/posts?status=${status}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: 'Không thể lấy tin tức từ WordPress', details: errText }, { status: response.status })
    }

    const result = await response.json()
    const allNews = result.data || []
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNews = allNews.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedNews,
      pagination: {
        page,
        limit,
        total: allNews.length,
        totalPages: Math.ceil(allNews.length / limit)
      },
      source: 'wordpress'
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
      // Không xử lý trùng tiêu đề tại backend nữa. Trả nguyên lỗi từ WordPress/plugin
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

    // KHÔNG lưu local nữa, chỉ trả về kết quả từ WordPress
    console.log('✅ WordPress publish successful (no local save)')
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
