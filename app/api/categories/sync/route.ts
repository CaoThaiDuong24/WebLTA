import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import { decryptSensitiveData } from '@/lib/security'

function getAuth() {
  const cfg = getWordPressConfig()
  if (!cfg?.siteUrl || !cfg?.username || !cfg?.applicationPassword) {
    throw new Error('Thiếu cấu hình WordPress')
  }
  const siteUrl = cfg.siteUrl.replace(/\/$/, '')
  const username = cfg.username.startsWith('ENCRYPTED:') ? decryptSensitiveData(cfg.username.replace('ENCRYPTED:', '')) : cfg.username
  const password = cfg.applicationPassword.startsWith('ENCRYPTED:') ? decryptSensitiveData(cfg.applicationPassword.replace('ENCRYPTED:', '')) : cfg.applicationPassword
  const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  return { siteUrl, auth }
}

export async function POST(_req: NextRequest) {
  try {
    const { siteUrl, auth } = getAuth()
    const resp = await fetch(`${siteUrl}/wp-json/lta/v1/categories/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({})
    })
    const text = await resp.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!resp.ok) {
      return NextResponse.json({ error: 'Sync thất bại', details: data }, { status: resp.status })
    }
    return NextResponse.json({ success: true, result: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Lỗi sync' }, { status: 500 })
  }
}


