import { NextRequest, NextResponse } from 'next/server'

// Run this route on the Edge Runtime for lower latency
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Google Apps Script Web App URL - cần deploy script và lấy URL này
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

// Timeout for the request to Google Apps Script (in milliseconds)
const APPS_SCRIPT_TIMEOUT_MS = Number(process.env.CONTACT_REQUEST_TIMEOUT_MS || 10000)

export async function POST(request: NextRequest) {
  try {
    console.log('Contact form submission received')
    console.log('GOOGLE_APPS_SCRIPT_URL:', GOOGLE_APPS_SCRIPT_URL)

    const body = await request.json()
    const { name, email, company, message } = body

    console.log('Form data received:', { name, email, company, message })

    // Validation
    if (!name || !email || !message) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        {
          success: false,
          error: 'Thiếu thông tin bắt buộc: tên, email, tin nhắn'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format')
      return NextResponse.json(
        {
          success: false,
          error: 'Email không hợp lệ'
        },
        { status: 400 }
      )
    }

    // Lấy IP address của user (Edge không hỗ trợ request.ip)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'Unknown'

    console.log('User IP:', ip)

    // Chuẩn bị dữ liệu để gửi đến Google Apps Script
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      company: company ? company.trim() : '',
      message: message.trim(),
      ipAddress: ip,
      timestamp: new Date().toISOString()
    }

    console.log('Sending data to Google Apps Script:', contactData)

    // Kiểm tra xem URL có phải là URL mặc định không
    if (GOOGLE_APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      console.log('Error: Google Apps Script URL not configured')
      return NextResponse.json(
        {
          success: false,
          error: 'Google Apps Script chưa được cấu hình. Vui lòng liên hệ admin.'
        },
        { status: 500 }
      )
    }

    // Gửi dữ liệu đến Google Apps Script với timeout để tránh chờ quá lâu
    console.log('Making request to Google Apps Script...')
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort('Request timed out'), APPS_SCRIPT_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData),
        cache: 'no-store',
        signal: abortController.signal
      })
    } finally {
      clearTimeout(timeoutId)
    }

    console.log('Google Apps Script response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Google Apps Script error response:', errorText)
      throw new Error(`Google Apps Script error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Google Apps Script success response:', result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Thông tin liên hệ đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.',
        timestamp: result.timestamp
      })
    }

    throw new Error(result.error || 'Lỗi không xác định từ Google Apps Script')
  } catch (error) {
    console.error('Contact form error:', error)

    const isAbortError = (error as any)?.name === 'AbortError' || (error as any)?.message?.includes('timed out')
    const humanMessage = isAbortError
      ? 'Hệ thống đang xử lý hơi lâu. Vui lòng thử lại sau ít phút.'
      : `Có lỗi xảy ra khi gửi thông tin liên hệ: ${error instanceof Error ? error.message : 'Lỗi không xác định'}. Vui lòng thử lại sau.`

    return NextResponse.json(
      {
        success: false,
        error: humanMessage
      },
      { status: 502 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contact API endpoint',
    method: 'POST',
    required_fields: ['name', 'email', 'message'],
    optional_fields: ['company'],
    google_script_url: process.env.GOOGLE_APPS_SCRIPT_URL || 'Not configured',
    timeout_ms: APPS_SCRIPT_TIMEOUT_MS
  })
}
