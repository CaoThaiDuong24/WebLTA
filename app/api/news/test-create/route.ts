import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Đường dẫn đến file JSON lưu tin tức
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

// Đảm bảo thư mục data tồn tại
const ensureDataDirectory = () => {
  const dataDir = path.dirname(NEWS_FILE_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Đọc danh sách tin tức từ file
const loadNews = () => {
  try {
    ensureDataDirectory()
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      fs.writeFileSync(NEWS_FILE_PATH, '[]')
      return []
    }
    const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading news:', error)
    return []
  }
}

// Lưu danh sách tin tức vào file
const saveNews = (news: any[]) => {
  try {
    ensureDataDirectory()
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(news, null, 2))
  } catch (error) {
    console.error('Error saving news:', error)
    throw error
  }
}

// Tạo ID duy nhất
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating test news with images...')
    
    // Tạo tin tức test với hình ảnh
    const testNews = {
      id: generateId(),
      title: 'Test tin tức với hình ảnh - ' + new Date().toLocaleString(),
      slug: 'test-tin-tuc-voi-hinh-anh-' + Date.now(),
      excerpt: 'Đây là tin tức test để kiểm tra hiển thị hình ảnh',
      content: 'Nội dung test với hình ảnh từ WordPress',
      status: 'published',
      featured: false,
      metaTitle: 'Test tin tức với hình ảnh',
      metaDescription: 'Test hiển thị hình ảnh',
      category: 'Test',
      tags: 'test, hình ảnh',
      featuredImage: 'https://wp2.ltacv.com/wp-content/uploads/2025/08/e0vr-vilog-3d-1-3.png',
      image: 'https://wp2.ltacv.com/wp-content/uploads/2025/08/e0vr-vilog-3d-1-3.png',
      imageAlt: 'Test tin tức với hình ảnh',
      additionalImages: [
        'https://wp2.ltacv.com/wp-content/uploads/2025/08/Claudia4_Znews-2.webp',
        'https://wp2.ltacv.com/wp-content/uploads/2025/08/cuoc_thi_booktok_ai_van_hoa_doc_sach-8.webp'
      ],
      relatedImages: [
        {
          id: 'featured',
          url: 'https://wp2.ltacv.com/wp-content/uploads/2025/08/e0vr-vilog-3d-1-3.png',
          alt: 'Test tin tức với hình ảnh',
          order: 0
        },
        {
          id: 'img-0',
          url: 'https://wp2.ltacv.com/wp-content/uploads/2025/08/Claudia4_Znews-2.webp',
          alt: 'Test tin tức với hình ảnh - Hình ảnh 1',
          order: 1
        },
        {
          id: 'img-1',
          url: 'https://wp2.ltacv.com/wp-content/uploads/2025/08/cuoc_thi_booktok_ai_van_hoa_doc_sach-8.webp',
          alt: 'Test tin tức với hình ảnh - Hình ảnh 2',
          order: 2
        }
      ],
      author: 'Admin LTA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      syncedToWordPress: false,
      lastSyncDate: null
    }
    
    // Lưu vào database
    const currentNews = loadNews()
    currentNews.push(testNews)
    saveNews(currentNews)
    
    console.log('✅ Test news created:', testNews.id)
    
    return NextResponse.json({
      success: true,
      message: 'Đã tạo tin tức test thành công',
      data: testNews
    })
    
  } catch (error) {
    console.error('Error creating test news:', error)
    return NextResponse.json(
      { error: 'Không thể tạo tin tức test' },
      { status: 500 }
    )
  }
} 