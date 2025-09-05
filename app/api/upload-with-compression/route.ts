import { NextRequest, NextResponse } from 'next/server'
import { processImageIfNeeded } from '@/lib/image-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting upload with compression...')
    
    // Lấy form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được upload' },
        { status: 400 }
      )
    }

    console.log('📁 Original file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    })

    // Kiểm tra kích thước file tối đa
    const maxSize = 1024 * 1024 * 1024 // 1GB
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

    // Kiểm tra định dạng file
    const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!supportedFormats.includes(file.type)) {
      return NextResponse.json(
        { error: 'Định dạng file không được hỗ trợ' },
        { status: 400 }
      )
    }

    // Nén hình ảnh nếu cần (giới hạn 10MB sau khi nén)
    let processedFile = file
    let compressionApplied = false
    
    if (file.size > 10 * 1024 * 1024) { // Nén nếu > 10MB
      try {
        console.log('🔄 Compressing large image...')
        processedFile = await processImageIfNeeded(file, 10) // Nén xuống 10MB
        compressionApplied = true
        console.log('✅ Image compressed:', {
          originalSize: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
          compressedSize: (processedFile.size / (1024 * 1024)).toFixed(2) + 'MB',
          reduction: ((1 - processedFile.size / file.size) * 100).toFixed(1) + '%'
        })
      } catch (error) {
        console.error('❌ Compression failed:', error)
        // Tiếp tục với file gốc nếu nén thất bại
      }
    }

    // Chuyển đổi thành base64 để lưu trữ
    const arrayBuffer = await processedFile.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${processedFile.type};base64,${base64}`

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'Upload thành công',
      data: {
        fileName: processedFile.name,
        fileType: processedFile.type,
        originalSize: file.size,
        originalSizeMB: (file.size / (1024 * 1024)).toFixed(2),
        processedSize: processedFile.size,
        processedSizeMB: (processedFile.size / (1024 * 1024)).toFixed(2),
        compressionApplied,
        reduction: compressionApplied ? ((1 - processedFile.size / file.size) * 100).toFixed(1) + '%' : '0%',
        dataUrl: dataUrl.substring(0, 100) + '...', // Chỉ trả về phần đầu để kiểm tra
        dataUrlLength: dataUrl.length
      }
    })

  } catch (error) {
    console.error('❌ Error in upload with compression:', error)
    return NextResponse.json(
      { 
        error: 'Lỗi khi upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Upload with compression endpoint is ready',
    config: {
      maxFileSize: '1GB',
      compressionThreshold: '10MB',
      targetSizeAfterCompression: '10MB',
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      endpoint: 'POST /api/upload-with-compression'
    }
  })
}
