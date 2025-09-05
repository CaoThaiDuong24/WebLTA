import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const wpId = body?.id
    if (!wpId) {
      return NextResponse.json({ error: 'Thiếu id bài viết WordPress' }, { status: 400 })
    }

    const config = getWordPressConfig()
    if (!config || !config.siteUrl || !config.username || !config.applicationPassword) {
      return NextResponse.json({ error: 'Chưa cấu hình WordPress đầy đủ' }, { status: 400 })
    }

    const siteUrl = String(config.siteUrl).replace(/\/$/, '')
    
    // Sử dụng WordPress REST API trực tiếp thay vì plugin
    const restUrl = `${siteUrl}/wp-json/wp/v2/posts/${wpId}`
    
    // Chuẩn bị dữ liệu để cập nhật
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.status !== undefined) updateData.status = body.status
    if (body.slug !== undefined) updateData.slug = body.slug
    
    // Headers cho authentication
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')}`
    }

    console.log(`🔄 Updating WordPress post ${wpId} with status: ${body.status}`)
    
    const resp = await fetch(restUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(updateData)
    })

    if (!resp.ok) {
      const errorText = await resp.text()
      console.error(`❌ WordPress REST API error: ${resp.status} - ${errorText}`)
      return NextResponse.json({ 
        error: `WordPress update failed: ${resp.status}`, 
        details: errorText 
      }, { status: 502 })
    }

    const result = await resp.json()
    console.log(`✅ WordPress post ${wpId} updated successfully`)
    
    return NextResponse.json({ success: true, data: result })
  } catch (e) {
    console.error('❌ Error in sync-multi-method:', e)
    return NextResponse.json({ error: 'Lỗi khi đồng bộ WordPress' }, { status: 500 })
  }
}
