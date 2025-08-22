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

// Encrypt sensitive fields in an object recursively
function encryptObject(obj, sensitiveFields) {
  const encrypted = { ...obj }
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively encrypt nested objects
      encrypted[key] = encryptObject(value, sensitiveFields)
    } else if (sensitiveFields.includes(key) && value && typeof value === 'string' && !isEncrypted(value)) {
      encrypted[key] = `ENCRYPTED:${encryptSensitiveData(value)}`
      console.log(`✅ Encrypted field: ${key}`)
    }
  }
  
  return encrypted
}

// Process settings.json with all sensitive fields
function encryptSettingsFile() {
  const settingsFile = path.join(process.cwd(), 'data', 'settings.json')
  
  if (!fs.existsSync(settingsFile)) {
    console.log('📁 settings.json not found, skipping...')
    return
  }
  
  console.log('🔐 Processing settings.json...')
  
  try {
    const settingsData = fs.readFileSync(settingsFile, 'utf8')
    const settings = JSON.parse(settingsData)
    
    const sensitiveFields = [
      'smtpUser', 
      'smtpPass', 
      'wordpressUsername', 
      'wordpressApplicationPassword',
      'googleAppsScriptUrl',
      'username',
      'applicationPassword'
    ]
    
    const encryptedSettings = encryptObject(settings, sensitiveFields)
    
    if (JSON.stringify(encryptedSettings) !== JSON.stringify(settings)) {
      fs.writeFileSync(settingsFile, JSON.stringify(encryptedSettings, null, 2))
      console.log('✅ settings.json encrypted successfully')
    } else {
      console.log('ℹ️  settings.json already encrypted')
    }
  } catch (error) {
    console.error('❌ Error processing settings.json:', error)
  }
}

// Main function
function main() {
  console.log('🔐 Starting encryption of remaining sensitive data...')
  console.log('📁 Working directory:', process.cwd())
  
  // Process settings file
  encryptSettingsFile()
  
  console.log('✅ Encryption process completed!')
  console.log('🔒 All remaining sensitive data has been encrypted with ENCRYPTION_KEY')
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  encryptSensitiveData,
  encryptObject,
  encryptSettingsFile
}
