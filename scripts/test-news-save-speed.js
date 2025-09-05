const fs = require('fs')
const path = require('path')

// Test tốc độ lưu tin tức
async function testNewsSaveSpeed() {
  console.log('🚀 Testing news save speed...')
  console.log('📁 Working directory:', process.cwd())
  
  const startTime = Date.now()
  
  try {
    // Test data
    const testNews = {
      title: 'Tin tức test tốc độ - ' + new Date().toISOString(),
      slug: 'tin-tuc-test-toc-do-' + Date.now(),
      excerpt: 'Đây là tin tức test để kiểm tra tốc độ lưu',
      content: '<p>Nội dung test tốc độ</p><p>Kiểm tra xem có lưu nhanh không.</p>',
      status: 'draft',
      featured: false,
      category: 'Test',
      author: 'Admin Test',
      featuredImage: '',
      additionalImages: []
    }
    
    console.log('📝 Test data prepared')
    
    // Test lưu tin tức
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testNews)
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`⏱️  Total time: ${duration}ms`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ News saved successfully!')
      console.log(`📋 WordPress ID: ${result.data?.wordpressId}`)
      console.log(`🔗 Link: ${result.data?.link || 'N/A'}`)
      console.log(`📝 Message: ${result.message}`)
    } else {
      const error = await response.json()
      console.log('❌ News save failed')
      console.log(`📋 Error: ${error.error}`)
      if (error.details) {
        console.log(`🔍 Details: ${JSON.stringify(error.details)}`)
      }
    }
    
    console.log(`\n📊 Performance Summary:`)
    console.log(`- Total time: ${duration}ms`)
    console.log(`- Status: ${response.ok ? 'SUCCESS' : 'FAILED'}`)
    
    if (duration > 10000) {
      console.log('⚠️  Warning: Save time is too slow (>10s)')
    } else if (duration > 5000) {
      console.log('⚠️  Warning: Save time is slow (>5s)')
    } else {
      console.log('✅ Save time is acceptable')
    }
    
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log('❌ Test failed:', error.message)
    console.log(`⏱️  Time before error: ${duration}ms`)
  }
}

// Test tốc độ load danh sách tin tức
async function testNewsLoadSpeed() {
  console.log('\n📡 Testing news load speed...')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch('http://localhost:3000/api/news?limit=10')
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ News loaded successfully!')
      console.log(`📊 Total posts: ${result.data?.length || 0}`)
      console.log(`⏱️  Load time: ${duration}ms`)
    } else {
      console.log('❌ News load failed')
      console.log(`⏱️  Time before error: ${duration}ms`)
    }
    
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log('❌ Load test failed:', error.message)
    console.log(`⏱️  Time before error: ${duration}ms`)
  }
}

// Main function
async function main() {
  console.log('🧪 News Performance Test')
  console.log('========================')
  
  // Chờ server khởi động
  console.log('⏳ Waiting for server to start...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  await testNewsSaveSpeed()
  await testNewsLoadSpeed()
  
  console.log('\n✅ Performance test completed!')
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testNewsSaveSpeed,
  testNewsLoadSpeed
}
