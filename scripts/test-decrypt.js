const fs = require('fs')
const path = require('path')

// Simple XOR encryption/decryption for testing
function simpleDecrypt(encryptedData) {
  try {
    const key = 'lta-encryption-key-2024-stable-32chars'
    const keyBuffer = Buffer.from(key)
    const combined = Buffer.from(encryptedData, 'base64')
    
    // Tách salt và dữ liệu
    const salt = combined.subarray(0, 8)
    const encrypted = combined.subarray(8)
    
    // XOR decryption
    const decrypted = Buffer.alloc(encrypted.length)
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBuffer[i % keyBuffer.length]
    }
    
    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error.message)
    return null
  }
}

console.log('=== Testing Decryption ===\n')

// Test with sample encrypted data from wordpress-config.json
const testData = [
  "Xu/LV67wOyg40bsvGhYssCpybLmWQIR3txEJxMYLdPVOpg==",
  "PuUkajkdgF040bsvGhYssCpyZJGAcqxa9Hcjh5kqO4tFkwqB9oSyjRXwvhwABDvMFg1rhqxNhgjkVCy25BooqEOmOIye0Q=="
]

testData.forEach((data, index) => {
  console.log(`Test ${index + 1}:`)
  console.log('Encrypted:', data.substring(0, 20) + '...')
  const decrypted = simpleDecrypt(data)
  if (decrypted) {
    console.log('✅ Decrypted:', decrypted.substring(0, 10) + '...')
  } else {
    console.log('❌ Failed to decrypt')
  }
  console.log('')
})

console.log('=== Test Complete ===')
