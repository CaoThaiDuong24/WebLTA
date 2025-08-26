import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { hashWordPressPassword } from '@/lib/wp-password'
import { getWpDbPool, getWpTablePrefix } from '@/lib/wp-db'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { encryptSensitiveData, decryptSensitiveData } from '@/lib/security'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Use WordPress-compatible bcrypt hashing

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/users/create called')
  
  try {
    console.log('🔄 Creating new user...')
    const isReadOnlyFs = !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_REGION || process.env.AWS_EXECUTION_ENV)
    
    let username: string, email: string, password: string, name: string, role: string, avatarFile: any = null
    
    // Xử lý form data
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData()
      username = (formData.get('username') as string) || ''
      email = (formData.get('email') as string) || ''
      password = (formData.get('password') as string) || ''
      name = (formData.get('name') as string) || ''
      role = (formData.get('role') as string) || 'subscriber'
      avatarFile = formData.get('avatar')
    } else {
      const body = await request.json()
      username = body.username || ''
      email = body.email || ''
      password = body.password || ''
      name = body.name || ''
      role = body.role || 'subscriber'
    }
    
    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Thiếu thông tin: username, email, password là bắt buộc' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      )
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      )
    }
    
    // Sanitize username
    const validUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (validUsername !== username.toLowerCase()) {
      return NextResponse.json(
        { error: 'Username chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới' },
        { status: 400 }
      )
    }
    
    // Không dùng local users.json nữa
    
    // Kiểm tra trùng lặp trên WordPress trước
    try {
      const config = getWordPressConfig()
      if (config?.siteUrl && config?.username && config?.applicationPassword) {
        // Decrypt WordPress credentials
        const decryptedUsername = config.username.startsWith('ENCRYPTED:') 
          ? decryptSensitiveData(config.username.replace('ENCRYPTED:', ''))
          : config.username
        const decryptedPassword = config.applicationPassword.startsWith('ENCRYPTED:')
          ? decryptSensitiveData(config.applicationPassword.replace('ENCRYPTED:', ''))
          : config.applicationPassword
        
        // Check if user exists via plugin endpoint
        const checkEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/users`
        const checkResp = await fetch(checkEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${decryptedUsername}:${decryptedPassword}`).toString('base64'),
          }
        })
        
        if (checkResp.ok) {
          const existingUsers = await checkResp.json()
          const wpUsers = existingUsers.users || existingUsers || []
          
          if (wpUsers.some((u: any) => u.user_login === validUsername)) {
            return NextResponse.json({ error: 'Username đã tồn tại trên WordPress' }, { status: 409 })
          }
          if (wpUsers.some((u: any) => u.user_email === email)) {
            return NextResponse.json({ error: 'Email đã tồn tại trên WordPress' }, { status: 409 })
          }
        }
      }
    } catch (e) {
      console.log('Failed to check existing users:', e)
    }
    
    // Lưu avatar: upload trực tiếp lên WordPress Media để lấy URL (không lưu local)
    let avatarUrl = null
    let avatarMediaId: number | null = null
    if (avatarFile && avatarFile instanceof File) {
      try {
        const form = new FormData()
        form.append('file', avatarFile)
        const uploadResp = await fetch(`${request.nextUrl.origin}/api/wordpress/upload-media`, {
          method: 'POST',
          body: form
        })
        if (uploadResp.ok) {
          const uploadData = await uploadResp.json()
          if (uploadData?.success && uploadData.data) {
            avatarUrl = uploadData.data.source_url || null
            avatarMediaId = uploadData.data.id || null
          }
        } else {
          const errText = await uploadResp.text()
          console.warn('Avatar upload to WordPress failed:', errText)
        }
      } catch (e) {
        console.warn('Avatar upload error:', e)
      }
    }
    
    // Tạo thời gian theo múi giờ Việt Nam (UTC+7)
    const now = new Date()
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)) // UTC+7
    const userRegistered = vietnamTime.toISOString().slice(0, 19).replace('T', ' ')
    const createdAt = vietnamTime.toISOString()
    
    console.log('🕐 Current time (UTC):', now.toISOString())
    console.log('🕐 Vietnam time (UTC+7):', vietnamTime.toISOString())
    console.log('🕐 User registered time:', userRegistered)
    
    // Encrypt sensitive data before saving
    const encryptedPassword = encryptSensitiveData(password)
    const encryptedEmail = encryptSensitiveData(email)
    
    const newUser = {
      id: Date.now(),
      user_login: validUsername,
      user_email: `ENCRYPTED:${encryptedEmail}`,
      user_pass: `ENCRYPTED:${encryptedPassword}`, // Encrypted password
      display_name: name || username,
      user_nicename: slugify(name || username),
      role: role,
      user_registered: userRegistered,
      avatar_url: avatarUrl,
      wordpress_avatar_url: avatarUrl,
      avatar_media_id: avatarMediaId,
      is_active: true,
      created_at: createdAt,
      security_version: "2.0" // Updated security version
    }
    
    // Chỉ sử dụng plugin REST API (nhanh nhất)
    let createdIn: 'plugin' | 'file' = 'plugin'
    let wordpressUserId: number | null = null
    
    try {
      const config = getWordPressConfig()
      if (config?.siteUrl && config?.username && config?.applicationPassword) {
        // Decrypt WordPress credentials
        const decryptedUsername = config.username.startsWith('ENCRYPTED:') 
          ? decryptSensitiveData(config.username.replace('ENCRYPTED:', ''))
          : config.username
        const decryptedPassword = config.applicationPassword.startsWith('ENCRYPTED:')
          ? decryptSensitiveData(config.applicationPassword.replace('ENCRYPTED:', ''))
          : config.applicationPassword
        
        const pluginEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/create-user`
        const resp = await fetch(pluginEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${decryptedUsername}:${decryptedPassword}`).toString('base64'),
          },
          body: JSON.stringify({ username: validUsername, email, password, name, role })
        })
        
        if (resp.ok) {
          const data = await resp.json()
          if (data?.success) {
            createdIn = 'plugin'
            wordpressUserId = data.userId || data.id || null
            console.log('✅ User created via plugin:', wordpressUserId)
          }
        } else {
          const errText = await resp.text()
          return NextResponse.json({ error: 'Không thể tạo user trên WordPress (plugin)', details: errText }, { status: resp.status })
        }
      }
    } catch (error) {
      console.log('❌ Failed to create user via plugin:', error)
      return NextResponse.json({ error: 'Không thể tạo user trên WordPress (plugin)', details: error instanceof Error ? error.message : String(error) }, { status: 502 })
    }
    
    // Add WordPress user ID if created successfully
    if (wordpressUserId) {
      newUser.wordpress_user_id = wordpressUserId
    }
    
    console.log('✅ User created successfully:', {
      id: newUser.id,
      username: validUsername,
      email: email.replace(/./g, '*'), // Mask email in logs
      role,
      createdIn,
      wordpressUserId
    })
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: validUsername,
        email: email.replace(/./g, '*'), // Don't return plain email
        display_name: newUser.display_name,
        role: newUser.role,
        created_in: createdIn,
        wordpress_user_id: wordpressUserId
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error:', error)
    console.error('❌ Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Lỗi khi tạo người dùng', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
