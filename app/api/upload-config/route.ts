import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = {
      maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
      maxFileSizeMB: 50,
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      maxDataUrlSize: 50 * 1024 * 1024, // 50MB for base64
      bodyParserLimit: '50mb', // Next.js body parser limit
      features: {
        localStorage: true,
        wordpressUpload: true,
        imageOptimization: true,
        multipleFiles: true,
        sizeValidation: true,
        autoCompression: true,
        progressiveUpload: true
      },
      limits: {
        singleFile: '50MB',
        totalUpload: '200MB', // Tổng kích thước cho multiple files
        dataUrl: '50MB',
        apiBody: '50MB'
      },
      compression: {
        enabled: true,
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        format: 'webp'
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
