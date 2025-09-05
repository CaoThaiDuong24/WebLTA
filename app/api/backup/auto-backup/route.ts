import { NextRequest, NextResponse } from 'next/server'
import { loadNews } from '@/lib/news-utils'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting auto backup...')
    
    // Load tất cả dữ liệu hiện tại
    const news = loadNews()
    
    // Tạo backup data với metadata
    const backupData = {
      version: '1.0.0',
      backupDate: new Date().toISOString(),
      totalItems: news.length,
      data: {
        news: news
      }
    }
    
    // Tạo filename với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `auto-backup-${timestamp}.json`
    
    // Đảm bảo thư mục backup tồn tại
    const backupDir = path.join(process.cwd(), 'data', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Lưu file backup
    const backupPath = path.join(backupDir, filename)
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')
    
    // Xóa các file backup cũ (giữ lại 10 file gần nhất)
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('auto-backup-') && file.endsWith('.json'))
      .sort()
      .reverse()
    
    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10)
      for (const file of filesToDelete) {
        fs.unlinkSync(path.join(backupDir, file))
        console.log(`🗑️ Deleted old backup: ${file}`)
      }
    }
    
    console.log(`💾 Auto backup saved: ${filename}`)
    console.log(`📊 Total backup files: ${backupFiles.length}`)
    
    return NextResponse.json({
      success: true,
      message: `Auto backup thành công: ${news.length} tin tức`,
      backupFile: filename,
      totalBackupFiles: backupFiles.length
    })
    
  } catch (error: any) {
    console.error('❌ Error auto backup:', error)
    return NextResponse.json({ 
      error: `Lỗi khi auto backup: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
