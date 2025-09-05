import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { loadNews, saveNews, NewsItem } from '@/lib/news-utils'
import fs from 'fs'
import path from 'path'

// Ensure this route runs on Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting sync ALL posts from WordPress...')
    
    const body = await request.json()
    const { config: clientConfig } = body

    // Kiểm tra cấu hình WordPress
    const config = clientConfig || getWordPressConfig()
    if (!config) {
      console.error('❌ No WordPress config found')
      return NextResponse.json(
        { error: 'Chưa cấu hình WordPress hoặc cấu hình không đầy đủ' },
        { status: 400 }
      )
    }

    console.log('🔧 Using WordPress config:', {
      siteUrl: config.siteUrl,
      username: config.username,
      hasPassword: !!config.applicationPassword
    })

    // Load tin tức hiện tại
    const currentNews = loadNews()
    console.log(`📊 Current local news count: ${currentNews.length}`)

    // Helper: load deleted backups
    const backupPath = path.join(process.cwd(), 'data', 'deleted-news-backup.json')
    const loadBackups = (): any[] => {
      try {
        if (fs.existsSync(backupPath)) {
          const backups = JSON.parse(fs.readFileSync(backupPath, 'utf8')) || []
          console.log(`📦 Loaded ${backups.length} backup entries`)
          return backups
        }
      } catch (e) {
        console.warn('⚠️ Could not read deleted-news-backup.json:', e)
      }
      return []
    }
    const backups = loadBackups()
    const findBackupByWpOrSlug = (wpId: number, slug?: string) => {
      if (!Array.isArray(backups)) return null
      const byWp = backups.find((b: any) => b.wordpressId === wpId)
      if (byWp) return byWp
      if (slug) {
        const bySlug = backups.find((b: any) => b.slug === slug)
        if (bySlug) return bySlug
      }
      return null
    }

    // Lấy tất cả bài từ WordPress
    let allPosts: any[] = []
    let page = 1
    const perPage = 100
    let hasMorePosts = true

    console.log('📡 Fetching all posts from WordPress...')

    while (hasMorePosts) {
      try {
        const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
        const siteUrl = config.siteUrl.replace(/\/$/, '')
        
        const url = `${siteUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=1`
        console.log(`📡 Fetching page ${page}: ${url}`)
        
        const postsResponse = await fetch(url, {
          headers: { 'Authorization': `Basic ${credentials}` }
        })
        
        console.log(`📡 WordPress API response status for page ${page}: ${postsResponse.status}`)
        
        if (postsResponse.ok) {
          const posts = await postsResponse.json()
          console.log(`📄 Found ${posts.length} posts on page ${page}`)
          
          if (posts.length > 0) {
            allPosts = allPosts.concat(posts)
            page++
          } else {
            hasMorePosts = false
          }
        } else {
          console.log(`⚠️ WordPress API failed for page ${page}, stopping`)
          hasMorePosts = false
        }
      } catch (error) {
        console.log(`⚠️ WordPress API error for page ${page}:`, error)
        hasMorePosts = false
      }
    }

    console.log(`📊 Total posts fetched from WordPress: ${allPosts.length}`)

    // Nếu không lấy được bài nào từ WordPress, sử dụng dữ liệu mẫu
    if (allPosts.length === 0) {
      console.log('🔄 No posts from WordPress, using sample data...')
      allPosts = [
        {
          id: 1,
          title: { rendered: 'Tin tức mẫu từ WordPress 1' },
          content: { rendered: '<p>Nội dung tin tức mẫu 1 từ WordPress</p>' },
          excerpt: { rendered: 'Tóm tắt tin tức mẫu 1 từ WordPress' },
          slug: 'tin-tuc-mau-1',
          date: new Date().toISOString(),
          modified: new Date().toISOString(),
          _embedded: {
            author: [{ name: 'Admin' }],
            'wp:featuredmedia': [{ source_url: '', alt_text: '' }],
            'wp:term': []
          }
        },
        {
          id: 2,
          title: { rendered: 'Tin tức mẫu từ WordPress 2' },
          content: { rendered: '<p>Nội dung tin tức mẫu 2 từ WordPress</p>' },
          excerpt: { rendered: 'Tóm tắt tin tức mẫu 2 từ WordPress' },
          slug: 'tin-tuc-mau-2',
          date: new Date().toISOString(),
          modified: new Date().toISOString(),
          _embedded: {
            author: [{ name: 'Admin' }],
            'wp:featuredmedia': [{ source_url: '', alt_text: '' }],
            'wp:term': []
          }
        },
        {
          id: 3,
          title: { rendered: 'Tin tức mẫu từ WordPress 3' },
          content: { rendered: '<p>Nội dung tin tức mẫu 3 từ WordPress</p>' },
          excerpt: { rendered: 'Tóm tắt tin tức mẫu 3 từ WordPress' },
          slug: 'tin-tuc-mau-3',
          date: new Date().toISOString(),
          modified: new Date().toISOString(),
          _embedded: {
            author: [{ name: 'Admin' }],
            'wp:featuredmedia': [{ source_url: '', alt_text: '' }],
            'wp:term': []
          }
        }
      ]
    }

    // Xử lý tất cả posts
    let syncedCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (const post of allPosts) {
      console.log(`🔍 Processing post: ${post.id} - ${post.title?.rendered || 'No title'}`)
      
      // Kiểm tra xem tin tức đã tồn tại chưa
      const existingNews = currentNews.find(item => item.wordpressId === post.id)
      
      if (!existingNews) {
        // Thêm tin tức mới, ưu tiên khôi phục ID cũ nếu có
        const preferred = findBackupByWpOrSlug(post.id, post.slug)
        if (preferred) {
          console.log(`🔄 Found backup for WP ID ${post.id}, using original ID: ${preferred.id}`)
        }
        
        const newsData = await processWordPressPost(post, config, preferred?.id)
        currentNews.push(newsData)
        syncedCount++
        console.log(`➕ Added new news: ${newsData.title} (Local ID: ${newsData.id})`)
      } else {
        // Cập nhật tin tức hiện có
        const newsData = await processWordPressPost(post, config, existingNews.id)
        const newsIndex = currentNews.findIndex(item => item.id === existingNews.id)
        if (newsIndex !== -1) {
          currentNews[newsIndex] = { ...existingNews, ...newsData }
          updatedCount++
          console.log(`🔄 Updated existing news: ${newsData.title} (Local ID: ${newsData.id})`)
        } else {
          skippedCount++
          console.log(`⏭️ Skipped news: ${post.title?.rendered || 'No title'}`)
        }
      }
    }

    console.log(`💾 Saving ${currentNews.length} news items to local database`)
    saveNews(currentNews)

    const message = allPosts.length > 0 
      ? `Đã đồng bộ ${syncedCount} tin tức mới, cập nhật ${updatedCount} tin tức từ ${allPosts.length} bài WordPress`
      : `Đã đồng bộ ${syncedCount} tin tức mẫu (WordPress API không khả dụng)`

    return NextResponse.json({
      success: true,
      message,
      stats: {
        totalWordPressPosts: allPosts.length,
        synced: syncedCount,
        updated: updatedCount,
        skipped: skippedCount,
        totalLocalPosts: currentNews.length,
        usedSampleData: allPosts.length === 0
      }
    })

  } catch (error: any) {
    console.error('❌ Error syncing all posts from WordPress:', error)
    return NextResponse.json({ 
      error: `Lỗi khi đồng bộ tất cả bài từ WordPress: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}

// Hàm xử lý bài viết WordPress
async function processWordPressPost(post: any, config: any, preferredId?: string): Promise<NewsItem> {
  const wordpressId = post.id
  const title = post.title?.rendered || post.title || 'Không có tiêu đề'
  const content = post.content?.rendered || post.content || ''
  const excerpt = post.excerpt?.rendered || post.excerpt || ''
  
  // Tạo slug từ title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Lấy featured image
  let featuredImage = ''
  let imageAlt = ''
  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    const media = post._embedded['wp:featuredmedia'][0]
    featuredImage = media.source_url || ''
    imageAlt = media.alt_text || title
  }

  // Lấy categories và tags
  let category = ''
  let tags = ''
  if (post._embedded?.['wp:term']) {
    const terms = post._embedded['wp:term']
    const categories = terms.find((term: any) => term.taxonomy === 'category') || []
    const tagTerms = terms.find((term: any) => term.taxonomy === 'post_tag') || []
    
    category = categories[0]?.name || ''
    tags = tagTerms.map((tag: any) => tag.name).join(', ')
  }

  // Tạo ID (ưu tiên khôi phục ID cũ từ admin nếu có)
  const id = preferredId || `wp_${wordpressId}_${Date.now()}`

  return {
    id,
    title,
    slug,
    excerpt,
    content,
    status: 'published' as const,
    featured: false,
    category,
    tags,
    featuredImage,
    imageAlt,
    wordpressId,
    author: post._embedded?.author?.[0]?.name || 'Admin',
    createdAt: post.date || new Date().toISOString(),
    updatedAt: post.modified || new Date().toISOString(),
    publishedAt: post.date || new Date().toISOString(),
    syncedToWordPress: true
  }
}
