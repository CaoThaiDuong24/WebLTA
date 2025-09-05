import { NextRequest, NextResponse } from 'next/server'
import { loadSettings, saveSettings, updateSetting, resetSettings } from '@/lib/settings-storage'
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



export async function GET(request: NextRequest) {
  try {
    // Ưu tiên lấy từ WordPress plugin DB nếu có API key
    const pluginConfigResp = await fetch(`${request.nextUrl.origin}/api/wordpress/plugin-auth`, { method: 'GET' })
    let settingsFromPlugin: any = null
    if (pluginConfigResp.ok) {
      const pluginInfo = await pluginConfigResp.json()
      const apiKey = pluginInfo?.plugin?.apiKey
      // Gọi AJAX plugin để lấy settings trong WP DB
      if (apiKey) {
        const ajaxResp = await fetch(`${pluginInfo?.wordpress?.siteUrl?.replace(/\/$/, '') || ''}/wp-admin/admin-ajax.php?action=lta_settings_get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
          // timeout nhẹ để không chặn UI nếu WP chậm
          signal: AbortSignal.timeout(8000)
        }).catch(() => null as any)
        if (ajaxResp && ajaxResp.ok) {
          const pluginData = await ajaxResp.json()
          if (pluginData?.success) settingsFromPlugin = pluginData.data
        }
      }
    }

    // Luôn đọc bản local trước
    const localSettings = loadSettings()

    // Nếu plugin trả về object rỗng hoặc không hợp lệ, ưu tiên local
    let settings = localSettings
    const hasValidPluginData = settingsFromPlugin && typeof settingsFromPlugin === 'object' && Object.keys(settingsFromPlugin).length > 0
    if (hasValidPluginData) {
      // Nếu cả hai có lastUpdated thì chọn bản mới hơn; đồng thời merge để không mất trường mới
      const pluginLast = Date.parse(settingsFromPlugin.lastUpdated || '')
      const localLast = Date.parse(localSettings.lastUpdated || '')
      if (!Number.isNaN(pluginLast) && !Number.isNaN(localLast)) {
        settings = pluginLast >= localLast
          ? { ...localSettings, ...settingsFromPlugin }
          : localSettings
      } else {
        // Nếu không có timestamp, merge plugin đè lên local (giữ trường local khi plugin thiếu)
        settings = { ...localSettings, ...settingsFromPlugin }
      }
    }
    return NextResponse.json({ success: true, settings })
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
      
      // Đọc dữ liệu đã mã hóa trực tiếp từ file thay vì qua getWordPressConfig
      const fs = await import('fs')
      const path = await import('path')
      const configFile = path.join(process.cwd(), 'data', 'wordpress-config.json')
      
      if (fs.existsSync(configFile)) {
        const fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'))
        body.wordpressConfig = {
          ...fileData,
          // Giữ nguyên dữ liệu đã mã hóa từ file
          username: fileData.username,
          applicationPassword: fileData.applicationPassword
        }
      }
    }
    
    // Lưu settings chung: ghi vào WP DB qua plugin nếu có API key; fallback local
    let updatedSettings = { ...(loadSettings() as any), ...body }
    try {
      const pluginInfoResp = await fetch(`${request.nextUrl.origin}/api/wordpress/plugin-auth`, { method: 'GET' })
      if (pluginInfoResp.ok) {
        const pluginInfo = await pluginInfoResp.json()
        const apiKey = pluginInfo?.plugin?.apiKey
        const siteUrl = pluginInfo?.wordpress?.siteUrl
        if (apiKey && siteUrl) {
          const ajaxResp = await fetch(`${String(siteUrl).replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_settings_save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, settings: updatedSettings }),
            signal: AbortSignal.timeout(12000)
          })
          if (ajaxResp.ok) {
            const saved = await ajaxResp.json()
            if (saved?.success && saved?.data) {
              updatedSettings = { ...updatedSettings, ...saved.data }
            }
          }
        }
      }
    } catch (e) {
      // Bỏ qua lỗi WP, vẫn lưu local để không mất cấu hình
    }

    // Luôn lưu bản local như backup
    saveSettings(updatedSettings)
    
    // Đảm bảo trả về dữ liệu đã giải mã để UI không hiển thị chuỗi mã hóa
    const decryptedForResponse = loadSettings()
    
    return NextResponse.json({
      success: true,
      message: 'Cài đặt đã được lưu thành công',
      settings: decryptedForResponse
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
    
    // Cập nhật: gọi WP plugin trước, sau đó lưu local như backup
    let updatedSettings = updateSetting(key as keyof SystemSettings, value)
    try {
      const pluginInfoResp = await fetch(`${request.nextUrl.origin}/api/wordpress/plugin-auth`, { method: 'GET' })
      if (pluginInfoResp.ok) {
        const pluginInfo = await pluginInfoResp.json()
        const apiKey = pluginInfo?.plugin?.apiKey
        const siteUrl = pluginInfo?.wordpress?.siteUrl
        if (apiKey && siteUrl) {
          const ajaxResp = await fetch(`${String(siteUrl).replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_settings_save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, settings: { [key]: value } }),
            signal: AbortSignal.timeout(8000)
          })
          if (ajaxResp.ok) {
            // Không cần dùng response, WP đã nhận được
          }
        }
      }
    } catch {}
    
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
    // Reset local
    const resetSettingsData = resetSettings()
    // Đồng thời xóa ở WP DB (đặt về rỗng) nếu có API key
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/wordpress/plugin-auth`, { method: 'GET' })
      if (resp?.ok) {
        const info = await resp.json()
        const apiKey = info?.plugin?.apiKey
        const siteUrl = info?.wordpress?.siteUrl
        if (apiKey && siteUrl) {
          await fetch(`${String(siteUrl).replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_settings_save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, settings: {} }),
            signal: AbortSignal.timeout(8000)
          }).catch(() => null)
        }
      }
    } catch {}
    
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