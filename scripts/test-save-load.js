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

console.log('=== Test Save and Load ===\n')

// Test data
const testConfig = {
  siteUrl: 'https://test.com',
  username: 'testuser',
  applicationPassword: 'testpass123',
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

console.log('\n2. After encryption (what gets saved to file):')
console.log('Username:', toSave.username.substring(0, 20) + '...')
console.log('Password:', toSave.applicationPassword.substring(0, 20) + '...')

// Simulate getWordPressConfig (decryption)
const decryptedConfig = {
  ...toSave,
  username: decryptWithDoubleCheck(toSave.username),
  applicationPassword: decryptWithDoubleCheck(toSave.applicationPassword)
}

console.log('\n3. After decryption (what UI should show):')
console.log('Username:', decryptedConfig.username)
console.log('Password:', decryptedConfig.applicationPassword)

// Test if they match
console.log('\n4. Verification:')
console.log('Username matches:', testConfig.username === decryptedConfig.username)
console.log('Password matches:', testConfig.applicationPassword === decryptedConfig.password)

console.log('\n✅ Test complete!')
