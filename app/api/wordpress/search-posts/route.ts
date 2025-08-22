import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Searching WordPress posts...')
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const perPage = parseInt(searchParams.get('per_page') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || 'publish,draft'

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

    // Tạo search parameters
    const searchParamsObj = new URLSearchParams()
    if (query) searchParamsObj.append('search', query)
    searchParamsObj.append('per_page', perPage.toString())
    searchParamsObj.append('page', page.toString())
    searchParamsObj.append('status', status)
    searchParamsObj.append('_embed', '1') // Lấy thêm thông tin media

    // Gọi WordPress REST API
    const apiUrl = `${siteUrl}/wp-json/wp/v2/posts?${searchParamsObj.toString()}`

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        // Timeout after 15 seconds
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const posts = await response.json()

      // Transform posts to our format
      const transformedPosts = posts.map((post: any) => {
        const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
        
        // Xử lý thông tin tác giả
        let author = 'Admin LTA'
        if (post._embedded?.author?.[0]?.name) {
          author = post._embedded.author[0].name
        } else if (post._embedded?.author?.[0]?.display_name) {
          author = post._embedded.author[0].display_name
        } else if (post._embedded?.author?.[0]?.user_nicename) {
          author = post._embedded.author[0].user_nicename
        }
        
        return {
          id: post.id,
          title: post.title?.rendered || '',
          slug: post.slug,
          excerpt: post.excerpt?.rendered || '',
          content: post.content?.rendered || '',
          status: post.status,
          date: post.date,
          modified: post.modified,
          author: author,
          featuredImage: featuredImage,
          categories: post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.name) || [],
          tags: post._embedded?.['wp:term']?.[1]?.map((tag: any) => tag.name) || [],
          sticky: post.sticky || false,
          link: post.link
        }
      })

      return NextResponse.json({
        success: true,
        data: transformedPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((response.headers.get('X-WP-Total') || posts.length) / perPage),
          totalPosts: parseInt(response.headers.get('X-WP-Total') || posts.length.toString()),
          perPage: perPage,
          hasNextPage: page < Math.ceil((response.headers.get('X-WP-Total') || posts.length) / perPage),
          hasPrevPage: page > 1
        },
        searchQuery: query
      })

    } catch (fetchError) {
      console.error('❌ Error fetching from WordPress:', fetchError)
      return NextResponse.json(
        { 
          error: 'Không thể kết nối đến WordPress',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
        },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('❌ Error searching WordPress posts:', error)
    return NextResponse.json(
      { error: `Lỗi khi tìm kiếm posts từ WordPress: ${error}` },
      { status: 500 }
    )
  }
}
