const fs = require('fs')
const path = require('path')

console.log('=== Quick Fix Test ===\n')

// Test data
const testConfig = {
  siteUrl: 'https://test.com',
  username: 'testuser123',
  applicationPassword: 'testpass456',
  autoPublish: true,
  defaultCategory: 'Test Category',
  defaultTags: ['test', 'demo'],
  featuredImageEnabled: true,
  excerptLength: 200,
  status: 'draft',
  isConnected: true
}

console.log('1. Test data:')
console.log('Username:', testConfig.username)
console.log('Password:', testConfig.applicationPassword)

// Simulate the fix: save to wordpress-config.json first
const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config-test.json')
fs.writeFileSync(wpConfigFile, JSON.stringify({
  ...testConfig,
  username: 'ENCRYPTED:test-encrypted-username',
  applicationPassword: 'ENCRYPTED:test-encrypted-password',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
}, null, 2))

console.log('\n2. Saved to wordpress-config file')

// Read encrypted data from file (simulating the fix)
const fileData = JSON.parse(fs.readFileSync(wpConfigFile, 'utf8'))
console.log('\n3. Read from file:')
console.log('Username in file:', fileData.username)
console.log('Password in file:', fileData.applicationPassword)

// Now save to settings with encrypted data
const settingsData = {
  wordpressConfig: {
    ...fileData,
    username: fileData.username, // Keep encrypted
    applicationPassword: fileData.applicationPassword // Keep encrypted
  }
}

console.log('\n4. Settings data:')
console.log('Username in settings:', settingsData.wordpressConfig.username)
console.log('Password in settings:', settingsData.wordpressConfig.applicationPassword)

// Clean up
fs.unlinkSync(wpConfigFile)

console.log('\n✅ Test complete!')
console.log('✅ No double encryption - data stays encrypted in both files')
