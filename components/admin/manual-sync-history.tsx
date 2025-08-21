'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Copy,
  RefreshCw,
  FileText,
  Calendar,
  User,
  Tag
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SyncHistoryItem {
  id: string
  title: string
  content: string
  excerpt?: string
  status: 'publish' | 'draft'
  categories: string[]
  tags: string[]
  featuredImage?: string
  localId: string
  timestamp: string
  syncStatus: 'pending' | 'completed' | 'failed'
  wordpressUrl?: string
  wordpressId?: string
}

export function ManualSyncHistory() {
  const { toast } = useToast()
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSyncHistory()
  }, [])

  const loadSyncHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('manual-syncs') || '[]')
      setSyncHistory(history)
    } catch (error) {
    }
  }

  const updateSyncStatus = (id: string, status: 'completed' | 'failed', wordpressUrl?: string, wordpressId?: string) => {
    const updatedHistory = syncHistory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          syncStatus: status,
          wordpressUrl,
          wordpressId
        }
      }
      return item
    })
    
    setSyncHistory(updatedHistory)
    localStorage.setItem('manual-syncs', JSON.stringify(updatedHistory))
    
    toast({
      title: "Đã cập nhật trạng thái",
      description: `Trạng thái đồng bộ đã được cập nhật thành ${status === 'completed' ? 'hoàn thành' : 'thất bại'}`,
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>
      case 'completed':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Hoàn thành</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Thất bại</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const clearHistory = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đồng bộ?')) {
      localStorage.removeItem('manual-syncs')
      setSyncHistory([])
      toast({
        title: "Đã xóa lịch sử",
        description: "Lịch sử đồng bộ đã được xóa",
      })
    }
  }

  const exportHistory = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: syncHistory.length,
      items: syncHistory
    }
    
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manual-sync-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Đã xuất lịch sử",
      description: "File JSON đã được tải về",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lịch sử đồng bộ thủ công</h2>
          <p className="text-gray-600">Quản lý các bài viết đã đồng bộ thủ công với WordPress</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadSyncHistory} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={exportHistory} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Xuất
          </Button>
          <Button onClick={clearHistory} variant="outline" size="sm">
            <XCircle className="w-4 h-4 mr-2" />
            Xóa tất cả
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{syncHistory.length}</p>
                <p className="text-sm text-gray-600">Tổng cộng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {syncHistory.filter(item => item.syncStatus === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Chờ xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {syncHistory.filter(item => item.syncStatus === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {syncHistory.filter(item => item.syncStatus === 'failed').length}
                </p>
                <p className="text-sm text-gray-600">Thất bại</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {syncHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử đồng bộ</h3>
              <p className="text-gray-600">Các bài viết đồng bộ thủ công sẽ xuất hiện ở đây</p>
            </CardContent>
          </Card>
        ) : (
          syncHistory.map((item, index) => (
            <Card key={item.id || index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(item.timestamp)}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {item.localId}
                        </span>
                        <span className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          {item.status === 'publish' ? 'Xuất bản' : 'Bản nháp'}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(item.syncStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Content Preview */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nội dung:</label>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {item.content.substring(0, 200)}...
                    </p>
                  </div>

                  {/* Categories and Tags */}
                  {(item.categories.length > 0 || item.tags.length > 0) && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phân loại:</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.categories.map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {item.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(item.title, 'Tiêu đề')}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy tiêu đề
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(item.content, 'Nội dung')}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy nội dung
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      {item.syncStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateSyncStatus(item.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Đánh dấu hoàn thành
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateSyncStatus(item.id, 'failed')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Đánh dấu thất bại
                          </Button>
                        </>
                      )}

                      {item.wordpressUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.wordpressUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Xem trong WordPress
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* WordPress URL Input */}
                  {item.syncStatus === 'pending' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        URL bài viết WordPress (sau khi tạo):
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          placeholder="https://wp2.ltacv.com/..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          onChange={(e) => {
                            const wordpressUrl = e.target.value
                            if (wordpressUrl) {
                              updateSyncStatus(item.id, 'completed', wordpressUrl)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const url = (document.querySelector(`input[placeholder*="wp2.ltacv.com"]`) as HTMLInputElement)?.value
                            if (url) {
                              updateSyncStatus(item.id, 'completed', url)
                            }
                          }}
                        >
                          Lưu URL
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
