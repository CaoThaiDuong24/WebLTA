import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'
import fs from 'fs'
import path from 'path'

const generateId = () => `${Date.now()}${Math.floor(100 + Math.random() * 900)}`

export async function POST(request: NextRequest) {
  console.log('=== SIMPLE RECRUITMENT API ===')
  try {
    console.log('Request received')
    console.log('Content-Type:', request.headers.get('content-type'))

    const form = await request.formData()
    console.log('FormData processed')

    const payload = {
      fullName: String(form.get('fullName') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      position: String(form.get('position') || ''),
      linkedinGithub: String(form.get('linkedinGithub') || ''),
      aiUseCase: String(form.get('aiUseCase') || ''),
      experience: String(form.get('experience') || ''),
      additionalRoles: (String(form.get('additionalRoles') || '') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      notes: String(form.get('notes') || ''),
      recruitmentTitle: String(form.get('recruitmentTitle') || ''),
      cvFile: form.get('cvFile') as File | null,
    }
    console.log('Data extracted:', { ...payload, cvFile: payload.cvFile ? 'File uploaded' : 'No file' })

    if (!payload.fullName?.trim() || !payload.email?.trim() || !payload.phone?.trim() || !payload.position?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Save CV file by uploading to WordPress
    let cvUrl = ''
    if (payload.cvFile && payload.cvFile instanceof File) {
      try {
        const config = getWordPressConfig()
        const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`
        const up = new FormData()
        up.append('action', 'lta_upload_cv')
        up.append('api_key', 'lta_recruitment_2024')
        up.append('cv', payload.cvFile)
        const upResp = await fetch(ajaxUrl, { method: 'POST', body: up })
        const upText = await upResp.text()
        let upJson: any
        try { upJson = JSON.parse(upText) } catch { upJson = null }
        if (upResp.ok && upJson?.success && upJson?.url) {
          cvUrl = upJson.url
          console.log('CV uploaded to WP:', cvUrl)
        } else {
          console.error('Upload CV to WP failed:', upText)
        }
      } catch (err) {
        console.error('CV upload failed:', err)
      }
    }

    const record = {
      id: generateId(),
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      position: payload.position,
      linkedinGithub: payload.linkedinGithub,
      aiUseCase: payload.aiUseCase,
      experience: payload.experience,
      additionalRoles: payload.additionalRoles,
      notes: payload.notes,
      recruitmentTitle: payload.recruitmentTitle,
      resumeUrl: cvUrl,
      createdAt: new Date().toISOString()
    }
    console.log('Record created:', record)

    const config = getWordPressConfig()
    if (!config?.siteUrl) {
      console.error('WordPress config not found.')
      return NextResponse.json({ success: false, error: 'WordPress not configured' }, { status: 500 })
    }

    const apiKey = 'lta_recruitment_2024'
    const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`
    const wpForm = new FormData()
    wpForm.append('action', 'lta_submit_applicant')
    wpForm.append('api_key', apiKey)

    Object.entries(record as any).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        wpForm.append(`applicant[${k}]`, v.join(', '))
      } else {
        wpForm.append(`applicant[${k}]`, String(v ?? ''))
      }
    })

    console.log('Sending to WordPress:', ajaxUrl)
    const resp = await fetch(ajaxUrl, { method: 'POST', body: wpForm })
    const text = await resp.text()
    console.log('WordPress response status:', resp.status)
    console.log('WordPress response text:', text)

    let json: any
    try {
      json = JSON.parse(text)
      console.log('Parsed JSON:', json)
    } catch (e: any) {
      json = { success: false, parseError: e.message }
      console.error('JSON parse error:', e.message)
    }

    if (!resp.ok || !json.success) {
      console.error('❌ WordPress save FAILED:', { status: resp.status, text, json })
      // Don't fail the entire request if WordPress fails, just log the error
      console.warn('WordPress save failed, but continuing with local save')
    } else {
      console.log('✅ WordPress save SUCCESS:', json)
    }

    // Also save to local admin LTA file for backup
    try {
      const APPLICANTS_FILE = path.join(process.cwd(), 'data', 'recruitment-applicants.json')
      const dataDir = path.dirname(APPLICANTS_FILE)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      let existingApplicants = []
      if (fs.existsSync(APPLICANTS_FILE)) {
        try {
          const raw = fs.readFileSync(APPLICANTS_FILE, 'utf8')
          existingApplicants = JSON.parse(raw)
        } catch (e) {
          console.warn('Failed to read existing applicants file:', e)
        }
      }
      
      existingApplicants.push(record)
      fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(existingApplicants, null, 2), 'utf8')
      console.log('✅ Saved to local admin LTA file')
    } catch (localError) {
      console.warn('Failed to save to local file:', localError)
      // Don't fail the request for local file issues
    }

    return NextResponse.json({ 
      success: true, 
      applicant: record, 
      message: 'Application submitted successfully',
      wordpressSaved: resp.ok && json.success,
      localSaved: true
    })

  } catch (error: any) {
    console.error('API processing error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
