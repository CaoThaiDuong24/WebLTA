import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG FORM TEST ===')
    console.log('Content-Type:', request.headers.get('content-type'))
    
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      console.log('Processing multipart/form-data...')
      const form = await request.formData()
      
      console.log('Form entries:')
      for (let [key, value] of form.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Form processed successfully',
        fields: Object.fromEntries(form.entries())
      })
    } else {
      console.log('Processing JSON data...')
      const data = await request.json()
      console.log('JSON data:', data)
      
      return NextResponse.json({
        success: true,
        message: 'JSON processed successfully',
        data: data
      })
    }
  } catch (error) {
    console.error('Debug form error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
