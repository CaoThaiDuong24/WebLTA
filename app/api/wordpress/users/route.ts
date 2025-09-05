import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Import với try-catch để tránh lỗi
let getWpDbPool: any, getWpTablePrefix: any, hashWordPressPassword: any, getWordPressConfig: any, encryptSensitiveData: any

try {
  const wpDb = require('@/lib/wp-db')
  getWpDbPool = wpDb.getWpDbPool
  getWpTablePrefix = wpDb.getWpTablePrefix
} catch (e) {
  console.log('⚠️ WordPress DB module not available')
}

try {
  const wpPassword = require('@/lib/wp-password')
  hashWordPressPassword = wpPassword.hashWordPressPassword
} catch (e) {
  console.log('⚠️ WordPress password module not available')
}

try {
  const wpConfig = require('@/lib/wordpress-config')
  getWordPressConfig = wpConfig.getWordPressConfig
} catch (e) {
  console.log('⚠️ WordPress config module not available:', e)
}

try {
  const security = require('@/lib/security')
  encryptSensitiveData = security.encryptSensitiveData
} catch (e) {
  console.log('⚠️ Security module not available')
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function phpSerializeCapabilities(role: string): string {
  // a:1:{s:<len>:"<role>";b:1;}
  const len = role.length
  return `a:1:{s:${len}:"${role}";b:1;}`
}

function roleToLevel(role: string): number {
  switch (role) {
    case 'administrator':
      return 10
    case 'editor':
      return 7
    case 'author':
      return 2
    case 'contributor':
      return 1
    default:
      return 0
  }
}

// Lưu avatar file
async function saveAvatarFile(file: File, userId: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  
  // Tạo thư mục nếu chưa có
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  
  // Tạo tên file unique
  const fileExtension = path.extname(file.name)
  const fileName = `avatar_${userId}_${Date.now()}${fileExtension}`
  const filePath = path.join(uploadsDir, fileName)
  
  // Lưu file
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  fs.writeFileSync(filePath, buffer)
  
  // Trả về đường dẫn public
  return `/uploads/avatars/${fileName}`
}

// Upload avatar to WordPress via XML-RPC
async function uploadAvatarToWordPress(file: File, userId: string): Promise<{localUrl: string, wordpressUrl?: string, mediaId?: number}> {
  try {
    // Lưu locally trước
    const localUrl = await saveAvatarFile(file, userId)
    
    // Thử upload lên WordPress
    const config = getWordPressConfig()
    if (config?.isConnected) {
      try {
        // Upload trực tiếp qua XML-RPC hoặc REST API
        const formData = new FormData()
        formData.append('file', file)
        
        // Thử REST API trước
        const response = await fetch(`${config.siteUrl}/wp-json/wp/v2/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')}`,
          },
          body: formData,
          signal: AbortSignal.timeout(30000)
        })
        
        if (response.ok) {
          const result = await response.json()
          return {
            localUrl,
            wordpressUrl: result.source_url,
            mediaId: result.id
          }
        } else {
          console.log('⚠️ REST API upload failed, keeping local only')
        }
      } catch (wpError) {
        console.log('⚠️ WordPress upload failed, keeping local only:', wpError)
      }
    }
    
    return { localUrl }
  } catch (error) {
    console.error('❌ Error uploading avatar:', error)
    throw error
  }
}

// Fallback: Lưu user vào file JSON khi không có DB WordPress
function saveUserToFile(userData: any) {
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  const usersDir = path.dirname(usersFile)
  
  // Tạo thư mục nếu chưa có
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir, { recursive: true })
  }
  
  // Đọc users hiện tại
  let users = []
  if (fs.existsSync(usersFile)) {
    try {
      users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
    } catch (e) {
      users = []
    }
  }
  
  // Kiểm tra trùng lặp
  if (users.some((u: any) => u.user_login === userData.user_login)) {
    throw new Error('Username đã tồn tại')
  }
  if (users.some((u: any) => u.user_email === userData.user_email)) {
    throw new Error('Email đã tồn tại')
  }
  
  // Kiểm tra xem có cần mã hóa không
  const shouldEncrypt = process.env.ENCRYPTION_ENABLED === 'true'
  
  // Thêm user mới
  const newUser = {
    id: Date.now(),
    user_login: shouldEncrypt ? `ENCRYPTED:${encryptSensitiveData(userData.user_login)}` : userData.user_login,
    user_email: shouldEncrypt ? `ENCRYPTED:${encryptSensitiveData(userData.user_email)}` : userData.user_email,
    user_pass: shouldEncrypt ? `ENCRYPTED:${encryptSensitiveData(userData.user_pass)}` : userData.user_pass,
    display_name: shouldEncrypt ? `ENCRYPTED:${encryptSensitiveData(userData.display_name)}` : userData.display_name,
    user_nicename: userData.user_nicename,
    role: userData.role,
    user_registered: userData.user_registered,
    avatar_url: userData.avatar_url || null,
    wordpress_avatar_url: userData.wordpress_avatar_url || null,
    avatar_media_id: userData.avatar_media_id || null,
    is_active: true, // Mặc định là hoạt động
    created_at: new Date().toISOString(),
    security_version: shouldEncrypt ? "2.0" : "1.0"
  }
  users.push(newUser)
  
  // Lưu file
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
  return newUser
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/wordpress/users called')
  try {
    let username: string, email: string, password: string, name: string, role: string, avatarFile: File | null = null
    
    // Kiểm tra content-type để xử lý FormData hoặc JSON
    const contentType = request.headers.get('content-type') || ''
    console.log('🔍 Content-Type:', contentType)
    
    if (contentType.includes('multipart/form-data')) {
      // Xử lý FormData (có avatar)
      const formData = await request.formData()
      username = (formData.get('username') as string) || ''
      email = (formData.get('email') as string) || ''
      password = (formData.get('password') as string) || ''
      name = (formData.get('name') as string) || ''
      role = (formData.get('role') as string) || 'subscriber'
      avatarFile = formData.get('avatar') as File || null
      console.log('📝 FormData received:', { username, email, name, role, hasAvatar: !!avatarFile })
    } else {
      // Xử lý JSON (không có avatar)
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

    // Validate avatar file nếu có
    if (avatarFile) {
      if (avatarFile.size > 5 * 1024 * 1024) { // 5MB
        return NextResponse.json(
          { error: 'Hình ảnh không được lớn hơn 5MB' },
          { status: 400 }
        )
      }
      
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Vui lòng chọn file hình ảnh' },
          { status: 400 }
        )
      }
    }

    // Try via WordPress XML-RPC API (if available) to ensure proper capability setup
    try {
      if (!getWordPressConfig) {
        console.log('⚠️ WordPress config function not available, skipping WordPress API')
        throw new Error('WordPress config not available')
      }
      const config = getWordPressConfig()
      console.log('🔧 WordPress config:', config ? 'loaded' : 'null')
      console.log('🔧 Config details:', {
        siteUrl: config?.siteUrl,
        username: config?.username,
        hasPassword: !!config?.applicationPassword,
        isConnected: config?.isConnected
      })
      if (config?.siteUrl && config?.username && config?.applicationPassword) {
        const xmlrpcUrl = `${config.siteUrl.replace(/\/$/, '')}/xmlrpc.php`
        // wp.newUser is not standard; many sites disallow it. Prefer custom plugin endpoint if present
        const pluginEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/create-user`
        console.log('🔗 Calling plugin endpoint:', pluginEndpoint)
        console.log('🔗 Request payload:', { username, email, name, role, hasPassword: !!password })
        
        const response = await fetch(pluginEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64'),
          },
          body: JSON.stringify({ username, email, password, name, role }),
          signal: AbortSignal.timeout(30000)
        })
        
        console.log('🔗 Plugin response status:', response.status)
        console.log('🔗 Plugin response headers:', Object.fromEntries(response.headers.entries()))
        if (response.ok) {
          const json = await response.json()
          console.log('🔗 Plugin response JSON:', json)
          if (json?.success) {
                    // Lưu avatar nếu có
        let avatarUrl = null
        let wordpressAvatarUrl = null
        let avatarMediaId = null
        if (avatarFile) {
          const avatarResult = await uploadAvatarToWordPress(avatarFile, json.userId || json.id)
          avatarUrl = avatarResult.localUrl
          wordpressAvatarUrl = avatarResult.wordpressUrl
          avatarMediaId = avatarResult.mediaId
        }
            
            return NextResponse.json({ 
              success: true, 
              userId: json.userId || json.id, 
              method: 'plugin',
              avatar_url: avatarUrl,
              wordpress_avatar_url: wordpressAvatarUrl,
              avatar_media_id: avatarMediaId
            })
          }
        } else {
          console.log('🔗 Plugin response not OK:', response.status, response.statusText)
          const errorText = await response.text()
          console.log('🔗 Plugin error response:', errorText)
        }
      } else {
        console.log('🔗 Missing WordPress config for plugin endpoint')
      }
    } catch (e) {
      console.log('🔗 Plugin endpoint error:', e)
      // Fallback to DB method below
    }

    // Try WordPress Database
    try {
      if (!getWpDbPool) {
        console.log('⚠️ WordPress DB function not available, skipping DB method')
        throw new Error('WordPress DB not available')
      }
      const pool = getWpDbPool()
      const prefix = getWpTablePrefix()
      const now = new Date()
      const registered = now.toISOString().slice(0, 19).replace('T', ' ')

      const user_login = username.trim()
      const user_email = email.trim()
      const display_name = name?.trim() || username.trim()
      const user_nicename = slugify(display_name || user_login)
              const user_pass = hashWordPressPassword ? hashWordPressPassword(password) : password

      // Check duplicates
      const [existingByLogin] = await pool.query(`SELECT ID FROM ${prefix}users WHERE user_login = ? LIMIT 1`, [user_login])
      // @ts-ignore
      if (Array.isArray(existingByLogin) && existingByLogin.length > 0) {
        return NextResponse.json({ error: 'Username đã tồn tại' }, { status: 409 })
      }
      const [existingByEmail] = await pool.query(`SELECT ID FROM ${prefix}users WHERE user_email = ? LIMIT 1`, [user_email])
      // @ts-ignore
      if (Array.isArray(existingByEmail) && existingByEmail.length > 0) {
        return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
      }

      // Insert user
      const [result]: any = await pool.query(
        `INSERT INTO ${prefix}users (user_login, user_pass, user_nicename, user_email, user_url, user_registered, user_activation_key, user_status, display_name)
         VALUES (?, ?, ?, ?, '', ?, '', 0, ?)`,
        [user_login, user_pass, user_nicename, user_email, registered, display_name]
      )

      const userId = result.insertId

              // Lưu avatar nếu có
        let avatarUrl = null
        let wordpressAvatarUrl = null
        let avatarMediaId = null
        if (avatarFile) {
          const avatarResult = await uploadAvatarToWordPress(avatarFile, userId.toString())
          avatarUrl = avatarResult.localUrl
          wordpressAvatarUrl = avatarResult.wordpressUrl
          avatarMediaId = avatarResult.mediaId
          
          // Lưu avatar URL vào usermeta
          await pool.query(
            `INSERT INTO ${prefix}usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
            [userId, `${prefix}avatar_url`, avatarUrl]
          )
          
          // Lưu WordPress avatar URL nếu có
          if (wordpressAvatarUrl) {
            await pool.query(
              `INSERT INTO ${prefix}usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
              [userId, `${prefix}wordpress_avatar_url`, wordpressAvatarUrl]
            )
          }
          
          // Lưu avatar media ID nếu có
          if (avatarMediaId) {
            await pool.query(
              `INSERT INTO ${prefix}usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
              [userId, `${prefix}avatar_media_id`, avatarMediaId.toString()]
            )
          }
        }

      // Insert capabilities and level in usermeta
      const capabilitiesKey = `${prefix}capabilities`
      const userLevelKey = `${prefix}user_level`
      const capabilitiesVal = phpSerializeCapabilities(role)
      const userLevelVal = String(roleToLevel(role))

      await pool.query(
        `INSERT INTO ${prefix}usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?), (?, ?, ?)`,
        [userId, capabilitiesKey, capabilitiesVal, userId, userLevelKey, userLevelVal]
      )

      return NextResponse.json({ 
        success: true, 
        userId, 
        method: 'db',
        avatar_url: avatarUrl,
        wordpress_avatar_url: wordpressAvatarUrl,
        avatar_media_id: avatarMediaId
      })
    } catch (dbError: any) {
      console.log('Database error, falling back to file storage:', dbError.message)
      
      // Fallback: Lưu vào file JSON
      try {
        const now = new Date()
        const registered = now.toISOString().slice(0, 19).replace('T', ' ')
        const user_login = username.trim()
        const user_email = email.trim()
        const display_name = name?.trim() || username.trim()
        const user_nicename = slugify(display_name || user_login)
        const user_pass = hashWordPressPassword ? hashWordPressPassword(password) : password

        // Lưu avatar nếu có
        let avatarUrl = null
        let wordpressAvatarUrl = null
        let avatarMediaId = null
        if (avatarFile) {
          const userId = Date.now().toString()
          const avatarResult = await uploadAvatarToWordPress(avatarFile, userId)
          avatarUrl = avatarResult.localUrl
          wordpressAvatarUrl = avatarResult.wordpressUrl
          avatarMediaId = avatarResult.mediaId
        }

        const userData = {
          user_login,
          user_email,
          user_pass,
          display_name,
          user_nicename,
          role: role || 'subscriber',
          user_registered: registered,
          avatar_url: avatarUrl,
          wordpress_avatar_url: wordpressAvatarUrl,
          avatar_media_id: avatarMediaId
        }

        const newUser = saveUserToFile(userData)
        
        return NextResponse.json({ 
          success: true, 
          userId: newUser.id, 
          method: 'file',
          avatar_url: avatarUrl,
          wordpress_avatar_url: wordpressAvatarUrl,
          avatar_media_id: avatarMediaId
        })
      } catch (fileError: any) {
        console.error('File storage error:', fileError)
        return NextResponse.json(
          { error: 'Không thể tạo người dùng. Vui lòng thử lại sau.' },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error('❌ User creation error:', error)
    console.error('❌ Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Lỗi khi tạo người dùng', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/wordpress/users called - Syncing users from WordPress')
  try {
    // Try to get users from WordPress REST API
    try {
      if (!getWordPressConfig) {
        console.log('⚠️ WordPress config function not available, skipping WordPress API')
        throw new Error('WordPress config not available')
      }
      const config = getWordPressConfig()
      console.log('🔧 WordPress config:', config ? 'loaded' : 'null')
      
      if (config?.siteUrl && config?.username && config?.applicationPassword) {
        const usersEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users`
        console.log('🔗 Calling WordPress users endpoint:', usersEndpoint)
        
        const response = await fetch(usersEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64'),
          },
          signal: AbortSignal.timeout(30000)
        })
        
        console.log('🔗 WordPress users response status:', response.status)
        
        if (response.ok) {
          const wpUsers = await response.json()
          console.log('🔗 Found', wpUsers.length, 'users in WordPress')
          
          // Convert WordPress users to local format and save
          const localUsers = wpUsers.map((wpUser: any) => ({
            id: wpUser.id,
            user_login: wpUser.slug,
            user_email: wpUser.email || '',
            display_name: wpUser.name || wpUser.slug,
            user_nicename: wpUser.slug,
            role: wpUser.roles?.[0] || 'subscriber',
            user_registered: wpUser.date || new Date().toISOString(),
            avatar_url: wpUser.avatar_urls?.['96'] || null,
            wordpress_avatar_url: wpUser.avatar_urls?.['96'] || null,
            is_active: true,
            created_at: wpUser.date || new Date().toISOString(),
            security_version: "1.0"
          }))
          
          // Save to local file
          const usersFile = path.join(process.cwd(), 'data', 'users.json')
          const usersDir = path.dirname(usersFile)
          
          if (!fs.existsSync(usersDir)) {
            fs.mkdirSync(usersDir, { recursive: true })
          }
          
          fs.writeFileSync(usersFile, JSON.stringify(localUsers, null, 2))
          console.log('✅ Synced', localUsers.length, 'users from WordPress to local file')
          
          return NextResponse.json({
            success: true,
            message: `Đã đồng bộ ${localUsers.length} người dùng từ WordPress`,
            users: localUsers,
            method: 'wordpress-rest'
          })
        } else {
          const errorText = await response.text()
          console.log('🔗 WordPress users error:', errorText)
          throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
        }
      } else {
        console.log('🔗 Missing WordPress config for users sync')
        throw new Error('WordPress config incomplete')
      }
    } catch (wpError: any) {
      console.log('🔗 WordPress users sync failed:', wpError.message)
      
      // Fallback: Try to get users from WordPress database
      try {
        if (!getWpDbPool) {
          console.log('⚠️ WordPress DB function not available, skipping DB method')
          throw new Error('WordPress DB not available')
        }
        
        const pool = getWpDbPool()
        const prefix = getWpTablePrefix()
        
        console.log('🔗 Trying to get users from WordPress database...')
        
        const [wpUsers]: any = await pool.query(`
          SELECT u.ID, u.user_login, u.user_email, u.display_name, u.user_nicename, 
                 u.user_registered, um.meta_value as role
          FROM ${prefix}users u
          LEFT JOIN ${prefix}usermeta um ON u.ID = um.user_id AND um.meta_key = '${prefix}capabilities'
          WHERE u.user_status = 0
          ORDER BY u.ID
        `)
        
        console.log('🔗 Found', wpUsers.length, 'users in WordPress database')
        
        // Convert to local format
        const localUsers = wpUsers.map((wpUser: any) => {
          let role = 'subscriber'
          if (wpUser.role) {
            // Parse WordPress capabilities
            const capabilities = wpUser.role
            if (capabilities.includes('administrator')) role = 'administrator'
            else if (capabilities.includes('editor')) role = 'editor'
            else if (capabilities.includes('author')) role = 'author'
            else if (capabilities.includes('contributor')) role = 'contributor'
          }
          
          return {
            id: wpUser.ID,
            user_login: wpUser.user_login,
            user_email: wpUser.user_email,
            display_name: wpUser.display_name || wpUser.user_login,
            user_nicename: wpUser.user_nicename,
            role: role,
            user_registered: wpUser.user_registered,
            avatar_url: null,
            wordpress_avatar_url: null,
            is_active: true,
            created_at: wpUser.user_registered || new Date().toISOString(),
            security_version: "1.0"
          }
        })
        
        // Save to local file
        const usersFile = path.join(process.cwd(), 'data', 'users.json')
        const usersDir = path.dirname(usersFile)
        
        if (!fs.existsSync(usersDir)) {
          fs.mkdirSync(usersDir, { recursive: true })
        }
        
        fs.writeFileSync(usersFile, JSON.stringify(localUsers, null, 2))
        console.log('✅ Synced', localUsers.length, 'users from WordPress DB to local file')
        
        return NextResponse.json({
          success: true,
          message: `Đã đồng bộ ${localUsers.length} người dùng từ WordPress database`,
          users: localUsers,
          method: 'wordpress-db'
        })
        
      } catch (dbError: any) {
        console.log('🔗 WordPress DB sync failed:', dbError.message)
        
        // Final fallback: return existing local users
        const usersFile = path.join(process.cwd(), 'data', 'users.json')
        if (fs.existsSync(usersFile)) {
          try {
            const localUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
            return NextResponse.json({
              success: true,
              message: `Trả về ${localUsers.length} người dùng từ local file`,
              users: localUsers,
              method: 'local-file'
            })
          } catch (e) {
            return NextResponse.json({
              success: false,
              error: 'Không thể đọc file users local',
              details: e instanceof Error ? e.message : String(e)
            }, { status: 500 })
          }
        } else {
          return NextResponse.json({
            success: false,
            error: 'Không thể đồng bộ từ WordPress và không có file local',
            details: {
              wordpressError: wpError.message,
              dbError: dbError.message
            }
          }, { status: 500 })
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Users sync error:', error)
    return NextResponse.json({
      error: 'Lỗi khi đồng bộ người dùng',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}


