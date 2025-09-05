import { NextRequest, NextResponse } from 'next/server'
import { decryptSensitiveData } from '@/lib/security'
import { getWordPressConfig } from '@/lib/wordpress-config'
import fs from 'fs'
import path from 'path'

const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

// Lấy cấu hình Plugin
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
    const status = searchParams.get('status') || 'all'
    
    const pluginConfig = getPluginConfig()
    if (!pluginConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Plugin chưa được cấu hình' },
        { status: 400 }
      )
    }

    // Fetch posts from WordPress via plugin AJAX
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig?.siteUrl) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình' },
        { status: 400 }
      )
    }

    const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_posts_get`
    
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: pluginConfig.apiKey,
        status: status === 'published' ? 'publish' : status === 'draft' ? 'draft' : 'publish,draft',
        per_page: 50,
        page: 1
      }),
      signal: AbortSignal.timeout(15000) // tăng timeout để tránh 502 do chậm
    })

    if (!response.ok) {
      // Đọc text an toàn, thử parse JSON nếu có
      const raw = await response.text()
      let parsed: any = null
      try { parsed = JSON.parse(raw) } catch {}
      return NextResponse.json(
        { error: 'Không thể lấy posts từ WordPress', details: parsed || raw },
        { status: response.status }
      )
    }

    // Parse JSON an toàn
    const rawText = await response.text()
    let result: any
    try {
      result = JSON.parse(rawText)
    } catch (e) {
      return NextResponse.json(
        { error: 'WordPress trả dữ liệu không hợp lệ', raw: rawText },
        { status: 502 }
      )
    }
    
    // Transform WordPress posts to our format và deduplicate
    let posts = result.data || []
    // Filter out recruitment posts that were created by the recruitment plugin
    posts = posts.filter((post: any) => {
      const meta = post.meta || post.meta_input || {}
      const categories = post.categories || []
      const categorySlugs = post.categorySlugs || post.categoriesSlug || post.categories_slugs || []
      const categoryNames = post.categoryNames || post.categoriesNames || []
      const title: string = post.title || ''

      // If plugin supplies a recruitment flag/meta -> exclude
      if (post.isRecruitment === true) return false
      if (meta && (meta.lta_recruitment_id || meta['lta_recruitment_id'])) return false

      // If any category indicates recruitment -> exclude
      const allCats = [
        ...([].concat(categories).filter(Boolean)),
        ...([].concat(categorySlugs).filter(Boolean)),
        ...([].concat(categoryNames).filter(Boolean))
      ].map((c: any) => (typeof c === 'string' ? c.toLowerCase() : String(c).toLowerCase()))

      if (allCats.some((c: string) => ['tuyen-dung', 'tuyển dụng', 'tuyen dung', 'recruitment'].includes(c))) {
        return false
      }

      // Heuristic fallback: exclude if title starts with common recruitment phrases
      const lowerTitle = title.toLowerCase()
      if (/(tuyển dụng|tuyen dung|recruitment)/.test(lowerTitle)) return false
      return true
    })
    
    // Deduplicate by ID để tránh hiển thị trùng lặp
    const uniquePosts = posts.filter((post: any, index: number, self: any[]) => 
      index === self.findIndex((p: any) => p.id === post.id)
    )
    
    // Giới hạn số lượng posts để tránh quá tải
    const limitedPosts = uniquePosts.slice(0, 50)
    
    const transformedPosts = limitedPosts.map((post: any) => ({
      id: `wp_${post.id}`,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status === 'publish' ? 'published' : 'draft',
      featured: post.sticky || false,
      category: post.categories?.[0] || '',
      tags: post.tags?.join(', ') || '',
      featuredImage: post.featuredImage || '',
      additionalImages: [],
      image: post.featuredImage || '',
      imageAlt: post.title,
      author: post.author || 'Admin LTA',
      createdAt: post.date || new Date().toISOString(),
      updatedAt: post.modified || post.date || new Date().toISOString(),
      publishedAt: post.status === 'publish' ? post.date : undefined,
      wordpressId: post.id,
      syncedToWordPress: true,
      lastSyncDate: new Date().toISOString(),
      link: post.link
    }))

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      total: result.pagination?.totalPosts || transformedPosts.length,
      source: 'wordpress'
    })

  } catch (error) {
    console.error('Error fetching posts from WordPress:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy posts từ WordPress' },
      { status: 500 }
    )
  }
} 