import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getWordPressConfig, saveWordPressConfig } from '@/lib/wordpress-config'

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
        isConnected: false,
        db: {
          host: '',
          user: '',
          password: '',
          database: '',
          port: 3306,
          tablePrefix: 'wp_'
        }
      }
      
      console.log('⚠️ No config found, returning empty config')
      return NextResponse.json(emptyConfig)
    }

    console.log('✅ WordPress config found:', {
      siteUrl: wordpressConfig.siteUrl,
      username: wordpressConfig.username,
      isConnected: wordpressConfig.isConnected,
      hasDb: !!wordpressConfig.db
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
      isConnected: true,
      db: body.db || {
        host: body.dbHost || '',
        user: body.dbUser || '',
        password: body.dbPassword || '',
        database: body.dbName || '',
        port: body.dbPort || 3306,
        tablePrefix: body.tablePrefix || 'wp_'
      }
    }
    
    // Lưu vào file (sử dụng helper để mã hóa)
    saveWordPressConfig(testConfig)
    
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