import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing multipart/form-data handling...')
    
    const contentType = request.headers.get('content-type') || ''
    console.log('📋 Content-Type:', contentType)
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      // Log all form data
      const result: any = {}
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          result[key] = {
            type: 'file',
            name: value.name,
            size: value.size,
            mimeType: value.type
          }
        } else {
          result[key] = {
            type: 'text',
            value: value
          }
        }
      }
      
      console.log('📊 Form data received:', result)
      
      return NextResponse.json({
        success: true,
        message: 'Multipart form data received successfully',
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Expected multipart/form-data content type'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error in test multipart:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
