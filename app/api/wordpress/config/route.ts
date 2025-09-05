import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function GET(request: NextRequest) {
  try {
    const config = getWordPressConfig()
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'WordPress config not found'
      }, { status: 404 })
    }

    // Log để debug - ẩn thông tin nhạy cảm
    console.log('WordPress config API response:', {
      ...config,
      username: config.username ? '***' : 'empty',
      applicationPassword: config.applicationPassword ? '***' : 'empty'
    })

    return NextResponse.json({
      success: true,
      config: config
    })
  } catch (error) {
    console.error('Error loading WordPress config:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load WordPress config'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config } = body

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Config data is required'
      }, { status: 400 })
    }

    // Import saveWordPressConfig dynamically to avoid circular dependency
    const { saveWordPressConfig } = await import('@/lib/wordpress-config')
    saveWordPressConfig(config)

    return NextResponse.json({
      success: true,
      message: 'WordPress config saved successfully'
    })
  } catch (error) {
    console.error('Error saving WordPress config:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save WordPress config'
    }, { status: 500 })
  }
}
