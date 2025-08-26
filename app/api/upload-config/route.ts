import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = {
      maxFileSize: 1024 * 1024 * 1024, // 1GB in bytes
      maxFileSizeMB: 1024,
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      maxDataUrlSize: 1024 * 1024 * 1024, // 1GB for base64
      bodyParserLimit: '1gb', // Next.js body parser limit
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
        singleFile: '1GB',
        totalUpload: '4GB', // Tổng kích thước cho multiple files
        dataUrl: '1GB',
        apiBody: '1GB'
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
