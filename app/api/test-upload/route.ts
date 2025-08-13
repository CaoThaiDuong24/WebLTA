import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing upload with large file...')
    
    // Lấy form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được upload' },
        { status: 400 }
      )
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    })

    // Kiểm tra kích thước file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'File quá lớn',
          details: {
            fileSize: file.size,
            fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
            maxSize: maxSize,
            maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2)
          }
        },
        { status: 400 }
      )
    }

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'Upload test thành công',
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
        fileType: file.type,
        processed: true
      }
    })

  } catch (error) {
    console.error('❌ Error in test upload:', error)
    return NextResponse.json(
      { 
        error: 'Lỗi khi test upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Upload test endpoint is ready',
    config: {
      maxFileSize: '10MB',
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      testEndpoint: 'POST /api/test-upload'
    }
  })
}
