const fs = require('fs')
const path = require('path')

// Helper functions
function getKey() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      const match = envContent.match(/ENCRYPTION_KEY=([^\n]+)/)
      if (match) {
        // Ensure key is 32 bytes for AES-256
        const key = match[1]
        return key.length >= 32 ? key.substring(0, 32) : key.padEnd(32, '0')
      }
    }
  } catch (error) {
    console.log('Error reading .env.local:', error.message)
  }
  // Return 32-byte default key
  return 'default-key-for-testing-32bytes-long'
}

function decryptSensitiveData(encryptedData) {
  try {
    const crypto = require('crypto')
    const rawKey = getKey()
    // Create a proper 32-byte key using SHA-256
    const key = crypto.createHash('sha256').update(rawKey).digest()
    const algorithm = 'aes-256-cbc'
    
    const parts = encryptedData.split(':')
    if (parts.length !== 2) return encryptedData
    
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = Buffer.from(parts[1], 'hex')
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedText, null, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.log('Decryption error:', error.message)
    return encryptedData
  }
}

function getWordPressConfig() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'wordpress-config.json')
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt sensitive fields
      if (config.username && config.username.startsWith('ENCRYPTED:')) {
        config.username = decryptSensitiveData(config.username.replace('ENCRYPTED:', ''))
      }
      if (config.applicationPassword && config.applicationPassword.startsWith('ENCRYPTED:')) {
        config.applicationPassword = decryptSensitiveData(config.applicationPassword.replace('ENCRYPTED:', ''))
      }
      
      return config
    }
    return null
  } catch (error) {
    console.log('Error loading WordPress config:', error.message)
    return null
  }
}

function getPluginConfig() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'plugin-config.json')
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt API key if needed
      if (config.apiKey && config.apiKey.startsWith('ENCRYPTED:')) {
        config.apiKey = decryptSensitiveData(config.apiKey.replace('ENCRYPTED:', ''))
      }
      
      return config
    }
    return null
  } catch (error) {
    console.log('Error loading Plugin config:', error.message)
    return null
  }
}

// Test API key với WordPress plugin
async function testApiKey() {
  console.log('🔍 Testing API Key with WordPress Plugin...')
  
  const wordpressConfig = getWordPressConfig()
  const pluginConfig = getPluginConfig()
  
  if (!wordpressConfig) {
    console.log('❌ WordPress config not found')
    return false
  }
  
  if (!pluginConfig) {
    console.log('❌ Plugin config not found')
    return false
  }
  
  console.log('📋 Config loaded:')
  console.log(`   Site URL: ${wordpressConfig.siteUrl}`)
  console.log(`   Username: ${wordpressConfig.username}`)
  console.log(`   API Key: ${pluginConfig.apiKey ? '***' + pluginConfig.apiKey.slice(-4) : 'Not set'}`)
  
  // Test với API key hiện tại
  try {
    console.log('\n🔗 Testing current API key...')
    const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`
    
    const testPayload = {
      apiKey: pluginConfig.apiKey,
      title: 'API Key Test',
      content: 'This is an API key test.',
      excerpt: 'API key test excerpt',
      status: 'draft',
      category: '',
      tags: '',
      featuredImage: '',
      additionalImages: [],
      slug: 'api-key-test',
      authorUsername: wordpressConfig.username
    }
    
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(15000)
    })
    
    const text = await response.text()
    console.log(`   📊 Status: ${response.status}`)
    console.log(`   📄 Response: ${text}`)
    
    if (response.ok) {
      console.log('   ✅ API key is working!')
      return true
    } else if (response.status === 401) {
      console.log('   ❌ API key is invalid (401 Unauthorized)')
      return false
    } else {
      console.log('   ⚠️  Other error occurred')
      return false
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

// Generate new API key
function generateApiKey() {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

// Update plugin config với API key mới
function updatePluginConfig(newApiKey) {
  try {
    const configPath = path.join(process.cwd(), 'data', 'plugin-config.json')
    const config = getPluginConfig() || {}
    
    // Encrypt API key
    const crypto = require('crypto')
    const rawKey = getKey()
    // Create a proper 32-byte key using SHA-256
    const key = crypto.createHash('sha256').update(rawKey).digest()
    const algorithm = 'aes-256-cbc'
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(newApiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const encryptedApiKey = `ENCRYPTED:${iv.toString('hex')}:${encrypted}`
    
    // Update config
    config.apiKey = encryptedApiKey
    
    // Save config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log('✅ Plugin config updated with new API key')
    
    return newApiKey
  } catch (error) {
    console.log('❌ Error updating plugin config:', error.message)
    return null
  }
}

// Test với API key mới
async function testNewApiKey(newApiKey) {
  console.log('\n🔄 Testing with new API key...')
  
  const wordpressConfig = getWordPressConfig()
  
  if (!wordpressConfig) {
    console.log('❌ WordPress config not found')
    return false
  }
  
  try {
    const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`
    
    const testPayload = {
      apiKey: newApiKey,
      title: 'New API Key Test',
      content: 'This is a test with new API key.',
      excerpt: 'New API key test excerpt',
      status: 'draft',
      category: '',
      tags: '',
      featuredImage: '',
      additionalImages: [],
      slug: 'new-api-key-test',
      authorUsername: wordpressConfig.username
    }
    
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(15000)
    })
    
    const text = await response.text()
    console.log(`   📊 Status: ${response.status}`)
    console.log(`   📄 Response: ${text}`)
    
    if (response.ok) {
      console.log('   ✅ New API key is working!')
      return true
    } else {
      console.log('   ❌ New API key still not working')
      return false
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

// Main function
async function main() {
  console.log('🔑 API Key Check & Fix')
  console.log('=====================')
  
  // Test API key hiện tại
  const currentKeyWorks = await testApiKey()
  
  if (currentKeyWorks) {
    console.log('\n✅ Current API key is working fine!')
    return
  }
  
  console.log('\n🔧 Current API key is not working. Generating new one...')
  
  // Generate new API key
  const newApiKey = generateApiKey()
  console.log(`📝 New API key: ${newApiKey}`)
  
  // Update plugin config
  const updated = updatePluginConfig(newApiKey)
  if (!updated) {
    console.log('❌ Failed to update plugin config')
    return
  }
  
  // Test new API key
  const newKeyWorks = await testNewApiKey(newApiKey)
  
  if (newKeyWorks) {
    console.log('\n✅ New API key is working!')
    console.log('\n📋 Next steps:')
    console.log('1. Copy the new API key above')
    console.log('2. Go to WordPress Admin → LTA News Sync')
    console.log('3. Paste the new API key in the settings')
    console.log('4. Save the settings')
    console.log('5. Test creating news again')
  } else {
    console.log('\n❌ New API key still not working')
    console.log('This might indicate a plugin configuration issue in WordPress')
  }
}

// Run
main().catch(console.error)
