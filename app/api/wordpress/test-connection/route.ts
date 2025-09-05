import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing WordPress connection...')
    
    // Lấy cấu hình WordPress từ file
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig) {
      return NextResponse.json(
        { error: 'Chưa cấu hình WordPress' },
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

    // Test basic connection to WordPress site
    const testUrl = `${siteUrl}/wp-json/wp/v2/posts?per_page=1`
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString('base64')}`
        },
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        console.log('✅ WordPress connection test successful')
        return NextResponse.json({
          success: true,
          message: 'Kết nối WordPress thành công',
          siteUrl: siteUrl
        })
      } else {
        console.log('❌ WordPress connection test failed:', response.status, response.statusText)
        
        // Try to get error details
        let errorDetails = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorText = await response.text()
          if (errorText && errorText.length < 500) { // Limit error text length
            errorDetails = errorText
          }
        } catch (e) {
          // Ignore error reading response text
        }
        
        return NextResponse.json(
          { 
            error: 'Không thể kết nối đến WordPress',
            details: errorDetails,
            siteUrl: siteUrl
          },
          { status: 503 }
        )
      }
    } catch (fetchError) {
      console.error('❌ WordPress connection error:', fetchError)
      return NextResponse.json(
        { 
          error: 'Lỗi kết nối đến WordPress',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          siteUrl: siteUrl
        },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('❌ Error testing WordPress connection:', error)
    return NextResponse.json(
      { 
        error: 'Lỗi khi test kết nối WordPress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}