import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { decryptSensitiveData } from '@/lib/security'
import fs from 'fs'
import path from 'path'

const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')

const getPluginConfig = () => {
  try {
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      const config = JSON.parse(configData)
      if (config.apiKey && String(config.apiKey).startsWith('ENCRYPTED:')) {
        config.apiKey = decryptSensitiveData(String(config.apiKey).replace('ENCRYPTED:', ''))
      }
      return config
    }
    return null
  } catch {
    return null
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const wordpressConfig = getWordPressConfig()
    const pluginConfig = getPluginConfig()

    if (!wordpressConfig?.siteUrl) {
      return NextResponse.json({ error: 'WordPress chưa được cấu hình' }, { status: 400 })
    }
    if (!pluginConfig?.apiKey) {
      return NextResponse.json({ error: 'Plugin chưa được cấu hình API key' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const postId = idParam ? Number(String(idParam).replace('wp_', '')) : undefined
    if (!postId) {
      return NextResponse.json({ error: 'Thiếu wordpressId để xóa' }, { status: 400 })
    }

    const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_delete`
    const payload = { apiKey: pluginConfig.apiKey, id: postId }

    let response: Response | undefined
    let lastError: any
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        response = await fetch(ajaxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20000)
        })
        break
      } catch (e: any) {
        lastError = e
        if (attempt < 2) await new Promise(r => setTimeout(r, 1000))
      }
    }

    if (!response) {
      return NextResponse.json({ error: 'Không thể xóa qua plugin', details: lastError?.message || 'Unknown' }, { status: 502 })
    }

    const text = await response.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = null }
    if (!response.ok || !json?.success) {
      return NextResponse.json({ error: json?.error || 'Plugin xóa thất bại', raw: text }, { status: 502 })
    }

    return NextResponse.json({ success: true, data: { id: postId } })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa qua plugin' }, { status: 500 })
  }
}


