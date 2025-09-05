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

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Syncing users from WordPress...')
    
    const config = getWordPressConfig()
    if (!config || !config.isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Chưa kết nối với WordPress'
      }, { status: 400 })
    }

    // Tạo Basic Auth header cho admin WordPress
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    
    // Lấy tất cả users từ WordPress
    const response = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users?per_page=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('❌ WordPress API error:', response.status, response.statusText)
      return NextResponse.json({
        success: false,
        error: 'Không thể kết nối đến WordPress API'
      }, { status: 500 })
    }

    const users = await response.json()
    console.log('✅ Found', users.length, 'users in WordPress')

    // Transform users data
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      username: user.slug,
      name: user.name,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.roles?.[0] || 'subscriber',
      status: 'active', // WordPress không có trạng thái inactive mặc định
      avatar: user.avatar_urls?.['96'] || '',
      lastLogin: user.last_login || '',
      joinDate: user.registered_date || user.date || '',
      loginCount: 0 // WordPress không track login count mặc định
    }))

    return NextResponse.json({
      success: true,
      message: `Đã đồng bộ ${transformedUsers.length} tài khoản từ WordPress`,
      users: transformedUsers,
      total: transformedUsers.length
    })

  } catch (error) {
    console.error('❌ Error syncing WordPress users:', error)
    return NextResponse.json({
      success: false,
      error: 'Lỗi server'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Syncing specific user from WordPress...')
    
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email là bắt buộc'
      }, { status: 400 })
    }

    const config = getWordPressConfig()
    if (!config || !config.isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Chưa kết nối với WordPress'
      }, { status: 400 })
    }

    // Tạo Basic Auth header cho admin WordPress
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    
    // Tìm user cụ thể trong WordPress
    const response = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('❌ WordPress API error:', response.status, response.statusText)
      return NextResponse.json({
        success: false,
        error: 'Không thể kết nối đến WordPress API'
      }, { status: 500 })
    }

    const users = await response.json()
    
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Không tìm thấy user với email này trong WordPress'
      }, { status: 404 })
    }

    const user = users[0]
    console.log('✅ Found user:', user.name, user.email)

    // Transform user data
    const transformedUser = {
      id: user.id,
      username: user.slug,
      name: user.name,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.roles?.[0] || 'subscriber',
      status: 'active',
      avatar: user.avatar_urls?.['96'] || '',
      lastLogin: user.last_login || '',
      joinDate: user.registered_date || user.date || '',
      loginCount: 0
    }

    return NextResponse.json({
      success: true,
      message: 'Đã đồng bộ tài khoản từ WordPress',
      user: transformedUser
    })

  } catch (error) {
    console.error('❌ Error syncing specific WordPress user:', error)
    return NextResponse.json({
      success: false,
      error: 'Lỗi server'
    }, { status: 500 })
  }
} 