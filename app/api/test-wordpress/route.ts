import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function GET() {
  try {
    const config = getWordPressConfig()
    if (!config?.siteUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'WordPress config not found',
        config: null 
      })
    }

    const apiKey = 'lta_recruitment_2024'
    const ajaxUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php`
    
    console.log('=== Testing WordPress Connection ===')
    console.log('Site URL:', config.siteUrl)
    console.log('AJAX URL:', ajaxUrl)
    console.log('API Key:', apiKey)

    // Test 1: Check if WordPress is reachable
    try {
      const testResp = await fetch(ajaxUrl, { 
        method: 'POST', 
        body: new URLSearchParams({
          'action': 'lta_test',
          'api_key': apiKey
        })
      })
      
      const testText = await testResp.text()
      console.log('Test response status:', testResp.status)
      console.log('Test response text:', testText)
      
      let testJson: any
      try {
        testJson = JSON.parse(testText)
        console.log('Test parsed JSON:', testJson)
      } catch (e) {
        console.log('Test JSON parse error:', e.message)
        testJson = { success: false, parseError: e.message }
      }

      return NextResponse.json({
        success: true,
        wordpress: {
          siteUrl: config.siteUrl,
          ajaxUrl: ajaxUrl,
          apiKey: apiKey,
          testStatus: testResp.status,
          testResponse: testText,
          testParsed: testJson
        }
      })
      
    } catch (error) {
      console.error('WordPress test failed:', error)
      return NextResponse.json({
        success: false,
        error: 'WordPress test failed',
        details: error.message,
        wordpress: {
          siteUrl: config.siteUrl,
          ajaxUrl: ajaxUrl,
          apiKey: apiKey
        }
      })
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test WordPress',
      details: error.message 
    }, { status: 500 })
  }
}
