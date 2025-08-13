'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
  Database,
  TrendingUp,
  Loader2,
  Globe
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface SyncResult {
  imported: number
  updated: number
  skipped: number
  errors: any[]
  totalWordPressPosts: number
  totalAdminPosts: number
}

export default function WordPressSyncManagerPage() {
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [wordpressStats, setWordpressStats] = useState<any>(null)
  const [adminStats, setAdminStats] = useState<any>(null)

  // Load stats
  const loadStats = async () => {
    try {
      // Load admin stats
      const adminResponse = await fetch('/api/news')
      const adminData = await adminResponse.json()
      setAdminStats({
        total: adminData.data?.length || 0,
        synced: adminData.data?.filter((n: any) => n.syncedToWordPress)?.length || 0,
        unsynced: adminData.data?.filter((n: any) => !n.syncedToWordPress)?.length || 0
      })

      // Load WordPress stats
      const wpResponse = await fetch('/api/wordpress/posts')
      if (wpResponse.ok) {
        const wpData = await wpResponse.json()
        setWordpressStats({
          total: wpData.count || 0,
          posts: wpData.posts || []
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  // Sync to WordPress
  const syncToWordPress = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    
    try {
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/wordpress/sync-all', {
        method: 'POST',
      })

      clearInterval(progressInterval)
      setSyncProgress(100)

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: "✅ Đồng bộ thành công",
          description: result.message,
        })
        loadStats()
      } else {
        toast({
          title: "❌ Lỗi đồng bộ",
          description: result.error || "Không thể đồng bộ lên WordPress",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error syncing to WordPress:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi đồng bộ lên WordPress",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncProgress(0), 1000)
    }
  }

  // Sync from WordPress
  const syncFromWordPress = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    
    try {
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/wordpress/sync-from', {
        method: 'POST',
      })

      clearInterval(progressInterval)
      setSyncProgress(100)

      const result = await response.json()
      
      if (response.ok) {
        setLastSyncResult(result.results)
        toast({
          title: "✅ Đồng bộ thành công",
          description: result.message,
        })
        loadStats()
      } else {
        toast({
          title: "❌ Lỗi đồng bộ",
          description: result.error || "Không thể đồng bộ từ WordPress",
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
      setIsSyncing(false)
      setTimeout(() => setSyncProgress(0), 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/news">
          <Button variant="outline" size="icon">
            ←
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Quản lý đồng bộ WordPress</h1>
          <p className="text-muted-foreground">Đồng bộ 2 chiều giữa admin và WordPress</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Posts</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.synced || 0} đã sync, {adminStats?.unsynced || 0} chưa sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WordPress Posts</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wordpressStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tổng bài viết trên WordPress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats?.synced || 0}/{adminStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.total ? Math.round((adminStats.synced / adminStats.total) * 100) : 0}% đã đồng bộ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastSyncResult ? '✅' : '❌'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastSyncResult ? 'Đã đồng bộ gần đây' : 'Chưa đồng bộ'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang đồng bộ...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={syncProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {syncProgress}% hoàn thành
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sync Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Đồng bộ lên WordPress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Đồng bộ tin tức từ admin lên WordPress
            </p>
            <Button 
              onClick={syncToWordPress}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isSyncing ? 'Đang đồng bộ...' : 'Sync lên WordPress'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Đồng bộ từ WordPress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Đồng bộ tin tức từ WordPress về admin
            </p>
            <Button 
              onClick={syncFromWordPress}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isSyncing ? 'Đang đồng bộ...' : 'Sync từ WordPress'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRightLeft className="h-5 w-5" />
              <span>Đồng bộ 2 chiều</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Đồng bộ 2 chiều giữa admin và WordPress
            </p>
            <Button 
              onClick={async () => {
                await syncFromWordPress()
                await syncToWordPress()
              }}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="mr-2 h-4 w-4" />
              )}
              {isSyncing ? 'Đang đồng bộ...' : 'Sync 2 chiều'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Last Sync Result */}
      {lastSyncResult && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả đồng bộ gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lastSyncResult.imported}</div>
                <p className="text-sm text-muted-foreground">Đã import</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lastSyncResult.updated}</div>
                <p className="text-sm text-muted-foreground">Đã cập nhật</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{lastSyncResult.skipped}</div>
                <p className="text-sm text-muted-foreground">Đã bỏ qua</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{lastSyncResult.errors.length}</div>
                <p className="text-sm text-muted-foreground">Lỗi</p>
              </div>
            </div>
            
            {lastSyncResult.errors.length > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lỗi đồng bộ:</strong>
                  <ul className="mt-2">
                    {lastSyncResult.errors.map((error: any, index: number) => (
                      <li key={index} className="text-sm">
                        {error.title}: {error.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* WordPress Posts Preview */}
      {wordpressStats?.posts && wordpressStats.posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bài viết trên WordPress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {wordpressStats.posts.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{post.title.rendered}</span>
                  </div>
                  <Badge variant={post.status === 'publish' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </div>
              ))}
              {wordpressStats.posts.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  Và {wordpressStats.posts.length - 5} bài viết khác...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 