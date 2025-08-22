'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Globe, 
  Mail, 
  Save,
  Database,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Loader2
} from 'lucide-react'
import { WordPressConfig } from '@/components/admin/wordpress-config'
import { WordPressSync } from '@/components/admin/wordpress-sync'
import { WordPressTest } from '@/components/admin/wordpress-test'
import { SettingsSync } from '@/components/admin/settings-sync'
import { useToast } from '@/hooks/use-toast'

interface SystemSettings {
  // General Settings
  siteName: string
  siteDescription: string
  siteUrl: string
  maintenanceMode: boolean
  
  // Contact / Google Apps Script
  googleAppsScriptUrl: string
  contactRequestTimeoutMs: number
  
  // Metadata
  lastUpdated?: string
  updatedBy?: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [settings, setSettings] = useState<SystemSettings>({
    // General Settings
    siteName: 'LTA - Logistics Technology Application',
    siteDescription: 'Ứng dụng công nghệ logistics hàng đầu Việt Nam',
    siteUrl: 'https://lta.com.vn',
    maintenanceMode: false,

    // Contact / Google Apps Script
    googleAppsScriptUrl: '',
    contactRequestTimeoutMs: 10000
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      console.log('Settings page - Loading settings from API...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const result = await response.json()
        console.log('Settings page - Settings loaded:', {
          ...result.settings,
          googleAppsScriptUrl: result.settings.googleAppsScriptUrl ? '***' : 'empty'
        })
        setSettings(result.settings)
      } else {
        throw new Error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: "Lỗi tải cài đặt",
        description: "Không thể tải cài đặt từ server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      console.log('Settings page - Saving settings:', {
        ...settings,
        googleAppsScriptUrl: settings.googleAppsScriptUrl ? '***' : 'empty'
      })
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Settings page - Save response:', result)
        setSaveStatus('success')
        toast({
          title: "Lưu thành công",
          description: result.message || "Cài đặt hệ thống đã được lưu thành công",
        })
        
        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Settings page - Save error:', error)
      setSaveStatus('error')
      toast({
        title: "Lỗi lưu cài đặt",
        description: error instanceof Error ? error.message : "Không thể lưu cài đặt hệ thống",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (key: keyof SystemSettings, value: any) => {
    console.log('Settings page - Input change:', { key, value: typeof value === 'string' && value.length > 10 ? '***' : value })
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const result = await response.json()
        setSettings(result.settings)
        toast({
          title: "Đã reset",
          description: result.message || "Cài đặt đã được khôi phục về mặc định",
        })
      } else {
        throw new Error('Failed to reset settings')
      }
    } catch (error) {
      toast({
        title: "Lỗi reset",
        description: "Không thể khôi phục cài đặt về mặc định",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground">
            Quản lý cấu hình và thiết lập hệ thống
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang tải cài đặt...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden admin-content-container">
      <div className="w-full max-w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">
          Quản lý cấu hình và thiết lập hệ thống
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 w-full max-w-full overflow-x-hidden admin-grid">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Cài đặt chung</span>
            </CardTitle>
            <CardDescription>
              Cấu hình cơ bản của website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-sm">Tên website</Label>
              <Input 
                id="siteName" 
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription" className="text-sm">Mô tả website</Label>
              <Textarea 
                id="siteDescription" 
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                rows={2}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteUrl" className="text-sm">URL website</Label>
              <Input 
                id="siteUrl" 
                value={settings.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance" className="text-sm">Chế độ bảo trì</Label>
              <Switch 
                id="maintenance" 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact / Google Apps Script Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LinkIcon className="h-5 w-5" />
              <span>Google Apps Script (Liên hệ)</span>
            </CardTitle>
            <CardDescription>
              Cấu hình URL Apps Script nhận dữ liệu form liên hệ và thời gian chờ phản hồi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="googleAppsScriptUrl" className="text-sm">Apps Script Web App URL</Label>
              <Input 
                id="googleAppsScriptUrl" 
                placeholder="https://script.google.com/macros/s/XXXX/exec"
                value={settings.googleAppsScriptUrl || ''}
                onChange={(e) => handleInputChange('googleAppsScriptUrl', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactRequestTimeoutMs" className="text-sm">Timeout (ms)</Label>
              <Input 
                id="contactRequestTimeoutMs" 
                type="number"
                value={settings.contactRequestTimeoutMs || 10000}
                onChange={(e) => handleInputChange('contactRequestTimeoutMs', parseInt(e.target.value) || 10000)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WordPress Test - Quick Test */}
      <WordPressTest />

      {/* WordPress API Settings - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <span>Cấu hình WordPress API</span>
          </CardTitle>
          <CardDescription>
            Cấu hình kết nối với WordPress để đăng tin tức
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WordPressConfig />
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Cài đặt cơ sở dữ liệu</span>
          </CardTitle>
          <CardDescription>
            Quản lý và sao lưu dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Kích thước database</Label>
              <p className="text-sm text-muted-foreground">2.5 GB</p>
            </div>
            <div className="space-y-2">
              <Label>Sao lưu cuối</Label>
              <p className="text-sm text-muted-foreground">2024-01-15 02:00</p>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <p className="text-sm text-green-600">Hoạt động bình thường</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              Tạo sao lưu
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Khôi phục dữ liệu
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Tối ưu database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sync */}
      <SettingsSync />

      {/* WordPress Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Đồng bộ WordPress</span>
          </CardTitle>
          <CardDescription>
            Đồng bộ dữ liệu 2 chiều giữa hệ thống và WordPress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WordPressSync />
        </CardContent>
      </Card>

      {/* Save Status Alert */}
      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Cài đặt đã được lưu thành công!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          disabled={isSaving || isLoading}
          className="w-full sm:w-auto"
        >
          Khôi phục mặc định
        </Button>
        
        <Button 
          onClick={saveSettings}
          disabled={isSaving || isLoading}
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 