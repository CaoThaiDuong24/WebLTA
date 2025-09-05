import { NextRequest, NextResponse } from 'next/server'
import { loadSettings as loadSettingsFromLib, saveSettings as saveSettingsToLib } from '@/lib/settings-storage'
import { getWordPressConfig } from '@/lib/wordpress-config'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'sync', force = false } = body
    
    console.log('🔄 WordPress Settings Sync - Action:', action)
    
    // Get WordPress config
    const wpConfig = getWordPressConfig()
    if (!wpConfig || !wpConfig.siteUrl) {
      return NextResponse.json(
        { error: 'WordPress configuration not found' },
        { status: 400 }
      )
    }
    
    const wpSiteUrl = wpConfig.siteUrl.replace(/\/$/, '') // Remove trailing slash
    const apiKey = wpConfig.apiKey || wpConfig.applicationPassword
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'WordPress API key not configured' },
        { status: 400 }
      )
    }
    
    // WordPress API endpoints
    const endpoints = {
      save: `${wpSiteUrl}/wp-json/lta-settings/v1/save`,
      get: `${wpSiteUrl}/wp-json/lta-settings/v1/get`,
      sync: `${wpSiteUrl}/wp-json/lta-settings/v1/sync`
    }
    
    // Get current local settings
    const localSettings = loadSettingsFromLib()
    
    switch (action) {
      case 'push':
        // Push local settings to WordPress
        return await pushToWordPress(endpoints.save, localSettings, apiKey)
        
      case 'pull':
        // Pull settings from WordPress
        return await pullFromWordPress(endpoints.get, apiKey)
        
      case 'sync':
      default:
        // Two-way sync
        return await twoWaySync(endpoints.sync, localSettings, apiKey, force)
    }
    
  } catch (error) {
    console.error('❌ WordPress Settings Sync Error:', error)
    return NextResponse.json(
      { error: 'Failed to sync settings with WordPress' },
      { status: 500 }
    )
  }
}

async function pushToWordPress(endpoint: string, settings: SystemSettings, apiKey: string) {
  try {
    console.log('📤 Pushing settings to WordPress...')
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(settings)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WordPress API error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    
    console.log('✅ Settings pushed to WordPress successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Settings pushed to WordPress successfully',
      data: result
    })
    
  } catch (error) {
    console.error('❌ Push to WordPress failed:', error)
    return NextResponse.json(
      { error: `Failed to push settings: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

async function pullFromWordPress(endpoint: string, apiKey: string) {
  try {
    console.log('📥 Pulling settings from WordPress...')
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WordPress API error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.settings) {
      // Save to local storage
      saveSettingsToLib(result.settings)
      console.log('✅ Settings pulled from WordPress and saved locally')
      
      return NextResponse.json({
        success: true,
        message: 'Settings pulled from WordPress successfully',
        data: result
      })
    } else {
      throw new Error('Invalid response from WordPress API')
    }
    
  } catch (error) {
    console.error('❌ Pull from WordPress failed:', error)
    return NextResponse.json(
      { error: `Failed to pull settings: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

async function twoWaySync(endpoint: string, localSettings: SystemSettings, apiKey: string, force: boolean = false) {
  try {
    console.log('🔄 Two-way sync with WordPress...')
    
    // If force is true, push local settings to WordPress
    if (force) {
      console.log('🔄 Force sync: pushing local settings to WordPress')
      return await pushToWordPress(endpoint, localSettings, apiKey)
    }
    
    // Otherwise, do a proper two-way sync
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        ...localSettings,
        action: 'sync'
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WordPress API error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.settings) {
      // Update local settings with merged result
      saveSettingsToLib(result.settings)
      console.log('✅ Two-way sync completed successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Settings synced successfully',
        data: result,
        sync_type: 'two_way'
      })
    } else {
      throw new Error('Invalid response from WordPress API')
    }
    
  } catch (error) {
    console.error('❌ Two-way sync failed:', error)
    return NextResponse.json(
      { error: `Failed to sync settings: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'
    
    if (action === 'status') {
      // Check sync status
      const wpConfig = getWordPressConfig()
      const localSettings = loadSettingsFromLib()
      
      return NextResponse.json({
        success: true,
        data: {
          wordpress_configured: !!(wpConfig && wpConfig.siteUrl),
          wordpress_url: wpConfig?.siteUrl || null,
          local_settings_count: Object.keys(localSettings).length,
          last_updated: localSettings.lastUpdated,
          sync_available: !!(wpConfig && wpConfig.siteUrl && (wpConfig.apiKey || wpConfig.applicationPassword))
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ Settings sync status check failed:', error)
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    )
  }
}
