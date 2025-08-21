import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')
const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

const getWordPressConfig = () => {
  try {
    if (fs.existsSync(WORDPRESS_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(WORDPRESS_CONFIG_FILE_PATH, 'utf8')
      return JSON.parse(configData)
    }
    return null
  } catch (error) {
    console.error('Error loading WordPress config:', error)
    return null
  }
}

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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Publish via WP Plugin API called')
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    const wordpressConfig = getWordPressConfig()
    const pluginConfig = getPluginConfig()

    if (!wordpressConfig || !wordpressConfig.siteUrl) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình' },
        { status: 400 }
      )
    }

    if (!pluginConfig || !pluginConfig.apiKey) {
      return NextResponse.json(
        { error: 'Plugin chưa được cấu hình API key' },
        { status: 400 }
      )
    }

    const { siteUrl } = wordpressConfig
    const authorUsername = wordpressConfig.username || ''
    const { apiKey } = pluginConfig

    const postData = body

    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'Thiếu tiêu đề hoặc nội dung bài viết' },
        { status: 400 }
      )
    }

    const ajaxUrl = `${siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`

    // Map status to WP expected values inside plugin; send original status for clarity
    const payload = {
      apiKey,
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || '',
      status: postData.status || 'draft',
      category: postData.category || postData.categories || '',
      tags: postData.tags || '',
      featuredImage: postData.featuredImage || postData.image || '',
      additionalImages: postData.additionalImages || [],
      slug: postData.slug || '',
      authorUsername
    }

    console.log('🔗 Calling WP Plugin AJAX URL:', ajaxUrl)

    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let json: any = null
    try {
      json = JSON.parse(text)
    } catch (e) {
      console.error('❌ Invalid JSON from plugin:', text)
      return NextResponse.json(
        { error: 'Plugin trả về dữ liệu không hợp lệ', raw: text },
        { status: 502 }
      )
    }

    if (!response.ok || !json?.success) {
      console.error('❌ Plugin publish failed:', json)
      return NextResponse.json(
        { error: json?.error || 'Không thể đăng bài qua plugin', details: json },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng bài thành công qua plugin',
      data: json.data || { id: json.postId, link: json.link }
    })
  } catch (error) {
    console.error('Publish via plugin error:', error)
    return NextResponse.json(
      { error: `Lỗi khi đăng bài qua plugin: ${error}` },
      { status: 500 }
    )
  }
}


