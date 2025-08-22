const fs = require('fs')
const path = require('path')

// Reset API key với key đơn giản mới
function resetApiKey() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'plugin-config.json')
    
    // Tạo API key mới dạng plain text
    const newApiKey = 'lta-plugin-' + Math.random().toString(36).substr(2, 16)
    
    console.log('🔑 Generating new API key...')
    console.log(`📝 New API key: ${newApiKey}`)
    
    // Đọc config hiện tại
    let config = {}
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      config = JSON.parse(configData)
    }
    
    // Cập nhật với API key mới (plain text)
    config.apiKey = newApiKey
    config.webhookUrl = config.webhookUrl || 'https://wp2.ltacv.com/api'
    config.autoSync = config.autoSync !== undefined ? config.autoSync : true
    config.syncDirection = config.syncDirection || 'bidirectional'
    
    // Lưu lại
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    
    console.log('✅ API key updated successfully!')
    console.log('📋 Plugin config:')
    console.log(`   API Key: ${newApiKey}`)
    console.log(`   Webhook URL: ${config.webhookUrl}`)
    console.log(`   Auto Sync: ${config.autoSync}`)
    console.log(`   Sync Direction: ${config.syncDirection}`)
    
    console.log('\n📋 Next steps:')
    console.log('1. Copy the API key above')
    console.log('2. Go to WordPress Admin → LTA News Sync')
    console.log('3. Paste the API key in the settings')
    console.log('4. Save the settings')
    console.log('5. Test creating news again')
    
    return newApiKey
  } catch (error) {
    console.error('❌ Error resetting API key:', error.message)
    return null
  }
}

// Run
console.log('🔄 Resetting API Key')
console.log('===================')
resetApiKey()
