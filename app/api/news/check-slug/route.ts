import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

// Đọc danh sách tin tức từ file
const loadNews = () => {
  try {
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      return []
    }
    const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
    const news = JSON.parse(data)
    return Array.isArray(news) ? news : []
  } catch (error) {
    console.error('Error loading news:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Thiếu tham số slug' },
        { status: 400 }
      )
    }
    
    const news = loadNews()
    const exists = news.some(item => item.slug === slug)
    
    return NextResponse.json({
      success: true,
      slug,
      exists,
      message: exists ? 'Slug đã tồn tại' : 'Slug có thể sử dụng'
    })
    
  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json(
      { error: 'Không thể kiểm tra slug' },
      { status: 500 }
    )
  }
} 