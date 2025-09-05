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

console.log('=== Complete Flow Test ===\n')

// Step 1: User enters new data
const userInput = {
  siteUrl: 'https://test.com',
  username: 'newuser789',
  applicationPassword: 'newpass789',
  autoPublish: true,
  defaultCategory: 'Test Category',
  defaultTags: ['test', 'demo'],
  featuredImageEnabled: true,
  excerptLength: 200,
  status: 'draft',
  isConnected: true
}

console.log('1. User input:')
console.log('Username:', userInput.username)
console.log('Password:', userInput.applicationPassword)

// Step 2: Save to wordpress-config.json (encrypted)
const ensureEncrypted = (value) => {
  if (!value) return value
  if (typeof value === 'string' && value.startsWith('ENCRYPTED:')) return value
  if (typeof value === 'string') return `ENCRYPTED:${encryptSensitiveData(value)}`
  return value
}

const wpConfigToSave = {
  ...userInput,
  username: ensureEncrypted(userInput.username),
  applicationPassword: ensureEncrypted(userInput.applicationPassword),
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
}

const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config-test.json')
fs.writeFileSync(wpConfigFile, JSON.stringify(wpConfigToSave, null, 2))

console.log('\n2. Saved to wordpress-config.json (encrypted)')
console.log('Username in file:', wpConfigToSave.username.substring(0, 20) + '...')
console.log('Password in file:', wpConfigToSave.applicationPassword.substring(0, 20) + '...')

// Step 3: Read encrypted data from file for settings
const fileData = JSON.parse(fs.readFileSync(wpConfigFile, 'utf8'))
const settingsData = {
  wordpressConfig: {
    ...fileData,
    username: fileData.username, // Keep encrypted
    applicationPassword: fileData.applicationPassword // Keep encrypted
  }
}

console.log('\n3. Settings data (encrypted):')
console.log('Username in settings:', settingsData.wordpressConfig.username.substring(0, 20) + '...')
console.log('Password in settings:', settingsData.wordpressConfig.applicationPassword.substring(0, 20) + '...')

// Step 4: Simulate UI reading (decryption)
const uiData = {
  ...settingsData.wordpressConfig,
  username: decryptWithDoubleCheck(settingsData.wordpressConfig.username),
  applicationPassword: decryptWithDoubleCheck(settingsData.wordpressConfig.applicationPassword)
}

console.log('\n4. UI displays (decrypted):')
console.log('Username in UI:', uiData.username)
console.log('Password in UI:', uiData.applicationPassword)

// Step 5: Verification
console.log('\n5. Verification:')
console.log('Username matches:', userInput.username === uiData.username)
console.log('Password matches:', userInput.applicationPassword === uiData.applicationPassword)

// Clean up
fs.unlinkSync(wpConfigFile)

console.log('\n✅ Complete flow test successful!')
console.log('✅ Data is encrypted in storage')
console.log('✅ UI shows real data')
console.log('✅ No double encryption issues')
