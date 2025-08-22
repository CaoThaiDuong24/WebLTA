const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Encryption key (same as in lib/security.ts)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lta-encryption-key-2024-stable-32chars'

// Get encryption key
function getKey() {
  return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
}

// Decrypt sensitive data
function decryptSensitiveData(encryptedData) {
  try {
    const key = getKey()
    const dataBuffer = Buffer.from(encryptedData, 'base64')
    const salt = dataBuffer.slice(0, 8)
    const encrypted = dataBuffer.slice(8)
    const keyBuffer = Buffer.from(key)
    
    // XOR decryption with key
    const decrypted = Buffer.alloc(encrypted.length)
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBuffer[i % keyBuffer.length]
    }
    
    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Load and decrypt WordPress config
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
            return decryptSensitiveData(value.replace('ENCRYPTED:', ''))
          } catch {
            return value
          }
        }
        return value
      }
      
      return {
        ...config,
        username: decryptIfPrefixed(config.username),
        applicationPassword: decryptIfPrefixed(config.applicationPassword),
      }
    } catch (error) {
      console.error('Error reading WordPress config file:', error)
      return null
    }
  }
  return null
}

// Load and decrypt plugin config
function getPluginConfig() {
  const configFile = path.join(process.cwd(), 'data', 'plugin-config.json')
  
  if (fs.existsSync(configFile)) {
    try {
      const configData = fs.readFileSync(configFile, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt API key if needed
      if (config.apiKey && config.apiKey.startsWith('ENCRYPTED:')) {
        config.apiKey = decryptSensitiveData(config.apiKey.replace('ENCRYPTED:', ''))
      }
      
      return config
    } catch (error) {
      console.error('Error reading plugin config file:', error)
      return null
    }
  }
  return null
}

// Test WordPress connection
async function testWordPressConnection() {
  console.log('🔍 Testing WordPress connection...')
  
  const wordpressConfig = getWordPressConfig()
  const pluginConfig = getPluginConfig()
  
  console.log('📋 WordPress Config:', {
    siteUrl: wordpressConfig?.siteUrl,
    username: wordpressConfig?.username ? '***' : 'empty',
    applicationPassword: wordpressConfig?.applicationPassword ? '***' : 'empty'
  })
  
  console.log('📋 Plugin Config:', {
    apiKey: pluginConfig?.apiKey ? '***' : 'empty',
    webhookUrl: pluginConfig?.webhookUrl
  })
  
  if (!wordpressConfig || !wordpressConfig.siteUrl || !wordpressConfig.username || !wordpressConfig.applicationPassword) {
    console.log('❌ WordPress config incomplete')
    return false
  }
  
  if (!pluginConfig || !pluginConfig.apiKey) {
    console.log('❌ Plugin config incomplete')
    return false
  }
  
  // Test basic WordPress REST API
  try {
    const credentials = Buffer.from(`${wordpressConfig.username}:${wordpressConfig.applicationPassword}`).toString('base64')
    const testUrl = `${wordpressConfig.siteUrl}/wp-json/wp/v2/posts?per_page=1`
    
    console.log('🔗 Testing REST API:', testUrl)
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      }
    })
    
    if (response.ok) {
      console.log('✅ WordPress REST API connection successful')
      return true
    } else {
      console.log('❌ WordPress REST API connection failed:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.log('❌ WordPress connection error:', error.message)
    return false
  }
}

// Test plugin AJAX endpoint
async function testPluginEndpoint() {
  console.log('🔍 Testing plugin AJAX endpoint...')
  
  const wordpressConfig = getWordPressConfig()
  const pluginConfig = getPluginConfig()
  
  if (!wordpressConfig?.siteUrl || !pluginConfig?.apiKey) {
    console.log('❌ Config incomplete for plugin test')
    return false
  }
  
  try {
    const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`
    
    console.log('🔗 Testing plugin AJAX:', ajaxUrl)
    
    const payload = {
      apiKey: pluginConfig.apiKey,
      title: 'Test Post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      status: 'draft'
    }
    
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const text = await response.text()
    console.log('📄 Plugin response:', text)
    
    if (response.ok) {
      console.log('✅ Plugin endpoint test successful')
      return true
    } else {
      console.log('❌ Plugin endpoint test failed:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.log('❌ Plugin endpoint error:', error.message)
    return false
  }
}

// Main function
async function main() {
  console.log('🚀 Starting WordPress connection tests...')
  console.log('📁 Working directory:', process.cwd())
  
  const restApiTest = await testWordPressConnection()
  const pluginTest = await testPluginEndpoint()
  
  console.log('\n📊 Test Results:')
  console.log('REST API:', restApiTest ? '✅ PASS' : '❌ FAIL')
  console.log('Plugin AJAX:', pluginTest ? '✅ PASS' : '❌ FAIL')
  
  if (!restApiTest || !pluginTest) {
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check WordPress site URL is accessible')
    console.log('2. Verify username and application password are correct')
    console.log('3. Ensure plugin is installed and activated')
    console.log('4. Check plugin API key is valid')
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testWordPressConnection,
  testPluginEndpoint
}
