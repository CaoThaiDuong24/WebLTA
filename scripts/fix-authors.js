const fs = require('fs')
const path = require('path')

// Sửa thông tin tác giả
async function fixAuthors() {
  console.log('🔧 Fixing author information...')
  
  const newsFilePath = path.join(process.cwd(), 'data', 'news.json')
  
  if (!fs.existsSync(newsFilePath)) {
    console.log('❌ News file not found')
    return
  }
  
  try {
    const data = fs.readFileSync(newsFilePath, 'utf8')
    const news = JSON.parse(data)
    
    console.log(`📁 Found ${news.length} news items`)
    
    // Sửa thông tin tác giả
    const fixedNews = news.map((item, index) => {
      let author = item.author || 'Admin LTA'
      
      // Sửa các trường hợp đặc biệt
      if (author === 'lta2') author = 'Admin LTA'
      if (author === 'admin') author = 'Admin LTA'
      if (author === 'Admin') author = 'Admin LTA'
      if (author.includes('@')) {
        author = author.split('@')[0]
      }
      
      console.log(`   🔧 Item ${index + 1}: "${item.title?.substring(0, 30)}..." - Author: ${item.author} → ${author}`)
      
      return {
        ...item,
        author: author
      }
    })
    
    // Backup
    const backupPath = path.join(process.cwd(), 'data', `news-authors-backup-${Date.now()}.json`)
    fs.writeFileSync(backupPath, data)
    console.log(`💾 Backup created: ${backupPath}`)
    
    // Ghi file mới
    fs.writeFileSync(newsFilePath, JSON.stringify(fixedNews, null, 2), 'utf8')
    console.log('✅ Authors fixed!')
    
  } catch (error) {
    console.log('❌ Error fixing authors:', error.message)
  }
}

// Chạy ngay
fixAuthors().catch(console.error)
