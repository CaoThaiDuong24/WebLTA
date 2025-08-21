import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { hashWordPressPassword } from '@/lib/wp-password'
import { getWpDbPool, getWpTablePrefix } from '@/lib/wp-db'
import { getWordPressConfig } from '@/lib/wordpress-config'

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
    const contentType = request.headers.get('content-type') || ''
    console.log('🔍 Content-Type:', contentType)
    
    let username: string, email: string, password: string, name: string, role: string, avatarFile: any = null
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      username = (formData.get('username') as string) || ''
      email = (formData.get('email') as string) || ''
      password = (formData.get('password') as string) || ''
      name = (formData.get('name') as string) || ''
      role = (formData.get('role') as string) || 'subscriber'
      avatarFile = formData.get('avatar')
      console.log('📝 FormData received:', { username, email, name, role, hasAvatar: !!avatarFile })
    } else {
      const body = await request.json()
      username = body.username || ''
      email = body.email || ''
      password = body.password || ''
      name = body.name || ''
      role = body.role || 'subscriber'
      console.log('📝 JSON received:', { username, email, name, role })
    }
    
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Thiếu thông tin: username, email, password là bắt buộc' },
        { status: 400 }
      )
    }
    
    // Tạo username hợp lệ từ tên nếu username có ký tự đặc biệt
    let validUsername = username
    if (username.includes(' ') || /[^a-zA-Z0-9_-]/.test(username)) {
      validUsername = slugify(username)
      console.log('🔄 Converting username from', username, 'to', validUsername)
    }
    
    // Kiểm tra trùng lặp trên WordPress trước
    try {
      const config = getWordPressConfig()
      if (config?.siteUrl && config?.username && config?.applicationPassword) {
        // Check if user exists via plugin endpoint
        const checkEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/users`
        const checkResp = await fetch(checkEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64'),
          }
        })
        
        if (checkResp.ok) {
          const existingUsers = await checkResp.json()
          const users = existingUsers.users || existingUsers || []
          
          if (users.some((u: any) => u.user_login === validUsername)) {
            return NextResponse.json({ error: 'Username đã tồn tại trên WordPress' }, { status: 409 })
          }
          if (users.some((u: any) => u.user_email === email)) {
            return NextResponse.json({ error: 'Email đã tồn tại trên WordPress' }, { status: 409 })
          }
        }
      }
    } catch (e) {
      console.log('Failed to check existing users:', e)
    }
    
    // Lưu avatar nếu có
    let avatarUrl = null
    if (avatarFile && avatarFile instanceof File) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      
      const fileExtension = path.extname(avatarFile.name)
      const fileName = `avatar_${Date.now()}${fileExtension}`
      const filePath = path.join(uploadsDir, fileName)
      
      const bytes = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      fs.writeFileSync(filePath, buffer)
      
      avatarUrl = `/uploads/avatars/${fileName}`
    }
    
    // Tạo thời gian theo múi giờ Việt Nam (UTC+7)
    const now = new Date()
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)) // UTC+7
    const userRegistered = vietnamTime.toISOString().slice(0, 19).replace('T', ' ')
    const createdAt = vietnamTime.toISOString()
    
    console.log('🕐 Current time (UTC):', now.toISOString())
    console.log('🕐 Vietnam time (UTC+7):', vietnamTime.toISOString())
    console.log('🕐 User registered time:', userRegistered)
    
    const newUser = {
      id: Date.now(),
      user_login: validUsername,
      user_email: email,
      user_pass: password, // Plain password for WordPress plugin
      display_name: name || username,
      user_nicename: slugify(name || username),
      role: role,
      user_registered: userRegistered,
      avatar_url: avatarUrl,
      wordpress_avatar_url: null,
      avatar_media_id: null,
      is_active: true,
      created_at: createdAt,
      security_version: "1.0"
    }
    
    // Chỉ sử dụng plugin REST API (nhanh nhất)
    let createdIn: 'plugin' | 'file' = 'file'
    let wordpressUserId: number | null = null
    
    try {
      const config = getWordPressConfig()
      if (config?.siteUrl && config?.username && config?.applicationPassword) {
        const pluginEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/create-user`
        const resp = await fetch(pluginEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64'),
          },
          body: JSON.stringify({ username: validUsername, email, password, name, role })
        })
        
        if (resp.ok) {
          const data = await resp.json()
          if (data?.success) {
            createdIn = 'plugin'
            wordpressUserId = data.userId || data.id || null
            console.log('✅ User created via plugin:', wordpressUserId)
          } else {
            console.log('❌ Plugin response not successful:', data)
          }
        } else {
          const text = await resp.text().catch(() => '')
          console.log('❌ Plugin request failed:', resp.status, text)
        }
      }
    } catch (e) {
      console.log('❌ Plugin request exception:', e)
    }
    
    // Nếu plugin thất bại, trả về lỗi ngay lập tức
    if (createdIn === 'file') {
      return NextResponse.json({
        success: false,
        error: 'Không thể tạo người dùng trên WordPress. Vui lòng kiểm tra plugin và thử lại.'
      }, { status: 502 })
    }

    console.log('✅ User created successfully:', newUser.id)

    return NextResponse.json({
      success: true,
      userId: wordpressUserId || newUser.id,
      method: createdIn,
      avatar_url: avatarUrl,
      wordpress_avatar_url: null,
      avatar_media_id: null
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
