import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Sử dụng interface từ lib/image-utils
import { NewsItem } from '@/lib/image-utils'

// Đường dẫn đến file JSON lưu tin tức
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

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
function saveNews(news: NewsItem[]) {
  try {
    // Đảm bảo thư mục data tồn tại
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

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting sync from WordPress...')
    
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

    // Chuẩn bị credentials cho WordPress
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    const siteUrl = config.siteUrl.replace(/\/$/, '')

    // Test 2: Check REST API
    try {
      const apiUrl = `${siteUrl}/wp-json/wp/v2/posts?per_page=1`
      console.log('🔗 Testing REST API:', apiUrl)
      
      const apiResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000)
      })
      
      console.log('📊 REST API test result:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        ok: apiResponse.ok,
        headers: Object.fromEntries(apiResponse.headers.entries())
      })

      if (apiResponse.status === 401) {
        return NextResponse.json(
          { error: 'Sai thông tin đăng nhập WordPress. Vui lòng kiểm tra username và application password.' },
          { status: 401 }
        )
      } else if (apiResponse.status === 403) {
        console.log('⚠️ REST API bị chặn, thử sử dụng XML-RPC...')
        
        // Thử sử dụng XML-RPC thay thế
        try {
          const xmlrpcUrl = `${siteUrl}/xmlrpc.php`
          const xmlrpcResponse = await fetch(xmlrpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/xml',
            },
            body: `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.getPosts</methodName>
  <params>
    <param><value><int>1</int></value></param>
    <param><value><string>${config.username}</string></value></param>
    <param><value><string>${config.applicationPassword}</string></value></param>
    <param><value><struct>
      <member>
        <name>number</name>
        <value><int>5</int></value>
      </member>
    </struct></value></param>
  </params>
</methodCall>`,
            signal: AbortSignal.timeout(15000)
          })
          
          if (xmlrpcResponse.ok) {
            console.log('✅ XML-RPC working, using XML-RPC for sync')
            return await syncFromWordPressViaXMLRPC(config)
          } else {
            console.log('❌ XML-RPC also failed')
            return NextResponse.json(
              { error: 'REST API và XML-RPC đều bị chặn bởi hosting provider. Vui lòng liên hệ nhà cung cấp hosting.' },
              { status: 503 }
            )
          }
        } catch (xmlrpcError) {
          console.log('❌ XML-RPC test failed:', xmlrpcError)
          return NextResponse.json(
            { error: 'REST API bị chặn và XML-RPC không khả dụng. Vui lòng liên hệ nhà cung cấp hosting.' },
            { status: 503 }
          )
        }
      } else if (apiResponse.status === 404) {
        return NextResponse.json(
          { error: 'Không tìm thấy WordPress REST API. Vui lòng kiểm tra URL website.' },
          { status: 404 }
        )
      }
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text()
      return NextResponse.json(
          { error: `Không thể lấy danh sách posts từ WordPress: ${apiResponse.status} ${apiResponse.statusText}` },
        { status: 500 }
      )
    }

      const posts = await apiResponse.json()
    console.log(`📊 Found ${posts.length} posts in WordPress`)

      if (posts.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Không có bài viết nào trong WordPress',
          syncedCount: 0,
          errorCount: 0
        })
      }

      // Tiếp tục xử lý với REST API
      return await processPostsFromREST(posts, config)

    } catch (error) {
      console.error('❌ REST API test failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Lỗi khi test REST API',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in sync from WordPress:', error)
    return NextResponse.json(
      { error: `Lỗi khi đồng bộ từ WordPress: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 

// Hàm xử lý posts từ REST API
async function processPostsFromREST(posts: any[], config: any) {
    const currentNews = loadNews()
  console.log(`�� Current local news count: ${currentNews.length}`)
  
    let syncedCount = 0
  let updatedCount = 0
    let errors: string[] = []

  // Xử lý từng post
    for (const post of posts) {
      try {
      console.log(`🔄 Processing post: ${post.title?.rendered || post.title || 'No title'} (ID: ${post.id})`)

      // Kiểm tra xem tin tức đã tồn tại chưa
        const existingNewsIndex = currentNews.findIndex(item => item.wordpressId === post.id)
        
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

        const newsItem: NewsItem = {
        id: existingNewsIndex !== -1 ? currentNews[existingNewsIndex].id : `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: post.title?.rendered || '',
          slug: post.slug,
          excerpt: post.excerpt?.rendered || '',
          content: post.content?.rendered || '',
          status: post.status === 'publish' ? 'published' : 'draft',
          featured: false,
          metaTitle: post.yoast_head_json?.title || post.title?.rendered || '',
          metaDescription: post.yoast_head_json?.description || post.excerpt?.rendered || '',
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

        if (existingNewsIndex !== -1) {
        // Cập nhật tin tức hiện có
        currentNews[existingNewsIndex] = { ...currentNews[existingNewsIndex], ...newsItem }
        updatedCount++
        console.log(`🔄 Updated existing news: ${newsItem.title}`)
      } else {
        // Thêm tin tức mới
        currentNews.push(newsItem)
        syncedCount++
        console.log(`➕ Added new news: ${newsItem.title}`)
      }
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

  console.log(`✅ Sync completed: ${syncedCount} new, ${updatedCount} updated, ${errors.length} errors`)

  return NextResponse.json({
    success: true,
    message: `Đồng bộ hoàn tất: ${syncedCount} tin tức mới, ${updatedCount} tin tức cập nhật`,
    syncedCount,
    updatedCount,
    errorCount: errors.length,
    errors: errors.slice(0, 5) // Chỉ trả về 5 lỗi đầu tiên
  })
}

// Hàm đồng bộ từ WordPress qua XML-RPC
async function syncFromWordPressViaXMLRPC(config: any) {
  console.log('🔄 Syncing from WordPress via XML-RPC...')
  
  try {
    const { siteUrl, username, applicationPassword } = config
    const baseUrl = siteUrl.replace(/\/$/, '')
    
    // Sử dụng XML-RPC để lấy posts
    const xmlrpcUrl = `${baseUrl}/xmlrpc.php`
    const xmlrpcRequest = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.getPosts</methodName>
  <params>
    <param><value><int>1</int></value></param>
    <param><value><string>${username}</string></value></param>
    <param><value><string>${applicationPassword}</string></value></param>
    <param><value><struct>
      <member>
        <name>number</name>
        <value><int>100</int></value>
      </member>
      <member>
        <name>post_status</name>
        <value><string>publish,draft</string></value>
      </member>
    </struct></value></param>
  </params>
</methodCall>`

    const response = await fetch(xmlrpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body: xmlrpcRequest,
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      throw new Error(`XML-RPC request failed: ${response.status}`)
    }

    const xmlResponse = await response.text()
    console.log('📊 XML-RPC response received')
    
    // Parse XML response (simplified)
    const posts = parseXMLRPCResponse(xmlResponse)
    console.log(`📊 Found ${posts.length} posts via XML-RPC`)
    
    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có bài viết nào trong WordPress',
        syncedCount: 0,
        errorCount: 0
      })
    }

    // Xử lý posts từ XML-RPC
    const currentNews = loadNews()
    let syncedCount = 0
    let updatedCount = 0
    let errors: string[] = []

    for (const post of posts) {
      try {
        console.log(`🔄 Processing post via XML-RPC: ${post.title} (ID: ${post.post_id})`)
        
        const existingNewsIndex = currentNews.findIndex(item => item.wordpressId === post.post_id)
        
        const newsItem: NewsItem = {
          id: existingNewsIndex !== -1 ? currentNews[existingNewsIndex].id : `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: post.title || '',
          slug: post.post_name || '',
          excerpt: post.excerpt || '',
          content: post.post_content || '',
          status: post.post_status === 'publish' ? 'published' : 'draft',
          featured: false,
          metaTitle: post.title || '',
          metaDescription: post.excerpt || '',
          category: '',
          tags: '',
          featuredImage: '',
          image: '',
          imageAlt: '',
          additionalImages: [],
          relatedImages: [],
          author: post.post_author || '',
          createdAt: post.post_date || new Date().toISOString(),
          updatedAt: post.post_modified || post.post_date || new Date().toISOString(),
          publishedAt: post.post_date_gmt || '',
          wordpressId: post.post_id,
          syncedToWordPress: true,
          lastSyncDate: new Date().toISOString(),
        }

        if (existingNewsIndex !== -1) {
          currentNews[existingNewsIndex] = { ...currentNews[existingNewsIndex], ...newsItem }
          updatedCount++
        } else {
          currentNews.push(newsItem)
          syncedCount++
        }
      } catch (error) {
        const errorMsg = `Error processing XML-RPC post ${post.post_id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        errors.push(errorMsg)
      }
    }

    if (syncedCount > 0 || updatedCount > 0) {
    saveNews(currentNews)
    }

    return NextResponse.json({
      success: true,
      message: `Đồng bộ XML-RPC hoàn tất: ${syncedCount} tin tức mới, ${updatedCount} tin tức cập nhật`,
      syncedCount,
      updatedCount,
      errorCount: errors.length,
      method: 'xmlrpc'
    })

  } catch (error) {
    console.error('❌ XML-RPC sync failed:', error)
    return NextResponse.json(
      { error: `Lỗi khi đồng bộ qua XML-RPC: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// Hàm parse XML-RPC response (simplified)
function parseXMLRPCResponse(xml: string): any[] {
  try {
    // Simplified XML parsing - in production, use a proper XML parser
    const posts: any[] = []
    const postMatches = xml.match(/<struct>([\s\S]*?)<\/struct>/g)
    
    if (postMatches) {
      for (const match of postMatches) {
        const post: any = {}
        
        // Extract post_id
        const postIdMatch = match.match(/<name>post_id<\/name>\s*<value><int>(\d+)<\/int><\/value>/)
        if (postIdMatch) post.post_id = parseInt(postIdMatch[1])
        
        // Extract title
        const titleMatch = match.match(/<name>post_title<\/name>\s*<value><string>([^<]*)<\/string><\/value>/)
        if (titleMatch) post.title = titleMatch[1]
        
        // Extract content
        const contentMatch = match.match(/<name>post_content<\/name>\s*<value><string>([\s\S]*?)<\/string><\/value>/)
        if (contentMatch) post.post_content = contentMatch[1]
        
        // Extract other fields...
        const statusMatch = match.match(/<name>post_status<\/name>\s*<value><string>([^<]*)<\/string><\/value>/)
        if (statusMatch) post.post_status = statusMatch[1]
        
        if (post.post_id) {
          posts.push(post)
        }
      }
    }
    
    return posts
  } catch (error) {
    console.error('Error parsing XML-RPC response:', error)
    return []
  }
} 