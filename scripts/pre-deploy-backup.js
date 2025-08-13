#!/usr/bin/env node

/**
 * Script tự động backup trước khi deploy
 * Sử dụng: node scripts/pre-deploy-backup.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Starting pre-deploy backup...')

// Đường dẫn đến file dữ liệu
const newsFilePath = path.join(process.cwd(), 'data', 'news.json')
const backupDir = path.join(process.cwd(), 'data', 'backups')

// Tạo thư mục backup nếu chưa có
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
  console.log('📁 Created backup directory')
}

// Kiểm tra file dữ liệu
if (!fs.existsSync(newsFilePath)) {
  console.log('⚠️ No news data file found, skipping backup')
  process.exit(0)
}

try {
  // Đọc dữ liệu hiện tại
  const newsData = fs.readFileSync(newsFilePath, 'utf-8')
  const news = JSON.parse(newsData)
  
  // Tạo backup data
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
  const filename = `pre-deploy-backup-${timestamp}.json`
  const backupPath = path.join(backupDir, filename)
  
  // Lưu backup
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')
  
  console.log(`✅ Pre-deploy backup created: ${filename}`)
  console.log(`📊 Total items backed up: ${news.length}`)
  console.log(`💾 Backup location: ${backupPath}`)
  
  // Xóa các file pre-deploy backup cũ (giữ lại 5 file gần nhất)
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('pre-deploy-backup-') && file.endsWith('.json'))
    .sort()
    .reverse()
  
  if (backupFiles.length > 5) {
    const filesToDelete = backupFiles.slice(5)
    for (const file of filesToDelete) {
      fs.unlinkSync(path.join(backupDir, file))
      console.log(`🗑️ Deleted old pre-deploy backup: ${file}`)
    }
  }
  
  console.log('🎉 Pre-deploy backup completed successfully!')
  
} catch (error) {
  console.error('❌ Error creating pre-deploy backup:', error)
  process.exit(1)
}
