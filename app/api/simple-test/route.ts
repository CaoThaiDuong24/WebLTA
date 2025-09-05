import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== SIMPLE TEST STARTED ===')
  
  try {
    console.log('Request received')
    console.log('Content-Type:', request.headers.get('content-type'))
    
    // Test basic functionality
    const testData = {
      message: 'Test successful',
      timestamp: new Date().toISOString(),
      headers: {
        contentType: request.headers.get('content-type'),
        userAgent: request.headers.get('user-agent')
      }
    }
    
    console.log('Test data created:', testData)
    
    return NextResponse.json({
      success: true,
      data: testData
    })
    
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
