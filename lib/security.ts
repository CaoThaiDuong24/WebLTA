import crypto from 'crypto'

// Encryption key - should be stored in environment variables in production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lta-encryption-key-2024-stable-32chars'
const ALGORITHM = 'aes-256-cbc'

export class SecurityManager {
  private static instance: SecurityManager
  private key: Buffer

  private constructor() {
    // Ensure key is exactly 32 bytes for AES-256
    this.key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  public encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipher(ALGORITHM, this.key)
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return iv.toString('hex') + ':' + encrypted
    } catch (error) {
      console.error('Encryption error:', error)
      return text // Fallback to plain text if encryption fails
    }
  }

  public decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':')
      if (parts.length !== 2) {
        return encryptedText // Return as-is if not encrypted
      }
      
      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]
      const decipher = crypto.createDecipher(ALGORITHM, this.key)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      return encryptedText // Return as-is if decryption fails
    }
  }

  public hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return salt + ':' + hash
  }

  public verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const parts = hashedPassword.split(':')
      if (parts.length !== 2) return false
      
      const salt = parts[0]
      const hash = parts[1]
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
      return hash === verifyHash
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  public maskSensitiveData(data: string, maskChar: string = '*'): string {
    if (!data || data.length <= 4) {
      return maskChar.repeat(data.length)
    }
    return data.substring(0, 2) + maskChar.repeat(data.length - 4) + data.substring(data.length - 2)
  }

  public sanitizeForLog(data: any): any {
    if (typeof data === 'string') {
      // Check if it looks like sensitive data
      if (data.includes('@') || data.includes('password') || data.includes('token') || data.includes('key')) {
        return this.maskSensitiveData(data)
      }
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') || 
            key.toLowerCase().includes('key') || 
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('email')) {
          sanitized[key] = this.maskSensitiveData(String(value))
        } else {
          sanitized[key] = this.sanitizeForLog(value)
        }
      }
      return sanitized
    }
    return data
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance()

// Utility functions
export const encryptSensitiveData = (data: string): string => {
  return securityManager.encrypt(data)
}

export const decryptSensitiveData = (data: string): string => {
  return securityManager.decrypt(data)
}

export const hashPassword = (password: string): string => {
  return securityManager.hashPassword(password)
}

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return securityManager.verifyPassword(password, hashedPassword)
}

export const maskSensitiveData = (data: string): string => {
  return securityManager.maskSensitiveData(data)
}

export const sanitizeForLog = (data: any): any => {
  return securityManager.sanitizeForLog(data)
}
