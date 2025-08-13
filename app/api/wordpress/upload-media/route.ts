import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { WordPressAPI } from '@/lib/wordpress'

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
    console.log('📤 Starting media upload to WordPress...')
    
    // Lấy cấu hình WordPress
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig?.isConnected) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình hoặc chưa kết nối' },
        { status: 400 }
      )
    }

    // Kiểm tra kích thước file (giới hạn 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    console.log('🔍 WordPress config found:', {
      siteUrl: wordpressConfig.siteUrl,
      username: wordpressConfig.username,
      isConnected: wordpressConfig.isConnected
    })

    // Tạo WordPress API instance
    const wpAPI = new WordPressAPI(wordpressConfig)
    
    // Lấy form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được upload' },
        { status: 400 }
      )
    }

    console.log('📁 File to upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Kiểm tra kích thước file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File quá lớn. Kích thước tối đa cho phép: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    try {
      // Upload file lên WordPress
      const uploadResult = await wpAPI.uploadMediaFile(file)
      
      console.log('✅ Media uploaded successfully:', {
        id: uploadResult.id,
        url: uploadResult.source_url,
        title: uploadResult.title?.rendered
      })

      return NextResponse.json({
        success: true,
        message: 'Upload media thành công',
        data: uploadResult
      })
    } catch (uploadError) {
      console.error('❌ WordPress upload failed:', uploadError)
      throw uploadError
    }

  } catch (error) {
    console.error('❌ Error uploading media:', error)
    return NextResponse.json(
      { error: 'Lỗi khi upload media lên WordPress' },
      { status: 500 }
    )
  }
} 