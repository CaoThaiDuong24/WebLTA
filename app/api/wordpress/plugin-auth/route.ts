import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { encryptSensitiveData, decryptSensitiveData } from '@/lib/security'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')
const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

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

// Lấy cấu hình plugin (luôn decrypt để hiển thị plain text)
const getPluginConfig = () => {
  try {
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      const cfg = JSON.parse(configData)
      // Luôn decrypt apiKey để hiển thị plain text trên UI
      if (typeof cfg.apiKey === 'string' && cfg.apiKey.startsWith('ENCRYPTED:')) {
        try { 
          cfg.apiKey = decryptSensitiveData(cfg.apiKey.replace('ENCRYPTED:', '')) 
        } catch (error) {
          console.error('Error decrypting API key:', error)
          // Nếu decrypt fail, tạo key mới
          cfg.apiKey = 'lta-plugin-' + Math.random().toString(36).substr(2, 16)
        }
      }
      return cfg
    }
    return {
      apiKey: 'lta-plugin-' + Math.random().toString(36).substr(2, 16),
      webhookUrl: '',
      autoSync: true,
      syncDirection: 'bidirectional' // 'wordpress-to-lta', 'lta-to-wordpress', 'bidirectional'
    }
  } catch (error) {
    console.error('Error loading plugin config:', error)
    return null
  }
}

// Lưu cấu hình plugin
const savePluginConfig = (config: any) => {
  try {
    const dataDir = path.dirname(PLUGIN_CONFIG_FILE_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    // Encrypt apiKey before saving
    const toSave = { ...config }
    if (typeof toSave.apiKey === 'string' && !toSave.apiKey.startsWith('ENCRYPTED:')) {
      toSave.apiKey = `ENCRYPTED:${encryptSensitiveData(toSave.apiKey)}`
    }
    fs.writeFileSync(PLUGIN_CONFIG_FILE_PATH, JSON.stringify(toSave, null, 2))
  } catch (error) {
    console.error('Error saving plugin config:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Plugin Auth API - GET request')
    
    const pluginConfig = getPluginConfig()
    const wordpressConfig = getWordPressConfig()
    
    // API key đã được decrypt trong getPluginConfig(), luôn hiển thị plain text
    return NextResponse.json({
      success: true,
      plugin: {
        apiKey: pluginConfig.apiKey, // Plain text cho UI
        webhookUrl: pluginConfig.webhookUrl,
        autoSync: pluginConfig.autoSync,
        syncDirection: pluginConfig.syncDirection
      },
      wordpress: wordpressConfig ? {
        siteUrl: wordpressConfig.siteUrl,
        username: wordpressConfig.username,
        isConnected: wordpressConfig.isConnected
      } : null
    })
  } catch (error) {
    console.error('Plugin Auth GET error:', error)
    return NextResponse.json(
      { error: `Lỗi khi lấy cấu hình plugin: ${error}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Plugin Auth API - POST request')
    const body = await request.json()
    
    const { action, data } = body
    
    switch (action) {
      case 'generate_api_key':
        return handleGenerateApiKey()
        
      case 'update_config':
        return handleUpdateConfig(data)
        
      case 'test_connection':
        return handleTestConnection(data)
        
      case 'sync_from_wordpress':
        return handleSyncFromWordPress(data)
        
      case 'webhook_received':
        return handleWebhookReceived(data)
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Plugin Auth POST error:', error)
    return NextResponse.json(
      { error: `Lỗi khi xử lý yêu cầu plugin: ${error}` },
      { status: 500 }
    )
  }
}

// Tạo API key mới
async function handleGenerateApiKey() {
  try {
    const pluginConfig = getPluginConfig()
    // Tạo API key ngắn gọn, dễ đọc và copy
    pluginConfig.apiKey = 'lta-plugin-' + Math.random().toString(36).substr(2, 16)
    savePluginConfig(pluginConfig)
    
    return NextResponse.json({
      success: true,
      apiKey: pluginConfig.apiKey,
      message: 'API key đã được tạo thành công'
    })
  } catch (error) {
    console.error('Error generating API key:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo API key' },
      { status: 500 }
    )
  }
}

// Cập nhật cấu hình plugin
async function handleUpdateConfig(data: any) {
  try {
    const pluginConfig = getPluginConfig()
    
    if (data.webhookUrl !== undefined) {
      pluginConfig.webhookUrl = data.webhookUrl
    }
    
    if (data.autoSync !== undefined) {
      pluginConfig.autoSync = data.autoSync
    }
    
    if (data.syncDirection !== undefined) {
      pluginConfig.syncDirection = data.syncDirection
    }
    
    savePluginConfig(pluginConfig)
    
    return NextResponse.json({
      success: true,
      config: pluginConfig,
      message: 'Cấu hình đã được cập nhật'
    })
  } catch (error) {
    console.error('Error updating plugin config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật cấu hình' },
      { status: 500 }
    )
  }
}

// Test kết nối với WordPress
async function handleTestConnection(data: any) {
  try {
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình' },
        { status: 400 }
      )
    }
    
    const { siteUrl, username, applicationPassword } = wordpressConfig
    
    // Test REST API connection
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Kết nối WordPress thành công',
        method: 'rest-api'
      })
    } else {
      // Test plugin endpoint
      const pluginResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/lta-news-sync/v1/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (pluginResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Kết nối plugin thành công',
          method: 'plugin-api'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Không thể kết nối với WordPress',
          details: {
            restApiStatus: response.status,
            pluginApiStatus: pluginResponse.status
          }
        }, { status: 503 })
      }
    }
  } catch (error) {
    console.error('Error testing connection:', error)
    return NextResponse.json(
      { error: `Lỗi khi test kết nối: ${error}` },
      { status: 500 }
    )
  }
}

// Đồng bộ từ WordPress
async function handleSyncFromWordPress(data: any) {
  try {
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình' },
        { status: 400 }
      )
    }
    
    const { siteUrl } = wordpressConfig
    const pluginConfig = getPluginConfig()
    
    // Lấy posts từ WordPress plugin API
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/lta-news-sync/v1/posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pluginConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Không thể lấy posts từ WordPress' },
        { status: 500 }
      )
    }
    
    const posts = await response.json()
    let syncedCount = 0
    let errors: string[] = []
    
    // Đồng bộ từng post
    for (const post of posts) {
      try {
        const newsData = {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          status: post.status === 'publish' ? 'published' : 'draft',
          slug: post.slug,
          author: 'WordPress',
          createdAt: post.date,
          updatedAt: post.modified,
          wordpressId: post.id,
          syncedFromWordPress: true,
          lastSyncDate: new Date().toISOString()
        }
        
        // Lưu vào local database
        const localResponse = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newsData),
        })
        
        if (localResponse.ok) {
          syncedCount++
        } else {
          errors.push(`Failed to sync post: ${post.title}`)
        }
      } catch (error) {
        errors.push(`Error syncing post ${post.title}: ${error}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Đồng bộ hoàn tất: ${syncedCount} thành công, ${errors.length} lỗi`,
      syncedCount,
      errorCount: errors.length,
      errors
    })
  } catch (error) {
    console.error('Error syncing from WordPress:', error)
    return NextResponse.json(
      { error: `Lỗi khi đồng bộ từ WordPress: ${error}` },
      { status: 500 }
    )
  }
}

// Xử lý webhook từ WordPress
async function handleWebhookReceived(data: any) {
  try {
    console.log('📥 Webhook received from WordPress:', data)
    
    const { action, post } = data
    
    if (action === 'post_created' || action === 'post_updated') {
      // Đồng bộ post từ WordPress về LTA
      const newsData = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        status: post.status === 'publish' ? 'published' : 'draft',
        slug: post.slug,
        author: 'WordPress',
        createdAt: post.date,
        updatedAt: post.modified,
        wordpressId: post.id,
        syncedFromWordPress: true,
        lastSyncDate: new Date().toISOString()
      }
      
      // Lưu vào local database
      const localResponse = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      })
      
      if (localResponse.ok) {
        console.log('✅ Post synced from WordPress:', post.title)
        return NextResponse.json({
          success: true,
          message: 'Post synced successfully'
        })
      } else {
        console.error('❌ Failed to sync post from WordPress:', post.title)
        return NextResponse.json(
          { error: 'Failed to sync post' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed'
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: `Lỗi khi xử lý webhook: ${error}` },
      { status: 500 }
    )
  }
}
