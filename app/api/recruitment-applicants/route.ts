import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getWordPressConfig } from '@/lib/wordpress-config'

const APPLICANTS_FILE = path.join(process.cwd(), 'data', 'recruitment-applicants.json')

function ensureDataFile() {
  const dir = path.dirname(APPLICANTS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(APPLICANTS_FILE)) fs.writeFileSync(APPLICANTS_FILE, '[]', 'utf8')
}

function loadApplicants(): any[] {
  try {
    ensureDataFile()
    const raw = fs.readFileSync(APPLICANTS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveApplicants(applicants: any[]) {
  ensureDataFile()
  fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicants, null, 2), 'utf8')
}

const generateId = () => `${Date.now()}${Math.floor(100 + Math.random() * 900)}`

export async function GET() {
  try {
    const config = getWordPressConfig()
    if (config?.siteUrl) {
              const apiKey = 'lta_recruitment_2024'
      const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`
      const form = new FormData()
      form.append('action', 'lta_get_applicants')
      form.append('api_key', apiKey)
      const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
      const text = await resp.text()
      let json: any
      try { json = JSON.parse(text) } catch { json = { success: false, data: [] } }

      if (!resp.ok || !json?.success) {
        console.warn('WP lta_get_applicants failed:', { status: resp.status, text })
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to load from WordPress',
          details: text 
        }, { status: 500 })
      }

      const snakeItems = (json?.data || [])
      const itemsFromWp = snakeItems.map((it: any) => ({
        id: it.id,
        fullName: it.fullName ?? it.full_name ?? '',
        email: it.email ?? '',
        phone: it.phone ?? '',
        position: it.position ?? '',
        linkedinGithub: it.linkedinGithub ?? it.linkedin_github ?? '',
        aiUseCase: it.aiUseCase ?? it.ai_use_case ?? '',
        experience: it.experience ?? '',
        additionalRoles: Array.isArray(it.additional_roles) ? it.additional_roles : (Array.isArray(it.additionalRoles) ? it.additionalRoles : []),
        notes: it.notes ?? '',
        createdAt: it.createdAt ?? it.created_at ?? new Date().toISOString(),
        // Optional extra fields if plugin provides them
        address: it.address ?? it.address_line ?? '',
        city: it.city ?? '',
        dob: it.dob ?? it.date_of_birth ?? '',
        gender: it.gender ?? '',
        resumeUrl: it.resumeUrl ?? it.resume_url ?? it.cv_url ?? '',
        portfolioUrl: it.portfolioUrl ?? it.portfolio_url ?? '',
        source: it.source ?? it.apply_source ?? '',
        expectedSalary: it.expectedSalary ?? it.expected_salary ?? '',
        startDate: it.startDate ?? it.preferred_start_date ?? '',
      }))

      const sorted = itemsFromWp.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      return NextResponse.json({ success: true, applicants: sorted, total: sorted.length })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'WordPress not configured' 
    }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load applicants' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST Request Started ===')
    console.log('Content-Type:', request.headers.get('content-type'))
    
    let payload: any
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      console.log('Processing multipart/form-data')
      try {
        const form = await request.formData()
        console.log('FormData created successfully')
        
        payload = {
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
          cvFile: form.get('cvFile') as File | null,
        }
        console.log('Payload extracted:', { ...payload, cvFile: payload.cvFile ? 'File uploaded' : 'No file' })
      } catch (formError) {
        console.error('FormData processing error:', formError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to process form data',
          details: formError.message 
        }, { status: 400 })
      }
    } else {
      console.log('Processing JSON data')
      try {
        payload = await request.json()
        console.log('JSON payload:', payload)
      } catch (jsonError) {
        console.error('JSON processing error:', jsonError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to process JSON data',
          details: jsonError.message 
        }, { status: 400 })
      }
    }

    if (!payload.fullName?.trim() || !payload.email?.trim() || !payload.phone?.trim() || !payload.position?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Handle CV file upload (simplified)
    let cvUrl = ''
    if (payload.cvFile && payload.cvFile instanceof File) {
      console.log('Processing CV file:', payload.cvFile.name, payload.cvFile.size, 'bytes')
      try {
        // For now, just store the filename - we'll handle upload later
        cvUrl = `cv_${Date.now()}_${payload.cvFile.name}`
        console.log('CV URL generated:', cvUrl)
      } catch (error) {
        console.error('CV processing failed:', error)
        // Don't fail the entire request for CV upload issues
        cvUrl = 'upload_failed'
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
      resumeUrl: cvUrl,
      createdAt: new Date().toISOString()
    }
    console.log('Record created:', record)

    // Try sync to WordPress via plugin
    try {
      console.log('Getting WordPress config...')
      const config = getWordPressConfig()
      console.log('WordPress config:', config ? 'Found' : 'Not found')
      if (config?.siteUrl) {
        const apiKey = 'lta_recruitment_2024'
        const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`
        const form = new FormData()
        form.append('action', 'lta_submit_applicant')
        form.append('api_key', apiKey)
        // Send data in format WordPress plugin expects
        form.append('applicant[id]', record.id)
        form.append('applicant[fullName]', record.fullName || '')
        form.append('applicant[email]', record.email || '')
        form.append('applicant[phone]', record.phone || '')
        form.append('applicant[position]', record.position || '')
        form.append('applicant[linkedinGithub]', record.linkedinGithub || '')
        form.append('applicant[aiUseCase]', record.aiUseCase || '')
        form.append('applicant[experience]', record.experience || '')
        form.append('applicant[additionalRoles]', Array.isArray(record.additionalRoles) ? record.additionalRoles.join(', ') : '')
        form.append('applicant[notes]', record.notes || '')
        form.append('applicant[address]', record.address || '')
        form.append('applicant[city]', record.city || '')
        form.append('applicant[dob]', record.dob || '')
        form.append('applicant[gender]', record.gender || '')
        form.append('applicant[resumeUrl]', record.resumeUrl || '')
        form.append('applicant[portfolioUrl]', record.portfolioUrl || '')
        form.append('applicant[source]', record.source || '')
        form.append('applicant[expectedSalary]', record.expectedSalary || '')
        form.append('applicant[startDate]', record.startDate || '')
        form.append('applicant[createdAt]', record.createdAt || '')
        console.log('=== WordPress Request Debug ===')
        console.log('URL:', ajaxUrl)
        console.log('API Key:', apiKey)
        console.log('Record:', record)
        console.log('FormData entries:')
        for (let [key, value] of form.entries()) {
          console.log(`  ${key}: ${value}`)
        }
        
        const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
        const text = await resp.text()
        
        console.log('=== WordPress Response Debug ===')
        console.log('Status:', resp.status)
        console.log('Response text:', text)
        console.log('Response headers:', Object.fromEntries(resp.headers.entries()))
        
        let json: any
        try { 
          json = JSON.parse(text) 
          console.log('Parsed JSON:', json)
        } catch (e) { 
          json = { success: false, parseError: e.message }
          console.log('JSON parse error:', e.message)
        }
        
        if (!resp.ok || !json.success) {
          console.warn('❌ WordPress save FAILED:', { 
            status: resp.status, 
            text, 
            json,
            url: ajaxUrl,
            apiKey: apiKey
          })
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to save to WordPress',
            details: text 
          }, { status: 500 })
        } else {
          console.log('✅ WordPress save SUCCESS:', json)
        }
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'WordPress not configured' 
        }, { status: 500 })
      }
    } catch (error) {
      console.error('WordPress sync error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'WordPress sync failed',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, applicant: record, message: 'Application submitted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit application' }, { status: 500 })
  }
}


