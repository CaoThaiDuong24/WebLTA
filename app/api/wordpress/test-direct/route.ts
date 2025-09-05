import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing direct WordPress connection...')
    
    const siteUrl = 'https://wp2.ltacv.com'
    
    // Test 1: Basic site access
    console.log('📡 Test 1: Basic site access...')
    const basicResponse = await fetch(`${siteUrl}/wp-json/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Basic response status:', basicResponse.status)
    
    if (!basicResponse.ok) {
      const errorText = await basicResponse.text()
      console.error('❌ Basic access failed:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Không thể truy cập site: ${basicResponse.status}`,
        details: errorText
      })
    }

    const siteInfo = await basicResponse.json()
    console.log('✅ Site info:', {
      name: siteInfo.name,
      description: siteInfo.description,
      url: siteInfo.url
    })

    // Test 2: Check if REST API is enabled
    console.log('📡 Test 2: REST API check...')
    const namespaces = siteInfo.namespaces || []
    const hasV2 = namespaces.includes('wp/v2')
    
    if (!hasV2) {
      return NextResponse.json({
        success: false,
        error: 'REST API v2 không được enable',
        details: {
          availableNamespaces: namespaces,
          hasV2: hasV2
        }
      })
    }

    // Test 3: Try to access users endpoint without auth
    console.log('📡 Test 3: Users endpoint without auth...')
    const usersResponse = await fetch(`${siteUrl}/wp-json/wp/v2/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Users response status:', usersResponse.status)
    
    let usersResult = null
    if (usersResponse.ok) {
      const users = await usersResponse.json()
      usersResult = {
        count: Array.isArray(users) ? users.length : 'Unknown',
        status: usersResponse.status
      }
    } else {
      const errorText = await usersResponse.text()
      usersResult = {
        error: errorText,
        status: usersResponse.status
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Direct connection test completed',
      siteInfo: {
        name: siteInfo.name,
        description: siteInfo.description,
        url: siteInfo.url,
        namespaces: namespaces,
        hasV2: hasV2
      },
      usersEndpoint: usersResult,
      recommendations: [
        'Site có thể truy cập được',
        'REST API v2 đã được enable',
        'Cần kiểm tra Application Password'
      ]
    })

  } catch (error) {
    console.error('❌ Error testing direct connection:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Lỗi khi test kết nối trực tiếp: ${error}` 
      },
      { status: 500 }
    )
  }
} 