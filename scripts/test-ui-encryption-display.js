const fs = require('fs')
const path = require('path')

// ⚡ Test UI Encryption Display
console.log('⚡ Testing UI Encryption Display')
console.log('=================================')

async function testUIEncryptionDisplay() {
  const results = []
  
  try {
    // 1. Test Plugin API Key
    console.log('\n🔧 Testing Plugin API Key...')
    const pluginResponse = await fetch('http://localhost:3000/api/wordpress/plugin-auth')
    if (pluginResponse.ok) {
      const pluginData = await pluginResponse.json()
      const apiKey = pluginData.plugin?.apiKey
      
      if (apiKey && !apiKey.startsWith('ENCRYPTED:') && apiKey.length < 50) {
        console.log('✅ Plugin API Key: Plain text on UI')
        console.log(`   Key: ${apiKey}`)
        results.push('✅ Plugin API Key: OK')
      } else {
        console.log('❌ Plugin API Key: Still encrypted or invalid')
        console.log(`   Key: ${apiKey}`)
        results.push('❌ Plugin API Key: FAILED')
      }
    }
    
    // Check plugin config file (should be encrypted)
    const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json')
    if (fs.existsSync(pluginConfigPath)) {
      const pluginConfig = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf8'))
      if (pluginConfig.apiKey?.startsWith('ENCRYPTED:')) {
        console.log('✅ Plugin Config File: Encrypted locally')
        results.push('✅ Plugin Config File: OK')
      } else {
        console.log('❌ Plugin Config File: Not encrypted locally')
        results.push('❌ Plugin Config File: FAILED')
      }
    }

    // 2. Test WordPress Config
    console.log('\n🔗 Testing WordPress Config...')
    const wpResponse = await fetch('http://localhost:3000/api/wordpress/config')
    if (wpResponse.ok) {
      const wpData = await wpResponse.json()
      const appPassword = wpData.config?.applicationPassword
      
      if (appPassword && !appPassword.startsWith('ENCRYPTED:') && appPassword.includes(' ')) {
        console.log('✅ WordPress Config: Plain text on UI')
        console.log(`   Password: ${appPassword.substring(0, 10)}...`)
        results.push('✅ WordPress Config: OK')
      } else {
        console.log('❌ WordPress Config: Still encrypted or invalid')
        console.log(`   Password: ${appPassword}`)
        results.push('❌ WordPress Config: FAILED')
      }
    }
    
    // Check WordPress config file (should be encrypted)
    const wpConfigPath = path.join(process.cwd(), 'data', 'wordpress-config.json')
    if (fs.existsSync(wpConfigPath)) {
      const wpConfig = JSON.parse(fs.readFileSync(wpConfigPath, 'utf8'))
      if (wpConfig.applicationPassword?.startsWith('ENCRYPTED:')) {
        console.log('✅ WordPress Config File: Encrypted locally')
        results.push('✅ WordPress Config File: OK')
      } else {
        console.log('❌ WordPress Config File: Not encrypted locally')
        results.push('❌ WordPress Config File: FAILED')
      }
    }

    // 3. Test Settings API
    console.log('\n⚙️ Testing Settings API...')
    const settingsResponse = await fetch('http://localhost:3000/api/settings')
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json()
      const wpAppPassword = settingsData.settings?.wordpressApplicationPassword
      
      // Settings should return decrypted data for UI
      if (!wpAppPassword || !wpAppPassword.startsWith('ENCRYPTED:')) {
        console.log('✅ Settings API: Returns plain text for UI')
        results.push('✅ Settings API: OK')
      } else {
        console.log('❌ Settings API: Still returning encrypted data')
        results.push('❌ Settings API: FAILED')
      }
    }

    // 4. Test Users API  
    console.log('\n👥 Testing Users API...')
    const usersResponse = await fetch('http://localhost:3000/api/users')
    if (usersResponse.ok) {
      const usersData = await usersResponse.json()
      const firstUser = usersData.users?.[0]
      
      if (firstUser && !firstUser.user_pass) {
        console.log('✅ Users API: Password excluded from response')
        console.log(`   User: ${firstUser.user_email?.substring(0, 10)}...`)
        results.push('✅ Users API: OK')
      } else {
        console.log('❌ Users API: Password still in response')
        results.push('❌ Users API: FAILED')
      }
    }

    // 5. Check Admin Data File
    console.log('\n👨‍💼 Testing Admin Data File...')
    const adminPath = path.join(process.cwd(), 'data', 'admin.json')
    if (fs.existsSync(adminPath)) {
      const adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'))
      if (adminData.email?.startsWith('ENCRYPTED:') && 
          adminData.password?.startsWith('ENCRYPTED:') &&
          adminData.name?.startsWith('ENCRYPTED:')) {
        console.log('✅ Admin Data File: All sensitive data encrypted')
        results.push('✅ Admin Data File: OK')
      } else {
        console.log('❌ Admin Data File: Some data not encrypted')
        results.push('❌ Admin Data File: FAILED')
      }
    }

    // 6. Check Settings Data File
    console.log('\n📊 Testing Settings Data File...')
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json')
    if (fs.existsSync(settingsPath)) {
      const settingsFile = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
      const wordpressConfig = settingsFile.wordpressConfig
      
      if (wordpressConfig?.username?.startsWith('ENCRYPTED:') && 
          wordpressConfig?.applicationPassword?.startsWith('ENCRYPTED:')) {
        console.log('✅ Settings Data File: WordPress credentials encrypted')
        results.push('✅ Settings Data File: OK')
      } else {
        console.log('❌ Settings Data File: WordPress credentials not encrypted')
        results.push('❌ Settings Data File: FAILED')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    results.push('❌ Test execution: FAILED')
  }

  // Summary
  console.log('\n📋 Test Summary')
  console.log('================')
  results.forEach(result => console.log(result))
  
  const passed = results.filter(r => r.startsWith('✅')).length
  const total = results.length
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All encryption/display tests PASSED!')
    console.log('\n💡 Status:')
    console.log('   • UI displays plain text for easy copy/paste')
    console.log('   • Local files store encrypted data for security')
    console.log('   • APIs properly decrypt/encrypt as needed')
  } else {
    console.log('⚠️  Some tests FAILED - check the results above')
  }
}

// Run the test
testUIEncryptionDisplay().catch(console.error)
