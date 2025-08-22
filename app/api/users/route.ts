import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { getWpDbPool, getWpTablePrefix } from '@/lib/wp-db'
import { decryptSensitiveData, encryptSensitiveData } from '@/lib/security'
import { getWordPressConfig } from '@/lib/wordpress-config'

interface UserData {
  id: number
  user_login: string
  user_email: string
  user_pass: string
  display_name: string
  role: string
  created_at: string
  user_registered?: string
  is_active?: boolean
  avatar_url?: string
}

// Hàm giải mã dữ liệu nếu đã mã hóa
function decryptIfEncrypted(data: string): string {
  if (data.startsWith('ENCRYPTED:')) {
    try {
      return decryptSensitiveData(data.replace('ENCRYPTED:', ''))
    } catch (error) {
      console.error('Failed to decrypt data:', error)
      return data.replace('ENCRYPTED:', '')
    }
  }
  return data
}

function getUsersFromFile(): UserData[] {
  try {
    const usersFile = path.join(process.cwd(), 'data', 'users.json')
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf8')
      const users = JSON.parse(data)
      
      // Kiểm tra xem dữ liệu có được mã hóa không
      if (users.length > 0 && users[0].security_version === "2.0") {
        // Giải mã dữ liệu cho mỗi user
        return users.map((user: any) => ({
          ...user,
          user_login: decryptIfEncrypted(user.user_login),
          user_email: decryptIfEncrypted(user.user_email),
          user_pass: decryptIfEncrypted(user.user_pass),
          display_name: decryptIfEncrypted(user.display_name)
        }))
      } else {
        // Dữ liệu chưa mã hóa
        return users
      }
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  return []
}

function saveUsersToFile(users: UserData[]) {
  try {
    const usersFile = path.join(process.cwd(), 'data', 'users.json')
    const usersDir = path.dirname(usersFile)
    
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true })
    }
    
    // Kiểm tra xem có cần mã hóa không
    const shouldEncrypt = process.env.ENCRYPTION_ENABLED === 'true'
    
    if (shouldEncrypt) {
      // Mã hóa dữ liệu trước khi lưu
      const encryptedUsers = users.map(user => ({
        ...user,
        user_login: `ENCRYPTED:${encryptSensitiveData(user.user_login)}`,
        user_email: `ENCRYPTED:${encryptSensitiveData(user.user_email)}`,
        user_pass: `ENCRYPTED:${encryptSensitiveData(user.user_pass)}`,
        display_name: `ENCRYPTED:${encryptSensitiveData(user.display_name)}`,
        security_version: "2.0"
      }))
      
      fs.writeFileSync(usersFile, JSON.stringify(encryptedUsers, null, 2))
    } else {
      // Lưu dữ liệu chưa mã hóa
      const plainUsers = users.map(user => ({
        ...user,
        security_version: "1.0"
      }))
      
      fs.writeFileSync(usersFile, JSON.stringify(plainUsers, null, 2))
    }
    
    return true
  } catch (error) {
    console.error('Error saving users file:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching users...')
    
    // Try to get users from WordPress first
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
        
        // Try custom plugin endpoint for getting users
        const pluginEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/users`
        console.log('🔗 Calling WordPress plugin endpoint:', pluginEndpoint)
        
        const response = await fetch(pluginEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${decryptedUsername}:${decryptedPassword}`).toString('base64'),
          },
          signal: AbortSignal.timeout(30000)
        })
        
        console.log('🔗 WordPress plugin response status:', response.status)
        
        if (response.ok) {
          const wpResponse = await response.json()
          console.log('🔗 Plugin response:', wpResponse)
          
          // Check if response has users array
          const wpUsers = wpResponse.users || wpResponse || []
          console.log('🔗 Found', wpUsers.length, 'users via plugin')
          
          // Convert WordPress users to admin format
          const users = wpUsers.map((wpUser: any) => ({
            id: wpUser.ID || wpUser.id,
            user_login: wpUser.user_login || wpUser.slug,
            user_email: wpUser.user_email || wpUser.email || '',
            display_name: wpUser.display_name || wpUser.name || wpUser.user_login,
            role: wpUser.role || wpUser.roles?.[0] || 'subscriber',
            created_at: wpUser.user_registered || wpUser.date || new Date().toISOString(),
            user_registered: wpUser.user_registered || wpUser.date,
            is_active: typeof wpUser?.meta?.is_active !== 'undefined' 
              ? (String(wpUser.meta.is_active) === 'true' || String(wpUser.meta.is_active) === '1')
              : true,
            avatar_url: null
          }))
          
          return NextResponse.json({
            success: true,
            users: users,
            count: users.length,
            source: 'wordpress-plugin'
          })
        } else {
          const errorText = await response.text()
          console.log('🔗 WordPress plugin error:', errorText)
          throw new Error(`WordPress plugin error: ${response.status} ${response.statusText}`)
        }
      } else {
        console.log('🔗 Missing WordPress config for users fetch')
        throw new Error('WordPress config incomplete')
      }
    } catch (wpError: any) {
      console.log('🔗 WordPress plugin fetch failed:', wpError.message)
      
      // Fallback: Try to get users from WordPress database
      try {
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
        
        // Convert to admin format
        const users = wpUsers.map((wpUser: any) => {
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
            role: role,
            created_at: wpUser.user_registered || new Date().toISOString(),
            user_registered: wpUser.user_registered,
            is_active: true,
            avatar_url: null
          }
        })
        
        return NextResponse.json({
          success: true,
          users: users,
          count: users.length,
          source: 'wordpress-database'
        })
        
      } catch (dbError: any) {
        console.log('🔗 WordPress database fetch failed:', dbError.message)
        
        // Final fallback: Get users from local file
        try {
          const usersFile = path.join(process.cwd(), 'data', 'users.json')
          
          if (fs.existsSync(usersFile)) {
            const usersData = fs.readFileSync(usersFile, 'utf8')
            const users = JSON.parse(usersData)
            
            // Decrypt sensitive data for display
            const decryptedUsers = users.map((user: any) => {
              const decryptedUser = { ...user }
              
              // Decrypt email if encrypted
              if (user.user_email && user.user_email.startsWith('ENCRYPTED:')) {
                try {
                  decryptedUser.user_email = decryptSensitiveData(user.user_email.replace('ENCRYPTED:', ''))
                } catch (e) {
                  decryptedUser.user_email = '***@***.***'
                }
              }
              
              // Don't return password in any form
              delete decryptedUser.user_pass
              
              return decryptedUser
            })
            
            return NextResponse.json({
              success: true,
              users: decryptedUsers,
              count: decryptedUsers.length,
              source: 'local-file'
            })
          } else {
            return NextResponse.json({
              success: true,
              users: [],
              count: 0,
              source: 'no-data'
            })
          }
        } catch (fileError: any) {
          console.log('🔗 Local file fetch failed:', fileError.message)
          throw new Error('All user fetch methods failed')
        }
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating new user...')
    
    const body = await request.json()
    const { username, email, password, name, role } = body
    
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: username, email, password' },
        { status: 400 }
      )
    }
    
    // Try to create user via WordPress plugin first
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
        console.log('🔗 Creating user via WordPress plugin...')
        
        const response = await fetch(pluginEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${decryptedUsername}:${decryptedPassword}`).toString('base64'),
          },
          body: JSON.stringify({ username, email, password, name, role })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data?.success) {
            console.log('✅ User created via WordPress plugin')
            return NextResponse.json({
              success: true,
              message: 'User created successfully via WordPress',
              userId: data.userId || data.id
            })
          }
        }
      }
    } catch (error: any) {
      console.log('❌ WordPress plugin creation failed:', error.message)
    }
    
    // Fallback: Create user in local file
    try {
      const usersFile = path.join(process.cwd(), 'data', 'users.json')
      let users = []
      
      if (fs.existsSync(usersFile)) {
        const usersData = fs.readFileSync(usersFile, 'utf8')
        users = JSON.parse(usersData)
      }
      
      // Check for duplicates
      if (users.some((u: any) => u.user_login === username)) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
      }
      if (users.some((u: any) => u.user_email === email)) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
      
      const newUser = {
        id: Date.now(),
        user_login: username,
        user_email: email,
        display_name: name || username,
        role: role || 'subscriber',
        created_at: new Date().toISOString(),
        is_active: true
      }
      
      users.push(newUser)
      
      const dataDir = path.dirname(usersFile)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
      
      console.log('✅ User created in local file')
      return NextResponse.json({
        success: true,
        message: 'User created successfully in local file',
        userId: newUser.id
      })
      
    } catch (error: any) {
      console.error('❌ Local file creation failed:', error)
      throw new Error('Failed to create user')
    }
    
  } catch (error: any) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Yêu cầu đăng nhập admin
    const session = await getServerSession(authOptions as any) as any
    if (!session || session.user?.role !== 'administrator') {
      return NextResponse.json(
        { error: 'Không có quyền cập nhật trạng thái người dùng' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, is_active } = body

    if (typeof userId === 'undefined' || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'Thiếu thông tin: userId và is_active là bắt buộc' },
        { status: 400 }
      )
    }

    // Cập nhật trạng thái trên WordPress
    try {
      const { getWordPressConfig } = require('@/lib/wordpress-config')
      const config = getWordPressConfig()
      
             if (config?.siteUrl && config?.username && config?.applicationPassword) {
         // Update user status via custom plugin endpoint
         const updateEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/users/${userId}`
         const response = await fetch(updateEndpoint, {
           method: 'PUT',
           headers: {
             'Content-Type': 'application/json',
             Authorization: 'Basic ' + Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64'),
           },
           body: JSON.stringify({
             meta: { is_active: is_active }
           })
         })
        
        if (response.ok) {
          // Cập nhật fallback file nếu tồn tại
          try {
            const users = getUsersFromFile()
            if (Array.isArray(users) && users.length > 0) {
              const updated = users.map(u => u.id === Number(userId) ? { ...u, is_active } : u)
              saveUsersToFile(updated as any)
            }
          } catch {}

          return NextResponse.json({ 
            success: true, 
            message: `Đã ${is_active ? 'bật' : 'tắt'} quyền hoạt động cho người dùng`,
          })
        } else {
          const errorText = await response.text()
          console.log('WordPress update user error:', errorText)
          return NextResponse.json(
            { error: 'Không thể cập nhật người dùng trên WordPress' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'WordPress config không đầy đủ' },
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error('Error updating user on WordPress:', error)
      return NextResponse.json(
        { error: 'Lỗi khi cập nhật trạng thái người dùng trên WordPress', details: error?.message || String(error) },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật trạng thái người dùng', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Yêu cầu đăng nhập admin
    const session = await getServerSession(authOptions as any) as any
    if (!session || session.user?.role !== 'administrator') {
      return NextResponse.json(
        { error: 'Không có quyền xoá người dùng' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin: userId là bắt buộc' },
        { status: 400 }
      )
    }

    const userIdNum = parseInt(userId, 10)
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'UserId không hợp lệ' },
        { status: 400 }
      )
    }

    // Xóa user trên WordPress
    try {
      const { getWordPressConfig } = require('@/lib/wordpress-config')
      const config = getWordPressConfig()
      
             if (config?.siteUrl && config?.username && config?.applicationPassword) {
         // Delete user via custom plugin endpoint
         const deleteEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/users/${userIdNum}`
         const response = await fetch(deleteEndpoint, {
           method: 'DELETE',
           headers: {
             'Content-Type': 'application/json',
             Authorization: 'Basic ' + Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64'),
           }
         })
        
        if (response.ok) {
          // Xoá khỏi file fallback nếu tồn tại
          try {
            const currentUsers = getUsersFromFile()
            if (Array.isArray(currentUsers) && currentUsers.length > 0) {
              const filtered = currentUsers.filter(u => Number(u.id) !== userIdNum)
              saveUsersToFile(filtered as any)
            }
          } catch {}

          return NextResponse.json({ 
            success: true, 
            message: 'Đã xóa người dùng thành công trên WordPress',
          })
        } else {
          const errorText = await response.text()
          console.log('WordPress delete user error:', errorText)
          return NextResponse.json(
            { error: 'Không thể xóa người dùng trên WordPress' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'WordPress config không đầy đủ' },
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error('Error deleting user on WordPress:', error)
      return NextResponse.json(
        { error: 'Lỗi khi xóa người dùng trên WordPress', details: error?.message || String(error) },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Lỗi khi xóa người dùng', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
