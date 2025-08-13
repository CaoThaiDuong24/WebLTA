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
    console.log('🧪 Testing direct WordPress connection...')
    
    // Lấy cấu hình WordPress
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig?.isConnected) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình hoặc chưa kết nối' },
        { status: 400 }
      )
    }

    const { siteUrl, username, applicationPassword } = wordpressConfig
    
    console.log('🌐 Testing connection to:', siteUrl)
    console.log('👤 Username:', username)

    // Tạo Basic Auth header
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    // Test connection bằng cách gọi API users/me
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response statusText:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Connection failed:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Kết nối thất bại: ${response.status} ${response.statusText}`,
        details: errorText
      })
    }

    const userData = await response.json()
    console.log('✅ Connection successful:', {
      id: userData.id,
      name: userData.name,
      email: userData.email
    })

    return NextResponse.json({
      success: true,
      message: 'Kết nối WordPress thành công',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email
      }
    })

  } catch (error) {
    console.error('❌ Error testing connection:', error)
    return NextResponse.json(
      { error: `Lỗi khi test kết nối: ${error}` },
      { status: 500 }
    )
  }
} 