import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { loadNews, saveNews } from '@/lib/news-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting restore deleted news from WordPress...')
    
    const body = await request.json()
    const { 
      wordpressId, 
      title, 
      slug, 
      forceRestore = false,
      includeImages = true,
      includeContent = true 
    } = body

    // Kiểm tra cấu hình WordPress
    const config = getWordPressConfig()
    if (!config || !config.siteUrl || !config.username || !config.applicationPassword) {
      return NextResponse.json(
        { error: 'Chưa cấu hình WordPress hoặc cấu hình không đầy đủ' },
        { status: 400 }
      )
    }

    // Chuẩn bị credentials cho WordPress
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    const siteUrl = config.siteUrl.replace(/\/$/, '')

    let targetPost = null

    // Nếu có wordpressId, tìm post theo ID
    if (wordpressId) {
      console.log(`🔍 Searching for WordPress post by ID: ${wordpressId}`)
      
      try {
        const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${wordpressId}?_embed=1`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        })

        if (response.ok) {
          targetPost = await response.json()
          console.log(`✅ Found WordPress post by ID: ${wordpressId}`)
        } else {
          console.log(`❌ WordPress post not found by ID: ${wordpressId}`)
        }
      } catch (error) {
        console.error('❌ Error fetching WordPress post by ID:', error)
        return NextResponse.json(
          { error: 'Lỗi kết nối đến WordPress' },
          { status: 503 }
        )
      }
    }

    // Nếu không tìm thấy theo ID hoặc không có ID, tìm theo title hoặc slug
    if (!targetPost && (title || slug)) {
      console.log(`🔍 Searching for WordPress post by title/slug: ${title || slug}`)
      
      const searchParams = new URLSearchParams()
      if (title) searchParams.append('search', title)
      if (slug) searchParams.append('slug', slug)
      searchParams.append('per_page', '10')
      searchParams.append('status', 'publish,draft')
      searchParams.append('_embed', '1')

      try {
        const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts?${searchParams.toString()}`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        })

        if (response.ok) {
          const posts = await response.json()
          if (Array.isArray(posts) && posts.length > 0) {
            targetPost = posts[0]
            console.log(`✅ Found WordPress post by search: ${targetPost.title?.rendered || 'No title'}`)
          } else {
            console.log(`❌ No WordPress posts found by search: ${title || slug}`)
          }
        } else {
          console.log(`❌ WordPress search failed: ${response.status}`)
        }
      } catch (error) {
        console.error('❌ Error searching WordPress posts:', error)
        return NextResponse.json(
          { error: 'Lỗi kết nối đến WordPress' },
          { status: 503 }
        )
      }
    }

    if (!targetPost) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức trong WordPress' },
        { status: 404 }
      )
    }

    // Kiểm tra xem tin tức đã tồn tại trong local không
    const currentNews = loadNews()
    const existingNews = currentNews.find(item => 
      item.wordpressId === targetPost.id ||
      item.title === (targetPost.title?.rendered || targetPost.title) ||
      item.slug === targetPost.slug
    )

    if (existingNews && !forceRestore) {
      return NextResponse.json(
        { 
          error: 'Tin tức đã tồn tại trong hệ thống',
          existingNews: {
            id: existingNews.id,
            title: existingNews.title,
            slug: existingNews.slug,
            wordpressId: existingNews.wordpressId
          }
        },
        { status: 409 }
      )
    }

    // Lấy thông tin hình ảnh nếu có
    let featuredImageUrl = null
    let additionalImages: string[] = []
    
    if (includeImages && targetPost.featured_media) {
      try {
        console.log(`🖼️ Fetching featured image (ID: ${targetPost.featured_media})`)
        
        const mediaResponse = await fetch(`${siteUrl}/wp-json/wp/v2/media/${targetPost.featured_media}`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
          },
        })

        if (mediaResponse.ok) {
          const media = await mediaResponse.json()
          featuredImageUrl = media.source_url || media.guid?.rendered
          console.log(`✅ Featured image URL: ${featuredImageUrl}`)
        }
      } catch (error) {
        console.log(`⚠️ Error fetching featured image: ${error}`)
      }
    }

    // Không lấy hình ảnh từ content để tránh trùng lặp
    // additionalImages sẽ chỉ chứa attachments từ WordPress

    // Chuẩn bị dữ liệu tin tức để lưu
    const newsData = {
      id: existingNews ? existingNews.id : Date.now().toString(36),
      wordpressId: targetPost.id,
      title: targetPost.title?.rendered || targetPost.title,
      slug: targetPost.slug,
      excerpt: includeContent ? (targetPost.excerpt?.rendered || targetPost.excerpt || '') : '',
      content: includeContent ? (targetPost.content?.rendered || targetPost.content || '') : '',
      status: targetPost.status === 'publish' ? 'published' : 'draft',
      featured: targetPost.sticky || false,
      category: targetPost.categories && targetPost.categories.length > 0 ? 
        await getCategoryName(siteUrl, credentials, targetPost.categories[0]) : '',
      tags: targetPost.tags && targetPost.tags.length > 0 ? 
        await getTagNames(siteUrl, credentials, targetPost.tags) : '',
      featuredImage: featuredImageUrl,
      additionalImages: additionalImages,
      imageAlt: targetPost.title?.rendered || targetPost.title,
      author: targetPost.author_info?.display_name || 'WordPress',
      createdAt: targetPost.date,
      updatedAt: targetPost.modified,
      publishedAt: targetPost.status === 'publish' ? targetPost.date : undefined,
      syncedFromWordPress: true,
      lastSyncDate: new Date().toISOString(),
      restoredFromWordPress: true
    }

    // Lưu vào local database
    if (existingNews) {
      // Cập nhật tin tức hiện có
      const newsIndex = currentNews.findIndex(item => item.id === existingNews.id)
      if (newsIndex !== -1) {
        currentNews[newsIndex] = { ...existingNews, ...newsData }
        console.log(`🔄 Updated existing news: ${newsData.title}`)
      }
    } else {
      // Thêm tin tức mới
      currentNews.push(newsData)
      console.log(`➕ Added new news: ${newsData.title}`)
    }

    saveNews(currentNews)

    return NextResponse.json({
      success: true,
      message: existingNews ? 'Tin tức đã được cập nhật từ WordPress' : 'Tin tức đã được khôi phục từ WordPress',
      news: {
        id: newsData.id,
        title: newsData.title,
        slug: newsData.slug,
        wordpressId: newsData.wordpressId,
        featuredImage: newsData.featuredImage,
        additionalImagesCount: newsData.additionalImages?.length || 0,
        status: newsData.status,
        restored: true
      }
    })

  } catch (error) {
    console.error('❌ Error restoring news from WordPress:', error)
    return NextResponse.json(
      { error: `Lỗi khi khôi phục tin tức từ WordPress: ${error}` },
      { status: 500 }
    )
  }
}

// Helper function để lấy tên category
async function getCategoryName(siteUrl: string, credentials: string, categoryId: number): Promise<string> {
  try {
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/categories/${categoryId}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    })

    if (response.ok) {
      const category = await response.json()
      return category.name
    }
  } catch (error) {
    console.log(`⚠️ Error fetching category: ${error}`)
  }
  return ''
}

// Helper function để lấy tên tags
async function getTagNames(siteUrl: string, credentials: string, tagIds: number[]): Promise<string> {
  try {
    const tagNames: string[] = []
    
    for (const tagId of tagIds) {
      const response = await fetch(`${siteUrl}/wp-json/wp/v2/tags/${tagId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      })

      if (response.ok) {
        const tag = await response.json()
        tagNames.push(tag.name)
      }
    }
    
    return tagNames.join(', ')
  } catch (error) {
    console.log(`⚠️ Error fetching tags: ${error}`)
  }
  return ''
}
