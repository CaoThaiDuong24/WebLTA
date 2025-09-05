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
    console.log('🔍 Testing WordPress authentication...')
    
    const body = await request.json()
    const { siteUrl, username, applicationPassword } = body
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json({
        success: false,
        error: 'Thiếu thông tin cấu hình WordPress'
      }, { status: 400 })
    }

    console.log('🌐 Testing connection to:', siteUrl)
    console.log('👤 Username:', username)
    console.log('🔐 Password length:', applicationPassword.length)

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    // Test 1: Basic REST API access
    console.log('📡 Test 1: Basic REST API access...')
    const basicResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Basic response status:', basicResponse.status)
    
    if (!basicResponse.ok) {
      const errorText = await basicResponse.text()
      console.error('❌ Basic access failed:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Không thể truy cập REST API: ${basicResponse.status}`,
        details: errorText
      })
    }

    // Test 2: Users endpoint access
    console.log('📡 Test 2: Users endpoint access...')
    const usersResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Users response status:', usersResponse.status)
    
    if (!usersResponse.ok) {
      const errorText = await usersResponse.text()
      console.error('❌ Users endpoint failed:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Không thể truy cập users endpoint: ${usersResponse.status}`,
        details: errorText
      })
    }

    // Test 3: Current user info
    console.log('📡 Test 3: Current user info...')
    const meResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Me response status:', meResponse.status)
    
    let userInfo = null
    if (meResponse.ok) {
      userInfo = await meResponse.json()
      console.log('✅ User info:', {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        roles: userInfo.roles
      })
    } else {
      console.warn('⚠️ Could not get user info:', meResponse.status)
    }

    // Test 4: Check if user can create other users
    console.log('📡 Test 4: Check user creation permissions...')
    const testUserData = {
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123',
      roles: ['subscriber']
    }

    const createResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    })

    console.log('📥 Create response status:', createResponse.status)
    
    let createResult = null
    if (createResponse.ok) {
      createResult = await createResponse.json()
      console.log('✅ User creation test successful:', createResult.id)
      
      // Clean up: delete the test user
      try {
        await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/${createResult.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          }
        })
        console.log('🧹 Test user cleaned up')
      } catch (cleanupError) {
        console.warn('⚠️ Could not cleanup test user:', cleanupError)
      }
    } else {
      const errorText = await createResponse.text()
      console.error('❌ User creation test failed:', errorText)
      createResult = { error: errorText, status: createResponse.status }
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication test completed',
      tests: {
        basicAccess: basicResponse.ok,
        usersEndpoint: usersResponse.ok,
        userInfo: meResponse.ok,
        userCreation: createResponse.ok
      },
      userInfo,
      createResult,
      config: {
        siteUrl,
        username,
        hasApplicationPassword: !!applicationPassword
      }
    })

  } catch (error) {
    console.error('❌ Error testing authentication:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Lỗi khi test authentication: ${error}` 
      },
      { status: 500 }
    )
  }
}
