import { NextRequest, NextResponse } from 'next/server'
import { loadSettings as loadSettingsFromLib, saveSettings as saveSettingsToLib } from '@/lib/settings-storage'
import { saveWordPressConfig } from '@/lib/wordpress-config'

interface SystemSettings {
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

  // Contact / Google Apps Script Settings
  googleAppsScriptUrl: string
  contactRequestTimeoutMs: number
  
  // Metadata
  lastUpdated?: string
  updatedBy?: string
}

// Cập nhật setting cụ thể
const updateSetting = (key: keyof SystemSettings, value: any): SystemSettings => {
  const currentSettings = loadSettingsFromLib() as any
  const updatedSettings = {
    ...currentSettings,
    [key]: value,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin'
  } as any
  saveSettingsToLib(updatedSettings)
  return updatedSettings
}

// Reset settings về mặc định
const resetSettings = (): SystemSettings => {
  const defaultSettings: SystemSettings = {
    siteName: 'LTA - Logistics Technology Application',
    siteDescription: 'Ứng dụng công nghệ logistics hàng đầu Việt Nam',
    siteUrl: 'https://lta.com.vn',
    maintenanceMode: false,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@lta.com.vn',
    smtpPass: '',
    twoFactorAuth: false,
    sessionTimeout: 0,
    passwordPolicy: true,
    loginAttempts: 5,
    maxPasswordAge: 90,
    requireSpecialChars: true,
    lockoutDuration: 15,
    enableAuditLog: true,
    ipWhitelist: '',
    sessionConcurrency: 1,
    emailNotifications: true,
    pushNotifications: false,
    newsAlerts: true,
    systemAlerts: true,
    wordpressSiteUrl: 'https://wp2.ltacv.com',
    wordpressUsername: '',
    wordpressApplicationPassword: '',
    wordpressAutoPublish: false,
    wordpressDefaultCategory: '',
    wordpressDefaultTags: [],
    wordpressFeaturedImageEnabled: true,
    wordpressExcerptLength: 150,
    wordpressStatus: 'draft',

    // Contact / Google Apps Script
    googleAppsScriptUrl: '',
    contactRequestTimeoutMs: 10000
  }
  saveSettings(defaultSettings)
  return defaultSettings
}

export async function GET(request: NextRequest) {
  try {
    const settings = loadSettingsFromLib()
    return NextResponse.json({
      success: true,
      settings: settings
    })
  } catch (error) {
    console.error('Error getting settings:', error)
    return NextResponse.json(
      { error: 'Không thể lấy cài đặt' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Nếu có WordPress config, lưu riêng
    if (body.wordpressConfig) {
      saveWordPressConfig(body.wordpressConfig)
      console.log('✅ WordPress config saved to file')
    }
    
    // Lưu settings chung
    const currentSettings = loadSettingsFromLib()
    const updatedSettings = { ...currentSettings, ...body }
    saveSettingsToLib(updatedSettings)
    
    return NextResponse.json({
      success: true,
      message: 'Cài đặt đã được lưu thành công',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Không thể lưu cài đặt' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    
    console.log('PUT /api/settings - Updating setting:', { key, value: typeof value === 'string' && value.length > 10 ? '***' : value })
    
    if (!key) {
      return NextResponse.json(
        { error: 'Key là bắt buộc' },
        { status: 400 }
      )
    }
    
    // Update specific setting using the storage function
    const updatedSettings = updateSetting(key as keyof SystemSettings, value)
    
    console.log('PUT /api/settings - Updated systemSettings:', {
      ...updatedSettings,
      wordpressApplicationPassword: updatedSettings.wordpressApplicationPassword ? '***' : 'empty'
    })
    
    return NextResponse.json({
      success: true,
      message: `Cài đặt ${key} đã được cập nhật`,
      settings: updatedSettings
    })
    
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { error: 'Không thể cập nhật cài đặt' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Reset to defaults using the storage function
    const resetSettingsData = resetSettings()
    
    return NextResponse.json({
      success: true,
      message: 'Cài đặt đã được khôi phục về mặc định',
      settings: resetSettingsData
    })
    
  } catch (error) {
    console.error('Error resetting settings:', error)
    return NextResponse.json(
      { error: 'Không thể khôi phục cài đặt' },
      { status: 500 }
    )
  }
} 