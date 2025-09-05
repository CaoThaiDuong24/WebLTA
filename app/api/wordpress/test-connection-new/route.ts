import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing WordPress connection with different credentials...')
    const body = await request.json()
    
    const { siteUrl, username, applicationPassword } = body
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình WordPress' },
        { status: 400 }
      )
    }

    console.log('🌐 Testing connection to:', siteUrl)
    console.log('👤 Username:', username)
    console.log('🔐 Password length:', applicationPassword.length)

    // Test 1: Basic Auth với application password
    const credentials1 = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    try {
      const response1 = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials1}`,
          'Content-Type': 'application/json',
        }
      })

      console.log('📥 Response 1 status:', response1.status)
      
      if (response1.ok) {
        const userData = await response1.json()
        console.log('✅ Connection successful with application password')
        
        return NextResponse.json({
          success: true,
          method: 'application_password',
          message: 'Kết nối WordPress thành công với Application Password',
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email
          }
        })
      }
    } catch (error) {
      console.log('❌ Method 1 failed:', error)
    }

    // Test 2: Basic Auth với username:password
    const credentials2 = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    try {
      const response2 = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials2}`,
          'Content-Type': 'application/json',
        }
      })

      console.log('📥 Response 2 status:', response2.status)
      
      if (response2.ok) {
        const userData = await response2.json()
        console.log('✅ Connection successful with username:password')
        
        return NextResponse.json({
          success: true,
          method: 'username_password',
          message: 'Kết nối WordPress thành công với Username:Password',
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email
          }
        })
      }
    } catch (error) {
      console.log('❌ Method 2 failed:', error)
    }

    // Test 3: Kiểm tra site có hoạt động không
    try {
      const response3 = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/`)
      console.log('📥 Site check status:', response3.status)
      
      if (response3.ok) {
        console.log('✅ Site is accessible')
      } else {
        console.log('❌ Site is not accessible')
      }
    } catch (error) {
      console.log('❌ Site check failed:', error)
    }

    return NextResponse.json({
      success: false,
      error: 'Không thể kết nối với WordPress',
      suggestions: [
        'Kiểm tra URL WordPress có đúng không',
        'Kiểm tra Application Password có đúng không',
        'Kiểm tra WordPress site có hoạt động không',
        'Thử tạo Application Password mới trong WordPress Admin'
      ]
    })

  } catch (error) {
    console.error('❌ Error testing connection:', error)
    return NextResponse.json(
      { error: `Lỗi khi test kết nối: ${error}` },
      { status: 500 }
    )
  }
} 