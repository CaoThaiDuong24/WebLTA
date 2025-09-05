const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function encryptSensitiveData(data) {
  const ENCRYPTION_KEY = 'lta-encryption-key-2024-stable-32chars'
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const salt = crypto.randomBytes(8)
  const encrypted = Buffer.alloc(data.length)
  
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data.charCodeAt(i) ^ key[i % key.length]
  }
  
  const combined = Buffer.concat([salt, encrypted])
  return combined.toString('base64')
}

function decryptSensitiveData(encryptedData) {
  try {
    const ENCRYPTION_KEY = 'lta-encryption-key-2024-stable-32chars'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const combined = Buffer.from(encryptedData, 'base64')
    
    const salt = combined.subarray(0, 8)
    const encrypted = combined.subarray(8)
    const keyBuffer = Buffer.from(key)
    
    const decrypted = Buffer.alloc(encrypted.length)
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBuffer[i % keyBuffer.length]
    }
    
    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error.message)
    throw new Error('Failed to decrypt data')
  }
}

function decryptWithDoubleCheck(value) {
  if (!value?.startsWith('ENCRYPTED:')) return value
  try {
    const decrypted = decryptSensitiveData(value.replace('ENCRYPTED:', ''))
    if (decrypted.startsWith('ENCRYPTED:')) {
      return decryptSensitiveData(decrypted.replace('ENCRYPTED:', ''))
    }
    return decrypted
  } catch (error) {
    console.error('Failed to decrypt value:', error)
    return ''
  }
}

console.log('=== Real Save and Load Test ===\n')

// Test data
const testConfig = {
  siteUrl: 'https://test.com',
  username: 'newuser123',
  applicationPassword: 'newpass456',
  autoPublish: true,
  defaultCategory: 'Test Category',
  defaultTags: ['test', 'demo'],
  featuredImageEnabled: true,
  excerptLength: 200,
  status: 'draft',
  isConnected: true
}

console.log('1. Original test data:')
console.log('Username:', testConfig.username)
console.log('Password:', testConfig.applicationPassword)

// Simulate saveWordPressConfig
const ensureEncrypted = (value) => {
  if (!value) return value
  if (typeof value === 'string' && value.startsWith('ENCRYPTED:')) return value
  if (typeof value === 'string') return `ENCRYPTED:${encryptSensitiveData(value)}`
  return value
}

const toSave = {
  ...testConfig,
  username: ensureEncrypted(testConfig.username),
  applicationPassword: ensureEncrypted(testConfig.applicationPassword),
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
}

// Save to file
const configFile = path.join(process.cwd(), 'data', 'wordpress-config-test.json')
fs.writeFileSync(configFile, JSON.stringify(toSave, null, 2))
console.log('\n2. Saved to file:', configFile)

// Read from file
const savedData = JSON.parse(fs.readFileSync(configFile, 'utf8'))
console.log('\n3. Read from file:')
console.log('Username in file:', savedData.username.substring(0, 20) + '...')
console.log('Password in file:', savedData.applicationPassword.substring(0, 20) + '...')

// Decrypt
const decryptedConfig = {
  ...savedData,
  username: decryptWithDoubleCheck(savedData.username),
  applicationPassword: decryptWithDoubleCheck(savedData.applicationPassword)
}

console.log('\n4. After decryption:')
console.log('Username:', decryptedConfig.username)
console.log('Password:', decryptedConfig.applicationPassword)

// Verification
console.log('\n5. Verification:')
console.log('Username matches:', testConfig.username === decryptedConfig.username)
console.log('Password matches:', testConfig.applicationPassword === decryptedConfig.applicationPassword)

// Clean up
fs.unlinkSync(configFile)
console.log('\n6. Cleaned up test file')

console.log('\n✅ Test complete!')
