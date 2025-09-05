import { NextRequest, NextResponse } from 'next/server'
import { saveWordPressConfig } from '@/lib/wordpress-config'

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

    // Cập nhật cấu hình và lưu (được mã hóa trong helper)
    const updatedConfig = {
      siteUrl: body.siteUrl,
      username: body.username,
      applicationPassword: body.applicationPassword,
      db: {
        host: body.dbHost || body.host,
        user: body.dbUser || body.user,
        password: body.dbPassword || body.password,
        database: body.dbName || body.database,
        port: body.dbPort || body.port || 3306,
        tablePrefix: body.tablePrefix || body.wpTablePrefix || 'wp_'
      },
      autoPublish: body.autoPublish !== undefined ? body.autoPublish : true,
      defaultCategory: body.defaultCategory || '',
      defaultTags: body.defaultTags || [],
      featuredImageEnabled: body.featuredImageEnabled !== undefined ? body.featuredImageEnabled : true,
      excerptLength: body.excerptLength || 150,
      status: body.status || 'draft',
      isConnected: true,
      lastUpdated: new Date().toISOString()
    }

    saveWordPressConfig(updatedConfig as any)

    console.log('✅ WordPress config saved successfully')
    console.log('🔄 Auto-sync status:', updatedConfig.autoPublish ? 'ENABLED' : 'DISABLED')

    return NextResponse.json({
      success: true,
      message: 'Cấu hình WordPress đã được lưu thành công',
      data: {
        ...updatedConfig,
        applicationPassword: '***HIDDEN***', // Ẩn mật khẩu trong response
        db: {
          ...updatedConfig.db,
          password: '***HIDDEN***'
        }
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