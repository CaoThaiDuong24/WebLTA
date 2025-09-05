import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')?.trim()
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 })
    }

    const config = getWordPressConfig()
    if (!config?.siteUrl) {
      return NextResponse.json({ success: false, error: 'WordPress not configured' }, { status: 500 })
    }
    const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`

    const form = new FormData()
    form.append('action', 'lta_get_recruitment_title')
    form.append('api_key', 'lta_recruitment_2024')
    form.append('id', id)

    const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = null }
    if (!resp.ok || !json?.success) {
      return NextResponse.json({ success: false, error: 'Lookup failed', details: text }, { status: 502 })
    }

    return NextResponse.json({ success: true, id, title: json.data?.title || '', position: json.data?.position || '' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 })
  }
}
