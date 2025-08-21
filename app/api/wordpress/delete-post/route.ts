import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Đường dẫn đến file cấu hình WordPress
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
    console.log('🗑️ Delete WordPress post API called')
    const body = await request.json()
    
    const { wordpressId } = body
    
    if (!wordpressId) {
      return NextResponse.json(
        { error: 'Thiếu wordpressId' },
        { status: 400 }
      )
    }
    
    console.log(`🗑️ Deleting WordPress post with ID: ${wordpressId}`)
    
    // Lấy cấu hình WordPress
    const wpConfig = getWordPressConfig()
    if (!wpConfig?.siteUrl) {
      return NextResponse.json(
        { error: 'Chưa cấu hình WordPress' },
        { status: 400 }
      )
    }
    
    const siteUrl = String(wpConfig.siteUrl).replace(/\/$/, '')
    
    // Xóa post bằng WordPress REST API
    const deleteUrl = `${siteUrl}/wp-json/wp/v2/posts/${wordpressId}?force=true`
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${wpConfig.username}:${wpConfig.applicationPassword}`).toString('base64')}`
    }
    
    console.log(`🗑️ Calling WordPress REST API: ${deleteUrl}`)
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ WordPress post ${wordpressId} deleted successfully`)
      
      return NextResponse.json({
        success: true,
        message: 'Tin tức đã được xóa khỏi WordPress',
        data: result
      })
      
    } else {
      const errorText = await response.text()
      console.error(`❌ WordPress delete failed: ${response.status} - ${errorText}`)
      
      return NextResponse.json(
        { 
          error: `Không thể xóa tin tức từ WordPress: ${response.status}`,
          details: errorText
        },
        { status: 502 }
      )
    }
    
  } catch (error) {
    console.error('❌ Error in delete-post:', error)
    return NextResponse.json(
      { error: 'Lỗi khi xóa tin tức từ WordPress' },
      { status: 500 }
    )
  }
}
