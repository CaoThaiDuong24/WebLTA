const fs = require('fs')
const path = require('path')

console.log('=== Quick API Test ===\n')

// Test 1: Check if WordPress config file exists and has encrypted data
const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
if (fs.existsSync(wpConfigFile)) {
  const wpConfig = JSON.parse(fs.readFileSync(wpConfigFile, 'utf8'))
  console.log('✅ WordPress config file exists')
  console.log('Username encrypted:', wpConfig.username?.startsWith('ENCRYPTED:'))
  console.log('Password encrypted:', wpConfig.applicationPassword?.startsWith('ENCRYPTED:'))
} else {
  console.log('❌ WordPress config file not found')
}

// Test 2: Check settings file
const settingsFile = path.join(process.cwd(), 'data', 'settings.json')
if (fs.existsSync(settingsFile)) {
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'))
  console.log('\n✅ Settings file exists')
  console.log('WordPress username encrypted:', settings.wordpressUsername?.startsWith('ENCRYPTED:'))
  console.log('WordPress password encrypted:', settings.wordpressApplicationPassword?.startsWith('ENCRYPTED:'))
  
  if (settings.wordpressConfig) {
    console.log('WordPress config object exists')
    console.log('Config username encrypted:', settings.wordpressConfig.username?.startsWith('ENCRYPTED:'))
    console.log('Config password encrypted:', settings.wordpressConfig.applicationPassword?.startsWith('ENCRYPTED:'))
  }
} else {
  console.log('❌ Settings file not found')
}

console.log('\n=== Test Complete ===')
