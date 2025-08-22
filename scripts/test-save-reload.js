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

console.log('=== Test Save and Reload ===\n')

// Step 1: Simulate old data
const oldData = {
  siteUrl: 'https://old.com',
  username: 'olduser',
  applicationPassword: 'oldpass',
  autoPublish: false,
  defaultCategory: 'Old Category',
  defaultTags: ['old'],
  featuredImageEnabled: false,
  excerptLength: 100,
  status: 'draft',
  isConnected: false
}

console.log('1. Old data:')
console.log('Username:', oldData.username)
console.log('Password:', oldData.applicationPassword)

// Step 2: Save old data to file
const ensureEncrypted = (value) => {
  if (!value) return value
  if (typeof value === 'string' && value.startsWith('ENCRYPTED:')) return value
  if (typeof value === 'string') return `ENCRYPTED:${encryptSensitiveData(value)}`
  return value
}

const oldEncrypted = {
  ...oldData,
  username: ensureEncrypted(oldData.username),
  applicationPassword: ensureEncrypted(oldData.applicationPassword),
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
}

const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config-test.json')
fs.writeFileSync(wpConfigFile, JSON.stringify(oldEncrypted, null, 2))

console.log('\n2. Saved old data to file')

// Step 3: Simulate user entering new data
const newData = {
  siteUrl: 'https://new.com',
  username: 'newuser123',
  applicationPassword: 'newpass456',
  autoPublish: true,
  defaultCategory: 'New Category',
  defaultTags: ['new', 'test'],
  featuredImageEnabled: true,
  excerptLength: 200,
  status: 'publish',
  isConnected: true
}

console.log('\n3. User enters new data:')
console.log('Username:', newData.username)
console.log('Password:', newData.applicationPassword)

// Step 4: Save new data (simulating the save process)
const newEncrypted = {
  ...newData,
  username: ensureEncrypted(newData.username),
  applicationPassword: ensureEncrypted(newData.applicationPassword),
  updatedAt: new Date().toISOString(),
  createdAt: oldEncrypted.createdAt // Keep original creation date
}

fs.writeFileSync(wpConfigFile, JSON.stringify(newEncrypted, null, 2))

console.log('\n4. Saved new data to file')

// Step 5: Simulate reloading data (what UI should do after save)
const reloadedData = JSON.parse(fs.readFileSync(wpConfigFile, 'utf8'))
const decryptedData = {
  ...reloadedData,
  username: decryptWithDoubleCheck(reloadedData.username),
  applicationPassword: decryptWithDoubleCheck(reloadedData.applicationPassword)
}

console.log('\n5. Reloaded data (what UI should show):')
console.log('Username:', decryptedData.username)
console.log('Password:', decryptedData.applicationPassword)

// Step 6: Verification
console.log('\n6. Verification:')
console.log('Username matches new data:', newData.username === decryptedData.username)
console.log('Password matches new data:', newData.applicationPassword === decryptedData.applicationPassword)
console.log('Username is NOT old data:', oldData.username !== decryptedData.username)
console.log('Password is NOT old data:', oldData.applicationPassword !== decryptedData.applicationPassword)

// Clean up
fs.unlinkSync(wpConfigFile)

console.log('\n✅ Test complete!')
console.log('✅ After save, UI should show NEW data, not OLD data')
