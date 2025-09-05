const fs = require('fs')
const path = require('path')
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

function decryptIfPrefixed(value) {
  if (typeof value === 'string' && value.startsWith('ENCRYPTED:')) {
    try {
      const decrypted = decryptSensitiveData(value.replace('ENCRYPTED:', ''))
      console.log('✅ Decrypted successfully')
      // Check if decrypted result still has ENCRYPTED prefix (double encryption)
      if (decrypted.startsWith('ENCRYPTED:')) {
        console.log('⚠️ Double encryption detected, decrypting again...')
        return decryptSensitiveData(decrypted.replace('ENCRYPTED:', ''))
      }
      return decrypted
    } catch (error) {
      console.error('❌ Failed to decrypt value:', error.message)
      return ''
    }
  }
  return value
}

console.log('=== Quick Fix Test ===\n')

// Test with actual data
const wpConfigFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
if (fs.existsSync(wpConfigFile)) {
  const wpConfig = JSON.parse(fs.readFileSync(wpConfigFile, 'utf8'))
  
  console.log('Testing username:')
  const username = decryptIfPrefixed(wpConfig.username)
  console.log('Final username:', username)
  
  console.log('\nTesting password:')
  const password = decryptIfPrefixed(wpConfig.applicationPassword)
  console.log('Final password:', password.substring(0, 10) + '...')
  
  console.log('\n✅ Test complete - UI should now show real data instead of encrypted data')
} else {
  console.log('❌ WordPress config file not found')
}
