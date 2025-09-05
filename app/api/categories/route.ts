import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { decryptSensitiveData } from '@/lib/security'

function getDecryptedWpAuth() {
  const config = getWordPressConfig()
  if (!config?.siteUrl || !config?.username || !config?.applicationPassword) {
    throw new Error('WordPress config không đầy đủ')
  }
  const username = config.username.startsWith('ENCRYPTED:')
    ? decryptSensitiveData(config.username.replace('ENCRYPTED:', ''))
    : config.username
  const password = config.applicationPassword.startsWith('ENCRYPTED:')
    ? decryptSensitiveData(config.applicationPassword.replace('ENCRYPTED:', ''))
    : config.applicationPassword
  const siteUrl = config.siteUrl.replace(/\/$/, '')
  return { siteUrl, username, password }
}

export async function GET(_request: NextRequest) {
  try {
    const { siteUrl, username, password } = getDecryptedWpAuth()
    const endpoint = `${siteUrl}/wp-json/lta/v1/categories`
    const resp = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      },
      signal: AbortSignal.timeout(30000)
    })
    const text = await resp.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!resp.ok) {
      return NextResponse.json({ error: 'Không thể lấy danh mục từ WordPress', details: data }, { status: resp.status })
    }
    // plugin có thể trả trực tiếp mảng categories hoặc { categories: [] }
    const categories = Array.isArray(data) ? data : (data.categories || [])
    return NextResponse.json({ success: true, categories })
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi khi lấy danh mục', details: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description } = body || {}
    if (!name) {
      return NextResponse.json({ error: 'Thiếu tên danh mục' }, { status: 400 })
    }
    const { siteUrl, username, password } = getDecryptedWpAuth()
    const endpoint = `${siteUrl}/wp-json/lta/v1/categories`
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      },
      body: JSON.stringify({ name, slug, description })
    })
    const text = await resp.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!resp.ok || data?.success === false) {
      return NextResponse.json({ error: 'Không thể tạo danh mục trên WordPress', details: data }, { status: 502 })
    }
    return NextResponse.json({ success: true, category: data.category || data })
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi khi tạo danh mục', details: error?.message || String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, description } = body || {}
    if (!id) {
      return NextResponse.json({ error: 'Thiếu id danh mục' }, { status: 400 })
    }
    const { siteUrl, username, password } = getDecryptedWpAuth()
    const endpoint = `${siteUrl}/wp-json/lta/v1/categories/${id}`
    const resp = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      },
      body: JSON.stringify({ name, slug, description })
    })
    const text = await resp.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!resp.ok || data?.success === false) {
      return NextResponse.json({ error: 'Không thể cập nhật danh mục trên WordPress', details: data }, { status: 502 })
    }
    return NextResponse.json({ success: true, category: data.category || data })
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi khi cập nhật danh mục', details: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Thiếu id danh mục' }, { status: 400 })
    }
    const { siteUrl, username, password } = getDecryptedWpAuth()
    const endpoint = `${siteUrl}/wp-json/lta/v1/categories/${id}`
    const resp = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      }
    })
    const text = await resp.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!resp.ok || data?.success === false) {
      return NextResponse.json({ error: 'Không thể xoá danh mục trên WordPress', details: data }, { status: 502 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi khi xoá danh mục', details: error?.message || String(error) }, { status: 500 })
  }
}


