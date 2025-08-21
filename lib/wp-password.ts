import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export function hashWordPressPassword(plain: string): string {
  // WordPress uses portable phpass format ($P$...)
  // We'll use WordPress-compatible phpass hashing
  return phpassHashPassword(plain)
}

// Verify a WordPress password hash which could be:
// - Portable phpass ($P$...)
// - Bcrypt ($2y$, $2a$, $2b$)
// - Legacy MD5
// - SHA256 (for new users created via API)
export function verifyWordPressPassword(plain: string, wpHash: string): boolean {
  if (!plain || !wpHash) return false

  // Bcrypt
  if (wpHash.startsWith('$2y$') || wpHash.startsWith('$2a$') || wpHash.startsWith('$2b$')) {
    try {
      return bcrypt.compareSync(plain, wpHash)
    } catch {
      return false
    }
  }

  // Portable phpass ($P$ or $H$)
  if (wpHash.startsWith('$P$') || wpHash.startsWith('$H$')) {
    return phpassCheckPassword(plain, wpHash)
  }

  // SHA256 (for new users created via API)
  try {
    const sha256 = crypto.createHash('sha256').update(plain).digest('hex')
    if (sha256 === wpHash) {
      return true
    }
  } catch {
    // Continue to MD5 check
  }

  // Legacy MD5
  try {
    const md5 = crypto.createHash('md5').update(plain).digest('hex')
    return md5 === wpHash
  } catch {
    return false
  }
}

// Implementation of portable phpass verification adapted for Node.js
function phpassCheckPassword(password: string, storedHash: string): boolean {
  const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const setting = storedHash.substring(0, 12)

  if (setting.length !== 12 || (setting[0] !== '$') || (setting[1] !== 'P' && setting[1] !== 'H') || setting[2] !== '$') {
    return false
  }

  const countLog2 = itoa64.indexOf(setting[3])
  if (countLog2 < 7 || countLog2 > 30) {
    return false
  }
  const count = 1 << countLog2
  const salt = setting.substring(4, 12)
  if (salt.length !== 8) {
    return false
  }

  // Initial hash
  let hash = crypto
    .createHash('md5')
    .update(Buffer.concat([Buffer.from(salt, 'utf8'), Buffer.from(password, 'utf8')]))
    .digest()

  for (let i = 0; i < count; i += 1) {
    hash = crypto.createHash('md5').update(Buffer.concat([hash, Buffer.from(password, 'utf8')])).digest()
  }

  const output = setting + encode64(hash, 16)
  // WordPress portable hashes are 34 chars
  return output === storedHash
}

function encode64(input: Buffer, count: number): string {
  const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let output = ''
  let i = 0
  while (i < count) {
    let value = input[i++]
    output += itoa64[value & 0x3f]
    if (i < count) {
      value |= input[i] << 8
    }
    output += itoa64[(value >> 6) & 0x3f]
    if (i++ >= count) break
    if (i < count) {
      value |= input[i] << 16
    }
    output += itoa64[(value >> 12) & 0x3f]
    if (i++ >= count) break
    output += itoa64[(value >> 18) & 0x3f]
  }
  return output
}

// WordPress-compatible phpass password hashing
function phpassHashPassword(password: string): string {
  const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  
  // Generate random salt
  const salt = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
  
  // WordPress uses 8192 iterations (2^13)
  const count = 8192
  
  // Initial hash
  let hash = crypto
    .createHash('md5')
    .update(Buffer.concat([Buffer.from(salt, 'utf8'), Buffer.from(password, 'utf8')]))
    .digest()

  for (let i = 0; i < count; i += 1) {
    hash = crypto.createHash('md5').update(Buffer.concat([hash, Buffer.from(password, 'utf8')])).digest()
  }

  // Create setting string: $P$ + count_log2 + salt
  const countLog2 = Math.log2(count)
  const setting = '$P$' + itoa64[Math.floor(countLog2)] + salt
  
  const output = setting + encode64(hash, 16)
  return output
}


