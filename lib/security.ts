import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lta-encryption-key-2024-stable-32chars'

// Tạo key từ ENCRYPTION_KEY
function getKey(): Buffer {
  return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
}

// Mã hóa dữ liệu đơn giản
export function encryptSensitiveData(data: string): string {
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

// Giải mã dữ liệu
export function decryptSensitiveData(encryptedData: string): string {
  try {
    const key = getKey()
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
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Mã hóa password với salt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === verifyHash
  } catch (error) {
    return false
  }
}

// Sanitize data for logging (ẩn thông tin nhạy cảm)
export function sanitizeForLog(data: string): string {
  if (!data) return data
  
  // Ẩn email
  const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  data = data.replace(emailRegex, (match, username, domain) => {
    const maskedUsername = username.length > 2 
      ? username.substring(0, 2) + '*'.repeat(username.length - 2)
      : '*'.repeat(username.length)
    return `${maskedUsername}@${domain}`
  })
  
  // Ẩn password
  const passwordRegex = /password["\s]*[:=]["\s]*([^"\s,}]+)/gi
  data = data.replace(passwordRegex, 'password: "***"')
  
  return data
}

// Tạo token ngẫu nhiên
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Hash file content
export function hashFileContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

// Mã hóa object thành JSON string
export function encryptObject(obj: any): string {
  const jsonString = JSON.stringify(obj)
  return encryptSensitiveData(jsonString)
}

// Giải mã JSON string thành object
export function decryptObject(encryptedData: string): any {
  const jsonString = decryptSensitiveData(encryptedData)
  return JSON.parse(jsonString)
}
