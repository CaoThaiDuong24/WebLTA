import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test upload API called')
    
    // Trả về mock data ngay lập tức
    const mockResult = {
      id: Date.now(),
      source_url: `https://via.placeholder.com/800x600/007bff/ffffff?text=test-image`,
      title: {
        rendered: 'Test Image'
      },
      alt_text: 'Test Image',
      media_type: 'image',
      mime_type: 'image/jpeg'
    }
    
    console.log('✅ Returning mock upload result:', mockResult)
    
    return NextResponse.json({
      success: true,
      message: 'Upload media thành công (mock data)',
      data: mockResult,
      note: 'Test API working correctly'
    })

  } catch (error) {
    console.error('❌ Error in test upload:', error)
    return NextResponse.json(
      { error: 'Lỗi trong test upload' },
      { status: 500 }
    )
  }
} 