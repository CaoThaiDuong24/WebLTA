import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== CHECKING WORDPRESS DATA ===')
    
    const ajaxUrl = 'https://wp2.ltacv.com/wp-admin/admin-ajax.php'
    const form = new FormData()
    form.append('action', 'lta_get_applicants')
    form.append('api_key', 'lta_recruitment_2024')
    
    console.log('Fetching from WordPress:', ajaxUrl)
    
    const resp = await fetch(ajaxUrl, { method: 'POST', body: form })
    const text = await resp.text()
    
    console.log('WordPress response status:', resp.status)
    console.log('WordPress response text:', text)
    
    let json: any
    try {
      json = JSON.parse(text)
      console.log('WordPress parsed JSON:', json)
    } catch (e) {
      console.log('WordPress JSON parse error:', e.message)
      json = { success: false, parseError: e.message }
    }
    
    return NextResponse.json({
      success: true,
      wordpress: {
        status: resp.status,
        response: text,
        parsed: json,
        dataCount: json?.data?.length || 0
      }
    })
    
  } catch (error) {
    console.error('Check WordPress error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
