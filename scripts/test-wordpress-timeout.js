const fs = require('fs')
const path = require('path')

// Helper functions
function getKey() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      const match = envContent.match(/ENCRYPTION_KEY=([^\n]+)/)
      return match ? match[1] : 'default-key-for-testing'
    }
  } catch (error) {
    console.log('Error reading .env.local:', error.message)
  }
  return 'default-key-for-testing'
}

function decryptSensitiveData(encryptedData) {
  try {
    const crypto = require('crypto')
    const key = getKey()
    const algorithm = 'aes-256-cbc'
    
    const parts = encryptedData.split(':')
    if (parts.length !== 2) return encryptedData
    
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = Buffer.from(parts[1], 'hex')
    
    const decipher = crypto.createDecipher(algorithm, key)
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

// Test WordPress connection
async function testWordPressConnection() {
  console.log('🔍 Testing WordPress Connection...')
  
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
  
  // Test REST API connection
  try {
    console.log('\n🔗 Testing REST API...')
    const restUrl = `${wordpressConfig.siteUrl}/wp-json/wp/v2/posts?per_page=1`
    
    const startTime = Date.now()
    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${wordpressConfig.username}:${wordpressConfig.applicationPassword}`).toString('base64')}`
      },
      signal: AbortSignal.timeout(10000)
    })
    const endTime = Date.now()
    
    console.log(`   ⏱️  Response time: ${endTime - startTime}ms`)
    console.log(`   📊 Status: ${response.status}`)
    
    if (response.ok) {
      console.log('   ✅ REST API connection successful')
    } else {
      console.log('   ❌ REST API connection failed')
      return false
    }
  } catch (error) {
    console.log(`   ❌ REST API error: ${error.message}`)
    return false
  }
  
  // Test plugin endpoint
  try {
    console.log('\n🔗 Testing Plugin Endpoint...')
    const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`
    
    const testPayload = {
      apiKey: pluginConfig.apiKey,
      title: 'Test Connection',
      content: 'This is a test connection.',
      excerpt: 'Test excerpt',
      status: 'draft',
      category: '',
      tags: '',
      featuredImage: '',
      additionalImages: [],
      slug: 'test-connection',
      authorUsername: wordpressConfig.username
    }
    
    const startTime = Date.now()
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(30000) // 30 seconds
    })
    const endTime = Date.now()
    
    console.log(`   ⏱️  Response time: ${endTime - startTime}ms`)
    console.log(`   📊 Status: ${response.status}`)
    
    const text = await response.text()
    console.log(`   📄 Response: ${text.substring(0, 200)}...`)
    
    if (response.ok) {
      console.log('   ✅ Plugin endpoint connection successful')
      return true
    } else {
      console.log('   ❌ Plugin endpoint connection failed')
      return false
    }
  } catch (error) {
    console.log(`   ❌ Plugin endpoint error: ${error.message}`)
    return false
  }
}

// Test timeout scenarios
async function testTimeoutScenarios() {
  console.log('\n⏱️  Testing Timeout Scenarios...')
  
  const wordpressConfig = getWordPressConfig()
  const pluginConfig = getPluginConfig()
  
  if (!wordpressConfig || !pluginConfig) {
    console.log('❌ Config not available for timeout test')
    return
  }
  
  const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`
  
  const testPayload = {
    apiKey: pluginConfig.apiKey,
    title: 'Timeout Test',
    content: 'This is a timeout test.',
    excerpt: 'Timeout test excerpt',
    status: 'draft',
    category: '',
    tags: '',
    featuredImage: '',
    additionalImages: [],
    slug: 'timeout-test',
    authorUsername: wordpressConfig.username
  }
  
  // Test với các timeout khác nhau
  const timeouts = [5000, 10000, 15000, 30000]
  
  for (const timeout of timeouts) {
    try {
      console.log(`\n🔄 Testing with ${timeout}ms timeout...`)
      
      const startTime = Date.now()
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(timeout)
      })
      const endTime = Date.now()
      
      console.log(`   ⏱️  Actual time: ${endTime - startTime}ms`)
      console.log(`   📊 Status: ${response.status}`)
      
      if (response.ok) {
        console.log(`   ✅ Success with ${timeout}ms timeout`)
        break
      } else {
        console.log(`   ⚠️  Failed with ${timeout}ms timeout`)
      }
    } catch (error) {
      console.log(`   ❌ Error with ${timeout}ms timeout: ${error.message}`)
    }
  }
}

// Main test function
async function runTests() {
  console.log('🧪 WordPress Timeout Test')
  console.log('========================')
  
  const connectionOk = await testWordPressConnection()
  
  if (connectionOk) {
    await testTimeoutScenarios()
  }
  
  console.log('\n✅ Test completed!')
}

// Run tests
runTests().catch(console.error)
