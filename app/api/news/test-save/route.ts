import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

export async function GET(request: NextRequest) {
  try {
    // Kiểm tra file tồn tại
    const fileExists = fs.existsSync(NEWS_FILE_PATH)
    
    if (!fileExists) {
      return NextResponse.json({
        success: false,
        message: 'File news.json không tồn tại',
        data: {
          fileExists: false,
          fileSize: 0,
          canWrite: false
        }
      })
    }
    
    // Kiểm tra kích thước file
    const stats = fs.statSync(NEWS_FILE_PATH)
    const fileSize = stats.size
    
    // Kiểm tra quyền ghi
    let canWrite = false
    try {
      fs.accessSync(NEWS_FILE_PATH, fs.constants.W_OK)
      canWrite = true
    } catch (error) {
      canWrite = false
    }
    
    // Thử đọc file
    let canRead = false
    let newsCount = 0
    try {
      const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
      const news = JSON.parse(data)
      canRead = true
      newsCount = Array.isArray(news) ? news.length : 0
    } catch (error) {
      canRead = false
    }
    
    return NextResponse.json({
      success: true,
      message: 'Kiểm tra trạng thái file news.json',
      data: {
        fileExists: true,
        fileSize: fileSize,
        fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
        canRead,
        canWrite,
        newsCount,
        isHealthy: canRead && canWrite && fileSize < 50 * 1024 * 1024
      }
    })
    
  } catch (error) {
    console.error('Error checking news file:', error)
    return NextResponse.json(
      { error: 'Không thể kiểm tra file news.json' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Test tạo tin tức đơn giản
    const testNews = {
      id: `test-${Date.now()}`,
      title: 'Test News',
      slug: `test-news-${Date.now()}`,
      excerpt: 'This is a test news',
      content: 'Test content',
      status: 'draft',
      featured: false,
      author: 'Test Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Thử đọc file hiện tại
    let currentNews = []
    try {
      if (fs.existsSync(NEWS_FILE_PATH)) {
        const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
        currentNews = JSON.parse(data)
        if (!Array.isArray(currentNews)) {
          currentNews = []
        }
      }
    } catch (error) {
      currentNews = []
    }
    
    // Thêm tin tức test
    currentNews.push(testNews)
    
    // Thử lưu file
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(currentNews, null, 2), 'utf8')
    
    return NextResponse.json({
      success: true,
      message: 'Test lưu tin tức thành công',
      data: {
        testNewsId: testNews.id,
        totalNews: currentNews.length
      }
    })
    
  } catch (error) {
    console.error('Error testing news save:', error)
    return NextResponse.json(
      { error: 'Không thể test lưu tin tức' },
      { status: 500 }
    )
  }
} 