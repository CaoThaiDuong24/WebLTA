'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  Upload, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Settings,
  Globe
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SyncStatus {
  wordpress_configured: boolean
  wordpress_url: string | null
  local_settings_count: number
  last_updated: string | null
  sync_available: boolean
}

export function SettingsSync() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    checkSyncStatus()
  }, [])

  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/wordpress/sync-settings?action=status')
      if (response.ok) {
        const result = await response.json()
        setSyncStatus(result.data)
      }
    } catch (error) {
      console.error('Failed to check sync status:', error)
    }
  }

  const performSync = async (action: 'push' | 'pull' | 'sync', force: boolean = false) => {
    setIsLoading(true)
    
    try {
      console.log(`🔄 Performing ${action} sync...`)
      
      const response = await fetch('/api/wordpress/sync-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, force })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Đồng bộ thành công",
          description: result.message || `Settings ${action} completed successfully`,
        })
        
        setLastSync(new Date().toISOString())
        await checkSyncStatus() // Refresh status
        
      } else {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${action} settings`)
      }
      
    } catch (error) {
      console.error(`❌ ${action} sync failed:`, error)
      toast({
        title: "Lỗi đồng bộ",
        description: error instanceof Error ? error.message : `Failed to ${action} settings`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!syncStatus) return <Badge variant="secondary">Checking...</Badge>
    
    if (syncStatus.sync_available) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>
    } else {
      return <Badge variant="destructive">Not Available</Badge>
    }
  }

  const getLastUpdatedText = () => {
    if (!syncStatus?.last_updated) return 'Never'
    
    const date = new Date(syncStatus.last_updated)
    return date.toLocaleString('vi-VN')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RotateCcw className="h-5 w-5" />
          <span>Đồng bộ cài đặt với WordPress</span>
        </CardTitle>
        <CardDescription>
          Đồng bộ cài đặt hệ thống giữa Next.js và WordPress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trạng thái WordPress:</span>
              {getStatusBadge()}
            </div>
            
            {syncStatus?.wordpress_url && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{syncStatus.wordpress_url}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span>Cài đặt local:</span>
              <span className="font-medium">{syncStatus?.local_settings_count || 0} items</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Cập nhật cuối:</span>
              <span className="font-medium">{getLastUpdatedText()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <p><strong>Push:</strong> Gửi cài đặt từ Next.js lên WordPress</p>
              <p><strong>Pull:</strong> Lấy cài đặt từ WordPress về Next.js</p>
              <p><strong>Sync:</strong> Đồng bộ 2 chiều giữa 2 hệ thống</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {!syncStatus?.wordpress_configured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              WordPress chưa được cấu hình. Vui lòng cấu hình WordPress trong phần "Cấu hình WordPress API".
            </AlertDescription>
          </Alert>
        )}

        {syncStatus?.wordpress_configured && !syncStatus?.sync_available && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              WordPress đã được cấu hình nhưng thiếu API key. Vui lòng kiểm tra cấu hình WordPress.
            </AlertDescription>
          </Alert>
        )}

        {lastSync && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Đồng bộ cuối: {new Date(lastSync).toLocaleString('vi-VN')}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => performSync('push')}
            disabled={isLoading || !syncStatus?.sync_available}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Push to WordPress
          </Button>
          
          <Button
            variant="outline"
            onClick={() => performSync('pull')}
            disabled={isLoading || !syncStatus?.sync_available}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Pull from WordPress
          </Button>
          
          <Button
            onClick={() => performSync('sync')}
            disabled={isLoading || !syncStatus?.sync_available}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Two-way Sync
          </Button>
        </div>

        {/* Force Sync Option */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>Force sync sẽ ghi đè cài đặt trên WordPress</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => performSync('push', true)}
            disabled={isLoading || !syncStatus?.sync_available}
          >
            Force Push
          </Button>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={checkSyncStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
