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

// Encrypt sensitive fields in an object
function encryptObject(obj, sensitiveFields) {
  const encrypted = { ...obj }
  
  for (const field of sensitiveFields) {
    if (obj[field] && typeof obj[field] === 'string' && !isEncrypted(obj[field])) {
      encrypted[field] = `ENCRYPTED:${encryptSensitiveData(obj[field])}`
      console.log(`✅ Encrypted field: ${field}`)
    }
  }
  
  return encrypted
}

// Process users.json
function encryptUsersFile() {
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  
  if (!fs.existsSync(usersFile)) {
    console.log('📁 users.json not found, skipping...')
    return
  }
  
  console.log('🔐 Processing users.json...')
  
  try {
    const usersData = fs.readFileSync(usersFile, 'utf8')
    const users = JSON.parse(usersData)
    
    let hasChanges = false
    const encryptedUsers = users.map(user => {
      const sensitiveFields = ['user_email', 'user_pass']
      const encryptedUser = encryptObject(user, sensitiveFields)
      
      if (JSON.stringify(encryptedUser) !== JSON.stringify(user)) {
        hasChanges = true
      }
      
      return encryptedUser
    })
    
    if (hasChanges) {
      fs.writeFileSync(usersFile, JSON.stringify(encryptedUsers, null, 2))
      console.log('✅ users.json encrypted successfully')
    } else {
      console.log('ℹ️  users.json already encrypted')
    }
  } catch (error) {
    console.error('❌ Error processing users.json:', error)
  }
}

// Process settings.json
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
      'googleAppsScriptUrl'
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

// Process wordpress-config.json
function encryptWordPressConfigFile() {
  const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
  
  if (!fs.existsSync(wpConfigFile)) {
    console.log('📁 wordpress-config.json not found, skipping...')
    return
  }
  
  console.log('🔐 Processing wordpress-config.json...')
  
  try {
    const wpConfigData = fs.readFileSync(wpConfigFile, 'utf8')
    const wpConfig = JSON.parse(wpConfigData)
    
    const sensitiveFields = ['username', 'applicationPassword']
    
    const encryptedWpConfig = encryptObject(wpConfig, sensitiveFields)
    
    if (JSON.stringify(encryptedWpConfig) !== JSON.stringify(wpConfig)) {
      fs.writeFileSync(wpConfigFile, JSON.stringify(encryptedWpConfig, null, 2))
      console.log('✅ wordpress-config.json encrypted successfully')
    } else {
      console.log('ℹ️  wordpress-config.json already encrypted')
    }
  } catch (error) {
    console.error('❌ Error processing wordpress-config.json:', error)
  }
}

// Process plugin-config.json
function encryptPluginConfigFile() {
  const pluginConfigFile = path.join(process.cwd(), 'data', 'plugin-config.json')
  
  if (!fs.existsSync(pluginConfigFile)) {
    console.log('📁 plugin-config.json not found, skipping...')
    return
  }
  
  console.log('🔐 Processing plugin-config.json...')
  
  try {
    const pluginConfigData = fs.readFileSync(pluginConfigFile, 'utf8')
    const pluginConfig = JSON.parse(pluginConfigData)
    
    const sensitiveFields = ['apiKey']
    
    const encryptedPluginConfig = encryptObject(pluginConfig, sensitiveFields)
    
    if (JSON.stringify(encryptedPluginConfig) !== JSON.stringify(pluginConfig)) {
      fs.writeFileSync(pluginConfigFile, JSON.stringify(encryptedPluginConfig, null, 2))
      console.log('✅ plugin-config.json encrypted successfully')
    } else {
      console.log('ℹ️  plugin-config.json already encrypted')
    }
  } catch (error) {
    console.error('❌ Error processing plugin-config.json:', error)
  }
}

// Main function
function main() {
  console.log('🔐 Starting encryption of sensitive data...')
  console.log('📁 Working directory:', process.cwd())
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('📁 Created data directory')
  }
  
  // Process all files
  encryptUsersFile()
  encryptSettingsFile()
  encryptWordPressConfigFile()
  encryptPluginConfigFile()
  
  console.log('✅ Encryption process completed!')
  console.log('🔒 All sensitive data has been encrypted with ENCRYPTION_KEY')
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  encryptSensitiveData,
  encryptObject,
  encryptUsersFile,
  encryptSettingsFile,
  encryptWordPressConfigFile,
  encryptPluginConfigFile
}
