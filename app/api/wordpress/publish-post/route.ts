import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')

// Lấy cấu hình WordPress
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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 WordPress publish API called')
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    // Lấy WordPress config từ file
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình' },
        { status: 400 }
      )
    }

    const { siteUrl, username, applicationPassword } = wordpressConfig
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình WordPress' },
        { status: 400 }
      )
    }

    // Lấy dữ liệu bài viết
    const postData = body
    
    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'Thiếu tiêu đề hoặc nội dung bài viết' },
        { status: 400 }
      )
    }

    console.log('🌐 Publishing to WordPress:', {
      siteUrl,
      username,
      title: postData.title,
      originalStatus: postData.status,
      mappedStatus: postData.status === 'published' ? 'publish' : 'draft'
    })

    // Tạo Basic Auth header
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    // Chuẩn bị dữ liệu bài viết
    const postPayload: any = {
      title: postData.title,
      content: postData.content,
      status: postData.status === 'published' ? 'publish' : 'draft'
    }

    // Thêm excerpt nếu có
    if (postData.excerpt) {
      postPayload.excerpt = postData.excerpt
    }

    // Thêm categories nếu có
    if (postData.categories && postData.categories.length > 0) {
      postPayload.categories = postData.categories
    }

    // Thêm tags nếu có
    if (postData.tags && postData.tags.length > 0) {
      postPayload.tags = postData.tags
    }

    // Thêm meta fields nếu có
    if (postData.meta) {
      postPayload.meta = postData.meta
    }

    // Thêm featured image nếu có
    if (postData.featuredImage) {
      console.log('🖼️ Adding featured image:', postData.featuredImage)
      // Chuyển đổi thành số nếu là string
      const featuredMediaId = parseInt(postData.featuredImage.toString())
      if (!isNaN(featuredMediaId)) {
        postPayload.featured_media = featuredMediaId
      } else {
        console.log('⚠️ Invalid featured_media ID, skipping:', postData.featuredImage)
      }
    }

    console.log('📤 Post payload:', JSON.stringify(postPayload, null, 2))
    console.log('🔗 WordPress URL:', `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`)
    console.log('🔐 Authorization header:', `Basic ${credentials.substring(0, 20)}...`)

    try {
      // Gửi request thực sự đến WordPress
      const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postPayload),
      })

      console.log('📥 WordPress response status:', response.status)
      console.log('📥 WordPress response statusText:', response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ WordPress error response:', errorText)
        
        // Kiểm tra nếu là lỗi REST API bị hạn chế
        if (response.status === 401 || response.status === 403) {
          console.log('🔄 REST API bị hạn chế, thử fallback method...')
          
          // Thử fallback method
          try {
            const fallbackResponse = await fetch('/api/wordpress/publish-post-fallback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(postData),
            })
            
            const fallbackResult = await fallbackResponse.json()
            
            if (fallbackResult.success) {
              return NextResponse.json({
                success: true,
                message: 'Đăng bài thành công (via fallback method)',
                method: 'fallback',
                data: fallbackResult.data
              })
            } else {
              return NextResponse.json({
                success: false,
                error: 'Không thể đăng bài lên WordPress',
                details: {
                  reason: 'REST API bị hạn chế bởi hosting provider',
                  solution: 'Liên hệ hosting provider để enable REST API hoặc upgrade plan',
                  originalError: errorText,
                  fallbackError: fallbackResult.error
                },
                recommendations: [
                  '1. Liên hệ hosting provider (apisupport@xecurify.com)',
                  '2. Yêu cầu enable REST API',
                  '3. Upgrade lên paid plan nếu cần',
                  '4. Sử dụng WordPress Admin thủ công trong khi chờ fix'
                ]
              }, { status: 503 })
            }
          } catch (fallbackError) {
            console.error('❌ Fallback method also failed:', fallbackError)
            return NextResponse.json({
              success: false,
              error: 'Không thể đăng bài lên WordPress',
              details: {
                reason: 'REST API bị hạn chế bởi hosting provider',
                solution: 'Liên hệ hosting provider để enable REST API hoặc upgrade plan',
                originalError: errorText,
                fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
              },
              recommendations: [
                '1. Liên hệ hosting provider (apisupport@xecurify.com)',
                '2. Yêu cầu enable REST API',
                '3. Upgrade lên paid plan nếu cần',
                '4. Sử dụng WordPress Admin thủ công trong khi chờ fix'
              ]
            }, { status: 503 })
          }
        }
        
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ WordPress success response:', JSON.stringify(result, null, 2))

      return NextResponse.json({
        success: true,
        message: 'Đăng bài thành công',
        data: {
          id: result.id,
          title: result.title?.rendered || postData.title,
          link: result.link,
          status: result.status,
          date: result.date,
          slug: result.slug
        }
      })

    } catch (wordpressError) {
      console.error('❌ WordPress publish failed:', wordpressError)
      return NextResponse.json(
        { error: `WordPress connection failed: ${wordpressError instanceof Error ? wordpressError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('WordPress publish error:', error)
    return NextResponse.json(
      { error: `Lỗi khi đăng bài lên WordPress: ${error}` },
      { status: 500 }
    )
  }
} 