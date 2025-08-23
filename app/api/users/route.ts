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

// Loại bỏ đọc users từ file local (không còn sử dụng)
function getUsersFromFile(): UserData[] { return [] }

// Không còn lưu users ra file local
function saveUsersToFile(_users: UserData[]) { return false }

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
      // Fallback: Try to get users from WordPress database (vẫn cho phép)
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
        // Không còn fallback file local: trả lỗi
        throw new Error('All user fetch methods failed')
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
    
    // Không cho phép tạo user local nữa
    return NextResponse.json({ error: 'WordPress plugin unavailable. User creation is disabled.' }, { status: 503 })
    
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
