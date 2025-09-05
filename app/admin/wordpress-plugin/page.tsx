'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  Upload, 
  ArrowRightLeft,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Copy,
  Key,
  Globe,
  Settings,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PluginConfig {
  apiKey: string
  webhookUrl: string
  autoSync: boolean
  syncDirection: 'wordpress-to-lta' | 'lta-to-wordpress' | 'bidirectional'
}

interface WordPressConfig {
  siteUrl: string
  username: string
  isConnected: boolean
}

export default function WordPressPluginPage() {
  const { toast } = useToast()
  const [pluginConfig, setPluginConfig] = useState<PluginConfig | null>(null)
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [autoSync, setAutoSync] = useState(true)
  const [syncDirection, setSyncDirection] = useState<'wordpress-to-lta' | 'lta-to-wordpress' | 'bidirectional'>('bidirectional')

  useEffect(() => {
    loadPluginConfig()
  }, [])

  const loadPluginConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wordpress/plugin-auth')
      
      if (response.ok) {
        const data = await response.json()
        setPluginConfig(data.plugin)
        setWordpressConfig(data.wordpress)
        setWebhookUrl(data.plugin.webhookUrl || '')
        setAutoSync(data.plugin.autoSync)
        setSyncDirection(data.plugin.syncDirection)
      } else {
        toast({
          title: "❌ Lỗi",
          description: "Không thể tải cấu hình plugin",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading plugin config:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi tải cấu hình plugin",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateApiKey = async () => {
    try {
      const response = await fetch('/api/wordpress/plugin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_api_key'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPluginConfig(prev => prev ? { ...prev, apiKey: data.apiKey } : null)
        toast({
          title: "✅ Thành công",
          description: "API key đã được tạo mới",
        })
      } else {
        toast({
          title: "❌ Lỗi",
          description: "Không thể tạo API key",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi tạo API key",
        variant: "destructive",
      })
    }
  }

  const updateConfig = async () => {
    try {
      const response = await fetch('/api/wordpress/plugin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_config',
          data: {
            webhookUrl,
            autoSync,
            syncDirection
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPluginConfig(data.config)
        toast({
          title: "✅ Thành công",
          description: "Cấu hình đã được cập nhật",
        })
      } else {
        toast({
          title: "❌ Lỗi",
          description: "Không thể cập nhật cấu hình",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating config:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi cập nhật cấu hình",
        variant: "destructive",
      })
    }
  }

  const testConnection = async () => {
    try {
      setTesting(true)
      const response = await fetch('/api/wordpress/plugin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connection',
          data: {
            apiKey: pluginConfig?.apiKey
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "✅ Kết nối thành công",
          description: data.message,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Kết nối thất bại",
          description: errorData.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi test kết nối",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const syncFromWordPress = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/wordpress/plugin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_from_wordpress',
          data: {
            apiKey: pluginConfig?.apiKey
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "✅ Đồng bộ thành công",
          description: data.message,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Đồng bộ thất bại",
          description: errorData.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error syncing from WordPress:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi đồng bộ từ WordPress",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "✅ Đã copy",
      description: `${label} đã được copy vào clipboard`,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải cấu hình plugin...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WordPress Plugin Manager</h1>
          <p className="text-muted-foreground">Quản lý plugin đồng bộ với WordPress</p>
        </div>
        <Button onClick={loadPluginConfig} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Plugin Status */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">
          LTA News Sync Plugin
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Plugin WordPress để đồng bộ tin tức hai chiều với LTA News System. 
          Tải plugin file <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">wordpress-plugin-lta-news-sync.php</code> 
          và cài đặt vào WordPress.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plugin Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Cấu hình Plugin</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Key */}
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex space-x-2">
                <Input 
                  value={pluginConfig?.apiKey || ''} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(pluginConfig?.apiKey || '', 'API Key')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateApiKey}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                API key để xác thực giữa WordPress và LTA News System
              </p>
            </div>

            {/* Webhook URL */}
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/api/wordpress/webhook"
              />
              <p className="text-xs text-muted-foreground">
                URL để WordPress gửi webhook khi có thay đổi bài viết
              </p>
            </div>

            {/* Auto Sync */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tự động đồng bộ</Label>
                <p className="text-xs text-muted-foreground">
                  Tự động đồng bộ khi có thay đổi bài viết
                </p>
              </div>
              <Switch 
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>

            {/* Sync Direction */}
            <div className="space-y-2">
              <Label>Hướng đồng bộ</Label>
              <Select value={syncDirection} onValueChange={(value: any) => setSyncDirection(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wordpress-to-lta">WordPress → LTA</SelectItem>
                  <SelectItem value="lta-to-wordpress">LTA → WordPress</SelectItem>
                  <SelectItem value="bidirectional">Hai chiều</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={updateConfig} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Cập nhật cấu hình
            </Button>
          </CardContent>
        </Card>

        {/* WordPress Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Kết nối WordPress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wordpressConfig ? (
              <>
                <div className="space-y-2">
                  <Label>WordPress Site</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={wordpressConfig.siteUrl} readOnly />
                    <Badge variant={wordpressConfig.isConnected ? "default" : "destructive"}>
                      {wordpressConfig.isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={wordpressConfig.username} readOnly />
                </div>

                <Button 
                  onClick={testConnection} 
                  disabled={testing}
                  className="w-full"
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Chưa cấu hình WordPress</AlertTitle>
                <AlertDescription>
                  Vui lòng cấu hình WordPress trong Settings trước khi sử dụng plugin.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5" />
            <span>Đồng bộ dữ liệu</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={syncFromWordPress} 
              disabled={syncing || !wordpressConfig}
              className="w-full"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ từ WordPress'}
            </Button>

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => window.open('/admin/wordpress-sync-manager', '_blank')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Đồng bộ lên WordPress
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• <strong>Đồng bộ từ WordPress:</strong> Lấy bài viết từ WordPress về LTA News System</p>
            <p>• <strong>Đồng bộ lên WordPress:</strong> Gửi tin tức từ LTA News System lên WordPress</p>
            <p>• <strong>Plugin hỗ trợ:</strong> REST API, XML-RPC, Webhook, và Meta Box</p>
          </div>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Hướng dẫn cài đặt Plugin</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Bước 1: Tải Plugin</h4>
            <p className="text-sm text-muted-foreground">
              File plugin: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">wordpress-plugin-lta-news-sync.php</code>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Bước 2: Cài đặt vào WordPress</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Đăng nhập vào WordPress Admin</li>
              <li>Vào Plugins → Add New → Upload Plugin</li>
              <li>Upload file plugin và kích hoạt</li>
              <li>Vào menu "LTA News Sync" để cấu hình</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Bước 3: Cấu hình Plugin</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Nhập LTA API URL: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">https://your-domain.com/api</code></li>
              <li>Nhập API Key từ cấu hình trên</li>
              <li>Bật "Auto Sync" nếu muốn tự động đồng bộ</li>
              <li>Test connection để kiểm tra</li>
            </ol>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lưu ý quan trọng</AlertTitle>
            <AlertDescription>
              Plugin này hoạt động song song với các phương pháp đồng bộ hiện có. 
              Nếu REST API bị hạn chế, plugin sẽ sử dụng các phương pháp thay thế.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
