import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getWordPressConfig } from '@/lib/wordpress-config'

const RECRUITMENT_FILE = path.join(process.cwd(), 'data', 'recruitment.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(RECRUITMENT_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Disabled local storage
const loadRecruitments = () => [] as any[]

const saveRecruitments = (_recruitments: any[]) => {}

// Sync recruitment to WordPress custom table via WP Admin AJAX (plugin)
async function syncToWordPress(recruitment: any) {
  try {
    const config = getWordPressConfig()
    if (!config || !config.siteUrl) {
      return { success: false, message: 'Missing WordPress site URL' }
    }

    const apiKey = (config as any).recruitmentApiKey || process.env.WP_RECRUITMENT_API_KEY || 'lta_recruitment_2024'
    const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`

    const formData = new FormData()
    // Only save to custom table, do NOT create WP post to avoid mixing with news
    formData.append('action', 'lta_sync_recruitment')
    formData.append('api_key', apiKey)
    formData.append('recruitment[id]', recruitment.id)
    formData.append('recruitment[title]', recruitment.title || '')
    formData.append('recruitment[position]', recruitment.position || '')
    formData.append('recruitment[location]', recruitment.location || '')
    formData.append('recruitment[salary]', recruitment.salary || '')
    formData.append('recruitment[type]', recruitment.type || 'full-time')
    formData.append('recruitment[status]', recruitment.status || 'draft')
    formData.append('recruitment[description]', recruitment.description || '')
    formData.append('recruitment[experience]', recruitment.experience || '')
    formData.append('recruitment[education]', recruitment.education || '')
    formData.append('recruitment[deadline]', recruitment.deadline || '')
    formData.append('recruitment[createdAt]', recruitment.createdAt || new Date().toISOString())
    formData.append('recruitment[updatedAt]', recruitment.updatedAt || new Date().toISOString())
    ;(recruitment.requirements || []).forEach((req: string) => {
      if (req && req.trim()) formData.append('recruitment[requirements][]', req)
    })
    ;(recruitment.benefits || []).forEach((b: string) => {
      if (b && b.trim()) formData.append('recruitment[benefits][]', b)
    })

    const response = await fetch(ajaxUrl, {
      method: 'POST',
      body: formData
    })

    const text = await response.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = { success: false, message: text } }

    if (!response.ok || !json.success) {
      return { success: false, message: json.message || `HTTP ${response.status}` }
    }

    return { success: true, message: json.message || 'Synced', postId: json.post_id, dbId: json.db_id }
  } catch (error) {
    return { success: false, message: (error as Error).message }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = getWordPressConfig()
    if (!config?.siteUrl) {
      return NextResponse.json({ success: false, error: 'Missing WordPress site URL' }, { status: 500 })
    }
    const apiKey = (config as any).recruitmentApiKey || process.env.WP_RECRUITMENT_API_KEY || 'lta_recruitment_2024'
    const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`

    const form = new FormData()
    form.append('action', 'lta_get_recruitment')
    form.append('api_key', apiKey)
    const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = { success: false, data: [] } }

    const list = json?.data || []
    const normalizeWpDate = (val: any) => {
      const s = String(val || '').trim()
      if (!s) return ''
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
        return s.replace(' ', 'T')
      }
      return s
    }
    const find = list
      .map((it: any) => ({
        ...it,
        createdAt: normalizeWpDate(it.createdAt || it.created_at || it.created_at?.toString?.()),
        updatedAt: normalizeWpDate(it.updatedAt || it.updated_at || it.updated_at?.toString?.() || it.createdAt)
      }))
      .sort((a: any, b: any) => {
        const ta = Date.parse(a.createdAt || a.updatedAt || '') || 0
        const tb = Date.parse(b.createdAt || b.updatedAt || '') || 0
        return tb - ta
      })
      .find((r: any) => String(r.id) === String(params.id))
    const toArray = (val: any) => {
      if (Array.isArray(val)) return val
      if (typeof val === 'string') {
        try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) return parsed } catch {}
        const matches = [...val.matchAll(/"([^"\\]*)"/g)].map(m => m[1]).filter(Boolean)
        return matches
      }
      return []
    }
    const recruitment = find ? {
      ...find,
      requirements: toArray(find.requirements),
      benefits: toArray(find.benefits)
    } : null
    if (!recruitment) {
      return NextResponse.json({ success: false, error: 'Recruitment not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, recruitment })
  } catch (error) {
    console.error('Error in GET /api/recruitment/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load recruitment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title?.trim() || !body.position?.trim() || !body.location?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title, position, and location are required' },
        { status: 400 }
      )
    }

    const updatedRecruitment = {
      id: params.id,
      title: body.title.trim(),
      position: body.position.trim(),
      location: body.location.trim(),
      salary: body.salary?.trim() || '',
      type: body.type || 'full-time',
      status: body.status || 'draft',
      description: body.description?.trim() || '',
      requirements: Array.isArray(body.requirements) ? body.requirements.filter((r: string) => r.trim()) : [],
      benefits: Array.isArray(body.benefits) ? body.benefits.filter((b: string) => b.trim()) : [],
      experience: body.experience?.trim() || '',
      education: body.education?.trim() || '',
      deadline: body.deadline || null,
      updatedAt: new Date().toISOString()
    }

    // Sync to WordPress
    const wpSyncResult = await syncToWordPress(updatedRecruitment)
    
    if (wpSyncResult.success) {
      console.log('WordPress sync successful:', wpSyncResult.message)
    } else {
      console.warn('WordPress sync failed:', wpSyncResult.message)
    }

    return NextResponse.json({ 
      success: true, 
      recruitment: updatedRecruitment,
      wordpressSync: wpSyncResult,
      message: 'Recruitment updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/recruitment/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update recruitment' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    // Load existing recruitment from WordPress to avoid wiping fields when partial update (e.g. status toggle)
    const config = getWordPressConfig()
    let existing: any = null
    if (config?.siteUrl) {
      try {
        const apiKey = (config as any).recruitmentApiKey || process.env.WP_RECRUITMENT_API_KEY || 'lta_recruitment_2024'
        const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`
        const form = new FormData()
        form.append('action', 'lta_get_recruitment')
        form.append('api_key', apiKey)
        const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
        const text = await resp.text()
        let json: any
        try { json = JSON.parse(text) } catch { json = { success: false, data: [] } }
        const list = json?.data || []
        const normalizeWpDate = (val: any) => {
          const s = String(val || '').trim()
          if (!s) return ''
          if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
            return s.replace(' ', 'T')
          }
          return s
        }
        const toArray = (val: any) => {
          if (Array.isArray(val)) return val
          if (typeof val === 'string') {
            try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) return parsed } catch {}
            const matches = [...val.matchAll(/"([^"\\]*)"/g)].map(m => m[1]).filter(Boolean)
            return matches
          }
          return []
        }
        const found = list.find((r: any) => String(r.id) === String(params.id))
        if (found) {
          existing = {
            ...found,
            createdAt: normalizeWpDate(found.createdAt || found.created_at || found.created_at?.toString?.()),
            updatedAt: normalizeWpDate(found.updatedAt || found.updated_at || found.updated_at?.toString?.() || found.createdAt),
            requirements: toArray(found.requirements),
            benefits: toArray(found.benefits)
          }
        }
      } catch {}
    }

    // Only update provided fields, preserving existing ones
    const updatedRecruitment = {
      ...(existing || {}),
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Sync to WordPress
    const wpSyncResult = await syncToWordPress(updatedRecruitment)
    
    if (wpSyncResult.success) {
      console.log('WordPress sync successful:', wpSyncResult.message)
    } else {
      console.warn('WordPress sync failed:', wpSyncResult.message)
    }

    return NextResponse.json({ 
      success: true, 
      recruitment: updatedRecruitment,
      wordpressSync: wpSyncResult,
      message: 'Recruitment updated successfully' 
    })
  } catch (error) {
    console.error('Error in PATCH /api/recruitment/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update recruitment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = getWordPressConfig()
    if (!config?.siteUrl) {
      return NextResponse.json({ success: false, error: 'Missing WordPress site URL' }, { status: 500 })
    }
    const apiKey = (config as any).recruitmentApiKey || process.env.WP_RECRUITMENT_API_KEY || 'lta_recruitment_2024'
    const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`

    const form = new FormData()
    form.append('action', 'lta_delete_recruitment')
    form.append('api_key', apiKey)
    form.append('id', params.id)
    const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
    const text = await resp.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = { success: false } }
    if (!resp.ok || !json.success) {
      return NextResponse.json({ success: false, error: json.message || 'Failed to delete' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Recruitment deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/recruitment/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete recruitment' },
      { status: 500 }
    )
  }
}
