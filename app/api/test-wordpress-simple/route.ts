import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TESTING WORDPRESS SIMPLE ===')
    
    const ajaxUrl = 'https://wp2.ltacv.com/wp-admin/admin-ajax.php'
    const form = new FormData()
    form.append('action', 'lta_submit_applicant')
    form.append('api_key', 'lta_recruitment_2024')
    form.append('applicant[fullName]', 'Test User')
    form.append('applicant[email]', 'test@example.com')
    form.append('applicant[phone]', '0123456789')
    form.append('applicant[position]', 'developer')
    
    console.log('Sending test data to WordPress...')
    console.log('URL:', ajaxUrl)
    console.log('Action:', 'lta_submit_applicant')
    console.log('API Key:', 'lta_recruitment_2024')
    
    const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
    const text = await resp.text()
    
    console.log('=== RESPONSE ===')
    console.log('Status:', resp.status)
    console.log('Response:', text)
    
    let json
    try {
      json = JSON.parse(text)
      console.log('Parsed:', json)
    } catch (e) {
      console.log('Parse error:', e.message)
      json = { error: 'Parse failed', raw: text }
    }
    
    return NextResponse.json({
      success: true,
      status: resp.status,
      response: text,
      parsed: json
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
