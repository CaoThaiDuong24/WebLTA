import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('=== DEBUG SUBMIT TEST ===')
    
    // Test data
    const testRecord = {
      id: `debug_${Date.now()}`,
      fullName: 'Debug User',
      email: 'debug@test.com',
      phone: '0123456789',
      position: 'developer',
      linkedinGithub: 'https://github.com/debug',
      aiUseCase: 'Debug AI use case',
      experience: '1',
      additionalRoles: 'debug,test',
      notes: 'Debug notes',
      createdAt: new Date().toISOString()
    }
    
    console.log('Test record:', testRecord)
    
    // Send to WordPress
    const ajaxUrl = 'https://wp2.ltacv.com/wp-admin/admin-ajax.php'
    const wpForm = new FormData()
    wpForm.append('action', 'lta_submit_applicant')
    wpForm.append('api_key', 'lta_recruitment_2024')
    
    // Add all fields
    Object.entries(testRecord).forEach(([key, value]) => {
      wpForm.append(`applicant[${key}]`, String(value))
    })
    
    console.log('FormData entries:')
    for (let [key, value] of wpForm.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    console.log('Sending to WordPress:', ajaxUrl)
    
    const resp = await fetch(ajaxUrl, { method: 'POST', body: wpForm })
    const text = await resp.text()
    
    console.log('=== WORDPRESS RESPONSE ===')
    console.log('Status:', resp.status)
    console.log('Response text:', text)
    
    let json: any
    try {
      json = JSON.parse(text)
      console.log('Parsed JSON:', json)
    } catch (e) {
      console.log('JSON parse error:', e.message)
      json = { success: false, parseError: e.message }
    }
    
    return NextResponse.json({
      success: true,
      testRecord: testRecord,
      wordpress: {
        status: resp.status,
        response: text,
        parsed: json,
        success: json?.success || false,
        message: json?.message || 'No message'
      }
    })
    
  } catch (error) {
    console.error('Debug submit error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
