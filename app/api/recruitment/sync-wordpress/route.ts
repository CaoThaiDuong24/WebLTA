import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getWordPressConfig } from '@/lib/wordpress-config'

const RECRUITMENT_FILE = path.join(process.cwd(), 'data', 'recruitment.json')

// Load recruitments from file
const loadRecruitments = () => {
  if (!fs.existsSync(RECRUITMENT_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(RECRUITMENT_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading recruitments:', error)
    return []
  }
}

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
    // Only save to custom table, do NOT create WP post
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'sync-all') {
      const recruitments = loadRecruitments()
      const results = []

      for (const recruitment of recruitments) {
        console.log(`Syncing recruitment: ${recruitment.title}`)
        const syncResult = await syncToWordPress(recruitment)
        results.push({
          id: recruitment.id,
          title: recruitment.title,
          ...syncResult
        })
      }

      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length

      return NextResponse.json({
        success: true,
        message: `Sync completed. ${successCount} successful, ${failureCount} failed.`,
        results,
        summary: {
          total: recruitments.length,
          successful: successCount,
          failed: failureCount
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "sync-all" to sync all recruitments.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/recruitment/sync-wordpress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync recruitments to WordPress' },
      { status: 500 }
    )
  }
}
