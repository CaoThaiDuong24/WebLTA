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
// Không còn dùng local load/save nữa
function loadNews(): any[] { return [] }
function saveNews(_list: any[]) {}


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
    
    // Lọc bỏ svg/icon/emoji và đảm bảo không trùng lặp
    const filtered = Array.from(new Set(urls.filter((u: string) => {
      const lower = u.toLowerCase()
      return !(
        lower.endsWith('.svg') ||
        lower.includes('emoji') ||
        lower.includes('wp-includes') ||
        lower.includes('icon') ||
        lower.startsWith('data:image/svg')
      )
    })))

    console.log('🔍 DEBUG fetchAttachments:', {
      postId,
      totalItems: items.length,
      urlsCount: urls.length,
      filteredCount: filtered.length,
      urls: urls,
      filtered: filtered
    })

    return filtered
  } catch (error) {
    console.error('❌ Error fetching attachments:', error)
    return []
  }
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // Thêm parameter status
    
    console.log('🔍 Getting news detail for ID:', id, 'Status filter:', status)
    
    const wpConfig = getWordPressConfig()

    if (!wpConfig || !wpConfig.siteUrl || !wpConfig.username || !wpConfig.applicationPassword) {
      return NextResponse.json({ error: 'WordPress chưa được cấu hình' }, { status: 400 })
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

      // Kiểm tra status filter
      if (status === 'published' && post.status !== 'publish') {
        return NextResponse.json({ error: 'Tin tức chưa được xuất bản' }, { status: 404 })
      } else if (status === 'draft' && post.status !== 'draft') {
        return NextResponse.json({ error: 'Tin tức không phải bản nháp' }, { status: 404 })
      }

      console.log(`✅ Found WordPress post: ${post.title?.rendered || 'Untitled'} (Status: ${post.status})`)

      // Transform WordPress post to our format
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
      const author = post._embedded?.author?.[0]?.name || 'Admin'
      const contentHtml = post.content?.rendered || ''
      
      // Chỉ lấy attachments, không lấy hình ảnh từ content
      const attachments = await fetchAttachments(baseUrl, post.id, credentials)
      
      // Lọc bỏ featured image khỏi additional images (so sánh theo "gốc" ảnh)
      const normalizeForCompare = (url: string) => {
        try {
          const u = new URL(url)
          // Bỏ querystring, trailing slash, extension, hậu tố -WxH và -scaled
          let p = u.pathname.toLowerCase()
          p = p.replace(/\.[a-z0-9]+$/i, '')
          p = p.replace(/-\d+x\d+$/i, '')
          p = p.replace(/-scaled$/i, '')
          return u.origin.toLowerCase() + p
        } catch {
          let s = url.toLowerCase().split('?')[0]
          s = s.replace(/\.[a-z0-9]+$/i, '')
          s = s.replace(/-\d+x\d+$/i, '')
          s = s.replace(/-scaled$/i, '')
          return s.replace(/\/$/, '')
        }
      }

      const baseFeatured = featuredImage ? normalizeForCompare(featuredImage) : ''

      // Deduplicate theo "gốc" ảnh, đồng thời loại bỏ ảnh trùng với featured
      const normalizedToOriginal = new Map<string, string>()
      for (const raw of attachments) {
        if (!raw || raw.trim() === '') continue
        const norm = normalizeForCompare(raw)
        if (baseFeatured && norm === baseFeatured) continue
        if (!normalizedToOriginal.has(norm)) normalizedToOriginal.set(norm, raw)
      }
      const additionalImages = Array.from(normalizedToOriginal.values())

      // Debug log để kiểm tra
      console.log('🔍 DEBUG Images:', {
        featuredImage,
        attachmentsCount: attachments.length,
        additionalImagesCount: additionalImages.length,
        attachments: attachments,
        additionalImages: additionalImages,
        hasFeaturedInAdditional: additionalImages.includes(featuredImage),
        featuredImageNormalized: featuredImage ? featuredImage.replace(/\/$/, '').toLowerCase() : null
      })

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
    
    // Gọi plugin để cập nhật trực tiếp
    const resp = await fetch(`${request.nextUrl.origin}/api/wordpress/update-via-plugin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wordpressId: id.startsWith('wp_') ? id.slice(3) : id,
        ...body
      }),
      signal: AbortSignal.timeout(30000)
    })

    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = null }
    if (!resp.ok || !json?.success) {
      return NextResponse.json({ error: json?.error || 'Không thể cập nhật tin tức', raw: text }, { status: resp.status || 502 })
    }

    return NextResponse.json({ success: true, message: 'Cập nhật thành công trên WordPress', data: json.data })
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
    
    const resp = await fetch(`${request.nextUrl.origin}/api/wordpress/update-via-plugin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wordpressId: id.startsWith('wp_') ? id.slice(3) : id,
        ...body
      }),
      signal: AbortSignal.timeout(30000)
    })

    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = null }
    if (!resp.ok || !json?.success) {
      return NextResponse.json({ error: json?.error || 'Không thể cập nhật tin tức', raw: text }, { status: resp.status || 502 })
    }

    return NextResponse.json({ success: true, message: 'Cập nhật thành công trên WordPress', data: json.data })
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
  try {
    const wpId = params.id.startsWith('wp_') ? params.id.slice(3) : params.id
    const resp = await fetch(`${request.nextUrl.origin}/api/wordpress/delete-via-plugin?id=${encodeURIComponent(wpId)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(20000)
    })

    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = null }
    if (!resp.ok || !json?.success) {
      return NextResponse.json({ error: json?.error || 'Không thể xóa tin tức', raw: text }, { status: resp.status || 502 })
    }

    return NextResponse.json({ success: true, message: 'Đã xóa bài viết trên WordPress', data: { id: Number(wpId) } })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa tin tức' }, { status: 500 })
  }
} 