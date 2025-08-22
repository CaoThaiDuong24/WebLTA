const fs = require('fs')
const path = require('path')

// Import crypto for decryption
const crypto = require('crypto')

function decryptSensitiveData(encryptedData) {
  try {
    const ENCRYPTION_KEY = 'lta-encryption-key-2024-stable-32chars'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const combined = Buffer.from(encryptedData, 'base64')
    
    // Tách salt và dữ liệu
    const salt = combined.subarray(0, 8)
    const encrypted = combined.subarray(8)
    const keyBuffer = Buffer.from(key)
    
    // XOR decryption
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

console.log('=== Direct Decryption Test ===\n')

// Test with actual data from wordpress-config.json
const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
if (fs.existsSync(wpConfigFile)) {
  const wpConfig = JSON.parse(fs.readFileSync(wpConfigFile, 'utf8'))
  
  console.log('Testing username decryption:')
  if (wpConfig.username?.startsWith('ENCRYPTED:')) {
    try {
      const decrypted = decryptSensitiveData(wpConfig.username.replace('ENCRYPTED:', ''))
      console.log('✅ Username decrypted:', decrypted)
    } catch (error) {
      console.log('❌ Username decryption failed:', error.message)
    }
  } else {
    console.log('Username not encrypted')
  }
  
  console.log('\nTesting password decryption:')
  if (wpConfig.applicationPassword?.startsWith('ENCRYPTED:')) {
    try {
      const decrypted = decryptSensitiveData(wpConfig.applicationPassword.replace('ENCRYPTED:', ''))
      console.log('✅ Password decrypted:', decrypted.substring(0, 10) + '...')
    } catch (error) {
      console.log('❌ Password decryption failed:', error.message)
    }
  } else {
    console.log('Password not encrypted')
  }
} else {
  console.log('❌ WordPress config file not found')
}

console.log('\n=== Test Complete ===')
