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
  const { settings, updateSetting, isLoading } = useSettings()
  
  
  
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

  // Load config from settings context
  useEffect(() => {
    if (settings && !isLoading) {
      
      setConfig({
        siteUrl: settings.wordpressSiteUrl || 'https://wp2.ltacv.com',
        username: settings.wordpressUsername || '',
        password: '',
        applicationPassword: settings.wordpressApplicationPassword || '',
        autoPublish: settings.wordpressAutoPublish || false,
        defaultCategory: settings.wordpressDefaultCategory || '',
        defaultTags: settings.wordpressDefaultTags || [],
        featuredImageEnabled: settings.wordpressFeaturedImageEnabled || true,
        excerptLength: settings.wordpressExcerptLength || 150,
        status: (settings.wordpressStatus as 'draft' | 'publish' | 'private') || 'draft'
      })
    }
  }, [settings, isLoading])

  // Save config to settings context and file
  const saveConfig = async () => {
    setIsSaving(true)
    try {
      
      
      // Update each WordPress setting
      await updateSetting('wordpressSiteUrl', config.siteUrl)
      await updateSetting('wordpressUsername', config.username)
      await updateSetting('wordpressApplicationPassword', config.applicationPassword)
      await updateSetting('wordpressAutoPublish', config.autoPublish)
      await updateSetting('wordpressDefaultCategory', config.defaultCategory)
      await updateSetting('wordpressDefaultTags', config.defaultTags)
      await updateSetting('wordpressFeaturedImageEnabled', config.featuredImageEnabled)
      await updateSetting('wordpressExcerptLength', config.excerptLength)
      await updateSetting('wordpressStatus', config.status)
      
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
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressConfig: wordpressConfig
        }),
      })
      
      toast({
        title: "Đã lưu cấu hình",
        description: "Cấu hình WordPress API đã được lưu thành công.",
      })
    } catch (error) {
      
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
              Kết nối thất bại
            </Badge>
          )}
        </div>
        <Button 
          onClick={testConnection} 
          disabled={isTesting || !config.siteUrl || !config.username || !config.applicationPassword}
          variant="outline"
          size="sm"
        >
          <TestTube className="w-4 h-4 mr-2" />
          {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
        </Button>
      </div>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Cấu hình cơ bản</span>
          </CardTitle>
          <CardDescription>
            Thông tin kết nối WordPress API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteUrl">URL WordPress Site *</Label>
            <Input
              id="siteUrl"
              type="url"
              placeholder="https://your-wordpress-site.com"
              value={config.siteUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="admin"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationPassword">Application Password *</Label>
            <Input
              id="applicationPassword"
              type="password"
              placeholder="••••••••••••••••"
              value={config.applicationPassword}
              onChange={(e) => setConfig(prev => ({ ...prev, applicationPassword: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Tạo Application Password trong WordPress Admin → Users → Profile → Application Passwords
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Cài đặt xuất bản</span>
          </CardTitle>
          <CardDescription>
            Cấu hình cách thức đăng tin tức
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoPublish">Tự động xuất bản</Label>
            <Switch
              id="autoPublish"
              checked={config.autoPublish}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoPublish: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái mặc định</Label>
            <select
              id="status"
              className="w-full p-2 border border-input rounded-md"
              value={config.status}
              onChange={(e) => setConfig(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="draft">Bản nháp</option>
              <option value="publish">Xuất bản</option>
              <option value="private">Riêng tư</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerptLength">Độ dài tóm tắt (ký tự)</Label>
            <Input
              id="excerptLength"
              type="number"
              min="50"
              max="500"
              value={config.excerptLength}
              onChange={(e) => setConfig(prev => ({ ...prev, excerptLength: parseInt(e.target.value) }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="featuredImage">Hỗ trợ ảnh đại diện</Label>
            <Switch
              id="featuredImage"
              checked={config.featuredImageEnabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, featuredImageEnabled: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories and Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Danh mục và thẻ</span>
          </CardTitle>
          <CardDescription>
            Cấu hình danh mục và thẻ mặc định
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultCategory">Danh mục mặc định</Label>
            <select
              id="defaultCategory"
              className="w-full p-2 border border-input rounded-md"
              value={config.defaultCategory}
              onChange={(e) => setConfig(prev => ({ ...prev, defaultCategory: e.target.value }))}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Thẻ mặc định</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Thêm thẻ mới"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} variant="outline" size="sm">
                Thêm
              </Button>
            </div>
            {config.defaultTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {config.defaultTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Trạng thái đồng bộ tự động</span>
          </CardTitle>
          <CardDescription>
            Thông tin về tính năng tự động đồng bộ tin tức lên WordPress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Tự động đồng bộ</p>
              <p className="text-sm text-muted-foreground">
                {config.autoPublish 
                  ? 'Tin tức sẽ tự động được đồng bộ lên WordPress khi tạo mới hoặc cập nhật'
                  : 'Tính năng tự động đồng bộ đã bị tắt'
                }
              </p>
            </div>
            <Badge variant={config.autoPublish ? "default" : "secondary"}>
              {config.autoPublish ? "BẬT" : "TẮT"}
            </Badge>
          </div>

          {config.autoPublish && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tính năng đã được kích hoạt!</strong> Bây giờ:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>✅ Tin tức mới sẽ tự động đồng bộ lên WordPress</li>
                  <li>✅ Tin tức được cập nhật sẽ tự động cập nhật trên WordPress</li>
                  <li>✅ Sử dụng multi-method sync để đảm bảo tỷ lệ thành công cao nhất</li>
                  <li>⚠️ Chỉ tin tức đã được sync trước đó mới được cập nhật tự động</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Thông tin về các phương pháp đồng bộ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Phương pháp đồng bộ</span>
              </CardTitle>
              <CardDescription>
                Hệ thống sẽ tự động thử các phương pháp theo thứ tự ưu tiên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-900">1. XML-RPC</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Phương pháp chính, ít bị chặn nhất</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-900">2. cURL</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Sử dụng cURL để gọi trực tiếp</p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-yellow-900">3. Fallback</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">Mô phỏng wp-admin nếu cần</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-purple-900">4. wp-cron</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">Sử dụng WordPress cron system</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">5. REST API</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Phương pháp cuối cùng (có thể bị chặn)</p>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lưu ý:</strong> Nếu REST API bị chặn, hệ thống sẽ tự động sử dụng các phương pháp thay thế. 
                  
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {!config.autoPublish && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tính năng đã bị tắt.</strong> Để kích hoạt:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Bật switch "Tự động xuất bản" ở trên</li>
                  <li>Lưu cấu hình</li>
                  <li>Tin tức sẽ được đồng bộ thủ công hoặc qua API riêng</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu cấu hình
            </>
          )}
        </Button>
      </div>

      {/* Help Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Hướng dẫn:</strong> Để sử dụng WordPress API, bạn cần:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Tạo Application Password trong WordPress Admin</li>
            <li>Đảm bảo REST API được bật trong WordPress</li>
            <li>Kiểm tra quyền truy cập của user</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
} 