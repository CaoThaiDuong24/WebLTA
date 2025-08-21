import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import fs from 'fs'
import path from 'path'

// XML-RPC request helper
async function makeXmlRpcRequest(url: string, method: string, params: any[]) {
  try {
    const xmlBody = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    ${params.map(param => `<param><value><string>${param}</string></value></param>`).join('')}
  </params>
</methodCall>`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'User-Agent': 'WordPress/6.0; https://example.com'
      },
      body: xmlBody,
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const xmlResponse = await response.text()
    return { success: true, data: xmlResponse }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Upload media via XML-RPC
async function uploadMediaViaXmlRpc(config: any, file: File, userId: string) {
  try {
    console.log('📤 Uploading avatar via XML-RPC...')
    
    const xmlRpcUrl = `${config.siteUrl}/xmlrpc.php`
    
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    
    // Prepare media data for XML-RPC
    const mediaData = {
      name: file.name,
      type: file.type,
      bits: base64Data,
      overwrite: false
    }
    
    // Upload using wp.uploadFile
    const result = await makeXmlRpcRequest(
      xmlRpcUrl,
      'wp.uploadFile',
      [
        '1', // blog_id
        config.username,
        config.applicationPassword,
        JSON.stringify(mediaData)
      ]
    )

    if (result.success) {
      // Parse XML response to get file URL
      const urlMatch = result.data.match(/<value><string>(.*?)<\/string><\/value>/)
      if (urlMatch) {
        const fileUrl = urlMatch[1]
        console.log(`✅ Avatar uploaded successfully: ${fileUrl}`)
        return { success: true, fileUrl }
      } else {
        console.log('✅ Avatar uploaded successfully (URL not found in response)')
        return { success: true, fileUrl: null }
      }
    } else {
      console.log(`❌ XML-RPC upload failed: ${result.error}`)
      return { success: false, error: result.error }
    }
  } catch (error: any) {
    console.log(`❌ XML-RPC upload error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Upload media via REST API (fallback)
async function uploadMediaViaRestApi(config: any, file: File) {
  try {
    console.log('📤 Uploading avatar via REST API...')
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${config.siteUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')}`,
      },
      body: formData,
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      throw new Error(`REST API upload failed: ${response.status}`)
    }

    const mediaData = await response.json()
    console.log(`✅ Avatar uploaded via REST API: ${mediaData.source_url}`)
    return { success: true, fileUrl: mediaData.source_url, mediaId: mediaData.id }
  } catch (error: any) {
    console.log(`❌ REST API upload error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Save avatar locally and sync to WordPress
async function saveAvatarToWordPress(file: File, userId: string) {
  try {
    // Lấy cấu hình WordPress
    const config = getWordPressConfig()
    if (!config?.isConnected) {
      throw new Error('WordPress chưa được cấu hình hoặc chưa kết nối')
    }

    console.log('🔍 WordPress config found:', {
      siteUrl: config.siteUrl,
      username: config.username,
      isConnected: config.isConnected
    })

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('Hình ảnh không được lớn hơn 5MB')
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('Vui lòng chọn file hình ảnh')
    }

    // Lưu file locally trước
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    const fileExtension = path.extname(file.name)
    const fileName = `avatar_${userId}_${Date.now()}${fileExtension}`
    const localFilePath = path.join(uploadsDir, fileName)
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(localFilePath, buffer)
    
    const localUrl = `/uploads/avatars/${fileName}`
    console.log(`✅ Avatar saved locally: ${localUrl}`)

    // Thử upload lên WordPress qua XML-RPC trước
    let wordpressUrl = null
    let mediaId = null
    
    try {
      const xmlRpcResult = await uploadMediaViaXmlRpc(config, file, userId)
      if (xmlRpcResult.success) {
        wordpressUrl = xmlRpcResult.fileUrl
        console.log('✅ Avatar uploaded to WordPress via XML-RPC')
      } else {
        console.log('⚠️ XML-RPC failed, trying REST API...')
        const restResult = await uploadMediaViaRestApi(config, file)
        if (restResult.success) {
          wordpressUrl = restResult.fileUrl
          mediaId = restResult.mediaId
          console.log('✅ Avatar uploaded to WordPress via REST API')
        } else {
          console.log('⚠️ Both XML-RPC and REST API failed, keeping local only')
        }
      }
    } catch (wpError) {
      console.log('⚠️ WordPress upload failed, keeping local only:', wpError)
    }

    return {
      success: true,
      localUrl,
      wordpressUrl,
      mediaId,
      fileName
    }

  } catch (error: any) {
    console.error('❌ Error saving avatar:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Starting avatar upload to WordPress...')
    
    // Lấy form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    const userId = formData.get('userId') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không có file avatar được upload' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu userId' },
        { status: 400 }
      )
    }

    console.log('📁 Avatar file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userId
    })

    // Lưu avatar và sync lên WordPress
    const result = await saveAvatarToWordPress(file, userId)
    
    console.log('✅ Avatar upload completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Upload avatar thành công',
      data: result
    })

  } catch (error: any) {
    console.error('❌ Error uploading avatar:', error)
    return NextResponse.json(
      { error: error.message || 'Lỗi khi upload avatar' },
      { status: 500 }
    )
  }
}
