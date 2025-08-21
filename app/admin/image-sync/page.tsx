'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Image,
  Folder,
  HardDrive,
  Loader2,
  Play,
  Pause,
  Settings
} from 'lucide-react'

interface ImageStats {
  count: number
  totalSize: number
  files: Array<{
    name: string
    size: number
    modified: string
  }>
}

interface SyncStatus {
  wordpress_connected: boolean
  total_images: number
  image_stats: Record<string, ImageStats>
  directories: string[]
}

interface SyncResult {
  success: boolean
  message: string
  data: {
    synced: number
    failed: number
    total: number
    results: Array<{
      fileName: string
      localPath: string
      wordpressUrl?: string
      mediaId?: number
      error?: string
      status: 'success' | 'failed'
    }>
  }
}

export default function ImageSyncPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResults, setSyncResults] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSyncStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/wordpress/sync-images')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setSyncStatus(result.data)
      } else {
        setError(result.error || 'Lỗi khi tải thống kê hình ảnh')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  const handleSyncImages = async () => {
    try {
      setSyncing(true)
      setSyncProgress(0)
      setSyncResults(null)
      setError(null)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch('/api/wordpress/sync-images', {
        method: 'POST'
      })
      
      const result = await response.json()
      
      clearInterval(progressInterval)
      setSyncProgress(100)

      if (response.ok && result.success) {
        setSyncResults(result)
        toast({
          title: "Thành công",
          description: result.message,
        })
        
        // Refresh status after sync
        setTimeout(() => {
          fetchSyncStatus()
        }, 1000)
      } else {
        setError(result.error || 'Lỗi khi sync hình ảnh')
        toast({
          title: "Lỗi",
          description: result.error || 'Lỗi khi sync hình ảnh',
          variant: "destructive",
        })
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
      toast({
        title: "Lỗi",
        description: err.message || 'Có lỗi xảy ra',
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncProgress(0), 1000)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thống kê hình ảnh...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Đồng bộ hình ảnh</h1>
          <p className="text-muted-foreground mt-1">Quản lý và đồng bộ hình ảnh lên WordPress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSyncStatus} disabled={syncing}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={handleSyncImages} disabled={syncing || !syncStatus?.wordpress_connected}>
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang sync...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Sync lên WordPress
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* WordPress Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Trạng thái kết nối WordPress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={syncStatus?.wordpress_connected ? "default" : "destructive"}>
              {syncStatus?.wordpress_connected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Đã kết nối
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Chưa kết nối
                </>
              )}
            </Badge>
            {!syncStatus?.wordpress_connected && (
              <p className="text-sm text-muted-foreground">
                Vui lòng cấu hình WordPress trước khi sync hình ảnh
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Thống kê hình ảnh
          </CardTitle>
          <CardDescription>
            Tổng cộng {syncStatus?.total_images || 0} hình ảnh trong {syncStatus?.directories?.length || 0} thư mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncStatus?.directories && syncStatus.directories.length > 0 ? (
            <div className="space-y-4">
              {syncStatus.directories.map((dir) => {
                const stats = syncStatus.image_stats[dir]
                return (
                  <div key={dir} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{dir}</span>
                      </div>
                      <Badge variant="outline">
                        {stats.count} files
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Kích thước:</span>
                        <div className="font-medium">{formatFileSize(stats.totalSize)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trung bình:</span>
                        <div className="font-medium">{formatFileSize(stats.totalSize / stats.count)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cập nhật cuối:</span>
                        <div className="font-medium">
                          {stats.files.length > 0 ? formatDate(stats.files[0].modified) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có hình ảnh nào</h3>
              <p className="text-muted-foreground">Hình ảnh sẽ xuất hiện ở đây sau khi được upload</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Progress */}
      {syncing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang đồng bộ hình ảnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={syncProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Đã hoàn thành {Math.round(syncProgress)}% - Vui lòng đợi...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Results */}
      {syncResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Kết quả đồng bộ
            </CardTitle>
            <CardDescription>
              {syncResults.message} - {syncResults.data.synced} thành công, {syncResults.data.failed} thất bại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{syncResults.data.synced}</div>
                  <div className="text-sm text-green-600">Thành công</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{syncResults.data.failed}</div>
                  <div className="text-sm text-red-600">Thất bại</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{syncResults.data.total}</div>
                  <div className="text-sm text-blue-600">Tổng cộng</div>
                </div>
              </div>

              {/* Detailed Results */}
              {syncResults.data.results.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Chi tiết:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {syncResults.data.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm">{result.fileName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.status === 'success' ? 'Thành công' : result.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
