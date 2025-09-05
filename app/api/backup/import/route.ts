import { NextRequest, NextResponse } from 'next/server'
import { loadNews, saveNews, NewsItem } from '@/lib/news-utils'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Starting data import...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file backup' }, { status: 400 })
    }
    
    // Đọc file backup
    const fileContent = await file.text()
    let backupData: any
    
    try {
      backupData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json({ error: 'File backup không đúng định dạng JSON' }, { status: 400 })
    }
    
    // Validate backup data
    if (!backupData.data || !backupData.data.news || !Array.isArray(backupData.data.news)) {
      return NextResponse.json({ error: 'File backup không chứa dữ liệu tin tức hợp lệ' }, { status: 400 })
    }
    
    const backupNews = backupData.data.news
    const currentNews = loadNews()
    
    console.log(`📦 Importing ${backupNews.length} news items from backup`)
    console.log(`📦 Current news count: ${currentNews.length}`)
    
    // Merge strategy: giữ lại tin tức hiện tại, thêm tin tức mới từ backup
    let importedCount = 0
    let skippedCount = 0
    let updatedCount = 0
    
    for (const backupItem of backupNews) {
      // Kiểm tra xem tin tức đã tồn tại chưa (dựa trên ID hoặc wordpressId)
      const existingByLocalId = currentNews.find(item => item.id === backupItem.id)
      const existingByWordPressId = backupItem.wordpressId ? 
        currentNews.find(item => item.wordpressId === backupItem.wordpressId) : null
      
      if (existingByLocalId) {
        // Cập nhật tin tức hiện có
        const index = currentNews.findIndex(item => item.id === backupItem.id)
        if (index !== -1) {
          currentNews[index] = { ...currentNews[index], ...backupItem }
          updatedCount++
          console.log(`🔄 Updated existing news: ${backupItem.title}`)
        }
      } else if (existingByWordPressId) {
        // Cập nhật tin tức có cùng wordpressId
        const index = currentNews.findIndex(item => item.wordpressId === backupItem.wordpressId)
        if (index !== -1) {
          currentNews[index] = { ...currentNews[index], ...backupItem }
          updatedCount++
          console.log(`🔄 Updated existing news by WordPress ID: ${backupItem.title}`)
        }
      } else {
        // Thêm tin tức mới
        currentNews.push(backupItem)
        importedCount++
        console.log(`➕ Imported new news: ${backupItem.title}`)
      }
    }
    
    // Lưu dữ liệu đã merge
    saveNews(currentNews)
    
    console.log(`💾 Saved ${currentNews.length} total news items`)
    
    return NextResponse.json({
      success: true,
      message: `Import thành công: ${importedCount} tin tức mới, ${updatedCount} tin tức cập nhật, ${skippedCount} tin tức bỏ qua`,
      stats: {
        totalBackupItems: backupNews.length,
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        totalLocalItems: currentNews.length
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error importing data:', error)
    return NextResponse.json({ 
      error: `Lỗi khi import dữ liệu: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
