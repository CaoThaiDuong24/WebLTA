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
        const key = match[1]
        return key.length >= 32 ? key.substring(0, 32) : key.padEnd(32, '0')
      }
    }
  } catch (error) {
    console.log('Error reading .env.local:', error.message)
  }
  return 'default-key-for-testing-32bytes-long'
}

function decryptSensitiveData(encryptedData) {
  try {
    const crypto = require('crypto')
    const rawKey = getKey()
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

function getPluginConfig() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'plugin-config.json')
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configData)
      
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

// Test news creation
async function testNewsCreation() {
  console.log('🧪 Testing News Creation')
  console.log('========================')
  
  const pluginConfig = getPluginConfig()
  
  if (!pluginConfig) {
    console.log('❌ Plugin config not found')
    return
  }
  
  console.log('📋 Plugin config loaded')
  console.log(`   API Key: ${pluginConfig.apiKey ? '***' + pluginConfig.apiKey.slice(-4) : 'Not set'}`)
  
  // Test data
  const testNews = {
    title: 'Test News Creation - ' + new Date().toISOString(),
    excerpt: 'This is a test news creation to check if the system is working properly.',
    content: `
      <h2>Test Content</h2>
      <p>This is a test news article created to verify that the news creation system is working correctly.</p>
      <p>The system should be able to:</p>
      <ul>
        <li>Create news articles</li>
        <li>Publish to WordPress</li>
        <li>Handle timeouts properly</li>
        <li>Return proper responses</li>
      </ul>
      <p>If you can see this content, the test was successful!</p>
    `,
    status: 'draft',
    category: 'Test',
    tags: 'test, creation, verification',
    featured: false
  }
  
  try {
    console.log('\n🚀 Creating test news...')
    console.log(`   Title: ${testNews.title}`)
    
    const startTime = Date.now()
    
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testNews),
      signal: AbortSignal.timeout(60000) // 60 seconds timeout
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`   ⏱️  Duration: ${duration}ms`)
    console.log(`   📊 Status: ${response.status}`)
    
    const text = await response.text()
    let result
    try {
      result = JSON.parse(text)
    } catch (e) {
      console.log(`   📄 Raw response: ${text}`)
      return
    }
    
    if (response.ok && result.success) {
      console.log('   ✅ News created successfully!')
      console.log(`   📋 WordPress ID: ${result.data?.wordpressId || 'N/A'}`)
      console.log(`   🔗 Local ID: ${result.data?.id || 'N/A'}`)
      console.log(`   📝 Message: ${result.message || 'N/A'}`)
    } else {
      console.log('   ❌ News creation failed!')
      console.log(`   📄 Error: ${result.error || 'Unknown error'}`)
      console.log(`   ⚠️  Warning: ${result.warning || 'N/A'}`)
      
      if (result.details) {
        console.log(`   🔍 Details: ${JSON.stringify(result.details, null, 2)}`)
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    
    if (error.name === 'TimeoutError') {
      console.log('   ⏰ Request timed out - WordPress might be slow or unresponsive')
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('   🔌 Network error - Check if the server is running')
    }
  }
}

// Test multiple scenarios
async function testScenarios() {
  console.log('\n🔬 Testing Different Scenarios')
  console.log('==============================')
  
  const scenarios = [
    {
      name: 'Simple Draft',
      data: {
        title: 'Simple Draft Test',
        excerpt: 'A simple draft test.',
        content: '<p>This is a simple draft test.</p>',
        status: 'draft'
      }
    },
    {
      name: 'Published Post',
      data: {
        title: 'Published Post Test',
        excerpt: 'A published post test.',
        content: '<p>This is a published post test.</p>',
        status: 'published'
      }
    },
    {
      name: 'With Category',
      data: {
        title: 'Category Test',
        excerpt: 'A test with category.',
        content: '<p>This is a test with category.</p>',
        status: 'draft',
        category: 'Test Category'
      }
    }
  ]
  
  for (const scenario of scenarios) {
    console.log(`\n🔄 Testing: ${scenario.name}`)
    
    try {
      const startTime = Date.now()
      
      const response = await fetch('http://localhost:3000/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenario.data),
        signal: AbortSignal.timeout(30000)
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      const text = await response.text()
      let result
      try {
        result = JSON.parse(text)
      } catch (e) {
        console.log(`   ❌ Invalid JSON response`)
        continue
      }
      
      if (response.ok && result.success) {
        console.log(`   ✅ Success (${duration}ms)`)
      } else {
        console.log(`   ❌ Failed (${duration}ms): ${result.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
}

// Main function
async function main() {
  await testNewsCreation()
  await testScenarios()
  
  console.log('\n✅ Test completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Check the results above')
  console.log('2. If there are errors, follow the troubleshooting guide')
  console.log('3. Update API key in WordPress if needed')
  console.log('4. Test again after fixes')
}

// Run
main().catch(console.error)
