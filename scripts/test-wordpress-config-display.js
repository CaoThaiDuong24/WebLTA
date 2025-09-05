const fs = require('fs')
const path = require('path')

// Import security functions
const { decryptSensitiveData } = require('./../lib/security.js')

// Load WordPress config
function getWordPressConfig() {
  const configFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
  
  if (fs.existsSync(configFile)) {
    try {
      const configData = fs.readFileSync(configFile, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt sensitive fields if needed
      const decryptIfPrefixed = (value) => {
        if (typeof value === 'string' && value.startsWith('ENCRYPTED:')) {
          try {
            const decrypted = decryptSensitiveData(value.replace('ENCRYPTED:', ''))
            console.log('✅ Decrypted:', value.substring(0, 20) + '... -> ' + decrypted.substring(0, 10) + '...')
            return decrypted
          } catch (error) {
            console.error('❌ Failed to decrypt:', error.message)
            return value
          }
        }
        return value
      }
      
      const normalized = {
        ...config,
        username: decryptIfPrefixed(config.username),
        applicationPassword: decryptIfPrefixed(config.applicationPassword),
        db: config.db ? {
          ...config.db,
          user: decryptIfPrefixed(config.db.user),
          password: decryptIfPrefixed(config.db.password),
        } : undefined,
      }
      
      return normalized
    } catch (error) {
      console.error('Error reading WordPress config file:', error)
    }
  }
  
  return null
}

// Load settings
function loadSettings() {
  const settingsFile = path.join(process.cwd(), 'data', 'settings.json')
  
  if (fs.existsSync(settingsFile)) {
    try {
      const data = fs.readFileSync(settingsFile, 'utf8')
      const settings = JSON.parse(data)
      
      // Decrypt sensitive data
      const decryptedSettings = {
        ...settings,
        smtpUser: settings.smtpUser?.startsWith('ENCRYPTED:') ? 
          decryptSensitiveData(settings.smtpUser.replace('ENCRYPTED:', '')) : settings.smtpUser,
        smtpPass: settings.smtpPass?.startsWith('ENCRYPTED:') ? 
          decryptSensitiveData(settings.smtpPass.replace('ENCRYPTED:', '')) : settings.smtpPass,
        wordpressUsername: settings.wordpressUsername?.startsWith('ENCRYPTED:') ? 
          decryptSensitiveData(settings.wordpressUsername.replace('ENCRYPTED:', '')) : settings.wordpressUsername,
        wordpressApplicationPassword: settings.wordpressApplicationPassword?.startsWith('ENCRYPTED:') ? 
          decryptSensitiveData(settings.wordpressApplicationPassword.replace('ENCRYPTED:', '')) : settings.wordpressApplicationPassword,
        googleAppsScriptUrl: settings.googleAppsScriptUrl?.startsWith('ENCRYPTED:') ?
          decryptSensitiveData(settings.googleAppsScriptUrl.replace('ENCRYPTED:', '')) : settings.googleAppsScriptUrl,
        // Decrypt wordpressConfig object if it exists
        wordpressConfig: settings.wordpressConfig ? {
          ...settings.wordpressConfig,
          username: settings.wordpressConfig.username?.startsWith('ENCRYPTED:') ? 
            decryptSensitiveData(settings.wordpressConfig.username.replace('ENCRYPTED:', '')) : settings.wordpressConfig.username,
          applicationPassword: settings.wordpressConfig.applicationPassword?.startsWith('ENCRYPTED:') ? 
            decryptSensitiveData(settings.wordpressConfig.applicationPassword.replace('ENCRYPTED:', '')) : settings.wordpressConfig.applicationPassword,
        } : undefined,
      }
      
      return decryptedSettings
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }
  
  return null
}

console.log('=== Testing WordPress Config Display ===\n')

// Test WordPress config file
console.log('1. WordPress Config File:')
const wpConfig = getWordPressConfig()
if (wpConfig) {
  console.log('✅ Config loaded successfully')
  console.log('Site URL:', wpConfig.siteUrl)
  console.log('Username:', wpConfig.username || 'empty')
  console.log('Application Password:', wpConfig.applicationPassword ? '***' : 'empty')
  console.log('Auto Publish:', wpConfig.autoPublish)
  console.log('Default Category:', wpConfig.defaultCategory || 'empty')
  console.log('Default Tags:', wpConfig.defaultTags || [])
  console.log('Featured Image Enabled:', wpConfig.featuredImageEnabled)
  console.log('Excerpt Length:', wpConfig.excerptLength)
  console.log('Status:', wpConfig.status)
  console.log('Is Connected:', wpConfig.isConnected)
} else {
  console.log('❌ No WordPress config file found')
}

console.log('\n2. Settings File:')
const settings = loadSettings()
if (settings) {
  console.log('✅ Settings loaded successfully')
  console.log('WordPress Site URL:', settings.wordpressSiteUrl)
  console.log('WordPress Username:', settings.wordpressUsername || 'empty')
  console.log('WordPress Application Password:', settings.wordpressApplicationPassword ? '***' : 'empty')
  console.log('WordPress Auto Publish:', settings.wordpressAutoPublish)
  console.log('WordPress Default Category:', settings.wordpressDefaultCategory || 'empty')
  console.log('WordPress Default Tags:', settings.wordpressDefaultTags || [])
  console.log('WordPress Featured Image Enabled:', settings.wordpressFeaturedImageEnabled)
  console.log('WordPress Excerpt Length:', settings.wordpressExcerptLength)
  console.log('WordPress Status:', settings.wordpressStatus)
  
  if (settings.wordpressConfig) {
    console.log('\nWordPress Config in Settings:')
    console.log('Username:', settings.wordpressConfig.username || 'empty')
    console.log('Application Password:', settings.wordpressConfig.applicationPassword ? '***' : 'empty')
    console.log('Auto Publish:', settings.wordpressConfig.autoPublish)
    console.log('Default Category:', settings.wordpressConfig.defaultCategory || 'empty')
    console.log('Default Tags:', settings.wordpressConfig.defaultTags || [])
    console.log('Featured Image Enabled:', settings.wordpressConfig.featuredImageEnabled)
    console.log('Excerpt Length:', settings.wordpressConfig.excerptLength)
    console.log('Status:', settings.wordpressConfig.status)
    console.log('Is Connected:', settings.wordpressConfig.isConnected)
  }
} else {
  console.log('❌ No settings file found')
}

console.log('\n=== Test Complete ===')
