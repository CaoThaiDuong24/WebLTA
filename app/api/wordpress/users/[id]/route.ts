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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Deleting WordPress user...')
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Thiếu ID người dùng' 
        },
        { status: 400 }
      )
    }

    // Get WordPress configuration
    const config = getWordPressConfig()
    if (!config || !config.isConnected) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Chưa kết nối với WordPress. Vui lòng cấu hình kết nối trước.' 
        },
        { status: 400 }
      )
    }

    console.log('🌐 Deleting user from WordPress:', config.siteUrl)
    console.log('👤 User ID:', userId)

    // Create Basic Auth header
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    
    // Delete user via WordPress REST API
    const response = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/${userId}?reassign=1`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response statusText:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ User deletion failed:', errorText)
      
      // Parse error message for better user feedback
      let errorMessage = 'Không thể xóa người dùng'
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.code === 'rest_user_cannot_delete') {
          errorMessage = 'Không thể xóa người dùng này'
        } else if (errorData.code === 'rest_user_not_found') {
          errorMessage = 'Không tìm thấy người dùng'
        }
      } catch (e) {
        // If error is not JSON, use the raw text
        errorMessage = errorText
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      })
    }

    console.log('✅ User deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Người dùng đã được xóa thành công'
    })

  } catch (error) {
    console.error('❌ Error deleting user:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Lỗi khi xóa người dùng: ${error}` 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Updating WordPress user...')
    const userId = params.id
    const body = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Thiếu ID người dùng' 
        },
        { status: 400 }
      )
    }

    // Get WordPress configuration
    const config = getWordPressConfig()
    if (!config || !config.isConnected) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Chưa kết nối với WordPress. Vui lòng cấu hình kết nối trước.' 
        },
        { status: 400 }
      )
    }

    console.log('🌐 Updating user on WordPress:', config.siteUrl)
    console.log('👤 User ID:', userId)

    // Create Basic Auth header
    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    
    // Update user via WordPress REST API
    const response = await fetch(`${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response statusText:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ User update failed:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Không thể cập nhật người dùng: ${response.status} ${response.statusText}`
      })
    }

    const updatedUser = await response.json()
    console.log('✅ User updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Người dùng đã được cập nhật thành công',
      user: updatedUser
    })

  } catch (error) {
    console.error('❌ Error updating user:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Lỗi khi cập nhật người dùng: ${error}` 
      },
      { status: 500 }
    )
  }
} 