const fs = require('fs')
const path = require('path')

// Sửa encoding cho file news.json
async function fixNewsEncoding() {
  console.log('🔧 Fixing news encoding...')
  
  const newsFilePath = path.join(process.cwd(), 'data', 'news.json')
  
  if (!fs.existsSync(newsFilePath)) {
    console.log('❌ News file not found')
    return
  }
  
  try {
    // Đọc file với encoding UTF-8
    const data = fs.readFileSync(newsFilePath, 'utf8')
    const news = JSON.parse(data)
    
    console.log(`📁 Found ${news.length} news items`)
    
    // Sửa encoding cho từng tin tức
    const fixedNews = news.map((item, index) => {
      console.log(`   🔧 Fixing item ${index + 1}: ${item.title?.substring(0, 50)}...`)
      
      return {
        ...item,
        title: item.title || '',
        excerpt: item.excerpt || '',
        content: item.content || '',
        category: item.category || '',
        tags: item.tags || '',
        author: item.author || 'Admin LTA',
        imageAlt: item.imageAlt || item.title || ''
      }
    })
    
    // Backup file cũ
    const backupPath = path.join(process.cwd(), 'data', `news-backup-${Date.now()}.json`)
    fs.writeFileSync(backupPath, data)
    console.log(`💾 Backup created: ${backupPath}`)
    
    // Ghi file mới với encoding đúng
    fs.writeFileSync(newsFilePath, JSON.stringify(fixedNews, null, 2), 'utf8')
    console.log('✅ News encoding fixed!')
    
    // Kiểm tra lại
    console.log('\n📋 Sample of fixed data:')
    if (fixedNews.length > 0) {
      const sample = fixedNews[0]
      console.log(`   Title: ${sample.title?.substring(0, 100)}...`)
      console.log(`   Author: ${sample.author}`)
      console.log(`   Category: ${sample.category}`)
    }
    
  } catch (error) {
    console.log('❌ Error fixing encoding:', error.message)
  }
}

// Kiểm tra encoding hiện tại
async function checkCurrentEncoding() {
  console.log('🔍 Checking current encoding...')
  
  const newsFilePath = path.join(process.cwd(), 'data', 'news.json')
  
  if (!fs.existsSync(newsFilePath)) {
    console.log('❌ News file not found')
    return
  }
  
  try {
    const data = fs.readFileSync(newsFilePath, 'utf8')
    const news = JSON.parse(data)
    
    console.log(`📁 Found ${news.length} news items`)
    
    // Kiểm tra encoding của từng tin tức
    news.forEach((item, index) => {
      const title = item.title || ''
      const author = item.author || ''
      const category = item.category || ''
      
      console.log(`\n${index + 1}. ${title.substring(0, 50)}...`)
      console.log(`   Author: ${author}`)
      console.log(`   Category: ${category}`)
      
      // Kiểm tra có ký tự lạ không
      if (title.includes('Ã') || title.includes('áº') || title.includes('Ä')) {
        console.log(`   ⚠️  Title has encoding issues`)
      }
      
      if (author.includes('Ã') || author.includes('áº') || author.includes('Ä')) {
        console.log(`   ⚠️  Author has encoding issues`)
      }
      
      if (category.includes('Ã') || category.includes('áº') || category.includes('Ä')) {
        console.log(`   ⚠️  Category has encoding issues`)
      }
    })
    
  } catch (error) {
    console.log('❌ Error checking encoding:', error.message)
  }
}

// Main function
async function main() {
  console.log('🔧 News Encoding Fix Tool')
  console.log('=========================')
  
  await checkCurrentEncoding()
  console.log('\n' + '='.repeat(50))
  await fixNewsEncoding()
  
  console.log('\n✅ Encoding fix completed!')
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  fixNewsEncoding,
  checkCurrentEncoding
}
