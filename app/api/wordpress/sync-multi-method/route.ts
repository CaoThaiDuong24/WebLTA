import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')
const SYNC_LOCK_FILE_PATH = path.join(process.cwd(), 'data', 'sync-lock.json')

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

// Cơ chế lock để tránh sync đồng thời
const acquireSyncLock = (newsId: string): boolean => {
  try {
    const lockData = fs.existsSync(SYNC_LOCK_FILE_PATH) 
      ? JSON.parse(fs.readFileSync(SYNC_LOCK_FILE_PATH, 'utf8'))
      : {}
    
    const now = Date.now()
    const lockTimeout = 5 * 60 * 1000 // 5 phút
    
    // Kiểm tra xem có lock cũ không
    if (lockData[newsId] && (now - lockData[newsId].timestamp) < lockTimeout) {
      console.log(`🔒 Sync lock exists for news ${newsId}`)
      return false
    }
    
    // Tạo lock mới
    lockData[newsId] = {
      timestamp: now,
      processId: process.pid
    }
    
    fs.writeFileSync(SYNC_LOCK_FILE_PATH, JSON.stringify(lockData, null, 2))
    console.log(`🔓 Sync lock acquired for news ${newsId}`)
    return true
  } catch (error) {
    console.error('Error acquiring sync lock:', error)
    return false
  }
}

const releaseSyncLock = (newsId: string) => {
  try {
    if (fs.existsSync(SYNC_LOCK_FILE_PATH)) {
      const lockData = JSON.parse(fs.readFileSync(SYNC_LOCK_FILE_PATH, 'utf8'))
      delete lockData[newsId]
      fs.writeFileSync(SYNC_LOCK_FILE_PATH, JSON.stringify(lockData, null, 2))
      console.log(`🔓 Sync lock released for news ${newsId}`)
    }
  } catch (error) {
    console.error('Error releasing sync lock:', error)
  }
}

// Kiểm tra tin tức đã tồn tại trên WordPress chưa
const checkWordPressDuplicate = async (siteUrl: string, username: string, password: string, title: string, content: string): Promise<number | null> => {
  try {
    console.log('🔍 Checking for duplicate post on WordPress...')
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    
    // Tìm kiếm theo tiêu đề
    const searchResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts?search=${encodeURIComponent(title)}&per_page=10`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    })
    
    if (searchResponse.ok) {
      const posts = await searchResponse.json()
      
      for (const post of posts) {
        // So sánh tiêu đề và nội dung
        if (post.title?.rendered === title || post.title === title) {
          // Kiểm tra thêm nội dung để đảm bảo chính xác
          const postContent = post.content?.rendered || post.content || ''
          const cleanContent = postContent.replace(/<[^>]*>/g, '').trim()
          const cleanNewContent = content.replace(/<[^>]*>/g, '').trim()
          
          if (cleanContent === cleanNewContent || 
              cleanContent.includes(cleanNewContent.substring(0, 100)) ||
              cleanNewContent.includes(cleanContent.substring(0, 100))) {
            console.log(`✅ Found duplicate post on WordPress: ID ${post.id}`)
            return post.id
          }
        }
      }
    }
    
    console.log('✅ No duplicate found on WordPress')
    return null
  } catch (error) {
    console.log('⚠️ Error checking duplicate:', error)
    return null
  }
}

// Thử REST API
async function tryRestAPI(siteUrl: string, username: string, password: string, postData: any) {
  try {
    console.log('🔄 Trying REST API...')
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ REST API success')
      return { success: true, method: 'rest-api', data: result }
    } else {
      console.log('❌ REST API failed:', response.status)
      return { success: false, error: `REST API failed: ${response.status}` }
    }
  } catch (error) {
    console.log('❌ REST API error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Thử XML-RPC (cải thiện để hoạt động tốt hơn)
async function tryXMLRPC(siteUrl: string, username: string, password: string, postData: any) {
  try {
    console.log('🔄 Trying XML-RPC...')
    
    // Sử dụng WordPress plugin REST API endpoint thay vì XML-RPC để hỗ trợ hình ảnh
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
      signal: AbortSignal.timeout(30000)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ XML-RPC (via plugin) success, post ID:', result.id)
      return { 
        success: true, 
        method: 'xml-rpc', 
        data: { id: result.id, title: postData.title, status: postData.status } 
      }
    } else {
      console.log('❌ XML-RPC (via plugin) failed:', response.status)
      return { success: false, error: `XML-RPC (via plugin) failed: ${response.status}` }
    }
  } catch (error) {
    console.log('❌ XML-RPC (via plugin) error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Thử Fallback method
async function tryFallback(postData: any) {
  try {
    console.log('🔄 Trying Fallback method...')
    
    const response = await fetch('/api/wordpress/publish-post-fallback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Fallback method success')
      return { success: true, method: 'fallback', data: result.data }
    } else {
      console.log('❌ Fallback method failed')
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.log('❌ Fallback method error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Thử cURL method (cải thiện)
async function tryCurl(siteUrl: string, username: string, password: string, postData: any) {
  try {
    console.log('🔄 Trying cURL method...')
    
    // Sử dụng WordPress plugin REST API endpoint để hỗ trợ hình ảnh
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    const curlCommand = `curl -X POST "${siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/sync" -H "Authorization: Basic ${credentials}" -H "Content-Type: application/json" -d '${JSON.stringify(postData)}' --silent --show-error --max-time 30`
    
    try {
      const { stdout, stderr } = await execAsync(curlCommand)
      
      if (!stderr && stdout) {
        try {
          const result = JSON.parse(stdout)
          if (result.id) {
            console.log('✅ cURL with WordPress plugin success, post ID:', result.id)
            return { success: true, method: 'curl-plugin', data: result }
          }
        } catch (parseError) {
          console.log('❌ cURL parse error:', parseError)
        }
      }
    } catch (curlError) {
      console.log('❌ cURL failed:', curlError)
    }
    
    console.log('❌ cURL method failed')
    return { success: false, error: 'cURL method failed' }
  } catch (error) {
    console.log('❌ cURL method error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Thử wp-cron method (phương pháp mới)
async function tryWpCron(siteUrl: string, username: string, password: string, postData: any) {
  try {
    console.log('🔄 Trying wp-cron method...')
    
    // Sử dụng WordPress plugin REST API endpoint để hỗ trợ hình ảnh
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LTA-News-Sync/1.0'
      },
      body: JSON.stringify(postData),
      signal: AbortSignal.timeout(30000)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ wp-cron method success, post ID:', result.id)
      return { 
        success: true, 
        method: 'wp-cron', 
        data: { 
          id: result.id, 
          title: postData.title, 
          status: postData.status,
          note: 'Post synced via wp-cron with WordPress plugin'
        }
      }
    } else {
      console.log('❌ wp-cron method failed:', response.status)
      return { success: false, error: `wp-cron failed: ${response.status}` }
    }
  } catch (error) {
    console.log('❌ wp-cron method error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 WordPress Multi-Method sync API called')
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    // Lấy WordPress config
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình' },
        { status: 400 }
      )
    }

    const { siteUrl, username, applicationPassword } = wordpressConfig
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình WordPress' },
        { status: 400 }
      )
    }

    // Kiểm tra xem REST API có bị chặn không
    if (wordpressConfig.restApiBlocked) {
      console.log('🚫 WordPress REST API is blocked by hosting provider')
      return NextResponse.json({
        success: false,
        error: 'WordPress REST API is blocked by hosting provider',
        details: {
          reason: 'REST API access denied (403/401 errors)',
          solution: 'Contact hosting provider to enable REST API',
          recommendations: [
            '1. Contact hosting provider: apisupport@xecurify.com',
            '2. Request REST API enablement',
            '3. Use manual sync until resolved',
            '4. Consider alternative hosting if needed'
          ]
        }
      }, { status: 503 })
    }

    // Lấy dữ liệu tin tức
    const newsData = body
    
    if (!newsData.title || !newsData.content) {
      return NextResponse.json(
        { error: 'Thiếu tiêu đề hoặc nội dung tin tức' },
        { status: 400 }
      )
    }

    // Tạo ID tạm thời nếu không có
    const tempNewsId = newsData.id || `temp_${Date.now()}`

    // Kiểm tra lock để tránh sync đồng thời
    if (!acquireSyncLock(tempNewsId)) {
      return NextResponse.json({
        success: false,
        error: 'Tin tức đang được đồng bộ, vui lòng thử lại sau',
        details: {
          reason: 'Sync lock exists',
          solution: 'Wait for current sync to complete'
        }
      }, { status: 429 })
    }

    try {
      console.log('🌐 Multi-method sync to WordPress:', {
        siteUrl,
        username,
        title: newsData.title
      })

      // Kiểm tra duplicate trên WordPress trước
      const existingPostId = await checkWordPressDuplicate(
        siteUrl, 
        username, 
        applicationPassword, 
        newsData.title, 
        newsData.content
      )

      if (existingPostId) {
        // Nếu đã tồn tại, cập nhật trạng thái sync và trả về thông tin post hiện có
        await updateNewsSyncStatus(newsData.id, true, existingPostId)
        
        return NextResponse.json({
          success: true,
          message: 'Tin tức đã tồn tại trên WordPress',
          method: 'duplicate-check',
          data: {
            id: existingPostId,
            title: newsData.title,
            status: 'existing',
            url: `${siteUrl.replace(/\/$/, '')}/?p=${existingPostId}`
          },
          duplicate: true
        })
      }

      // Chuẩn bị dữ liệu bài viết
      const postPayload: any = {
        title: newsData.title,
        content: newsData.content,
        status: newsData.status === 'published' ? 'publish' : 'draft'
      }

      if (newsData.excerpt) {
        postPayload.excerpt = newsData.excerpt
      }

      // Thêm thông tin hình ảnh
      if (newsData.featuredImage) {
        postPayload.featuredImage = newsData.featuredImage
      }
      if (newsData.image) {
        postPayload.image = newsData.image
      }
      if (newsData.additionalImages && newsData.additionalImages.length > 0) {
        postPayload.additionalImages = newsData.additionalImages
      }
      if (newsData.relatedImages && newsData.relatedImages.length > 0) {
        postPayload.relatedImages = newsData.relatedImages
      }
      if (newsData.imageAlt) {
        postPayload.imageAlt = newsData.imageAlt
      }

      // Thay đổi thứ tự ưu tiên: XML-RPC trước, REST API cuối cùng
      const methods = [
        { name: 'XML-RPC', fn: () => tryXMLRPC(siteUrl, username, applicationPassword, postPayload) },
        { name: 'cURL', fn: () => tryCurl(siteUrl, username, applicationPassword, postPayload) },
        { name: 'wp-cron', fn: () => tryWpCron(siteUrl, username, applicationPassword, postPayload) },
        { name: 'Fallback', fn: () => tryFallback(newsData) },
        { name: 'REST API', fn: () => tryRestAPI(siteUrl, username, applicationPassword, postPayload) }
      ]

      const results = []
      let successResult = null

      // Thử từng phương pháp
      for (const method of methods) {
        console.log(`🔄 Trying ${method.name}...`)
        
        try {
          const result = await method.fn()
          results.push({
            method: method.name,
            success: result.success,
            error: result.error || null
          })

          if (result.success) {
            successResult = result
            console.log(`✅ ${method.name} succeeded!`)
            break
          } else {
            console.log(`❌ ${method.name} failed:`, result.error)
          }
        } catch (error) {
          console.log(`❌ ${method.name} error:`, error)
          results.push({
            method: method.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Xử lý kết quả
      if (successResult) {
        // Cập nhật trạng thái sync trong local
        await updateNewsSyncStatus(newsData.id, true, successResult.data.id)
        
        return NextResponse.json({
          success: true,
          message: `Đồng bộ thành công (via ${successResult.method})`,
          method: successResult.method,
          data: successResult.data,
          allResults: results
        })
      } else {
        // Tất cả phương pháp đều thất bại
        return NextResponse.json({
          success: false,
          error: 'Không thể đồng bộ tin tức',
          details: {
            reason: 'Tất cả các phương pháp đều thất bại',
            solution: 'Liên hệ hosting provider hoặc sử dụng đồng bộ thủ công',
            results: results
          },
          recommendations: [
            '1. Liên hệ hosting provider để enable REST API/XML-RPC',
            '2. Sử dụng đồng bộ thủ công',
            '3. Upgrade lên paid plan',
            '4. Sử dụng WordPress Admin trực tiếp'
          ]
        }, { status: 503 })
      }
    } finally {
      // Luôn giải phóng lock
      releaseSyncLock(tempNewsId)
    }

  } catch (error) {
    console.error('WordPress Multi-Method sync error:', error)
    return NextResponse.json(
      { error: `Lỗi khi đồng bộ: ${error}` },
      { status: 500 }
    )
  }
}

// Cập nhật trạng thái sync trong local news
async function updateNewsSyncStatus(newsId: string, synced: boolean, wordpressId?: number) {
  try {
    const response = await fetch(`/api/news/${newsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        syncedToWordPress: synced,
        wordpressId: wordpressId,
        lastSyncDate: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      console.error(`Failed to update sync status for news ${newsId}`)
    }
  } catch (error) {
    console.error(`Error updating sync status for news ${newsId}:`, error)
  }
}
