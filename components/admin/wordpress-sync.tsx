'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw, 
  Download, 
  Upload, 
  ArrowRightLeft,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  FileText,
  Image,
  Tag,
  Settings,
  Database,
  TrendingUp,
  Loader2,
  Wifi,
  Plus
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/contexts/settings-context'


interface SyncOptions {
  syncDirection: 'to-wordpress' | 'from-wordpress' | 'both'
  syncImages: boolean
  syncCategories: boolean
  syncTags: boolean
  lastSyncDate?: string
}

interface SyncResult {
  fromWordPress: any[]
  toWordPress: any[]
  summary: {
    totalFromWordPress: number
    totalToWordPress: number
    successFromWordPress: number
    successToWordPress: number
    errors: any[]
  }
}

export function WordPressSync() {
  const { toast } = useToast()
  const { settings } = useSettings()
  const [config, setConfig] = useState<any>(null)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    syncDirection: 'both',
    syncImages: true,
    syncCategories: true,
    syncTags: true
  })
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [wordpressStats, setWordpressStats] = useState<any>(null)
  const [localPosts, setLocalPosts] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)

  // Load WordPress config from settings context
  useEffect(() => {
    if (settings) {
      
      // Check if WordPress is configured
      const isConfigured = settings.wordpressSiteUrl && 
                          settings.wordpressUsername && 
                          settings.wordpressApplicationPassword
      
      if (isConfigured) {
        const wpConfig = {
          siteUrl: settings.wordpressSiteUrl,
          username: settings.wordpressUsername,
          applicationPassword: settings.wordpressApplicationPassword,
          autoPublish: settings.wordpressAutoPublish,
          defaultCategory: settings.wordpressDefaultCategory,
          defaultTags: settings.wordpressDefaultTags,
          featuredImageEnabled: settings.wordpressFeaturedImageEnabled,
          excerptLength: settings.wordpressExcerptLength,
          status: settings.wordpressStatus
        }
        
        setConfig(wpConfig)
        loadWordPressStats(wpConfig)
        
      } else {
        setConfig(null)
        setIsConnected(false)
        
      }
    }
    
    // Load local posts (simulate)
    loadLocalPosts()
  }, [settings])

  const loadWordPressStats = async (wpConfig: any) => {
    try {
      const configParam = encodeURIComponent(JSON.stringify(wpConfig))
      const response = await fetch(`/api/wordpress/sync?config=${configParam}`)
      
      if (response.ok) {
        const result = await response.json()
        setWordpressStats(result.stats)
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      setIsConnected(false)
    }
  }

  // Load danh sách tin tức local
  const loadLocalPosts = async () => {
    try {
      
      const response = await fetch('/api/news')
      
      if (response.ok) {
        const result = await response.json()
        
        
        if (result.success && result.data && Array.isArray(result.data)) {
          setLocalPosts(result.data)
          
        } else {
          
          setLocalPosts([])
        }
      } else {
        
        setLocalPosts([])
      }
    } catch (error) {
      
      setLocalPosts([])
    }
  }

  const startSync = async () => {
    if (!config) return
    
    setIsSyncing(true)
    setSyncProgress(0)
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/wordpress/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          syncOptions,
          localPosts
        }),
      })

      clearInterval(progressInterval)
      setSyncProgress(100)

      const result = await response.json()
      
      if (response.ok) {
        setLastSyncResult(result.results)
        toast({
          title: "Đồng bộ thành công",
          description: `Đã đồng bộ ${result.results.summary.successFromWordPress + result.results.summary.successToWordPress} bài viết`,
        })
        
        // Refresh stats
        loadWordPressStats(config)
      } else {
        toast({
          title: "Đồng bộ thất bại",
          description: result.error || "Không thể đồng bộ dữ liệu",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi đồng bộ",
        description: "Đã xảy ra lỗi khi đồng bộ dữ liệu",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncProgress(0), 1000)
    }
  }

  const quickSync = async (direction: 'from-wordpress' | 'to-wordpress') => {
    const quickOptions = { ...syncOptions, syncDirection: direction }
    setSyncOptions(quickOptions)
    
    // Trigger sync after a short delay
    setTimeout(() => {
      startSync()
    }, 100)
  }

  const testConnection = async () => {
    try {
      setIsTesting(true)
      
      
      const response = await fetch('/api/wordpress/test-connection')
      const result = await response.json()
      
      
      
      if (result.success) {
        setIsConnected(true)
        toast({
          title: "✅ Thành công",
          description: result.message,
        })
      } else {
        setIsConnected(false)
        toast({
          title: "❌ Lỗi kết nối",
          description: result.error,
          variant: "destructive",
        })
        
        // Hiển thị chi tiết lỗi trong console
        if (result.details) {
          
        }
      }
    } catch (error) {
      
      setIsConnected(false)
      toast({
        title: "❌ Lỗi",
        description: "Không thể test kết nối WordPress",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const syncFromWordPressViaCreate = async () => {
    try {
      setIsSyncing(true)
      
      
      const response = await fetch('/api/wordpress/sync-via-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ Thành công",
          description: result.message,
        })
        
        // Reload news list
        await loadLocalPosts()
      } else {
        toast({
          title: "❌ Lỗi",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      
      toast({
        title: "❌ Lỗi",
        description: "Không thể đồng bộ từ WordPress",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const syncFromWordPressReal = async () => {
    try {
      setIsSyncing(true)
      
      
      const response = await fetch('/api/wordpress/sync-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ Thành công",
          description: result.message,
        })
        
        // Reload news list
        await loadLocalPosts()
      } else {
        toast({
          title: "❌ Lỗi",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      
      toast({
        title: "❌ Lỗi",
        description: "Không thể đồng bộ từ WordPress",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
          </span>
        </div>
        
        <Button
          onClick={testConnection}
          disabled={isTesting || !config}
          variant="outline"
          size="sm"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang test...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Test kết nối
            </>
          )}
        </Button>

        <Button
          onClick={loadLocalPosts}
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Sync Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Tùy chọn đồng bộ</span>
            </CardTitle>
            <CardDescription>
              Cấu hình cách thức đồng bộ dữ liệu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="syncDirection">Hướng đồng bộ</Label>
              <select
                id="syncDirection"
                className="w-full p-2 border border-input rounded-md"
                value={syncOptions.syncDirection}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, syncDirection: e.target.value as any }))}
              >
                <option value="both">Cả 2 chiều</option>
                <option value="from-wordpress">Từ WordPress về Admin</option>
                <option value="to-wordpress">Từ Admin lên WordPress</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="syncImages" className="text-sm">Đồng bộ hình ảnh</Label>
                <Switch
                  id="syncImages"
                  checked={syncOptions.syncImages}
                  onCheckedChange={(checked) => setSyncOptions(prev => ({ ...prev, syncImages: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="syncCategories" className="text-sm">Đồng bộ danh mục</Label>
                <Switch
                  id="syncCategories"
                  checked={syncOptions.syncCategories}
                  onCheckedChange={(checked) => setSyncOptions(prev => ({ ...prev, syncCategories: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="syncTags" className="text-sm">Đồng bộ tags</Label>
                <Switch
                  id="syncTags"
                  checked={syncOptions.syncTags}
                  onCheckedChange={(checked) => setSyncOptions(prev => ({ ...prev, syncTags: checked }))}
                />
              </div>
            </div>

            <Separator />

            <Button 
              onClick={startSync} 
              disabled={isSyncing || !isConnected}
              className="w-full"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {isSyncing ? 'Đang đồng bộ...' : 'Bắt đầu đồng bộ'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Thao tác nhanh</span>
            </CardTitle>
            <CardDescription>
              Đồng bộ nhanh theo hướng cụ thể
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => quickSync('from-wordpress')} 
              disabled={isSyncing || !isConnected}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Lấy từ WordPress
            </Button>

            <Button 
              onClick={() => quickSync('to-wordpress')} 
              disabled={isSyncing || !isConnected}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Gửi lên WordPress
            </Button>

            <Button
              onClick={syncFromWordPressViaCreate}
              disabled={isSyncing || !config}
              variant="outline"
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Đồng bộ qua API tạo mới
                </>
              )}
            </Button>

            <Button
              onClick={syncFromWordPressReal}
              disabled={isSyncing || !config}
              variant="outline"
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Đồng bộ thực tế từ WordPress
                </>
              )}
            </Button>

            {isSyncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Tiến trình đồng bộ</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Thống kê</span>
            </CardTitle>
            <CardDescription>
              Thông tin dữ liệu hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{localPosts.length}</div>
                <div className="text-xs text-gray-500">Bài viết local</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {wordpressStats?.totalPosts || 0}
                </div>
                <div className="text-xs text-gray-500">Bài viết WordPress</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Danh mục WordPress</span>
                <Badge variant="secondary">{wordpressStats?.totalCategories || 0}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Tags WordPress</span>
                <Badge variant="secondary">{wordpressStats?.totalTags || 0}</Badge>
              </div>
            </div>

            {lastSyncResult && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Kết quả đồng bộ cuối</h4>
                  <div className="text-xs space-y-1">
                    <div>✅ Từ WordPress: {lastSyncResult.summary.successFromWordPress}</div>
                    <div>✅ Lên WordPress: {lastSyncResult.summary.successToWordPress}</div>
                    {lastSyncResult.summary.errors.length > 0 && (
                      <div className="text-red-500">
                        ❌ Lỗi: {lastSyncResult.summary.errors.length}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Results */}
      {lastSyncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Kết quả đồng bộ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* From WordPress */}
              {lastSyncResult.fromWordPress.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Từ WordPress ({lastSyncResult.fromWordPress.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lastSyncResult.fromWordPress.map((post: any) => (
                      <div key={post.id} className="border rounded p-3 text-sm">
                        <div className="font-medium">{post.title}</div>
                        <div className="text-gray-500 text-xs">
                          ID: {post.id} • {post.status} • {new Date(post.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* To WordPress */}
              {lastSyncResult.toWordPress.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Lên WordPress ({lastSyncResult.toWordPress.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lastSyncResult.toWordPress.map((result: any) => (
                      <div key={result.localId} className={`border rounded p-3 text-sm ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="font-medium">{result.title}</div>
                        <div className="text-gray-500 text-xs">
                          {result.success ? (
                            <>✅ Thành công • WordPress ID: {result.wordpressId}</>
                          ) : (
                            <>❌ Thất bại • {result.error}</>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Errors */}
            {lastSyncResult.summary.errors.length > 0 && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Có {lastSyncResult.summary.errors.length} lỗi xảy ra:</div>
                      {lastSyncResult.summary.errors.map((error: any, index: number) => (
                        <div key={index} className="text-xs">
                          • {error.direction}: {error.error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 