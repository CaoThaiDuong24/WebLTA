import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')

// Đảm bảo thư mục data tồn tại
const ensureDataDirectory = () => {
  const dataDir = path.dirname(WORDPRESS_CONFIG_FILE_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 WordPress config save API called')
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.siteUrl || !body.username || !body.applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình bắt buộc' },
        { status: 400 }
      )
    }

    // Đọc cấu hình hiện tại nếu có
    let currentConfig = {}
    if (fs.existsSync(WORDPRESS_CONFIG_FILE_PATH)) {
      try {
        const existingData = fs.readFileSync(WORDPRESS_CONFIG_FILE_PATH, 'utf8')
        currentConfig = JSON.parse(existingData)
      } catch (error) {
        console.log('⚠️ Error reading existing config, starting fresh')
      }
    }

    // Cập nhật cấu hình
    const updatedConfig = {
      ...currentConfig,
      siteUrl: body.siteUrl,
      username: body.username,
      applicationPassword: body.applicationPassword,
      autoPublish: body.autoPublish !== undefined ? body.autoPublish : true, // Mặc định bật auto-sync
      defaultCategory: body.defaultCategory || '',
      defaultTags: body.defaultTags || [],
      featuredImageEnabled: body.featuredImageEnabled !== undefined ? body.featuredImageEnabled : true,
      excerptLength: body.excerptLength || 150,
      status: body.status || 'draft',
      isConnected: true,
      lastUpdated: new Date().toISOString()
    }

    // Lưu cấu hình
    ensureDataDirectory()
    fs.writeFileSync(WORDPRESS_CONFIG_FILE_PATH, JSON.stringify(updatedConfig, null, 2))

    console.log('✅ WordPress config saved successfully')
    console.log('🔄 Auto-sync status:', updatedConfig.autoPublish ? 'ENABLED' : 'DISABLED')

    return NextResponse.json({
      success: true,
      message: 'Cấu hình WordPress đã được lưu thành công',
      data: {
        ...updatedConfig,
        applicationPassword: '***HIDDEN***' // Ẩn mật khẩu trong response
      }
    })

  } catch (error) {
    console.error('❌ Error saving WordPress config:', error)
    return NextResponse.json(
      { error: 'Không thể lưu cấu hình WordPress' },
      { status: 500 }
    )
  }
} 