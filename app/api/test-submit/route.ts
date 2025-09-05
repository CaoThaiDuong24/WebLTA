import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function POST() {
  try {
    const config = getWordPressConfig()
    if (!config?.siteUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'WordPress config not found' 
      })
    }

    const apiKey = 'lta_recruitment_2024'
    const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`
    
    // Test data
    const testRecord = {
      id: `test_${Date.now()}`,
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      position: 'developer',
      linkedinGithub: 'https://github.com/test',
      aiUseCase: 'Test AI use case',
      experience: '2',
      additionalRoles: ['frontend', 'backend'],
      notes: 'Test notes',
      createdAt: new Date().toISOString()
    }

    console.log('=== Testing WordPress Submit ===')
    console.log('Test record:', testRecord)

    const form = new FormData()
    form.append('action', 'lta_submit_applicant')
    form.append('api_key', apiKey)
    form.append('applicant[id]', testRecord.id)
    form.append('applicant[fullName]', testRecord.fullName)
    form.append('applicant[email]', testRecord.email)
    form.append('applicant[phone]', testRecord.phone)
    form.append('applicant[position]', testRecord.position)
    form.append('applicant[linkedinGithub]', testRecord.linkedinGithub)
    form.append('applicant[aiUseCase]', testRecord.aiUseCase)
    form.append('applicant[experience]', testRecord.experience)
    form.append('applicant[additionalRoles]', testRecord.additionalRoles.join(', '))
    form.append('applicant[notes]', testRecord.notes)
    form.append('applicant[createdAt]', testRecord.createdAt)

    console.log('FormData entries:')
    for (let [key, value] of form.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
    const text = await resp.text()
    
    console.log('=== WordPress Submit Response ===')
    console.log('Status:', resp.status)
    console.log('Response text:', text)
    
    let json: any
    try { 
      json = JSON.parse(text) 
      console.log('Parsed JSON:', json)
    } catch (e) { 
      json = { success: false, parseError: e.message }
      console.log('JSON parse error:', e.message)
    }

    return NextResponse.json({
      success: true,
      testRecord: testRecord,
      wordpress: {
        status: resp.status,
        response: text,
        parsed: json
      }
    })
    
  } catch (error) {
    console.error('Test submit failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Test submit failed',
      details: error.message
    }, { status: 500 })
  }
}
