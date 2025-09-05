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
    console.log('🔍 Creating new WordPress user...')
    
    // Get request body
    const body = await request.json()
    const { username, email, password, firstName, lastName, role = 'subscriber' } = body
    
    console.log('📝 Received data:', { username, email, role, firstName, lastName })
    
    // Validate required fields
    if (!username || !email || !password) {
      console.error('❌ Missing required fields:', { username: !!username, email: !!email, password: !!password })
      return NextResponse.json({
        success: false,
        error: 'Username, email và password là bắt buộc'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email)
      return NextResponse.json({
        success: false,
        error: 'Email không hợp lệ'
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      console.error('❌ Password too short:', password.length)
      return NextResponse.json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự'
      }, { status: 400 })
    }

    // Get WordPress configuration
    const config = getWordPressConfig()
    if (!config || !config.isConnected) {
      console.error('❌ WordPress config not found or not connected')
      return NextResponse.json(
        { 
          success: false,
          error: 'Chưa kết nối với WordPress. Vui lòng cấu hình kết nối trước.' 
        },
        { status: 400 }
      )
    }

    console.log('🌐 Creating user in WordPress:', config.siteUrl)
    console.log('📝 User data:', { username, email, role, firstName, lastName })

    // Create Basic Auth header
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    
    // Prepare user data with proper WordPress format
    const userData = {
      username: username,
      email: email,
      password: password,
      first_name: firstName || '',
      last_name: lastName || '',
      roles: [role]
    }

    console.log('📤 Sending user data to WordPress...')
    console.log('📤 User data:', JSON.stringify(userData, null, 2))

    // Create user via WordPress REST API
    const response = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response statusText:', response.statusText)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = await response.text()
      }
      
      console.error('❌ Failed to create user:', errorData)
      
      let errorMessage = 'Không thể tạo người dùng'
      if (errorData.code === 'existing_user_login') {
        errorMessage = 'Tên đăng nhập đã tồn tại'
      } else if (errorData.code === 'existing_user_email') {
        errorMessage = 'Email đã tồn tại'
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorData
      }, { status: response.status })
    }

    let newUser
    try {
      newUser = await response.json()
    } catch (e) {
      console.error('❌ Failed to parse response:', e)
      return NextResponse.json({
        success: false,
        error: 'Không thể parse response từ WordPress'
      }, { status: 500 })
    }

    console.log('✅ User created successfully:', {
      id: newUser.id,
      username: newUser.slug,
      email: newUser.email,
      roles: newUser.roles
    })

    // Verify user was created by fetching user details
    try {
      const verifyResponse = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/${newUser.id}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        }
      })

      if (verifyResponse.ok) {
        const userDetails = await verifyResponse.json()
        console.log('✅ User verification successful:', {
          id: userDetails.id,
          username: userDetails.slug,
          email: userDetails.email,
          roles: userDetails.roles
        })
      } else {
        console.warn('⚠️ User verification failed:', verifyResponse.status)
      }
    } catch (verifyError) {
      console.warn('⚠️ User verification failed:', verifyError)
    }

    return NextResponse.json({
      success: true,
      message: `Tạo người dùng thành công! Người dùng có thể đăng nhập tại: ${config.siteUrl}/wp-admin`,
      user: {
        id: newUser.id,
        username: newUser.slug,
        name: newUser.name,
        email: newUser.email,
        firstName: newUser.first_name || '',
        lastName: newUser.last_name || '',
        role: newUser.roles?.[0] || role,
        status: 'active',
        avatar: newUser.avatar_urls?.['96'] || '/placeholder-user.jpg',
        lastLogin: 'Chưa đăng nhập',
        joinDate: new Date().toLocaleDateString('vi-VN'),
        loginCount: 0,
        adminUrl: `${config.siteUrl}/wp-admin`
      }
    })

  } catch (error) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Lỗi khi tạo người dùng: ${error}` 
      },
      { status: 500 }
    )
  }
} 