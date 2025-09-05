const fs = require('fs')
const path = require('path')

// Test nhanh API key với WordPress
async function quickTest() {
  console.log('⚡ Quick API Test')
  console.log('================')
  
  try {
    // Đọc config
    const configPath = path.join(process.cwd(), 'data', 'plugin-config.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(configData)
    
    console.log('📋 Current API Key:', config.apiKey)
    
    // Test với WordPress
    const wordpressUrl = 'https://wp2.ltacv.com'
    const ajaxUrl = `${wordpressUrl}/wp-admin/admin-ajax.php?action=lta_news_create`
    
    const testPayload = {
      apiKey: config.apiKey,
      title: 'Quick Test',
      content: 'Quick test content.',
      excerpt: 'Quick test',
      status: 'draft',
      category: '',
      tags: '',
      featuredImage: '',
      additionalImages: [],
      slug: 'quick-test',
      authorUsername: 'admin'
    }
    
    console.log('🔗 Testing with WordPress...')
    
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(10000)
    })
    
    const text = await response.text()
    console.log('📊 Status:', response.status)
    console.log('📄 Response:', text)
    
    if (response.ok) {
      console.log('✅ API key is working!')
    } else {
      console.log('❌ API key is not working')
      console.log('💡 You need to update the API key in WordPress plugin settings')
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

quickTest()
