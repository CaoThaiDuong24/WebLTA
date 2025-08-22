const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Encryption key (same as in lib/security.ts)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lta-encryption-key-2024-stable-32chars'

// Get encryption key
function getKey() {
  return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
}

// Encrypt sensitive data
function encryptSensitiveData(data) {
  try {
    const key = getKey()
    const dataBuffer = Buffer.from(data, 'utf8')
    const keyBuffer = Buffer.from(key)
    
    // XOR encryption with key
    const encrypted = Buffer.alloc(dataBuffer.length)
    for (let i = 0; i < dataBuffer.length; i++) {
      encrypted[i] = dataBuffer[i] ^ keyBuffer[i % keyBuffer.length]
    }
    
    // Add salt and encode base64
    const salt = crypto.randomBytes(8)
    const combined = Buffer.concat([salt, encrypted])
    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

// Check if data is already encrypted
function isEncrypted(data) {
  return typeof data === 'string' && data.startsWith('ENCRYPTED:')
}

// Process settings.json to encrypt wordpressConfig
function encryptWordPressConfigInSettings() {
  const settingsFile = path.join(process.cwd(), 'data', 'settings.json')
  
  if (!fs.existsSync(settingsFile)) {
    console.log('📁 settings.json not found, skipping...')
    return
  }
  
  console.log('🔐 Processing wordpressConfig in settings.json...')
  
  try {
    const settingsData = fs.readFileSync(settingsFile, 'utf8')
    const settings = JSON.parse(settingsData)
    
    // Check if wordpressConfig exists
    if (!settings.wordpressConfig) {
      console.log('ℹ️  No wordpressConfig found in settings.json')
      return
    }
    
    const wordpressConfig = settings.wordpressConfig
    let hasChanges = false
    
    // Encrypt username if not already encrypted
    if (wordpressConfig.username && !isEncrypted(wordpressConfig.username)) {
      wordpressConfig.username = `ENCRYPTED:${encryptSensitiveData(wordpressConfig.username)}`
      console.log('✅ Encrypted wordpressConfig.username')
      hasChanges = true
    }
    
    // Encrypt applicationPassword if not already encrypted
    if (wordpressConfig.applicationPassword && !isEncrypted(wordpressConfig.applicationPassword)) {
      wordpressConfig.applicationPassword = `ENCRYPTED:${encryptSensitiveData(wordpressConfig.applicationPassword)}`
      console.log('✅ Encrypted wordpressConfig.applicationPassword')
      hasChanges = true
    }
    
    if (hasChanges) {
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2))
      console.log('✅ settings.json wordpressConfig encrypted successfully')
    } else {
      console.log('ℹ️  wordpressConfig already encrypted')
    }
  } catch (error) {
    console.error('❌ Error processing settings.json:', error)
  }
}

// Main function
function main() {
  console.log('🔐 Starting encryption of wordpressConfig in settings.json...')
  console.log('📁 Working directory:', process.cwd())
  
  // Process settings file
  encryptWordPressConfigInSettings()
  
  console.log('✅ Encryption process completed!')
  console.log('🔒 All wordpressConfig sensitive data has been encrypted with ENCRYPTION_KEY')
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  encryptSensitiveData,
  encryptWordPressConfigInSettings
}
