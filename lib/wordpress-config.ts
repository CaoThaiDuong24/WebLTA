import { decryptSensitiveData, encryptSensitiveData, sanitizeForLog } from './security'
import fs from 'fs'
import path from 'path'

export interface WordPressConfig {
  siteUrl: string
  username: string
  applicationPassword: string
  isConnected?: boolean
  autoPublish?: boolean
  restApiBlocked?: boolean
  lastSyncDate?: string | null
  syncMethod?: string
  createdAt?: string
  updatedAt?: string
  db?: {
    host?: string
    user?: string
    password?: string
    database?: string
    port?: number
    tablePrefix?: string
  }
}

export function getWordPressConfig(): WordPressConfig | null {
  const configFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
  
  // Try to read from JSON file first
  if (fs.existsSync(configFile)) {
    try {
      const configData = fs.readFileSync(configFile, 'utf8')
      const config = JSON.parse(configData)
      // Decrypt sensitive fields if needed
      const isLikelyValidText = (text: string) => {
        // Accept common printable characters including spaces; reject control/garbled bytes
        return typeof text === 'string' && /^[\x20-\x7E]+$/.test(text)
      }

      const decryptIfPrefixed = (value: any) => {
        if (typeof value === 'string' && value.startsWith('ENCRYPTED:')) {
          try {
            const decrypted = decryptSensitiveData(value.replace('ENCRYPTED:', ''))
            console.log('✅ Decrypted successfully')
            // Check if decrypted result still has ENCRYPTED prefix (double encryption)
            if (decrypted.startsWith('ENCRYPTED:')) {
              console.log('⚠️ Double encryption detected, decrypting again...')
              return decryptSensitiveData(decrypted.replace('ENCRYPTED:', ''))
            }
            // If decryption yields unreadable text (likely wrong key), hide it
            if (!isLikelyValidText(decrypted)) {
              console.warn('⚠️ Decrypted text appears invalid; returning empty to avoid showing garbled data')
              return ''
            }
            return decrypted
          } catch (error) {
            console.error('❌ Failed to decrypt value:', error.message)
            // Return empty string instead of encrypted value to avoid showing encrypted data on UI
            return ''
          }
        }
        // If not encrypted, return as is
        return value
      }
      const normalized: WordPressConfig = {
        ...config,
        username: decryptIfPrefixed(config.username),
        applicationPassword: decryptIfPrefixed(config.applicationPassword),
        db: config.db ? {
          ...config.db,
          user: decryptIfPrefixed(config.db.user),
          password: decryptIfPrefixed(config.db.password),
        } : undefined,
      }
      try {
        console.log('WordPress config loaded from file:', sanitizeForLog(JSON.stringify(normalized)))
      } catch {
        console.log('WordPress config loaded from file: (masked)')
      }
      return normalized
    } catch (error) {
      console.error('Error reading WordPress config file:', error)
    }
  }

  // Try environment variables as fallback
  const siteUrl = process.env.WORDPRESS_SITE_URL
  const username = process.env.WORDPRESS_USERNAME
  const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD

  if (siteUrl && username && applicationPassword) {
    const config = {
      siteUrl,
      username,
      applicationPassword,
      isConnected: false // Default to false for env config
    }
    try {
      console.log('WordPress config loaded from env:', sanitizeForLog(JSON.stringify(config)))
    } catch {
      console.log('WordPress config loaded from env (masked)')
    }
    return config
  }

  // Fallback to default values for development
  const fallbackConfig = {
    siteUrl: 'https://wp2.ltacv.com',
    username: 'admin',
    applicationPassword: 'your-application-password',
    isConnected: false
  }
  try {
    console.log('WordPress config using fallback:', sanitizeForLog(JSON.stringify(fallbackConfig)))
  } catch {
    console.log('WordPress config using fallback (masked)')
  }
  return fallbackConfig
}

export function saveWordPressConfig(config: WordPressConfig): void {
  const configFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
  const configDir = path.dirname(configFile)
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
  
  // Load existing (possibly encrypted) config to preserve values when input is left blank
  let existingRaw: any = null
  if (fs.existsSync(configFile)) {
    try {
      existingRaw = JSON.parse(fs.readFileSync(configFile, 'utf8'))
    } catch {}
  }

  // Add timestamps
  const configWithTimestamps = {
    ...config,
    // If username/password empty, keep existing encrypted value
    username: config.username || (existingRaw?.username || ''),
    applicationPassword: config.applicationPassword || (existingRaw?.applicationPassword || ''),
    db: config.db ? {
      ...config.db,
      user: config.db.user || (existingRaw?.db?.user || ''),
      password: config.db.password || (existingRaw?.db?.password || '')
    } : config.db,
    updatedAt: new Date().toISOString(),
    createdAt: config.createdAt || existingRaw?.createdAt || new Date().toISOString()
  }

  // Encrypt sensitive fields before saving
  const ensureEncrypted = (value: any) => {
    if (!value) return value
    if (typeof value === 'string' && value.startsWith('ENCRYPTED:')) return value
    if (typeof value === 'string') return `ENCRYPTED:${encryptSensitiveData(value)}`
    return value
  }
  const toSave = {
    ...configWithTimestamps,
    username: ensureEncrypted(configWithTimestamps.username),
    applicationPassword: ensureEncrypted(configWithTimestamps.applicationPassword),
    db: configWithTimestamps.db ? {
      ...configWithTimestamps.db,
      user: ensureEncrypted(configWithTimestamps.db.user),
      password: ensureEncrypted(configWithTimestamps.db.password),
    } : undefined,
  }

  fs.writeFileSync(configFile, JSON.stringify(toSave, null, 2))
  console.log('WordPress config saved to file')
}

export function encryptWordPressConfig(config: WordPressConfig): WordPressConfig {
  return {
    ...config,
    username: encryptSensitiveData(config.username),
    applicationPassword: encryptSensitiveData(config.applicationPassword)
  }
}

export function decryptWordPressConfig(config: WordPressConfig): WordPressConfig {
  return {
    ...config,
    username: decryptSensitiveData(config.username),
    applicationPassword: decryptSensitiveData(config.applicationPassword)
  }
}
