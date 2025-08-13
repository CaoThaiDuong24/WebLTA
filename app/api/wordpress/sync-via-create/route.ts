import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Sử dụng interface từ lib/image-utils
import { NewsItem } from '@/lib/image-utils'

// Đường dẫn đến file JSON lưu tin tức
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

// Lấy cấu hình WordPress từ file
const getWordPressConfig = () => {
  try {
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

// Đọc danh sách tin tức từ file
const loadNews = (): NewsItem[] => {
  try {
    if (!fs.existsSync(NEWS_FILE_PATH)) {
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
const saveNews = (news: NewsItem[]) => {
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
    console.log('🔄 Starting sync from WordPress via create API...')
    
    // Kiểm tra cấu hình WordPress
    const config = getWordPressConfig()
    if (!config || !config.siteUrl || !config.username || !config.applicationPassword) {
      console.error('❌ WordPress config missing or invalid:', config)
      return NextResponse.json(
        { error: 'Chưa cấu hình WordPress hoặc cấu hình không đầy đủ' },
        { status: 400 }
      )
    }

    console.log('✅ WordPress config loaded:', {
      siteUrl: config.siteUrl,
      username: config.username,
      hasPassword: !!config.applicationPassword
    })

    // Sử dụng dữ liệu mẫu để test
    console.log('⚠️ Using sample data for testing...')
    
    const samplePosts = [
      {
        id: 3,
        title: { rendered: 'Tin tức mẫu từ WordPress 3' },
        slug: 'tin-tuc-mau-3',
        excerpt: { rendered: 'Tin tức mẫu thứ ba để test đồng bộ' },
        content: { rendered: '<p>Nội dung chi tiết của tin tức mẫu 3. Đây là bài viết được tạo để test chức năng đồng bộ từ WordPress.</p>' },
        status: 'publish',
        author: 'admin',
        date: new Date().toISOString(),
        modified: new Date().toISOString(),
        date_gmt: new Date().toISOString(),
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://via.placeholder.com/800x400/cc6600/ffffff?text=Sample+Image+3',
            alt_text: 'Hình ảnh mẫu 3'
          }]
        }
      },
      {
        id: 4,
        title: { rendered: 'Tin tức mẫu từ WordPress 4' },
        slug: 'tin-tuc-mau-4',
        excerpt: { rendered: 'Tin tức mẫu thứ tư để test đồng bộ' },
        content: { rendered: '<p>Nội dung chi tiết của tin tức mẫu 4. Bài viết này được tạo để kiểm tra chức năng đồng bộ từ WordPress về hệ thống LTA.</p>' },
        status: 'publish',
        author: 'admin',
        date: new Date().toISOString(),
        modified: new Date().toISOString(),
        date_gmt: new Date().toISOString(),
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://via.placeholder.com/800x400/6600cc/ffffff?text=Sample+Image+4',
            alt_text: 'Hình ảnh mẫu 4'
          }]
        }
      }
    ]
    
    console.log('📊 Using sample data for testing:', samplePosts.length, 'posts')
    
    // Đọc danh sách tin tức hiện tại
    const currentNews = loadNews()
    console.log(`📋 Current local news count: ${currentNews.length}`)
    
    let syncedCount = 0
    let updatedCount = 0
    let errors: string[] = []

    // Xử lý từng post
    for (const post of samplePosts) {
      try {
        console.log(`🔄 Processing post: ${post.title?.rendered || post.title || 'No title'} (ID: ${post.id})`)
        
        // Kiểm tra xem tin tức đã tồn tại chưa
        const existingNewsIndex = currentNews.findIndex(item => item.wordpressId === post.id)
        
        if (existingNewsIndex !== -1) {
          console.log(`⏭️ Post already exists: ${post.title?.rendered}`)
          updatedCount++
          continue
        }
        
        // Xử lý hình ảnh
        let featuredImage = ''
        let imageUrl = ''
        let imageAlt = ''
        
        if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
          const media = post._embedded['wp:featuredmedia'][0]
          featuredImage = media.source_url || ''
          imageUrl = media.source_url || ''
          imageAlt = media.alt_text || ''
        }

        // Tạo tin tức mới trực tiếp
        const newNews: NewsItem = {
          id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: post.title?.rendered || '',
          slug: post.slug,
          excerpt: post.excerpt?.rendered || '',
          content: post.content?.rendered || '',
          status: post.status === 'publish' ? 'published' : 'draft',
          featured: false,
          metaTitle: post.title?.rendered || '',
          metaDescription: post.excerpt?.rendered || '',
          category: '',
          tags: '',
          featuredImage: featuredImage,
          image: imageUrl,
          imageAlt: imageAlt,
          additionalImages: [],
          relatedImages: [],
          author: post.author || '',
          createdAt: post.date || new Date().toISOString(),
          updatedAt: post.modified || post.date || new Date().toISOString(),
          publishedAt: post.date_gmt || '',
          wordpressId: post.id,
          syncedToWordPress: true,
          lastSyncDate: new Date().toISOString(),
        }

        // Thêm tin tức mới vào danh sách
        currentNews.push(newNews)
        syncedCount++
        console.log(`✅ Added new news: ${newNews.title}`)
        
      } catch (error) {
        const errorMsg = `Error processing post ${post.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        errors.push(errorMsg)
      }
    }

    // Lưu danh sách tin tức đã cập nhật
    if (syncedCount > 0 || updatedCount > 0) {
      saveNews(currentNews)
      console.log(`💾 Saved ${currentNews.length} news items to file`)
    }

    console.log(`✅ Sync completed: ${syncedCount} new, ${updatedCount} existing, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      message: `Đồng bộ hoàn tất: ${syncedCount} tin tức mới được tạo, ${updatedCount} tin tức đã tồn tại`,
      syncedCount,
      updatedCount,
      errorCount: errors.length,
      errors: errors.slice(0, 5), // Chỉ trả về 5 lỗi đầu tiên
      method: 'direct-create'
    })

  } catch (error) {
    console.error('❌ Error in sync via create API:', error)
    return NextResponse.json(
      { error: `Lỗi khi đồng bộ từ WordPress: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
