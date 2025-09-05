const fs = require('fs')
const path = require('path')

console.log('=== Test Save & Reload Quick ===\n')

// Đọc dữ liệu hiện tại
const configFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
if (fs.existsSync(configFile)) {
  const currentData = JSON.parse(fs.readFileSync(configFile, 'utf8'))
  console.log('📖 Current data:')
  console.log('- Username:', currentData.username ? '***' : 'empty')
  console.log('- Password:', currentData.applicationPassword ? '***' : 'empty')
  console.log('- Site URL:', currentData.siteUrl)
  console.log('- Auto Publish:', currentData.autoPublish)
  console.log('- Updated at:', currentData.updatedAt)
  
  // Kiểm tra xem có phải dữ liệu mã hóa không
  console.log('\n🔐 Encryption check:')
  console.log('- Username encrypted:', currentData.username?.startsWith('ENCRYPTED:'))
  console.log('- Password encrypted:', currentData.applicationPassword?.startsWith('ENCRYPTED:'))
} else {
  console.log('❌ Config file not found')
}

console.log('\n✅ Test complete!')
