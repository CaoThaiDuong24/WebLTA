import { NextRequest, NextResponse } from 'next/server'
import { loadNews } from '@/lib/news-utils'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Starting data export...')
    
    // Load tất cả dữ liệu hiện tại
    const news = loadNews()
    
    // Tạo backup data với metadata
    const backupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      totalItems: news.length,
      data: {
        news: news
      }
    }
    
    // Tạo filename với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `lta-backup-${timestamp}.json`
    
    console.log(`📦 Exporting ${news.length} news items to ${filename}`)
    
    // Trả về file download
    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error exporting data:', error)
    return NextResponse.json({ 
      error: `Lỗi khi export dữ liệu: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
