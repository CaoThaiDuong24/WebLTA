const fetch = require('node-fetch')

async function testWordPressConfigAPI() {
  console.log('=== Testing WordPress Config API ===\n')
  
  try {
    // Test API endpoint
    const response = await fetch('http://localhost:3000/api/wordpress/config')
    if (response.ok) {
      const data = await response.json()
      console.log('✅ WordPress Config API Response:')
      console.log('Success:', data.success)
      if (data.config) {
        console.log('Site URL:', data.config.siteUrl)
        console.log('Username:', data.config.username ? '***' : 'empty')
        console.log('Application Password:', data.config.applicationPassword ? '***' : 'empty')
        console.log('Auto Publish:', data.config.autoPublish)
        console.log('Default Category:', data.config.defaultCategory || 'empty')
        console.log('Default Tags:', data.config.defaultTags || [])
        console.log('Featured Image Enabled:', data.config.featuredImageEnabled)
        console.log('Excerpt Length:', data.config.excerptLength)
        console.log('Status:', data.config.status)
        console.log('Is Connected:', data.config.isConnected)
      }
    } else {
      console.log('❌ API Error:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message)
  }
  
  console.log('\n=== Testing Settings API ===\n')
  
  try {
    // Test Settings API endpoint
    const response = await fetch('http://localhost:3000/api/settings')
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Settings API Response:')
      console.log('Success:', data.success)
      if (data.settings) {
        console.log('WordPress Site URL:', data.settings.wordpressSiteUrl)
        console.log('WordPress Username:', data.settings.wordpressUsername ? '***' : 'empty')
        console.log('WordPress Application Password:', data.settings.wordpressApplicationPassword ? '***' : 'empty')
        console.log('WordPress Auto Publish:', data.settings.wordpressAutoPublish)
        console.log('WordPress Default Category:', data.settings.wordpressDefaultCategory || 'empty')
        console.log('WordPress Default Tags:', data.settings.wordpressDefaultTags || [])
        console.log('WordPress Featured Image Enabled:', data.settings.wordpressFeaturedImageEnabled)
        console.log('WordPress Excerpt Length:', data.settings.wordpressExcerptLength)
        console.log('WordPress Status:', data.settings.wordpressStatus)
        
        if (data.settings.wordpressConfig) {
          console.log('\nWordPress Config Object:')
          console.log('Username:', data.settings.wordpressConfig.username ? '***' : 'empty')
          console.log('Application Password:', data.settings.wordpressConfig.applicationPassword ? '***' : 'empty')
          console.log('Auto Publish:', data.settings.wordpressConfig.autoPublish)
          console.log('Default Category:', data.settings.wordpressConfig.defaultCategory || 'empty')
          console.log('Default Tags:', data.settings.wordpressConfig.defaultTags || [])
          console.log('Featured Image Enabled:', data.settings.wordpressConfig.featuredImageEnabled)
          console.log('Excerpt Length:', data.settings.wordpressConfig.excerptLength)
          console.log('Status:', data.settings.wordpressConfig.status)
          console.log('Is Connected:', data.settings.wordpressConfig.isConnected)
        }
      }
    } else {
      console.log('❌ API Error:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message)
  }
}

// Run test
testWordPressConfigAPI().then(() => {
  console.log('\n=== Test Complete ===')
}).catch(error => {
  console.error('Test failed:', error)
})
