import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
      maxFileSizeMB: 10,
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      maxDataUrlSize: 10 * 1024 * 1024, // 10MB for base64
      bodyParserLimit: '10mb', // Next.js body parser limit
      features: {
        localStorage: true,
        wordpressUpload: true,
        imageOptimization: true,
        multipleFiles: true,
        sizeValidation: true
      },
      limits: {
        singleFile: '10MB',
        totalUpload: '50MB', // Tổng kích thước cho multiple files
        dataUrl: '10MB',
        apiBody: '10MB'
      }
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error getting upload config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy cấu hình upload' },
      { status: 500 }
    )
  }
}
