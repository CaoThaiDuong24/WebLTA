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
    console.log('🔧 Fixing UNAUTHORIZED issue...')
    
    const body = await request.json()
    const { siteUrl, username, applicationPassword } = body
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json({
        success: false,
        error: 'Thiếu thông tin cấu hình WordPress'
      }, { status: 400 })
    }

    console.log('🌐 Fixing permissions for:', siteUrl)
    console.log('👤 Username:', username)

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    // Test 1: Check if REST API is accessible without auth
    console.log('📡 Test 1: REST API accessibility...')
    const basicResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Basic response status:', basicResponse.status)
    
    if (!basicResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `REST API không accessible: ${basicResponse.status}`,
        details: await basicResponse.text(),
        solutions: [
          'Kiểm tra WordPress có được cài đặt đúng không',
          'Kiểm tra REST API có được enable không',
          'Tắt các plugin có thể block REST API'
        ]
      })
    }

    // Test 2: Try different authentication methods
    console.log('📡 Test 2: Authentication methods...')
    
    // Method 1: Basic Auth with current credentials
    const auth1Response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Auth method 1 status:', auth1Response.status)
    
    if (auth1Response.ok) {
      const userData = await auth1Response.json()
      console.log('✅ Authentication successful:', {
        id: userData.id,
        name: userData.name,
        roles: userData.roles
      })
      
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          roles: userData.roles
        },
        recommendations: [
          'Authentication working correctly',
          'Check user permissions for creating users',
          'Ensure user has administrator or editor role'
        ]
      })
    }

    // Method 2: Try with different header format
    console.log('📡 Test 3: Alternative header format...')
    const auth2Response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Bearer ${applicationPassword}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Auth method 2 status:', auth2Response.status)

    // Method 3: Try with username in header
    console.log('📡 Test 4: Username in header...')
    const auth3Response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString('base64')}`,
        'X-WP-Username': username,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Auth method 3 status:', auth3Response.status)

    // If all methods fail, provide detailed error analysis
    const errorText1 = await auth1Response.text()
    const errorText2 = await auth2Response.text()
    const errorText3 = await auth3Response.text()

    console.error('❌ All authentication methods failed')
    console.error('Method 1 error:', errorText1)
    console.error('Method 2 error:', errorText2)
    console.error('Method 3 error:', errorText3)

    return NextResponse.json({
      success: false,
      error: 'Tất cả phương thức xác thực đều thất bại',
      details: {
        method1: { status: auth1Response.status, error: errorText1 },
        method2: { status: auth2Response.status, error: errorText2 },
        method3: { status: auth3Response.status, error: errorText3 }
      },
      solutions: [
        '1. Tạo Application Password mới trong WordPress Admin:',
        '   - Vào WordPress Admin → Users → Profile',
        '   - Cuộn xuống "Application Passwords"',
        '   - Tạo password mới với quyền đầy đủ',
        '',
        '2. Kiểm tra user permissions:',
        '   - User phải có role Administrator hoặc Editor',
        '   - User phải có quyền tạo user khác',
        '',
        '3. Kiểm tra WordPress settings:',
        '   - Đảm bảo REST API được enable',
        '   - Tắt các plugin có thể block REST API',
        '   - Kiểm tra .htaccess không block REST API',
        '',
        '4. Test với curl command:',
        `   curl -X GET "${siteUrl}/wp-json/wp/v2/users/me" \\`,
        `   -H "Authorization: Basic ${credentials}" \\`,
        `   -H "Content-Type: application/json"`
      ]
    })

  } catch (error) {
    console.error('❌ Error fixing UNAUTHORIZED:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Lỗi khi fix UNAUTHORIZED: ${error}` 
      },
      { status: 500 }
    )
  }
}
