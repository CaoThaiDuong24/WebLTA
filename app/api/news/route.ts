import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { WordPressAPI } from '@/lib/wordpress'
import { sanitizeHtmlContent, validateHtmlContent } from '@/lib/html-content-utils'

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
      // Tạo file mới nếu chưa tồn tại
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

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/[\s_-]+/g, '-') // Thay thế khoảng trắng và dấu gạch dưới bằng dấu gạch ngang
    .replace(/^-+|-+$/g, '') // Loại bỏ dấu gạch ngang ở đầu và cuối
}

// Kiểm tra slug đã tồn tại chưa
const isSlugExists = (slug: string, excludeId?: string): boolean => {
  const news = loadNews()
  return news.some(item => item.slug === slug && item.id !== excludeId)
}

// Lấy cấu hình WordPress từ localStorage (server-side)
const getWordPressConfig = () => {
  try {
    // Thử đọc từ file cấu hình
    const configPath = path.join(process.cwd(), 'data', 'wordpress-config.json')
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      return JSON.parse(configData)
    }
    return null
  } catch (error) {
    console.error('Error loading WordPress config:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    let news = loadNews()

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

    // Sắp xếp theo thời gian tạo mới nhất
    news.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
      }
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
    console.log('POST /api/news called')
    const body = await request.json()
    console.log('Request body:', body)
    
    // Validate required fields
    if (!body.title || !body.excerpt || !body.content) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: title, excerpt, content' },
        { status: 400 }
      )
    }

    // Tự động tạo slug nếu không có
    let slug = body.slug || generateSlug(body.title)
    
    // Kiểm tra slug đã tồn tại chưa và tạo slug mới nếu cần
    let counter = 1
    let originalSlug = slug
    while (isSlugExists(slug)) {
      slug = `${originalSlug}-${counter}`
      counter++
    }
    
    console.log(`✅ Generated slug: ${slug}`)

    // Validate và xử lý hình ảnh
    const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB cho data URL
    
    // Kiểm tra featuredImage
    let featuredImage = body.featuredImage || '';
    if (featuredImage && typeof featuredImage === 'string') {
      if (featuredImage.startsWith('data:') && featuredImage.length > MAX_IMAGE_SIZE) {
        console.log('⚠️ Featured image quá lớn, bỏ qua');
        featuredImage = '';
      }
    }
    
    // Kiểm tra image - ưu tiên từ body, nếu không có thì dùng featuredImage
    let image = body.image || featuredImage || '';
    if (image && typeof image === 'string') {
      if (image.startsWith('data:') && image.length > MAX_IMAGE_SIZE) {
        console.log('⚠️ Image quá lớn, bỏ qua');
        image = '';
      }
    }
    
    // Kiểm tra additionalImages
    let additionalImages = body.additionalImages || [];
    if (Array.isArray(additionalImages)) {
      additionalImages = additionalImages.filter(img => {
        if (typeof img === 'string' && img.startsWith('data:') && img.length > MAX_IMAGE_SIZE) {
          console.log('⚠️ Additional image quá lớn, bỏ qua');
          return false;
        }
        return img && img.trim() !== '';
      });
    }

    // Xử lý và làm sạch nội dung HTML
    let content = body.content || '';
    let excerpt = body.excerpt || '';
    
    if (content && typeof content === 'string') {
      const originalContent = content;
      content = sanitizeHtmlContent(content);
      
      // Kiểm tra nội dung sau khi làm sạch
      const validation = validateHtmlContent(content);
      if (!validation.isValid) {
        console.log('⚠️ Content validation issues:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.log('⚠️ Content validation warnings:', validation.warnings);
      }
      
      if (content !== originalContent) {
        console.log('✅ Content sanitized');
      }
    }
    
    if (excerpt && typeof excerpt === 'string') {
      const originalExcerpt = excerpt;
      excerpt = sanitizeHtmlContent(excerpt);
      
      if (excerpt !== originalExcerpt) {
        console.log('✅ Excerpt sanitized');
      }
    }
    
    // Đảm bảo featuredImage và image có giá trị nếu có additionalImages
    if (additionalImages.length > 0 && !featuredImage && !image) {
      featuredImage = additionalImages[0];
      image = additionalImages[0];
      console.log('✅ Tự động set featuredImage và image từ additionalImages[0]');
    }
    
    // Log thông tin hình ảnh
    console.log('📸 Image processing summary:');
    console.log('- Featured Image:', featuredImage ? 'Có' : 'Không');
    console.log('- Main Image:', image ? 'Có' : 'Không');
    console.log('- Additional Images:', additionalImages.length);
    console.log('- Related Images:', body.relatedImages?.length || 0);

    // Tạo tin tức mới
    const newNews: NewsItem = {
      id: generateId(),
      title: body.title,
      slug: body.slug,
      excerpt: excerpt,
      content: content,
      status: body.status || 'draft',
      featured: body.featured || false,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      category: body.category,
      tags: body.tags,
      featuredImage: featuredImage,
      additionalImages: additionalImages,
      image: image,
      imageAlt: body.imageAlt || body.title,
      relatedImages: body.relatedImages || [], // Chỉ sử dụng relatedImages được gửi từ client
      author: body.author || 'Admin LTA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: body.status === 'published' ? new Date().toISOString() : undefined,
      wordpressId: body.wordpressId,
      syncedToWordPress: false, // Sẽ được cập nhật sau khi sync
      lastSyncDate: undefined
    }

    // Lưu vào local database
    const currentNews = loadNews()
    currentNews.push(newNews)
    saveNews(currentNews)

    console.log('✅ News saved to local database:', newNews.id)

    // Tự động đồng bộ lên WordPress sử dụng auto sync mới
    try {
      const wordpressConfig = getWordPressConfig()
      if (wordpressConfig && wordpressConfig.isConnected && wordpressConfig.autoPublish) {
        console.log('🔄 Auto-syncing to WordPress using new method...')
        
        // Chuẩn bị dữ liệu để sync
        const syncData = {
          title: newNews.title,
          content: newNews.content,
          excerpt: newNews.excerpt,
          status: newNews.status === 'published' ? 'publish' : 'draft',
          author: newNews.author,
          category: newNews.category || '',
          tags: newNews.tags || ''
        }

        // Sử dụng auto sync mới
        const syncResponse = await fetch(`${request.nextUrl.origin}/api/wordpress/auto-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(syncData)
        })

        if (syncResponse.ok) {
          const syncResult = await syncResponse.json()
          if (syncResult.success) {
            // Cập nhật trạng thái sync
            newNews.syncedToWordPress = true
            newNews.lastSyncDate = new Date().toISOString()
            if (syncResult.data && syncResult.data.id) {
              newNews.wordpressId = syncResult.data.id
            }
            
            // Lưu lại với thông tin sync
            const updatedNews = loadNews()
            const newsIndex = updatedNews.findIndex(item => item.id === newNews.id)
            if (newsIndex !== -1) {
              updatedNews[newsIndex] = newNews
              saveNews(updatedNews)
            }
            
            console.log('✅ Auto-sync to WordPress successful')
          } else {
            console.log('⚠️ Auto-sync to WordPress failed:', syncResult.error)
          }
        } else {
          console.log('⚠️ Auto-sync to WordPress failed:', syncResponse.status)
        }
      } else {
        if (wordpressConfig?.restApiBlocked) {
          console.log('ℹ️ Auto-sync disabled: WordPress REST API is blocked by hosting provider')
          console.log('📧 Contact hosting provider: apisupport@xecurify.com')
        } else {
          console.log('ℹ️ Auto-sync disabled or WordPress not connected')
        }
      }
    } catch (syncError) {
      console.error('❌ Error during auto-sync:', syncError)
      // Không làm gián đoạn việc tạo tin tức nếu sync thất bại
    }

    return NextResponse.json({
      success: true,
      message: 'Tin tức đã được tạo thành công',
      data: newNews
    })

  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json(
      { error: 'Không thể tạo tin tức' },
      { status: 500 }
    )
  }
} 