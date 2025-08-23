import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { decryptSensitiveData } from '@/lib/security'
import fs from 'fs'
import path from 'path'

const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

// Cache decrypted API key để tăng tốc
let cachedApiKey: string | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 phút

const getPluginConfig = () => {
  try {
    const now = Date.now()
    
    // Return cached API key nếu còn hạn
    if (cachedApiKey && (now - cacheTimestamp) < CACHE_DURATION) {
      return { apiKey: cachedApiKey }
    }
    
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt API key if needed và cache
      if (config.apiKey && String(config.apiKey).startsWith('ENCRYPTED:')) {
        cachedApiKey = decryptSensitiveData(String(config.apiKey).replace('ENCRYPTED:', ''))
        cacheTimestamp = now
        return { apiKey: cachedApiKey }
      } else if (config.apiKey) {
        cachedApiKey = config.apiKey
        cacheTimestamp = now
        return { apiKey: cachedApiKey }
      }
      
      return config
    }
    return null
  } catch {
    return null
  }
}

export async function PUT(request: NextRequest) {
  try {
    const wordpressConfig = getWordPressConfig()
    const pluginConfig = getPluginConfig()

    if (!wordpressConfig?.siteUrl) {
      return NextResponse.json({ error: 'WordPress chưa được cấu hình' }, { status: 400 })
    }
    if (!pluginConfig?.apiKey) {
      return NextResponse.json({ error: 'Plugin chưa được cấu hình API key' }, { status: 400 })
    }

    const { siteUrl } = wordpressConfig
    const { apiKey } = pluginConfig
    const body = await request.json()

    // Yêu cầu phải có postId (WordPress ID)
    const postId = body.wordpressId || body.id || body.postId
    if (!postId) {
      return NextResponse.json({ error: 'Thiếu wordpressId để cập nhật' }, { status: 400 })
    }

    const ajaxUrl = `${siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_update`
    const payload: any = {
      apiKey,
      id: Number(String(postId).replace('wp_', '')),
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || '',
      status: body.status || 'draft',
      category: body.category || body.categories || '',
      tags: body.tags || '',
      // Cho phép bỏ qua cập nhật ảnh nếu frontend không thay đổi
      featuredImage: body.__skipFeaturedImage ? undefined : (body.featuredImage || body.image || ''),
      additionalImages: body.__skipAdditionalImages ? undefined : (body.additionalImages || []),
      slug: body.slug || ''
    }

    let response: Response | undefined
    let lastError: any
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🚀 Updating WordPress post (attempt ${attempt}/2)...`)
        response = await fetch(ajaxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000)
        })
        break
      } catch (e: any) {
        lastError = e
        if (attempt < 2) await new Promise(r => setTimeout(r, 500))
      }
    }

    if (!response) {
      return NextResponse.json({ error: 'Không thể cập nhật qua plugin', details: lastError?.message || 'Unknown' }, { status: 502 })
    }

    const text = await response.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = null }
    if (!response.ok || !json?.success) {
      return NextResponse.json({ error: json?.error || 'Plugin cập nhật thất bại', raw: text }, { status: 502 })
    }

    return NextResponse.json({ success: true, data: json.data || { id: json.postId, link: json.link } })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi cập nhật qua plugin' }, { status: 500 })
  }
}


