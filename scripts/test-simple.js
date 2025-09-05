const fs = require('fs')
const path = require('path')

console.log('=== Simple Test ===\n')

// Check current data
const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
if (fs.existsSync(wpConfigFile)) {
  const data = JSON.parse(fs.readFileSync(wpConfigFile, 'utf8'))
  console.log('✅ WordPress config file exists')
  console.log('Username encrypted:', data.username?.startsWith('ENCRYPTED:'))
  console.log('Password encrypted:', data.applicationPassword?.startsWith('ENCRYPTED:'))
  console.log('Site URL:', data.siteUrl)
  console.log('Auto Publish:', data.autoPublish)
  console.log('Updated at:', data.updatedAt)
} else {
  console.log('❌ WordPress config file not found')
}

console.log('\n✅ Test complete!')
