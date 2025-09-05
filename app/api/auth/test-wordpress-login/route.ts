import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')

// Lấy cấu hình WordPress
function getWordPressConfig() {
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
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email và password là bắt buộc'
      }, { status: 400 })
    }

    const config = getWordPressConfig()
    if (!config || !config.isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Chưa kết nối với WordPress'
      }, { status: 400 })
    }

    console.log('🔍 Testing WordPress login for:', email)

    // Tạo Basic Auth header cho admin WordPress
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    
    // Tìm user trong WordPress
    const response = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText)
      return NextResponse.json({
        success: false,
        error: 'Không thể kết nối đến WordPress API'
      }, { status: 500 })
    }

    const users = await response.json()
    
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Không tìm thấy user với email này'
      }, { status: 404 })
    }

    const user = users[0]
    console.log('✅ Found user:', user.name, user.email)

    // Test đăng nhập bằng cách gọi wp-login.php
    const loginResponse = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        log: email,
        pwd: password,
        'wp-submit': 'Log In',
        redirect_to: `${config.siteUrl}/wp-admin/`,
        testcookie: '1'
      })
    })

    const responseText = await loginResponse.text()
    console.log('📥 Login response status:', loginResponse.status)
    console.log('📥 Response includes wp-admin:', responseText.includes('wp-admin'))
    console.log('📥 Response includes error:', responseText.includes('error'))

    // Kiểm tra kết quả đăng nhập
    if (loginResponse.ok && responseText.includes('wp-admin') && !responseText.includes('error')) {
      return NextResponse.json({
        success: true,
        message: 'Đăng nhập thành công',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.roles?.[0] || 'subscriber'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Email hoặc mật khẩu không đúng'
      }, { status: 401 })
    }

  } catch (error) {
    console.error('Error testing WordPress login:', error)
    return NextResponse.json({
      success: false,
      error: 'Lỗi server'
    }, { status: 500 })
  }
} 