import fs from 'fs'
import path from 'path'
import { encryptSensitiveData, decryptSensitiveData, sanitizeForLog } from './security'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

// Đảm bảo thư mục data tồn tại
const ensureDataDir = () => {
  const dataDir = path.dirname(SETTINGS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Default settings
const defaultSettings = {
  // General Settings
  siteName: 'LTA - Logistics Technology Application',
  siteDescription: 'Ứng dụng công nghệ logistics hàng đầu Việt Nam',
  siteUrl: 'https://lta.com.vn',
  maintenanceMode: false,
  
  // Email Settings
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: 'noreply@lta.com.vn',
  smtpPass: '',
  
  // Security Settings
  twoFactorAuth: false,
  sessionTimeout: 30,
  passwordPolicy: true,
  loginAttempts: 5,
  maxPasswordAge: 90,
  requireSpecialChars: true,
  lockoutDuration: 15,
  enableAuditLog: true,
  ipWhitelist: '',
  sessionConcurrency: 1,
  
  // Notification Settings
  emailNotifications: true,
  pushNotifications: false,
  newsAlerts: true,
  systemAlerts: true,
  
  // WordPress Settings
  wordpressSiteUrl: 'https://wp2.ltacv.com',
  wordpressUsername: '',
  wordpressApplicationPassword: '',
  wordpressAutoPublish: false,
  wordpressDefaultCategory: '',
  wordpressDefaultTags: [],
  wordpressFeaturedImageEnabled: true,
  wordpressExcerptLength: 150,
  wordpressStatus: 'draft' as 'draft' | 'publish' | 'private',

  // Contact / Google Apps Script
  googleAppsScriptUrl: '',
  contactRequestTimeoutMs: 10000,
  
  // Metadata
  lastUpdated: new Date().toISOString(),
  updatedBy: 'admin'
}

export interface SystemSettings {
  // General Settings
  siteName: string
  siteDescription: string
  siteUrl: string
  maintenanceMode: boolean
  
  // Email Settings
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPass: string
  
  // Security Settings
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordPolicy: boolean
  loginAttempts: number
  maxPasswordAge: number
  requireSpecialChars: boolean
  lockoutDuration: number
  enableAuditLog: boolean
  ipWhitelist: string
  sessionConcurrency: number
  
  // Notification Settings
  emailNotifications: boolean
  pushNotifications: boolean
  newsAlerts: boolean
  systemAlerts: boolean
  
  // WordPress Settings
  wordpressSiteUrl: string
  wordpressUsername: string
  wordpressApplicationPassword: string
  wordpressAutoPublish: boolean
  wordpressDefaultCategory: string
  wordpressDefaultTags: string[]
  wordpressFeaturedImageEnabled: boolean
  wordpressExcerptLength: number
  wordpressStatus: 'draft' | 'publish' | 'private'
  wordpressConfig?: {
    siteUrl: string
    username: string
    applicationPassword: string
    autoPublish: boolean
    defaultCategory: string
    defaultTags: string[]
    featuredImageEnabled: boolean
    excerptLength: number
    status: 'draft' | 'publish' | 'private'
    isConnected: boolean
  }

  // Contact / Google Apps Script
  googleAppsScriptUrl: string
  contactRequestTimeoutMs: number
  
  // Metadata
  lastUpdated: string
  updatedBy: string
}

// Load settings from file
export const loadSettings = (): SystemSettings => {
  try {
    ensureDataDir()
    
    if (!fs.existsSync(SETTINGS_FILE)) {
      // Create default settings file
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2))
      return defaultSettings
    }
    
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
    const settings = JSON.parse(data)
    
    // Ensure new fields exist with defaults for backward compatibility
    const normalized = {
      ...settings,
      googleAppsScriptUrl: settings.googleAppsScriptUrl ?? '',
      contactRequestTimeoutMs: settings.contactRequestTimeoutMs ?? 10000,
    }

    // Helper function to decrypt with double encryption check
    const isLikelyValidText = (text: string) => {
      return typeof text === 'string' && /^[\x20-\x7E]+$/.test(text)
    }

    const decryptWithDoubleCheck = (value: string) => {
      if (!value?.startsWith('ENCRYPTED:')) return value
      try {
        const decrypted = decryptSensitiveData(value.replace('ENCRYPTED:', ''))
        // Check if decrypted result still has ENCRYPTED prefix (double encryption)
        if (decrypted.startsWith('ENCRYPTED:')) {
          return decryptSensitiveData(decrypted.replace('ENCRYPTED:', ''))
        }
        // If decrypted data is garbled (likely wrong key), hide it from UI
        if (!isLikelyValidText(decrypted)) {
          console.warn('⚠️ Decrypted text appears invalid; returning empty to avoid showing garbled data')
          return ''
        }
        return decrypted
      } catch (error) {
        console.error('Failed to decrypt value:', error)
        return ''
      }
    }

    // Decrypt sensitive data
    const decryptedSettings = {
      ...normalized,
      smtpUser: decryptWithDoubleCheck(settings.smtpUser),
      smtpPass: decryptWithDoubleCheck(settings.smtpPass),
      wordpressUsername: decryptWithDoubleCheck(settings.wordpressUsername),
      wordpressApplicationPassword: decryptWithDoubleCheck(settings.wordpressApplicationPassword),
      googleAppsScriptUrl: decryptWithDoubleCheck(settings.googleAppsScriptUrl),
      // Decrypt wordpressConfig object if it exists
      wordpressConfig: settings.wordpressConfig ? {
        ...settings.wordpressConfig,
        username: decryptWithDoubleCheck(settings.wordpressConfig.username),
        applicationPassword: decryptWithDoubleCheck(settings.wordpressConfig.applicationPassword),
      } : undefined,
    }
    
    try {
      console.log('Settings loaded:', sanitizeForLog(JSON.stringify(decryptedSettings)))
    } catch {
      console.log('Settings loaded (masked)')
    }
    return decryptedSettings
  } catch (error) {
    console.error('Error loading settings:', error)
    return defaultSettings
  }
}

// Save settings to file
export const saveSettings = (settings: SystemSettings): void => {
  try {
    ensureDataDir()
    
    // Encrypt sensitive data before saving
    const encryptedSettings = {
      ...settings,
      smtpUser: settings.smtpUser ? `ENCRYPTED:${encryptSensitiveData(settings.smtpUser)}` : '',
      smtpPass: settings.smtpPass ? `ENCRYPTED:${encryptSensitiveData(settings.smtpPass)}` : '',
      wordpressUsername: settings.wordpressUsername ? `ENCRYPTED:${encryptSensitiveData(settings.wordpressUsername)}` : '',
      wordpressApplicationPassword: settings.wordpressApplicationPassword ? `ENCRYPTED:${encryptSensitiveData(settings.wordpressApplicationPassword)}` : '',
      googleAppsScriptUrl: settings.googleAppsScriptUrl ? `ENCRYPTED:${encryptSensitiveData(settings.googleAppsScriptUrl)}` : '',
      // Encrypt wordpressConfig object if it exists
      wordpressConfig: settings.wordpressConfig ? {
        ...settings.wordpressConfig,
        username: settings.wordpressConfig.username ? `ENCRYPTED:${encryptSensitiveData(settings.wordpressConfig.username)}` : '',
        applicationPassword: settings.wordpressConfig.applicationPassword ? `ENCRYPTED:${encryptSensitiveData(settings.wordpressConfig.applicationPassword)}` : '',
      } : undefined,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    }
    
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(encryptedSettings, null, 2))
    console.log('Settings saved successfully to:', SETTINGS_FILE)
  } catch (error) {
    console.error('Error saving settings:', error)
    throw error
  }
}

// Update a specific setting
export const updateSetting = (key: keyof SystemSettings, value: any): SystemSettings => {
  const currentSettings = loadSettings()
  const updatedSettings = {
    ...currentSettings,
    [key]: value,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin'
  }
  
  saveSettings(updatedSettings)
  return updatedSettings
}

// Reset settings to defaults
export const resetSettings = (): SystemSettings => {
  const resetSettings = {
    ...defaultSettings,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin'
  }
  
  saveSettings(resetSettings)
  return resetSettings
} 