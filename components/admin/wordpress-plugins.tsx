'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plug, 
  Database, 
  Image, 
  Zap, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Globe,
  Shield
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PluginConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  status: 'active' | 'inactive' | 'error'
  version: string
  category: 'sync' | 'media' | 'cache' | 'security' | 'database'
  icon: React.ReactNode
  config?: any
}

interface PluginStatus {
  [key: string]: {
    enabled: boolean
    lastSync?: string
    syncCount?: number
    errorCount?: number
  }
}

export default function WordPressPlugins() {
  const { toast } = useToast()
  const [plugins, setPlugins] = useState<PluginConfig[]>([])
  const [pluginStatus, setPluginStatus] = useState<PluginStatus>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPlugins()
    loadPluginStatus()
  }, [])

  const loadPlugins = () => {
    const availablePlugins: PluginConfig[] = [
      {
        id: 'rest-api',
        name: 'WordPress REST API',
        description: 'Tích hợp REST API để truy cập dữ liệu WordPress',
        enabled: true,
        status: 'active',
        version: '2.0.0',
        category: 'sync',
        icon: <Globe className="h-5 w-5" />
      },
      {
        id: 'jwt-auth',
        name: 'JWT Authentication',
        description: 'Xác thực JWT token thay vì Basic Auth',
        enabled: false,
        status: 'inactive',
        version: '1.0.0',
        category: 'security',
        icon: <Shield className="h-5 w-5" />
      },
      {
        id: 'acf-rest',
        name: 'ACF to REST API',
        description: 'Đồng bộ custom fields qua REST API',
        enabled: false,
        status: 'inactive',
        version: '1.5.0',
        category: 'sync',
        icon: <Database className="h-5 w-5" />
      },
      {
        id: 'media-sync',
        name: 'Media Sync',
        description: 'Đồng bộ hình ảnh và media files',
        enabled: true,
        status: 'active',
        version: '1.2.0',
        category: 'media',
        icon: <Image className="h-5 w-5" />
      },
      {
        id: 'cache-system',
        name: 'Cache System',
        description: 'Hệ thống cache để tăng performance',
        enabled: true,
        status: 'active',
        version: '1.1.0',
        category: 'cache',
        icon: <Zap className="h-5 w-5" />
      },
      {
        id: 'webhook',
        name: 'Webhook Integration',
        description: 'Real-time sync qua webhook',
        enabled: false,
        status: 'inactive',
        version: '1.0.0',
        category: 'sync',
        icon: <RefreshCw className="h-5 w-5" />
      },
      {
        id: 'database-sync',
        name: 'Database Sync',
        description: 'Đồng bộ trực tiếp database',
        enabled: false,
        status: 'inactive',
        version: '1.0.0',
        category: 'database',
        icon: <Database className="h-5 w-5" />
      }
    ]

    setPlugins(availablePlugins)
  }

  const loadPluginStatus = () => {
    // Mock plugin status - trong thực tế sẽ lấy từ API
    const status: PluginStatus = {
      'rest-api': {
        enabled: true,
        lastSync: new Date().toISOString(),
        syncCount: 150,
        errorCount: 0
      },
      'media-sync': {
        enabled: true,
        lastSync: new Date(Date.now() - 3600000).toISOString(),
        syncCount: 45,
        errorCount: 2
      },
      'cache-system': {
        enabled: true,
        syncCount: 0,
        errorCount: 0
      }
    }

    setPluginStatus(status)
  }

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, enabled, status: enabled ? 'active' : 'inactive' }
          : plugin
      ))

      setPluginStatus(prev => ({
        ...prev,
        [pluginId]: {
          ...prev[pluginId],
          enabled
        }
      }))

      toast({
        title: enabled ? 'Plugin enabled' : 'Plugin disabled',
        description: `Plugin ${pluginId} has been ${enabled ? 'enabled' : 'disabled'}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle plugin',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'error':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sync':
        return <RefreshCw className="h-4 w-4" />
      case 'media':
        return <Image className="h-4 w-4" />
      case 'cache':
        return <Zap className="h-4 w-4" />
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'database':
        return <Database className="h-4 w-4" />
      default:
        return <Plug className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sync':
        return 'bg-blue-50 border-blue-200'
      case 'media':
        return 'bg-purple-50 border-purple-200'
      case 'cache':
        return 'bg-yellow-50 border-yellow-200'
      case 'security':
        return 'bg-red-50 border-red-200'
      case 'database':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">WordPress Plugins</h1>
        <p className="text-muted-foreground">
          Quản lý các plugins và integrations với WordPress
        </p>
      </div>

      {/* Plugin Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className={`${getCategoryColor(plugin.category)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {plugin.icon}
                  <CardTitle className="text-lg">{plugin.name}</CardTitle>
                </div>
                <Switch
                  checked={plugin.enabled}
                  onCheckedChange={(enabled) => togglePlugin(plugin.id, enabled)}
                  disabled={loading}
                />
              </div>
              <CardDescription>{plugin.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(plugin.category)}
                  <span className="text-sm text-muted-foreground capitalize">
                    {plugin.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(plugin.status)}
                  <span className="text-xs text-muted-foreground">
                    v{plugin.version}
                  </span>
                </div>
              </div>

              {/* Plugin Status */}
              {pluginStatus[plugin.id] && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Last sync:</span>
                    <span className="text-muted-foreground">
                      {pluginStatus[plugin.id].lastSync 
                        ? new Date(pluginStatus[plugin.id].lastSync!).toLocaleString('vi-VN')
                        : 'Never'
                      }
                    </span>
                  </div>
                  
                  {pluginStatus[plugin.id].syncCount !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Sync count:</span>
                      <span className="text-muted-foreground">
                        {pluginStatus[plugin.id].syncCount}
                      </span>
                    </div>
                  )}

                  {pluginStatus[plugin.id].errorCount !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Errors:</span>
                      <span className={`${pluginStatus[plugin.id].errorCount! > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {pluginStatus[plugin.id].errorCount}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Plugin Actions */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  disabled={!plugin.enabled || loading}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!plugin.enabled || loading}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plugin Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Plugin Statistics</CardTitle>
          <CardDescription>
            Tổng quan về hoạt động của các plugins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {plugins.filter(p => p.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Plugins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {plugins.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(pluginStatus).reduce((sum, status) => sum + (status.syncCount || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Syncs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(pluginStatus).reduce((sum, status) => sum + (status.errorCount || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Recommendations:</strong> Enable JWT Authentication for better security and 
          Webhook Integration for real-time sync capabilities.
        </AlertDescription>
      </Alert>
    </div>
  )
} 