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
    console.log('🚀 WordPress fallback publish API called')
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

    console.log('🌐 Attempting fallback publish to WordPress:', {
      siteUrl,
      username,
      title: postData.title
    })

    // Thử phương pháp fallback: Sử dụng wp-admin endpoint
    try {
      const result = await publishViaAdminEndpoint(siteUrl, username, applicationPassword, postData)
      
      return NextResponse.json({
        success: true,
        message: 'Đăng bài thành công (via fallback method)',
        method: 'admin-endpoint',
        data: result
      })

    } catch (fallbackError) {
      console.error('❌ Fallback method failed:', fallbackError)
      
      // Trả về thông tin lỗi chi tiết
      return NextResponse.json({
        success: false,
        error: 'Không thể đăng bài lên WordPress',
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

  } catch (error) {
    console.error('WordPress fallback publish error:', error)
    return NextResponse.json(
      { error: `Lỗi khi đăng bài lên WordPress: ${error}` },
      { status: 500 }
    )
  }
}

// Fallback method: Sử dụng wp-admin endpoint (cải thiện)
async function publishViaAdminEndpoint(siteUrl: string, username: string, password: string, postData: any) {
  try {
    console.log('🔄 Fallback: Attempting to publish via wp-admin...')
    
    // Tạo session và đăng nhập vào wp-admin
    const loginUrl = `${siteUrl.replace(/\/$/, '')}/wp-login.php`
    
    // Tạo form data cho login
    const loginFormData = new URLSearchParams()
    loginFormData.append('log', username)
    loginFormData.append('pwd', password)
    loginFormData.append('wp-submit', 'Log In')
    loginFormData.append('redirect_to', `${siteUrl.replace(/\/$/, '')}/wp-admin/`)
    loginFormData.append('testcookie', '1')

    // Thực hiện login với timeout
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: loginFormData,
      redirect: 'manual',
      signal: AbortSignal.timeout(30000) // 30 giây timeout
    })

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`)
    }

    // Lấy cookies từ login response
    const cookies = loginResponse.headers.get('set-cookie')
    if (!cookies) {
      throw new Error('No cookies received from login - WordPress may have security restrictions')
    }

    console.log('✅ Login successful, cookies received')

    // Tạo post data cho wp-admin
    const postFormData = new URLSearchParams()
    postFormData.append('post_title', postData.title)
    postFormData.append('content', postData.content)
    postFormData.append('post_status', postData.status === 'published' ? 'publish' : 'draft')
    postFormData.append('action', 'post')
    postFormData.append('post_type', 'post')
    postFormData.append('_wpnonce', '') // WordPress sẽ tự động tạo nonce
    postFormData.append('_wp_http_referer', `${siteUrl.replace(/\/$/, '')}/wp-admin/post-new.php`)
    
    if (postData.excerpt) {
      postFormData.append('excerpt', postData.excerpt)
    }

    // Gửi request tạo post với timeout
    const postUrl = `${siteUrl.replace(/\/$/, '')}/wp-admin/post.php`
    const postResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': `${siteUrl.replace(/\/$/, '')}/wp-admin/post-new.php`
      },
      body: postFormData,
      redirect: 'manual',
      signal: AbortSignal.timeout(45000) // 45 giây timeout cho việc tạo post
    })

    if (!postResponse.ok) {
      throw new Error(`Post creation failed: ${postResponse.status} ${postResponse.statusText}`)
    }

    // Parse response để lấy post ID
    const responseText = await postResponse.text()
    console.log('📝 Post response received, length:', responseText.length)
    
    // Cải thiện regex để tìm post ID
    const postIdMatch = responseText.match(/post=(\d+)/) || 
                        responseText.match(/wp-admin\/post\.php\?post=(\d+)/) ||
                        responseText.match(/post_id=(\d+)/)
    
    if (postIdMatch) {
      const postId = postIdMatch[1]
      console.log('✅ Post created successfully, ID:', postId)
      
      return {
        id: postId,
        title: postData.title,
        status: postData.status === 'published' ? 'publish' : 'draft',
        url: `${siteUrl.replace(/\/$/, '')}/wp-admin/post.php?post=${postId}&action=edit`,
        method: 'wp-admin-fallback'
      }
    } else {
      // Kiểm tra xem có phải là lỗi không
      if (responseText.includes('error') || responseText.includes('Error') || responseText.includes('ERROR')) {
        throw new Error('WordPress returned an error page during post creation')
      }
      
      // Nếu không tìm thấy post ID, có thể post đã được tạo nhưng không parse được ID
      console.log('⚠️ Post may have been created but ID not found in response')
      return {
        id: 'unknown',
        title: postData.title,
        status: postData.status === 'published' ? 'publish' : 'draft',
        url: `${siteUrl.replace(/\/$/, '')}/wp-admin/edit.php`,
        method: 'wp-admin-fallback',
        note: 'Post created but ID not confirmed'
      }
    }
    
  } catch (error) {
    console.error('❌ Fallback method error:', error)
    throw new Error(`Fallback method failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
