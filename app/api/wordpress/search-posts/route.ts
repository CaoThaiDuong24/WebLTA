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

    console.log(`🔍 Searching WordPress with query: "${query}"`)

    // Tìm kiếm posts từ WordPress
    const searchResponse = await fetch(`${siteUrl}/wp-json/wp/v2/posts?${searchParamsObj}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    })

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('❌ Failed to search WordPress posts:', errorText)
      return NextResponse.json(
        { error: `Không thể tìm kiếm posts từ WordPress: ${searchResponse.status} ${searchResponse.statusText}` },
        { status: 500 }
      )
    }

    const posts = await searchResponse.json()
    const totalPosts = parseInt(searchResponse.headers.get('X-WP-Total') || '0')
    const totalPages = parseInt(searchResponse.headers.get('X-WP-TotalPages') || '0')

    console.log(`📊 Found ${posts.length} posts (Total: ${totalPosts})`)

    // Xử lý dữ liệu posts
    const processedPosts = posts.map((post: any) => ({
      id: post.id,
      title: post.title?.rendered || post.title,
      slug: post.slug,
      excerpt: post.excerpt?.rendered || post.excerpt,
      content: post.content?.rendered || post.content,
      status: post.status,
      date: post.date,
      modified: post.modified,
      author: post.author_info?.display_name || 'Unknown',
      featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      categories: post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.name) || [],
      tags: post._embedded?.['wp:term']?.[1]?.map((tag: any) => tag.name) || [],
      sticky: post.sticky || false
    }))

    return NextResponse.json({
      success: true,
      data: processedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        perPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      searchQuery: query
    })

  } catch (error) {
    console.error('❌ Error searching WordPress posts:', error)
    return NextResponse.json(
      { error: `Lỗi khi tìm kiếm posts từ WordPress: ${error}` },
      { status: 500 }
    )
  }
}
