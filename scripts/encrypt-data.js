const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lta-encryption-key-2024-stable-32chars'

// Tạo key từ ENCRYPTION_KEY
function getKey() {
  return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
}

// Mã hóa dữ liệu đơn giản
function encryptSensitiveData(data) {
  try {
    const key = getKey()
    const dataBuffer = Buffer.from(data, 'utf8')
    const keyBuffer = Buffer.from(key)
    
    // XOR encryption với key
    const encrypted = Buffer.alloc(dataBuffer.length)
    for (let i = 0; i < dataBuffer.length; i++) {
      encrypted[i] = dataBuffer[i] ^ keyBuffer[i % keyBuffer.length]
    }
    
    // Thêm salt và encode base64
    const salt = crypto.randomBytes(8)
    const combined = Buffer.concat([salt, encrypted])
    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

// Mã hóa file admin.json
function encryptAdminData() {
  const adminFile = path.join(process.cwd(), 'data', 'admin.json')
  
  if (fs.existsSync(adminFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(adminFile, 'utf8'))
      
      const encryptedData = {
        email: `ENCRYPTED:${encryptSensitiveData(data.email)}`,
        password: `ENCRYPTED:${encryptSensitiveData(data.password)}`,
        name: `ENCRYPTED:${encryptSensitiveData(data.name)}`,
        role: data.role,
        created_at: data.created_at,
        updated_at: data.updated_at,
        security_version: "2.0",
        encryption_enabled: true
      }
      
      fs.writeFileSync(adminFile, JSON.stringify(encryptedData, null, 2))
      console.log('✅ Admin data encrypted successfully')
    } catch (error) {
      console.error('❌ Error encrypting admin data:', error)
    }
  }
}

// Mã hóa file users.json
function encryptUsersData() {
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  
  if (fs.existsSync(usersFile)) {
    try {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
      
      const encryptedUsers = users.map(user => ({
        ...user,
        user_login: `ENCRYPTED:${encryptSensitiveData(user.user_login)}`,
        user_email: `ENCRYPTED:${encryptSensitiveData(user.user_email)}`,
        user_pass: `ENCRYPTED:${encryptSensitiveData(user.user_pass)}`,
        display_name: `ENCRYPTED:${encryptSensitiveData(user.display_name)}`,
        security_version: "2.0"
      }))
      
      fs.writeFileSync(usersFile, JSON.stringify(encryptedUsers, null, 2))
      console.log('✅ Users data encrypted successfully')
    } catch (error) {
      console.error('❌ Error encrypting users data:', error)
    }
  }
}

// Chạy mã hóa
console.log('🔐 Starting data encryption...')
encryptAdminData()
encryptUsersData()
console.log('✅ Data encryption completed!')
