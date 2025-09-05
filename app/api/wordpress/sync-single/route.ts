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
    console.log('🚀 WordPress sync-single API called')
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    // Lấy WordPress config
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

    // Lấy dữ liệu tin tức
    const newsData = body
    
    if (!newsData.title || !newsData.content) {
      return NextResponse.json(
        { error: 'Thiếu tiêu đề hoặc nội dung tin tức' },
        { status: 400 }
      )
    }

    console.log('🌐 Syncing to WordPress:', {
      siteUrl,
      username,
      title: newsData.title,
      status: newsData.status
    })

    // Tạo Basic Auth header
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    // Chuẩn bị dữ liệu bài viết
    const postPayload: any = {
      title: newsData.title,
      content: newsData.content,
      status: newsData.status === 'published' ? 'publish' : 'draft'
    }

    // Thêm excerpt nếu có
    if (newsData.excerpt) {
      postPayload.excerpt = newsData.excerpt
    }

    // Thêm categories nếu có
    if (newsData.category) {
      postPayload.categories = [newsData.category]
    }

    // Thêm tags nếu có
    if (newsData.tags && Array.isArray(newsData.tags)) {
      postPayload.tags = newsData.tags
    }

    // Thêm featured image nếu có
    if (newsData.featuredImage) {
      const featuredMediaId = parseInt(newsData.featuredImage.toString())
      if (!isNaN(featuredMediaId)) {
        postPayload.featured_media = featuredMediaId
      }
    }

    console.log('📤 Post payload:', JSON.stringify(postPayload, null, 2))

    try {
      // Thử publish qua REST API
      const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postPayload),
      })

      console.log('📥 WordPress response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ WordPress API error:', errorText)
        
        // Nếu REST API bị hạn chế, thử fallback method
        if (response.status === 401 || response.status === 403) {
          console.log('🔄 REST API bị hạn chế, thử fallback method...')
          
          try {
            const fallbackResponse = await fetch('/api/wordpress/publish-post-fallback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newsData),
            })
            
            const fallbackResult = await fallbackResponse.json()
            
            if (fallbackResult.success) {
              // Cập nhật trạng thái sync trong local
              await updateNewsSyncStatus(newsData.id, true, fallbackResult.data.id)
              
              return NextResponse.json({
                success: true,
                message: 'Đồng bộ thành công (via fallback method)',
                method: 'fallback',
                data: fallbackResult.data
              })
            } else {
              return NextResponse.json({
                success: false,
                error: 'Không thể đồng bộ tin tức',
                details: {
                  reason: 'REST API bị hạn chế bởi hosting provider',
                  solution: 'Liên hệ hosting provider để enable REST API hoặc upgrade plan',
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
              error: 'Không thể đồng bộ tin tức',
              details: {
                reason: 'REST API bị hạn chế bởi hosting provider',
                solution: 'Liên hệ hosting provider để enable REST API hoặc upgrade plan',
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

      // Cập nhật trạng thái sync trong local
      await updateNewsSyncStatus(newsData.id, true, result.id)

      return NextResponse.json({
        success: true,
        message: 'Đồng bộ thành công',
        method: 'rest-api',
        data: {
          id: result.id,
          title: result.title?.rendered || newsData.title,
          link: result.link,
          status: result.status,
          date: result.date,
          slug: result.slug
        }
      })

    } catch (wordpressError) {
      console.error('❌ WordPress sync failed:', wordpressError)
      return NextResponse.json(
        { error: `WordPress connection failed: ${wordpressError instanceof Error ? wordpressError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('WordPress sync-single error:', error)
    return NextResponse.json(
      { error: `Lỗi khi đồng bộ tin tức: ${error}` },
      { status: 500 }
    )
  }
}

// Cập nhật trạng thái sync trong local news
async function updateNewsSyncStatus(newsId: string, synced: boolean, wordpressId?: number) {
  try {
    const response = await fetch(`/api/news/${newsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        syncedToWordPress: synced,
        wordpressId: wordpressId,
        lastSyncDate: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      console.error(`Failed to update sync status for news ${newsId}`)
    }
  } catch (error) {
    console.error(`Error updating sync status for news ${newsId}:`, error)
  }
}
