import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { NewsItem } from '@/lib/image-utils'

// Local storage path (legacy fallback)
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')
const TRASH_FILE_PATH = path.join(process.cwd(), 'data', 'trash-news.json')

function ensureDataDir() {
  try {
    const dir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
}
const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')
// Helpers to read/write local news file
function loadNews(): any[] {
  try {
    ensureDataDir()
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      fs.writeFileSync(NEWS_FILE_PATH, '[]')
      return []
    }
    const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function saveNews(list: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(list, null, 2))
  } catch (e) {
    console.error('❌ Error saving news file:', e)
  }
}


const loadLocalNewsById = (id: string) => {
  try {
    if (!fs.existsSync(NEWS_FILE_PATH)) return null
    const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
    const list = JSON.parse(data) as any[]
    return list.find(item => item.id === id || item.slug === id) || null
  } catch (e) {
    return null
  }
}

const getWordPressConfig = () => {
  try {
    if (fs.existsSync(WORDPRESS_CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(WORDPRESS_CONFIG_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
    return null
  } catch (e) {
    return null
  }
}

function extractImagesFromContent(html: string): string[] {
  const urls: string[] = []
  try {
    const matches = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
    for (const m of matches) {
      const url = m[1]
      if (url && !urls.includes(url)) urls.push(url)
    }
  } catch {}
  // Lọc bỏ icon/svg/emoji phổ biến
  const filtered = urls.filter(u => {
    const lower = u.toLowerCase()
    return !(
      lower.endsWith('.svg') ||
      lower.includes('emoji') ||
      lower.includes('wp-includes') ||
      lower.includes('icon') ||
      lower.startsWith('data:image/svg')
    )
  })
  return filtered
}

function mapWpPostToNewsItem(post: any, attachments: string[] = []) {
  const fi = post._embedded?.['wp:featuredmedia']?.[0]
  const featuredImage = fi?.source_url || ''
  const imageAlt = fi?.alt_text || ''
  const contentHtml: string = post.content?.rendered || ''
  const embeddedAuthor = post._embedded?.author?.[0]
  const authorName = (
    embeddedAuthor?.name ||
    embeddedAuthor?.display_name ||
    post.author_info?.display_name ||
    embeddedAuthor?.slug ||
    'WordPress'
  )

  // Chỉ sử dụng attachments làm additionalImages, không lấy hình ảnh từ content
  const additional = attachments.filter(u => u && u !== featuredImage)

  // De-duplicate
  const uniqueAdditional = Array.from(new Set(additional))

  return {
    id: `wp_${post.id}`,
    wordpressId: post.id,
    title: post.title?.rendered || '',
    slug: post.slug,
    excerpt: post.excerpt?.rendered || '',
    content: contentHtml,
    status: post.status === 'publish' ? 'published' : 'draft',
    featured: !!post.sticky,
    metaTitle: post.yoast_head_json?.title || post.title?.rendered || '',
    metaDescription: post.yoast_head_json?.description || post.excerpt?.rendered || '',
    category: '',
    tags: '',
    featuredImage,
    additionalImages: uniqueAdditional,
    image: featuredImage,
    author: authorName,
    imageAlt: imageAlt || (post.title?.rendered || ''),
    relatedImages: uniqueAdditional.map((url: string, idx: number) => ({ id: `${post.id}_${idx}`, url, alt: '', order: idx })),
    createdAt: post.date || new Date().toISOString(),
    updatedAt: post.modified || post.date || new Date().toISOString(),
    publishedAt: post.date_gmt || undefined,
    syncedToWordPress: true,
    lastSyncDate: new Date().toISOString(),
  }
}

async function fetchWithFallback(url: string, credentials?: string) {
  // Try without auth first
  let resp = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  if (!resp.ok && credentials) {
    // Retry with auth if unauthorized/forbidden
    if (resp.status === 401 || resp.status === 403) {
      resp = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        }
      })
    }
  }
  return resp
}

async function fetchAttachments(baseUrl: string, postId: number, credentials?: string): Promise<string[]> {
  try {
    // Fetch attachments for the post
    const apiUrl = `${baseUrl}/wp-json/wp/v2/media?parent=${postId}&per_page=100`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return []
    }

    const items = await response.json()
    const urls: string[] = Array.isArray(items)
      ? items.map((m: any) => m?.source_url).filter((u: any) => typeof u === 'string' && u.trim() !== '')
      : []
    
    // Lọc bỏ svg/icon/emoji
    return Array.from(new Set(urls.filter((u: string) => {
      const lower = u.toLowerCase()
      return !(
        lower.endsWith('.svg') ||
        lower.includes('emoji') ||
        lower.includes('wp-includes') ||
        lower.includes('icon') ||
        lower.startsWith('data:image/svg')
      )
    })))
  } catch {
    return []
  }
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    console.log('🔍 Getting news detail for ID:', id)
    
    const wpConfig = getWordPressConfig()

    if (!wpConfig || !wpConfig.siteUrl || !wpConfig.username || !wpConfig.applicationPassword) {
      // Fallback to local if no WordPress config
      const local = loadLocalNewsById(context.params.id)
      if (local) {
        return NextResponse.json({ success: true, data: local })
      }
      return NextResponse.json({ error: 'Không tìm thấy tin tức' }, { status: 404 })
    }

    const baseUrl: string = String(wpConfig.siteUrl).replace(/\/$/, '')
    const credentials = Buffer.from(`${wpConfig.username}:${wpConfig.applicationPassword}`).toString('base64')

    // Support ids like wp_123 or 123; otherwise treat as slug
    const wpIdStr = id.startsWith('wp_') ? id.slice(3) : id
    const wpId = parseInt(wpIdStr, 10)

    try {
      let apiUrl: string
      
      if (!isNaN(wpId)) {
        // Fetch by WordPress ID
        apiUrl = `${baseUrl}/wp-json/wp/v2/posts/${wpId}?_embed=1`
        console.log(`📡 Fetching WordPress post by ID: ${wpId}`)
      } else {
        // Fetch by slug
        apiUrl = `${baseUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(id)}&_embed=1`
        console.log(`📡 Fetching WordPress post by slug: ${id}`)
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      let post: any
      if (!isNaN(wpId)) {
        // Single post response
        post = await response.json()
      } else {
        // Array response for slug search
        const posts = await response.json()
        post = posts[0] // Get first matching post
      }

      if (!post) {
        return NextResponse.json({ error: 'Không tìm thấy tin tức' }, { status: 404 })
      }

      console.log(`✅ Found WordPress post: ${post.title?.rendered || 'Untitled'}`)

      // Transform WordPress post to our format
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
      const author = post._embedded?.author?.[0]?.name || 'Admin'
      const contentHtml = post.content?.rendered || ''
      
      // Chỉ lấy attachments, không lấy hình ảnh từ content
      const attachments = await fetchAttachments(baseUrl, post.id, credentials)
      const additionalImages = attachments.filter(img => img !== featuredImage)

      const newsItem = {
        id: `wp_${post.id}`,
        title: post.title?.rendered || '',
        slug: post.slug,
        excerpt: post.excerpt?.rendered || '',
        content: contentHtml,
        status: post.status === 'publish' ? 'published' : 'draft',
        featured: !!post.sticky,
        metaTitle: post.yoast_head_json?.title || post.title?.rendered || '',
        metaDescription: post.yoast_head_json?.description || post.excerpt?.rendered || '',
        category: post._embedded?.['wp:term']?.[0]?.[0]?.name || '',
        tags: post._embedded?.['wp:term']?.[1]?.map((tag: any) => tag.name).join(', ') || '',
        featuredImage: featuredImage,
        additionalImages: additionalImages,
        image: featuredImage,
        imageAlt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title?.rendered || '',
        author: author,
        createdAt: post.date || new Date().toISOString(),
        updatedAt: post.modified || post.date || new Date().toISOString(),
        publishedAt: post.status === 'publish' ? post.date : undefined,
        wordpressId: post.id,
        syncedToWordPress: true,
        lastSyncDate: new Date().toISOString(),
        link: post.link
      }

      return NextResponse.json({ success: true, data: newsItem })

    } catch (fetchError) {
      console.error('❌ Error fetching from WordPress:', fetchError)
      
      // Fallback to local data
      const local = loadLocalNewsById(context.params.id)
      if (local) {
        console.log('🔄 Falling back to local data')
        return NextResponse.json({ success: true, data: local })
      }
      
      return NextResponse.json({ 
        error: 'Không tìm thấy tin tức',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('❌ Error getting news detail:', error)
    return NextResponse.json({ error: 'Lỗi khi lấy chi tiết tin tức' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const news = loadNews()
    const newsIndex = news.findIndex(item => item.id === id)
    
    let updatedNews: any
    if (newsIndex === -1) {
      // Không có trong local: thử lấy từ WP để tạo bản local rồi cập nhật
      const wpFallback = loadLocalNewsById(id)
      const base = wpFallback || { id, createdAt: new Date().toISOString() }
      updatedNews = {
        ...base,
        ...body,
        id: base.id || id,
        updatedAt: new Date().toISOString()
      }
      news.push(updatedNews)
    } else {
      // Cập nhật tin tức - giữ nguyên ID và các trường quan trọng
      updatedNews = {
        ...news[newsIndex],
        ...body,
        id: news[newsIndex].id,
        wordpressId: news[newsIndex].wordpressId,
        syncedToWordPress: news[newsIndex].syncedToWordPress,
        createdAt: news[newsIndex].createdAt,
        updatedAt: new Date().toISOString()
      }
      news[newsIndex] = updatedNews
    }

    // Lưu vào file
    saveNews(news)

    // Tự động đồng bộ lên WordPress nếu có cấu hình và tin tức đã được sync trước đó
    try {
      const wordpressConfig = getWordPressConfig()
      if (wordpressConfig && wordpressConfig.siteUrl && updatedNews.wordpressId) {
        console.log('🔄 Auto-syncing updated news to WordPress...')
        
        // Chuẩn bị dữ liệu để sync
        const syncData = {
          id: updatedNews.wordpressId, // ID của bài viết trên WordPress
          title: updatedNews.title,
          content: updatedNews.content,
          excerpt: updatedNews.excerpt,
          status: updatedNews.status === 'published' ? 'publish' : 'draft',
          categories: updatedNews.category ? [updatedNews.category] : [],
          tags: updatedNews.tags ? updatedNews.tags.split(',').map((tag: string) => tag.trim()) : [],
          meta: {
            meta_title: updatedNews.metaTitle,
            meta_description: updatedNews.metaDescription
          }
        }

        // Sử dụng multi-method sync để cập nhật bài viết
        const syncResponse = await fetch(`${request.nextUrl.origin}/api/wordpress/sync-multi-method`, {
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
            updatedNews.lastSyncDate = new Date().toISOString()
            
            // Lưu lại với thông tin sync
            const currentNews = loadNews()
            const currentNewsIndex = currentNews.findIndex(item => item.id === id)
            if (currentNewsIndex !== -1) {
              currentNews[currentNewsIndex] = updatedNews
              saveNews(currentNews)
            }
            
            console.log('✅ Auto-sync update to WordPress successful')
          } else {
            console.log('⚠️ Auto-sync update to WordPress failed:', syncResult.error)
          }
        } else {
          console.log('⚠️ Auto-sync update to WordPress failed:', syncResponse.status)
        }
      } else {
        console.log('ℹ️ Auto-sync disabled, WordPress not connected, or news not synced before')
      }
    } catch (syncError) {
      console.error('❌ Error during auto-sync update:', syncError)
      // Không làm gián đoạn việc cập nhật tin tức nếu sync thất bại
    }

    return NextResponse.json({
      success: true,
      message: 'Tin tức đã được cập nhật thành công',
      data: updatedNews
    })
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { error: 'Không thể cập nhật tin tức' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const news = loadNews()
    let newsIndex = news.findIndex(item => item.id === id)
    
    // Nếu không tìm thấy trong local, thử tìm trong WordPress
    if (newsIndex === -1) {
      console.log(`🔍 Không tìm thấy tin tức với ID "${id}" trong local, thử tìm trong WordPress...`)
      
      // Kiểm tra xem có phải WordPress ID không
      const wordpressId = id.startsWith('wp_') ? id.substring(3) : id
      
      try {
        const wordpressConfig = getWordPressConfig()
        if (wordpressConfig && wordpressConfig.siteUrl) {
          // Tìm tin tức từ WordPress
          const wpResponse = await fetch(`${wordpressConfig.siteUrl}/wp-json/wp/v2/posts/${wordpressId}?_embed=1`, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${wordpressConfig.username}:${wordpressConfig.applicationPassword}`).toString('base64')}`
            }
          })
          
          if (wpResponse.ok) {
            const wpPost = await wpResponse.json()
            
            // Chuyển đổi WordPress post thành NewsItem
            const attachments = await fetchAttachments(wordpressConfig.siteUrl, wpPost.id, {
              username: wordpressConfig.username,
              password: wordpressConfig.applicationPassword
            })
            
            const newsItem = mapWpPostToNewsItem(wpPost, attachments)
            
            // Thêm vào local news
            news.push(newsItem)
            saveNews(news)
            
            // Tìm lại index
            newsIndex = news.findIndex(item => item.id === id)
            console.log(`✅ Đã tìm thấy tin tức từ WordPress và thêm vào local`)
          } else {
            console.log(`❌ Không tìm thấy tin tức trong WordPress với ID ${wordpressId}`)
          }
        }
      } catch (error) {
        console.error('❌ Lỗi khi tìm tin tức từ WordPress:', error)
      }
    }
    
    if (newsIndex === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức' },
        { status: 404 }
      )
    }

    // Cập nhật một phần tin tức
    const updatedNews = {
      ...news[newsIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    news[newsIndex] = updatedNews

    // Lưu vào file
    saveNews(news)

    // Tự động đồng bộ lên WordPress nếu có cấu hình và tin tức đã được sync trước đó
    try {
      const wordpressConfig = getWordPressConfig()
      if (wordpressConfig && wordpressConfig.siteUrl && updatedNews.wordpressId) {
        console.log('🔄 Auto-syncing patched news to WordPress...')
        
        // Chuẩn bị dữ liệu để sync (chỉ những trường đã thay đổi)
        const syncData: any = {
          id: updatedNews.wordpressId // ID của bài viết trên WordPress
        }

        // Chỉ sync những trường đã thay đổi
        if (body.title !== undefined) syncData.title = updatedNews.title
        if (body.content !== undefined) syncData.content = updatedNews.content
        if (body.excerpt !== undefined) syncData.excerpt = updatedNews.excerpt
        if (body.status !== undefined) syncData.status = updatedNews.status === 'published' ? 'publish' : 'draft'
        if (body.category !== undefined) syncData.categories = updatedNews.category ? [updatedNews.category] : []
        if (body.tags !== undefined) syncData.tags = updatedNews.tags ? updatedNews.tags.split(',').map((tag: string) => tag.trim()) : []
        if (body.metaTitle !== undefined || body.metaDescription !== undefined) {
          syncData.meta = {
            meta_title: updatedNews.metaTitle,
            meta_description: updatedNews.metaDescription
          }
        }

        // Chỉ sync nếu có thay đổi thực sự
        if (Object.keys(syncData).length > 1) { // > 1 vì luôn có id
          const syncResponse = await fetch(`${request.nextUrl.origin}/api/wordpress/sync-multi-method`, {
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
              updatedNews.lastSyncDate = new Date().toISOString()
              
              // Lưu lại với thông tin sync
              const currentNews = loadNews()
              const currentNewsIndex = currentNews.findIndex(item => item.id === id)
              if (currentNewsIndex !== -1) {
                currentNews[currentNewsIndex] = updatedNews
                saveNews(currentNews)
              }
              
              console.log('✅ Auto-sync patch to WordPress successful')
            } else {
              console.log('⚠️ Auto-sync patch to WordPress failed:', syncResult.error)
            }
          } else {
            console.log('⚠️ Auto-sync patch to WordPress failed:', syncResponse.status)
          }
        } else {
          console.log('ℹ️ No changes detected, skipping WordPress sync')
        }
      } else {
        console.log('ℹ️ Auto-sync disabled, WordPress not connected, or news not synced before')
      }
    } catch (syncError) {
      console.error('❌ Error during auto-sync patch:', syncError)
      // Không làm gián đoạn việc cập nhật tin tức nếu sync thất bại
    }

    return NextResponse.json({
      success: true,
      message: 'Tin tức đã được cập nhật thành công',
      data: updatedNews
    })
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { error: 'Không thể cập nhật tin tức' },
      { status: 500 }
    )
  }
}

// DELETE function đã bị vô hiệu hóa - không cho phép xóa tin tức
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { 
      error: 'Chức năng xóa tin tức đã bị vô hiệu hóa',
      message: 'Không thể xóa tin tức để đảm bảo dữ liệu an toàn'
    },
    { status: 403 }
  )
} 