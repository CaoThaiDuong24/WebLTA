import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { decryptSensitiveData } from '@/lib/security'
import fs from 'fs'
import path from 'path'

const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

// Cache decrypted API key để tăng tốc
let cachedApiKey: string | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 phút

const getPluginConfig = () => {
  try {
    const now = Date.now()
    
    // Return cached API key nếu còn hạn
    if (cachedApiKey && (now - cacheTimestamp) < CACHE_DURATION) {
      return { apiKey: cachedApiKey }
    }
    
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt API key if needed và cache
      if (config.apiKey && config.apiKey.startsWith('ENCRYPTED:')) {
        cachedApiKey = decryptSensitiveData(config.apiKey.replace('ENCRYPTED:', ''))
        cacheTimestamp = now
        return { apiKey: cachedApiKey }
      } else if (config.apiKey) {
        cachedApiKey = config.apiKey
        cacheTimestamp = now
        return { apiKey: cachedApiKey }
      }
      
      return config
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
        { error: 'Plugin chưa được cấu hình API key. Vui lòng cập nhật API key trong WordPress Admin → LTA News Sync' },
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

    // Debug: Log thông tin request
    console.log('🔍 Debug info:', {
      ajaxUrl,
      siteUrl,
      apiKeyLength: apiKey?.length || 0,
      payloadKeys: Object.keys(payload),
      titleLength: postData.title?.length || 0,
      contentLength: postData.content?.length || 0
    })

    // Tối ưu: Tăng timeout và chỉ retry 1 lần để tránh duplicate
    let response: Response
    let lastError: any = null
    
    for (let attempt = 1; attempt <= 1; attempt++) {
      try {
        console.log(`🚀 Publishing to WordPress (attempt ${attempt}/1)...`)
        
        response = await fetch(ajaxUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          // Tăng timeout lên 60 giây để tránh timeout
          signal: AbortSignal.timeout(60000)
        })
        
        console.log(`✅ Response status: ${response.status}`)
        
        // Nếu thành công, thoát khỏi loop ngay
        if (response.ok) {
          break
        }
        
      } catch (error) {
        lastError = error
        console.log(`❌ Attempt ${attempt} failed:`, error.message)
      }
    }
    
    // Nếu tất cả attempts đều thất bại
    if (!response) {
      return NextResponse.json(
        { 
          error: 'Không thể kết nối đến WordPress plugin',
          details: lastError?.message || 'Unknown error'
        },
        { status: 502 }
      )
    }

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
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'API key không đúng. Vui lòng cập nhật API key trong WordPress Admin → LTA News Sync',
            details: json 
          },
          { status: 401 }
        )
      }
      
      // Xử lý lỗi trùng lặp title
      if (json?.error && json.error.includes('title already exists')) {
        return NextResponse.json(
          { 
            error: 'Tiêu đề đã tồn tại trong WordPress',
            details: json,
            suggestion: 'Vui lòng thay đổi tiêu đề hoặc slug và thử lại.',
            code: 'DUPLICATE_TITLE'
          },
          { status: 409 }
        )
      }
      
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


