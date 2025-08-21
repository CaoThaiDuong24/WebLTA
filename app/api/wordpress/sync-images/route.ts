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

// Upload single image via XML-RPC
async function uploadImageViaXmlRpc(config: any, filePath: string, fileName: string) {
  try {
    console.log(`📤 Uploading ${fileName} via XML-RPC...`)
    
    const xmlRpcUrl = `${config.siteUrl}/xmlrpc.php`
    
    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(filePath)
    const base64Data = fileBuffer.toString('base64')
    
    // Get MIME type
    const ext = path.extname(fileName).toLowerCase()
    let mimeType = 'image/jpeg'
    if (ext === '.png') mimeType = 'image/png'
    else if (ext === '.gif') mimeType = 'image/gif'
    else if (ext === '.webp') mimeType = 'image/webp'
    
    // Prepare media data for XML-RPC
    const mediaData = {
      name: fileName,
      type: mimeType,
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
        console.log(`✅ ${fileName} uploaded successfully: ${fileUrl}`)
        return { success: true, fileUrl }
      } else {
        console.log(`✅ ${fileName} uploaded successfully (URL not found in response)`)
        return { success: true, fileUrl: null }
      }
    } else {
      console.log(`❌ XML-RPC upload failed for ${fileName}: ${result.error}`)
      return { success: false, error: result.error }
    }
  } catch (error: any) {
    console.log(`❌ XML-RPC upload error for ${fileName}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Upload single image via REST API (fallback)
async function uploadImageViaRestApi(config: any, filePath: string, fileName: string) {
  try {
    console.log(`📤 Uploading ${fileName} via REST API...`)
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer])
    
    // Get MIME type
    const ext = path.extname(fileName).toLowerCase()
    let mimeType = 'image/jpeg'
    if (ext === '.png') mimeType = 'image/png'
    else if (ext === '.gif') mimeType = 'image/gif'
    else if (ext === '.webp') mimeType = 'image/webp'
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', blob, fileName)
    
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
    console.log(`✅ ${fileName} uploaded via REST API: ${mediaData.source_url}`)
    return { success: true, fileUrl: mediaData.source_url, mediaId: mediaData.id }
  } catch (error: any) {
    console.log(`❌ REST API upload error for ${fileName}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Get all images from uploads directory
function getAllImages() {
  const images = []
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  
  if (!fs.existsSync(uploadsDir)) {
    return images
  }
  
  // Recursively find all image files
  function scanDirectory(dir: string, relativePath: string = '') {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativeItemPath = path.join(relativePath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, relativeItemPath)
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase()
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          images.push({
            fileName: item,
            filePath: fullPath,
            relativePath: relativeItemPath,
            size: stat.size,
            modified: stat.mtime
          })
        }
      }
    }
  }
  
  scanDirectory(uploadsDir)
  return images
}

// Sync all images to WordPress
async function syncImagesToWordPress() {
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

    // Lấy tất cả hình ảnh
    const images = getAllImages()
    console.log(`📁 Found ${images.length} images to sync`)

    if (images.length === 0) {
      return {
        success: true,
        message: 'Không có hình ảnh nào để sync',
        synced: 0,
        failed: 0,
        results: []
      }
    }

    const results = []
    let synced = 0
    let failed = 0

    // Sync từng hình ảnh
    for (const image of images) {
      console.log(`🔄 Syncing ${image.fileName}...`)
      
      try {
        // Thử XML-RPC trước
        let uploadResult = await uploadImageViaXmlRpc(config, image.filePath, image.fileName)
        
        if (!uploadResult.success) {
          console.log(`⚠️ XML-RPC failed for ${image.fileName}, trying REST API...`)
          uploadResult = await uploadImageViaRestApi(config, image.filePath, image.fileName)
        }
        
        if (uploadResult.success) {
          synced++
          results.push({
            fileName: image.fileName,
            localPath: image.relativePath,
            wordpressUrl: uploadResult.fileUrl,
            mediaId: uploadResult.mediaId,
            status: 'success'
          })
          console.log(`✅ ${image.fileName} synced successfully`)
        } else {
          failed++
          results.push({
            fileName: image.fileName,
            localPath: image.relativePath,
            error: uploadResult.error,
            status: 'failed'
          })
          console.log(`❌ ${image.fileName} sync failed: ${uploadResult.error}`)
        }
      } catch (error: any) {
        failed++
        results.push({
          fileName: image.fileName,
          localPath: image.relativePath,
          error: error.message,
          status: 'failed'
        })
        console.log(`❌ ${image.fileName} sync error: ${error.message}`)
      }
    }

    return {
      success: true,
      message: `Sync completed: ${synced} successful, ${failed} failed`,
      synced,
      failed,
      total: images.length,
      results
    }

  } catch (error: any) {
    console.error('❌ Error syncing images:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting image sync to WordPress...')
    
    const result = await syncImagesToWordPress()
    
    console.log('✅ Image sync completed:', result)

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result
    })

  } catch (error: any) {
    console.error('❌ Error in image sync:', error)
    return NextResponse.json(
      { error: error.message || 'Lỗi khi sync hình ảnh' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting image sync status...')
    
    // Lấy cấu hình WordPress
    const config = getWordPressConfig()
    const isConnected = config?.isConnected || false
    
    // Lấy thống kê hình ảnh
    const images = getAllImages()
    const totalImages = images.length
    
    // Phân loại theo thư mục
    const imageStats = {}
    for (const image of images) {
      const dir = path.dirname(image.relativePath)
      if (!imageStats[dir]) {
        imageStats[dir] = {
          count: 0,
          totalSize: 0,
          files: []
        }
      }
      imageStats[dir].count++
      imageStats[dir].totalSize += image.size
      imageStats[dir].files.push({
        name: image.fileName,
        size: image.size,
        modified: image.modified
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        wordpress_connected: isConnected,
        total_images: totalImages,
        image_stats: imageStats,
        directories: Object.keys(imageStats)
      }
    })

  } catch (error: any) {
    console.error('❌ Error getting image sync status:', error)
    return NextResponse.json(
      { error: error.message || 'Lỗi khi lấy thống kê hình ảnh' },
      { status: 500 }
    )
  }
}
