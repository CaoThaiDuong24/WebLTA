import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

// Lấy cấu hình Plugin
const getPluginConfig = () => {
  try {
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      return JSON.parse(configData)
    }
    return null
  } catch (error) {
    console.error('Error loading Plugin config:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Fetching posts from WordPress...')
    
    const pluginConfig = getPluginConfig()
    if (!pluginConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Plugin chưa được cấu hình' },
        { status: 400 }
      )
    }

    // Fetch posts from WordPress via plugin
    const response = await fetch(`${request.nextUrl.origin}/api/wordpress/search-posts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: 'Không thể lấy posts từ WordPress', details: error },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    // Transform WordPress posts to our format
    const transformedPosts = (result.data || []).map((post: any) => ({
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