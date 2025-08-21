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

export async function GET(request: NextRequest) {
  try {
    const news = loadNews()
    
    return NextResponse.json({
      success: true,
      data: news,
      message: 'Lấy danh sách tin tức thành công'
    })
  } catch (error) {
    console.error('Error getting news:', error)
    return NextResponse.json(
      { error: 'Không thể lấy danh sách tin tức' },
      { status: 500 }
    )
  }
}
