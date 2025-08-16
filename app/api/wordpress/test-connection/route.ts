import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')

// Lấy cấu hình WordPress từ file
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

// Chạy các bài kiểm tra kết nối
async function performTests(siteUrl: string, username: string, applicationPassword: string) {
  if (!siteUrl || !username || !applicationPassword) {
    return NextResponse.json({
      success: false,
      error: 'Cấu hình WordPress không đầy đủ',
      details: {
        hasSiteUrl: !!siteUrl,
        hasUsername: !!username,
        hasPassword: !!applicationPassword
      }
    }, { status: 400 })
  }

  const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
  const baseUrl = siteUrl.replace(/\/$/, '')
  console.log('🔗 Testing connection to:', baseUrl)

  // Test 1: Check site accessibility
  try {
    const siteResponse = await fetch(baseUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    })
    if (!siteResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Không thể truy cập website WordPress',
        details: {
          status: siteResponse.status,
          statusText: siteResponse.statusText,
          url: baseUrl
        }
      }, { status: 503 })
    }
  } catch (error) {
    console.error('❌ Site accessibility test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Không thể kết nối đến website WordPress',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: baseUrl
      }
    }, { status: 503 })
  }

  // Test 2: Check REST API
  try {
    const apiUrl = `${baseUrl}/wp-json/wp/v2/posts?per_page=1`
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000)
    })

    if (apiResponse.status === 401) {
      return NextResponse.json({
        success: false,
        error: 'Sai thông tin đăng nhập WordPress',
        details: { status: 401, message: 'Vui lòng kiểm tra username và application password' }
      }, { status: 401 })
    }
    if (apiResponse.status === 403) {
      return NextResponse.json({
        success: false,
        error: 'REST API bị chặn bởi hosting provider',
        details: { status: 403, message: 'Vui lòng liên hệ nhà cung cấp hosting để mở REST API' }
      }, { status: 403 })
    }
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      return NextResponse.json({
        success: false,
        error: 'REST API không hoạt động',
        details: { status: apiResponse.status, statusText: apiResponse.statusText, error: errorText }
      }, { status: apiResponse.status })
    }
    await apiResponse.json()
  } catch (error) {
    console.error('❌ REST API test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Lỗi khi test REST API',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }, { status: 500 })
  }

  // Test 3: Get user info
  try {
    const userUrl = `${baseUrl}/wp-json/wp/v2/users/me`
    const userResponse = await fetch(userUrl, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    })
    if (userResponse.ok) {
      const userData = await userResponse.json()
      return NextResponse.json({
        success: true,
        message: 'Kết nối WordPress thành công',
        details: {
          siteUrl: baseUrl,
          user: { id: userData.id, name: userData.name, roles: userData.roles },
          restApiWorking: true,
          authenticationWorking: true
        }
      })
    }
    return NextResponse.json({
      success: false,
      error: 'Xác thực người dùng thất bại',
      details: { status: userResponse.status, statusText: userResponse.statusText }
    }, { status: userResponse.status })
  } catch (error) {
    console.error('❌ User authentication test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Lỗi khi test xác thực người dùng',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing WordPress connection (GET)...')
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig) {
      return NextResponse.json({
        success: false,
        error: 'Chưa cấu hình WordPress',
        details: { configExists: false, configPath: WORDPRESS_CONFIG_FILE_PATH }
      }, { status: 400 })
    }
    const { siteUrl, username, applicationPassword } = wordpressConfig
    return performTests(siteUrl, username, applicationPassword)
  } catch (error) {
    console.error('❌ WordPress connection test failed:', error)
    return NextResponse.json({ success: false, error: 'Lỗi khi test kết nối WordPress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing WordPress connection (POST) with provided credentials...')
    const body = await request.json().catch(() => ({}))
    const { siteUrl, username, applicationPassword } = body || {}
    // If not provided, fallback to file config
    if (!siteUrl || !username || !applicationPassword) {
      const cfg = getWordPressConfig()
      if (cfg) {
        return performTests(cfg.siteUrl, cfg.username, cfg.applicationPassword)
      }
    }
    return performTests(siteUrl, username, applicationPassword)
  } catch (error) {
    console.error('❌ WordPress connection test (POST) failed:', error)
    return NextResponse.json({ success: false, error: 'Lỗi khi test kết nối WordPress' }, { status: 500 })
  }
}