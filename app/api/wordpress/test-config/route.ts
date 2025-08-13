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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting WordPress config...')
    
    const wordpressConfig = getWordPressConfig()
    
    if (!wordpressConfig) {
      // Trả về config trống thay vì mock
      const emptyConfig = {
        siteUrl: "",
        username: "",
        applicationPassword: "",
        isConnected: false
      }
      
      console.log('⚠️ No config found, returning empty config')
      return NextResponse.json(emptyConfig)
    }

    console.log('✅ WordPress config found:', {
      siteUrl: wordpressConfig.siteUrl,
      username: wordpressConfig.username,
      isConnected: wordpressConfig.isConnected
    })

    return NextResponse.json(wordpressConfig)

  } catch (error) {
    console.error('❌ Error getting WordPress config:', error)
    return NextResponse.json(
      { error: 'Error getting WordPress config' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Tạo cấu hình test
    const testConfig = {
      siteUrl: body.siteUrl || 'https://wp2.ltacv.com',
      username: body.username || 'admin',
      applicationPassword: body.applicationPassword || 'test-password',
      isConnected: true
    }
    
    // Lưu vào file
    const dataDir = path.dirname(WORDPRESS_CONFIG_FILE_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(WORDPRESS_CONFIG_FILE_PATH, JSON.stringify(testConfig, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Đã tạo cấu hình test WordPress',
      config: {
        siteUrl: testConfig.siteUrl,
        username: testConfig.username,
        isConnected: testConfig.isConnected
      }
    })
  } catch (error) {
    console.error('Error creating test config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo cấu hình test' },
      { status: 500 }
    )
  }
} 