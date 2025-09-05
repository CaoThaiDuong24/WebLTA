const fs = require('fs')
const path = require('path')

// Test hiển thị tin tức
async function testNewsDisplay() {
  console.log('🔍 Testing news display...')
  console.log('📁 Working directory:', process.cwd())
  
  try {
    // Test lấy danh sách tin tức
    console.log('\n📡 Fetching news from API...')
    const response = await fetch('http://localhost:3000/api/news?status=published&limit=10')
    
    if (!response.ok) {
      console.log('❌ Failed to fetch news:', response.status, response.statusText)
      return
    }
    
    const result = await response.json()
    
    if (!result.success) {
      console.log('❌ API returned error:', result.error)
      return
    }
    
    const news = result.data || []
    console.log(`✅ Fetched ${news.length} news items`)
    
    // Kiểm tra thông tin từng tin tức
    console.log('\n📋 News Details:')
    console.log('='.repeat(80))
    
    news.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`)
      console.log(`   📅 Published: ${item.publishedAt || item.createdAt}`)
      console.log(`   👤 Author: ${item.author}`)
      console.log(`   🏷️  Category: ${item.category || 'N/A'}`)
      console.log(`   📝 Status: ${item.status}`)
      console.log(`   🔗 Slug: ${item.slug}`)
      console.log(`   🆔 ID: ${item.id}`)
      
      // Kiểm tra thông tin tác giả
      if (!item.author || item.author === 'Admin') {
        console.log(`   ⚠️  Warning: Author might be incorrect`)
      }
      
      if (item.author && item.author.includes('@')) {
        console.log(`   ⚠️  Warning: Author contains email address`)
      }
    })
    
    // Kiểm tra thứ tự sắp xếp
    console.log('\n📊 Sorting Analysis:')
    console.log('='.repeat(80))
    
    const dates = news.map(item => ({
      title: item.title,
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      date: new Date(item.publishedAt || item.createdAt)
    }))
    
    // Kiểm tra xem có sắp xếp đúng không (mới nhất trước)
    let isCorrectlySorted = true
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i].date < dates[i + 1].date) {
        isCorrectlySorted = false
        console.log(`   ❌ Wrong order: "${dates[i].title}" (${dates[i].date.toISOString()}) should come after "${dates[i + 1].title}" (${dates[i + 1].date.toISOString()})`)
      }
    }
    
    if (isCorrectlySorted) {
      console.log('   ✅ News are correctly sorted (newest first)')
    }
    
    // Thống kê tác giả
    console.log('\n👥 Author Statistics:')
    console.log('='.repeat(80))
    
    const authorCount = {}
    news.forEach(item => {
      const author = item.author || 'Unknown'
      authorCount[author] = (authorCount[author] || 0) + 1
    })
    
    Object.entries(authorCount).forEach(([author, count]) => {
      console.log(`   ${author}: ${count} posts`)
    })
    
    // Kiểm tra dữ liệu local
    console.log('\n💾 Local Data Check:')
    console.log('='.repeat(80))
    
    const newsFilePath = path.join(process.cwd(), 'data', 'news.json')
    if (fs.existsSync(newsFilePath)) {
      const localData = JSON.parse(fs.readFileSync(newsFilePath, 'utf8'))
      console.log(`   📁 Local news file: ${localData.length} items`)
      
      const publishedLocal = localData.filter(item => item.status === 'published')
      console.log(`   📰 Published in local: ${publishedLocal.length} items`)
      
      if (publishedLocal.length > 0) {
        console.log(`   📅 Latest local: ${publishedLocal[0].title} (${publishedLocal[0].publishedAt || publishedLocal[0].createdAt})`)
      }
    } else {
      console.log('   ❌ Local news file not found')
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

// Test tạo tin tức mới
async function testCreateNews() {
  console.log('\n🚀 Testing news creation...')
  
  try {
    const testNews = {
      title: 'Tin tức test hiển thị - ' + new Date().toISOString(),
      slug: 'tin-tuc-test-hien-thi-' + Date.now(),
      excerpt: 'Đây là tin tức test để kiểm tra hiển thị và thông tin tác giả',
      content: '<p>Nội dung test hiển thị</p><p>Kiểm tra thông tin tác giả và thứ tự sắp xếp.</p>',
      status: 'published',
      featured: false,
      category: 'Test',
      author: 'Test User',
      featuredImage: '',
      additionalImages: []
    }
    
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testNews)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ News created successfully!')
      console.log(`   📋 WordPress ID: ${result.data?.wordpressId}`)
      console.log(`   👤 Author: ${result.data?.author}`)
      console.log(`   📅 Published: ${result.data?.publishedAt}`)
    } else {
      const error = await response.json()
      console.log('❌ News creation failed:', error.error)
    }
    
  } catch (error) {
    console.log('❌ Create test failed:', error.message)
  }
}

// Main function
async function main() {
  console.log('🧪 News Display Test')
  console.log('====================')
  
  // Chờ server khởi động
  console.log('⏳ Waiting for server to start...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  await testNewsDisplay()
  await testCreateNews()
  
  console.log('\n✅ Display test completed!')
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testNewsDisplay,
  testCreateNews
}
