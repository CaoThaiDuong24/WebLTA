const fs = require('fs')
const path = require('path')

console.log('=== Testing WordPress Config Display ===\n')

// Check if WordPress config file exists
const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
console.log('1. WordPress Config File:')
if (fs.existsSync(wpConfigFile)) {
  console.log('✅ WordPress config file exists')
  const wpConfigData = fs.readFileSync(wpConfigFile, 'utf8')
  const wpConfig = JSON.parse(wpConfigData)
  console.log('Raw config data:')
  console.log('- Site URL:', wpConfig.siteUrl)
  console.log('- Username:', wpConfig.username ? 'ENCRYPTED' : 'empty')
  console.log('- Application Password:', wpConfig.applicationPassword ? 'ENCRYPTED' : 'empty')
  console.log('- Auto Publish:', wpConfig.autoPublish)
  console.log('- Default Category:', wpConfig.defaultCategory || 'empty')
  console.log('- Default Tags:', wpConfig.defaultTags || [])
  console.log('- Featured Image Enabled:', wpConfig.featuredImageEnabled)
  console.log('- Excerpt Length:', wpConfig.excerptLength)
  console.log('- Status:', wpConfig.status)
  console.log('- Is Connected:', wpConfig.isConnected)
} else {
  console.log('❌ WordPress config file not found')
}

// Check settings file
const settingsFile = path.join(process.cwd(), 'data', 'settings.json')
console.log('\n2. Settings File:')
if (fs.existsSync(settingsFile)) {
  console.log('✅ Settings file exists')
  const settingsData = fs.readFileSync(settingsFile, 'utf8')
  const settings = JSON.parse(settingsData)
  console.log('WordPress settings:')
  console.log('- WordPress Site URL:', settings.wordpressSiteUrl)
  console.log('- WordPress Username:', settings.wordpressUsername ? 'ENCRYPTED' : 'empty')
  console.log('- WordPress Application Password:', settings.wordpressApplicationPassword ? 'ENCRYPTED' : 'empty')
  console.log('- WordPress Auto Publish:', settings.wordpressAutoPublish)
  console.log('- WordPress Default Category:', settings.wordpressDefaultCategory || 'empty')
  console.log('- WordPress Default Tags:', settings.wordpressDefaultTags || [])
  console.log('- WordPress Featured Image Enabled:', settings.wordpressFeaturedImageEnabled)
  console.log('- WordPress Excerpt Length:', settings.wordpressExcerptLength)
  console.log('- WordPress Status:', settings.wordpressStatus)
  
  if (settings.wordpressConfig) {
    console.log('\nWordPress Config in Settings:')
    console.log('- Username:', settings.wordpressConfig.username ? 'ENCRYPTED' : 'empty')
    console.log('- Application Password:', settings.wordpressConfig.applicationPassword ? 'ENCRYPTED' : 'empty')
  }
} else {
  console.log('❌ Settings file not found')
}

console.log('\n=== Test Complete ===')
