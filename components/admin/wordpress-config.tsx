'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Globe, 
  Key, 
  TestTube, 
  Save, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  FileText,
  Image,
  Tag,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/contexts/settings-context'

interface WordPressConfig {
  siteUrl: string
  username: string
  password: string
  applicationPassword: string
  autoPublish: boolean
  defaultCategory: string
  defaultTags: string[]
  featuredImageEnabled: boolean
  excerptLength: number
  status: 'draft' | 'publish' | 'private'
}

export function WordPressConfig() {
  const { toast } = useToast()
  const { settings, updateSetting, isLoading, refreshSettings } = useSettings()
  
  const [config, setConfig] = useState<WordPressConfig>({
    siteUrl: 'https://wp2.ltacv.com',
    username: '',
    password: '',
    applicationPassword: '',
    autoPublish: false,
    defaultCategory: '',
    defaultTags: [],
    featuredImageEnabled: true,
    excerptLength: 150,
    status: 'draft'
  })
  
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [newTag, setNewTag] = useState('')

  // Load config from WordPress config file and settings context
  useEffect(() => {
    const loadWordPressConfig = async () => {
      try {
        // Load từ WordPress config file trước
        const wpResponse = await fetch('/api/wordpress/config')
        if (wpResponse.ok) {
          const wpConfig = await wpResponse.json()
          if (wpConfig.config) {
            setConfig({
              siteUrl: wpConfig.config.siteUrl || 'https://wp2.ltacv.com',
              username: wpConfig.config.username || '',
              password: '',
              applicationPassword: wpConfig.config.applicationPassword || '',
              autoPublish: wpConfig.config.autoPublish || false,
              defaultCategory: wpConfig.config.defaultCategory || '',
              defaultTags: wpConfig.config.defaultTags || [],
              featuredImageEnabled: wpConfig.config.featuredImageEnabled !== false,
              excerptLength: wpConfig.config.excerptLength || 150,
              status: (wpConfig.config.status as 'draft' | 'publish' | 'private') || 'draft'
            })
            setIsConnected(wpConfig.config.isConnected || false)
            return
          }
        }
      } catch (error) {
        console.log('Could not load WordPress config from file, falling back to settings context')
      }

      // Fallback to settings context
      if (settings && !isLoading) {
        setConfig({
          siteUrl: settings.wordpressSiteUrl || 'https://wp2.ltacv.com',
          username: settings.wordpressUsername || '',
          password: '',
          applicationPassword: settings.wordpressApplicationPassword || '',
          autoPublish: settings.wordpressAutoPublish || false,
          defaultCategory: settings.wordpressDefaultCategory || '',
          defaultTags: settings.wordpressDefaultTags || [],
          featuredImageEnabled: settings.wordpressFeaturedImageEnabled !== false,
          excerptLength: settings.wordpressExcerptLength || 150,
          status: (settings.wordpressStatus as 'draft' | 'publish' | 'private') || 'draft'
        })
      }
    }

    loadWordPressConfig()
  }, [settings, isLoading])

  // Save config to settings context and file
  const saveConfig = async () => {
    setIsSaving(true)
    try {
      // Lưu cấu hình WordPress vào file để server có thể đọc
      const wordpressConfig = {
        siteUrl: config.siteUrl,
        username: config.username,
        applicationPassword: config.applicationPassword,
        autoPublish: config.autoPublish,
        defaultCategory: config.defaultCategory,
        defaultTags: config.defaultTags,
        featuredImageEnabled: config.featuredImageEnabled,
        excerptLength: config.excerptLength,
        status: config.status,
        isConnected: true
      }
      
      // Lưu vào API settings
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressConfig: wordpressConfig
        }),
      })

      if (response.ok) {
        // Update settings context với dữ liệu mới
        await updateSetting('wordpressSiteUrl', config.siteUrl)
        await updateSetting('wordpressUsername', config.username)
        await updateSetting('wordpressApplicationPassword', config.applicationPassword)
        await updateSetting('wordpressAutoPublish', config.autoPublish)
        await updateSetting('wordpressDefaultCategory', config.defaultCategory)
        await updateSetting('wordpressDefaultTags', config.defaultTags)
        await updateSetting('wordpressFeaturedImageEnabled', config.featuredImageEnabled)
        await updateSetting('wordpressExcerptLength', config.excerptLength)
        await updateSetting('wordpressStatus', config.status)
        
        // Refresh settings context để đảm bảo dữ liệu được cập nhật
        await refreshSettings()
        
        toast({
          title: "Đã lưu cấu hình",
          description: "Cấu hình WordPress API đã được lưu thành công.",
        })
      } else {
        throw new Error('Failed to save WordPress config')
      }
    } catch (error) {
      console.error('Error saving WordPress config:', error)
      toast({
        title: "Lỗi lưu cấu hình",
        description: "Không thể lưu cấu hình WordPress API.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Test WordPress connection
  const testConnection = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/wordpress/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: config.siteUrl,
          username: config.username,
          applicationPassword: config.applicationPassword
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setIsConnected(true)
        setCategories(result.categories || [])
        toast({
          title: "Kết nối thành công",
          description: result.message || "Đã kết nối thành công với WordPress API.",
        })
      } else {
        setIsConnected(false)
        toast({
          title: "Kết nối thất bại",
          description: result.error || "Không thể kết nối với WordPress API.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setIsConnected(false)
      toast({
        title: "Lỗi kết nối",
        description: "Đã xảy ra lỗi khi kiểm tra kết nối.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Add new tag
  const addTag = () => {
    if (newTag.trim() && !config.defaultTags.includes(newTag.trim())) {
      setConfig(prev => ({
        ...prev,
        defaultTags: [...prev.defaultTags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setConfig(prev => ({
      ...prev,
      defaultTags: prev.defaultTags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Trạng thái kết nối:</span>
          {isConnected === null ? (
            <Badge variant="secondary">Chưa kiểm tra</Badge>
          ) : isConnected ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Đã kết nối
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Chưa kết nối
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={testConnection}
          disabled={isTesting}
        >
          {isTesting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4 mr-2" />
          )}
          Kiểm tra kết nối
        </Button>
      </div>

      {/* Basic Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="siteUrl" className="text-sm">WordPress Site URL</Label>
          <Input 
            id="siteUrl" 
            value={config.siteUrl}
            onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
            placeholder="https://your-wordpress-site.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm">Username</Label>
          <Input 
            id="username" 
            value={config.username}
            onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
            placeholder="admin"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationPassword" className="text-sm">Application Password</Label>
        <Input 
          id="applicationPassword" 
          type="password"
          value={config.applicationPassword}
          onChange={(e) => setConfig(prev => ({ ...prev, applicationPassword: e.target.value }))}
          placeholder="•••• •••• •••• ••••"
        />
        <p className="text-xs text-muted-foreground">
          Tạo Application Password trong WordPress Admin → Users → Profile → Application Passwords
        </p>
      </div>

      <Separator />

      {/* Publishing Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tùy chọn xuất bản</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="autoPublish" className="text-sm">Tự động xuất bản</Label>
          <Switch 
            id="autoPublish" 
            checked={config.autoPublish}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoPublish: checked }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultCategory" className="text-sm">Danh mục mặc định</Label>
            <Input 
              id="defaultCategory" 
              value={config.defaultCategory}
              onChange={(e) => setConfig(prev => ({ ...prev, defaultCategory: e.target.value }))}
              placeholder="Uncategorized"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm">Trạng thái mặc định</Label>
            <select
              id="status"
              value={config.status}
              onChange={(e) => setConfig(prev => ({ ...prev, status: e.target.value as 'draft' | 'publish' | 'private' }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="draft">Draft</option>
              <option value="publish">Publish</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerptLength" className="text-sm">Độ dài tóm tắt (ký tự)</Label>
          <Input 
            id="excerptLength" 
            type="number"
            value={config.excerptLength}
            onChange={(e) => setConfig(prev => ({ ...prev, excerptLength: parseInt(e.target.value) || 150 }))}
            min="50"
            max="500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="featuredImage" className="text-sm">Bật ảnh đại diện</Label>
          <Switch 
            id="featuredImage" 
            checked={config.featuredImageEnabled}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, featuredImageEnabled: checked }))}
          />
        </div>
      </div>

      <Separator />

      {/* Tags Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tags mặc định</h3>
        
        <div className="flex space-x-2">
          <Input 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Thêm tag mới"
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <Button onClick={addTag} disabled={!newTag.trim()}>
            Thêm
          </Button>
        </div>

        {config.defaultTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {config.defaultTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Available Categories */}
      {categories.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Danh mục có sẵn</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category: any) => (
                <Badge key={category.id} variant="outline">
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cấu hình
            </>
          )}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Cấu hình này sẽ được sử dụng khi đồng bộ tin tức từ Next.js lên WordPress. 
          Đảm bảo WordPress site có REST API được bật và Application Password đã được tạo.
        </AlertDescription>
      </Alert>
    </div>
  )
} 