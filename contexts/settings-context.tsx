'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'

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
  
  // Metadata
  lastUpdated?: string
  updatedBy?: string

  // Contact / Google Apps Script
  googleAppsScriptUrl: string
  contactRequestTimeoutMs: number
}

interface SettingsContextType {
  settings: SystemSettings | null
  isLoading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
  updateSetting: (key: keyof SystemSettings, value: any) => Promise<void>
  isMaintenanceMode: boolean
  getSetting: <K extends keyof SystemSettings>(key: K) => SystemSettings[K] | null
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadSettings = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Loading settings from API...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const result = await response.json()
        console.log('Settings loaded successfully:', {
          ...result.settings,
          wordpressApplicationPassword: result.settings?.wordpressApplicationPassword ? '***' : 'empty'
        })
        setSettings(result.settings || null)
      } else {
        throw new Error('Failed to load settings')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error loading settings:', err)
      
      // Don't set fallback settings, keep current settings if they exist
      if (!settings) {
        // Only set fallback if no settings exist at all
        const fallbackSettings = {
          siteName: 'LTA - Logistics Technology Application',
          siteDescription: 'Ứng dụng công nghệ logistics hàng đầu Việt Nam',
          siteUrl: 'https://lta.com.vn',
          maintenanceMode: false,
          smtpHost: 'smtp.gmail.com',
          smtpPort: '587',
          smtpUser: 'noreply@lta.com.vn',
          smtpPass: '',
          twoFactorAuth: false,
          sessionTimeout: 0, // No timeout - session never expires
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
          wordpressStatus: 'draft' as 'draft' | 'publish' | 'private',

          // Contact / Google Apps Script
          googleAppsScriptUrl: '',
          contactRequestTimeoutMs: 10000
        }
        console.log('Using fallback settings (no existing settings):', fallbackSettings)
        setSettings(fallbackSettings)
      } else {
        console.log('Keeping existing settings despite load error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSettings = async () => {
    await loadSettings()
  }

  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    if (!settings) return

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })

      if (response.ok) {
        const result = await response.json()
        setSettings(result.settings)
        toast({
          title: "Cập nhật thành công",
          description: `Cài đặt ${key} đã được cập nhật`,
        })
      } else {
        throw new Error('Failed to update setting')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast({
        title: "Lỗi cập nhật",
        description: `Không thể cập nhật cài đặt ${key}: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }

  const getSetting = <K extends keyof SystemSettings>(key: K): SystemSettings[K] | null => {
    return settings ? settings[key] : null
  }

  const isMaintenanceMode = settings?.maintenanceMode ?? false

  useEffect(() => {
    loadSettings()
  }, [])

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
    refreshSettings,
    updateSetting,
    isMaintenanceMode,
    getSetting
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Hook để kiểm tra maintenance mode
export function useMaintenanceMode() {
  const { isMaintenanceMode, isLoading } = useSettings()
  return { isMaintenanceMode, isLoading }
}

// Hook để lấy setting cụ thể
export function useSetting<K extends keyof SystemSettings>(key: K) {
  const { getSetting, isLoading } = useSettings()
  return { value: getSetting(key), isLoading }
} 