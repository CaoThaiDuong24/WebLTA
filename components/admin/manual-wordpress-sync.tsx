'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Globe,
  Settings,
  Mail,
  Download,
  Upload
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ManualSyncProps {
  post?: any
  onSuccess?: () => void
}

export function ManualWordPressSync({ post, onSuccess }: ManualSyncProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [wordpressUrl, setWordpressUrl] = useState('https://wp2.ltacv.com/wp-admin/')
  const [credentials, setCredentials] = useState({
    username: '***',
    password: '***'
  })

  const generateWordPressData = () => {
    if (!post) return null

    const postData = {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || post.content.substring(0, 150),
      status: post.status === 'published' ? 'publish' : 'draft',
      categories: post.categories || [],
      tags: post.tags || [],
      featuredImage: post.featuredImage
    }

    return {
      ...postData,
      // Thêm thông tin cho manual sync
      manualSync: true,
      syncDate: new Date().toISOString(),
      localId: post.id
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`,
    })
  }

  const openWordPressAdmin = () => {
    window.open(wordpressUrl, '_blank')
  }

  const openWordPressNewPost = () => {
    const newPostUrl = `${wordpressUrl}post-new.php`
    window.open(newPostUrl, '_blank')
  }

  const generateExportData = () => {
    const data = generateWordPressData()
    if (!data) return

    const exportData = {
      ...data,
      instructions: [
        '1. Mở WordPress Admin trong tab mới',
        '2. Tạo bài viết mới',
        '3. Copy và paste dữ liệu từ clipboard',
        '4. Lưu bài viết',
        '5. Copy URL bài viết về đây'
      ]
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    copyToClipboard(jsonString, 'Dữ liệu bài viết')
  }

  const handleManualSync = async () => {
    setIsLoading(true)
    setSyncStatus('idle')

    try {
      // Tạo dữ liệu cho manual sync
      const syncData = generateWordPressData()
      if (!syncData) {
        throw new Error('Không có dữ liệu bài viết')
      }

      // Lưu vào localStorage để tracking
      const manualSyncs = JSON.parse(localStorage.getItem('manual-syncs') || '[]')
      manualSyncs.push({
        ...syncData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      })
      localStorage.setItem('manual-syncs', JSON.stringify(manualSyncs))

      toast({
        title: "Đã chuẩn bị dữ liệu",
        description: "Dữ liệu đã được sao chép vào clipboard. Vui lòng tạo bài viết trong WordPress Admin.",
      })

      setSyncStatus('success')
      onSuccess?.()

    } catch (error) {
      setSyncStatus('error')
      toast({
        title: "Lỗi",
        description: "Không thể chuẩn bị dữ liệu cho manual sync",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const postData = generateWordPressData()

  return (
    <div className="space-y-6">
      {/* WordPress Admin Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>WordPress Admin Access</span>
          </CardTitle>
          <CardDescription>
            Truy cập WordPress Admin để tạo bài viết thủ công
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Settings className="w-3 h-3 mr-1" />
              WordPress URL
            </Badge>
            <span className="text-sm font-mono">{wordpressUrl}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(wordpressUrl, 'WordPress URL')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <FileText className="w-3 h-3 mr-1" />
              Username
            </Badge>
            <span className="text-sm font-mono">{credentials.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(credentials.username, 'Username')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <FileText className="w-3 h-3 mr-1" />
              Password
            </Badge>
            <span className="text-sm font-mono">••••••••••••</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(credentials.password, 'Password')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          <div className="flex space-x-2">
            <Button onClick={openWordPressAdmin} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Mở WordPress Admin
            </Button>
            <Button onClick={openWordPressNewPost} variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Tạo bài viết mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync Data */}
      {postData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Dữ liệu đồng bộ thủ công</span>
            </CardTitle>
            <CardDescription>
              Sao chép dữ liệu này để tạo bài viết trong WordPress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm bg-gray-100 p-2 rounded flex-1">
                    {postData.title}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(postData.title, 'Tiêu đề')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={postData.status === 'publish' ? 'default' : 'secondary'}>
                    {postData.status === 'publish' ? 'Xuất bản' : 'Bản nháp'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Nội dung</label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm bg-gray-100 p-2 rounded flex-1 max-h-20 overflow-hidden">
                  {postData.content.substring(0, 100)}...
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(postData.content, 'Nội dung')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {postData.excerpt && (
              <div>
                <label className="text-sm font-medium">Tóm tắt</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm bg-gray-100 p-2 rounded flex-1">
                    {postData.excerpt}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(postData.excerpt, 'Tóm tắt')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex space-x-2">
              <Button 
                onClick={generateExportData}
                className="flex-1"
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Sao chép tất cả dữ liệu
              </Button>
              <Button 
                onClick={handleManualSync}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Bắt đầu đồng bộ thủ công
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Hướng dẫn đồng bộ thủ công</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Mở WordPress Admin</p>
                <p className="text-sm text-gray-600">Click "Mở WordPress Admin" để truy cập wp-admin</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Đăng nhập</p>
                <p className="text-sm text-gray-600">Sử dụng thông tin đăng nhập đã cung cấp</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Tạo bài viết mới</p>
                <p className="text-sm text-gray-600">Vào Posts {'>'} Add New hoặc click "Tạo bài viết mới"</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Copy dữ liệu</p>
                <p className="text-sm text-gray-600">Click "Sao chép tất cả dữ liệu" và paste vào WordPress</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                5
              </div>
              <div>
                <p className="font-medium">Lưu bài viết</p>
                <p className="text-sm text-gray-600">Publish hoặc Save Draft tùy theo trạng thái</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {syncStatus !== 'idle' && (
        <Alert variant={syncStatus === 'success' ? 'default' : 'destructive'}>
          {syncStatus === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {syncStatus === 'success' ? 'Chuẩn bị thành công' : 'Có lỗi xảy ra'}
          </AlertTitle>
          <AlertDescription>
            {syncStatus === 'success' 
              ? 'Dữ liệu đã được sao chép. Vui lòng tạo bài viết trong WordPress Admin.'
              : 'Không thể chuẩn bị dữ liệu. Vui lòng thử lại.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
