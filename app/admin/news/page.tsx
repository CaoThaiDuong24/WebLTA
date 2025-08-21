'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Trash2,
  Edit, 
  Eye,
  FileText,
  Calendar,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  Download,
  Save
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { getMainImageUrl, getImageAlt, hasImage, getAllImages, NewsItem } from '@/lib/image-utils'
import { stripHtmlTags } from '@/lib/utils'
import { ImageUrlDisplay, formatImageUrl } from '@/components/ui/image-url-display'

export default function NewsManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Auto reload when component mounts
  useEffect(() => {
    loadNews()
  }, [])

  // Đồng bộ tất cả tin tức còn thiếu từ WordPress
  const syncAllMissingFromWordPress = async () => {
    try {
      setRestoringId('all')
      console.log('🔄 Starting sync from WordPress...')
      
      // Load WordPress config từ settings
      const wpConfig = {
        siteUrl: "https://wp2.ltacv.com",
        username: "lta2",
        applicationPassword: "m5ng lGbg T7L3 sfPg CuO6 b6TZ",
        autoPublish: true,
        defaultCategory: "",
        defaultTags: [],
        featuredImageEnabled: true,
        excerptLength: 150,
        status: "draft"
      }
      
      const response = await fetch('/api/wordpress/sync-missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          syncAll: true,
          config: wpConfig
        })
      })
      
      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📊 Response result:', result)
      
      if (response.ok) {
        toast({ title: '✅ Thành công', description: result.message || 'Đã đồng bộ tất cả tin tức còn thiếu từ WordPress' })
        loadNews()
      } else {
        console.error('❌ API Error:', result)
        toast({ title: '❌ Lỗi', description: result.error || 'Không thể đồng bộ tin tức từ WordPress', variant: 'destructive' })
      }
    } catch (error) {
      console.error('❌ Network Error:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi đồng bộ tin tức từ WordPress', variant: 'destructive' })
    } finally {
      setRestoringId(null)
    }
  }

  // Đồng bộ TẤT CẢ bài từ WordPress
  const syncAllPostsFromWordPress = async () => {
    try {
      setRestoringId('all-posts')
      console.log('🚀 Starting sync ALL posts from WordPress...')
      
      // Load WordPress config từ settings
      const wpConfig = {
        siteUrl: "https://wp2.ltacv.com",
        username: "lta2",
        applicationPassword: "m5ng lGbg T7L3 sfPg CuO6 b6TZ",
        autoPublish: true,
        defaultCategory: "",
        defaultTags: [],
        featuredImageEnabled: true,
        excerptLength: 150,
        status: "draft"
      }
      
      const response = await fetch('/api/wordpress/sync-all-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config: wpConfig
        })
      })
      
      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📊 Response result:', result)
      
      if (response.ok) {
        toast({ title: '✅ Thành công', description: result.message || 'Đã đồng bộ tất cả bài từ WordPress' })
        loadNews()
      } else {
        console.error('❌ API Error:', result)
        toast({ title: '❌ Lỗi', description: result.error || 'Không thể đồng bộ tất cả bài từ WordPress', variant: 'destructive' })
      }
    } catch (error) {
      console.error('❌ Network Error:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi đồng bộ tất cả bài từ WordPress', variant: 'destructive' })
    } finally {
      setRestoringId(null)
    }
  }

  // Load danh sách tin tức từ local database
  const loadNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news')
      if (response.ok) {
        const responseData = await response.json()
        let newsData = []
        if (responseData.success && responseData.data && Array.isArray(responseData.data)) {
          newsData = responseData.data
        } else if (Array.isArray(responseData)) {
          newsData = responseData
        } else {
          setNews([])
          toast({ title: '⚠️ Cảnh báo', description: 'Dữ liệu tin tức từ local database không đúng định dạng', variant: 'destructive' })
          return
        }
        setNews(newsData)
      } else {
        setNews([])
        toast({ title: '❌ Lỗi', description: 'Không thể tải danh sách tin tức từ local database', variant: 'destructive' })
      }
    } catch (error) {
      setNews([])
      toast({ title: '❌ Lỗi', description: 'Lỗi khi tải danh sách tin tức từ local database', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Xóa tin tức
  const deleteNews = async (id: string) => {
    if (!id) {
      toast({ title: '❌ Lỗi', description: 'ID tin tức không hợp lệ', variant: 'destructive' })
      return
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa tin tức có ID: ${id}?`)) return
    try {
      setDeletingId(id)
      const response = await fetch(`/api/news/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (response.ok) {
        toast({ title: '✅ Thành công', description: result.message || 'Đã xóa tin tức thành công' })
        loadNews()
      } else {
        toast({ title: '❌ Lỗi', description: result.error || 'Không thể xóa tin tức', variant: 'destructive' })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast({ title: '❌ Lỗi', description: `Lỗi khi xóa tin tức: ${errorMessage}`, variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  // Format date
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('vi-VN')

  // Truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    const strippedText = stripHtmlTags(text)
    if (strippedText.length <= maxLength) return strippedText
    return strippedText.substring(0, maxLength) + '...'
  }

  // Toggle status draft/published
  const toggleStatus = async (item: NewsItem) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    try {
      setTogglingId(item.id)
      const response = await fetch(`/api/news/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const result = await response.json()
      if (response.ok) {
        toast({ title: '✅ Đã cập nhật', description: `Trạng thái chuyển sang "${newStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp'}"` })
        // Cập nhật state tại chỗ để mượt hơn
        setNews(prev => prev.map(n => n.id === item.id ? { ...n, status: newStatus, updatedAt: new Date().toISOString() } : n))
      } else {
        toast({ title: '❌ Lỗi', description: result.error || 'Không thể cập nhật trạng thái', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: '❌ Lỗi', description: 'Lỗi khi cập nhật trạng thái', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(news.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNews = news.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of news list
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="space-y-6">
      {/* WordPress notice removed: using plugin-based sync only */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tin tức</h1>
          <p className="text-muted-foreground">Quản lý và xóa tin tức</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadNews}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-2">Làm mới</span>
          </Button>
          <Button
            variant="outline"
            onClick={syncAllMissingFromWordPress}
            disabled={restoringId === 'all'}
          >
            {restoringId === 'all' ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {restoringId === 'all' ? 'Đang đồng bộ...' : 'Đồng bộ từ WordPress'}
          </Button>
          <Button
            variant="outline"
            onClick={syncAllPostsFromWordPress}
            disabled={restoringId === 'all-posts'}
          >
            {restoringId === 'all-posts' ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {restoringId === 'all-posts' ? 'Đang đồng bộ...' : 'Đồng bộ TẤT CẢ bài từ WordPress'}
          </Button>
          <Link href="/admin/backup">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Backup & Restore
            </Button>
          </Link>
          <Link href="/admin/news/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo tin tức mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tin tức</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {news.filter(item => item.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {news.filter(item => item.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã sync WordPress</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {news.filter(item => item.syncedToWordPress).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải danh sách tin tức...</span>
          </CardContent>
        </Card>
      ) : news.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có tin tức nào</h3>
            <p className="text-muted-foreground mb-4">Tạo tin tức đầu tiên để bắt đầu</p>
            <Link href="/admin/news/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo tin tức mới
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentNews.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {hasImage(item) ? (
                      <img src={getMainImageUrl(item)} alt={getImageAlt(item)} className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                      {/* Toggle status */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Nháp</span>
                        <Switch checked={item.status === 'published'} onCheckedChange={() => toggleStatus(item)} disabled={togglingId === item.id} />
                        <span className="text-xs text-gray-500">Xuất bản</span>
                      </div>
                      {item.wordpressId && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">WP: {item.wordpressId}</span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-2">{truncateText(stripHtmlTags(item.excerpt || item.content), 150)}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1"><User className="h-4 w-4" /><span>{item.author || 'Admin'}</span></div>
                      <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{formatDate(item.createdAt)}</span></div>
                      {item.category && (<div className="flex items-center space-x-1"><FileText className="h-4 w-4" /><span>{item.category}</span></div>)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* View */}
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/news/${item.slug || item.id}`)} title="Xem">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {/* Edit */}
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/news/edit/${item.id}`)} title="Sửa">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {/* Delete */}
                    <Button variant="destructive" size="sm" onClick={() => deleteNews(item.id)} disabled={deletingId === item.id} title="Xóa">
                      {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            {/* Previous button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <svg className="h-4 w-4 rotate-180 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Trước
            </Button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 ${
                    currentPage === page 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>

            {/* Next button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Sau
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Page info */}
      {news.length > 0 && (
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, news.length)} trong tổng số {news.length} tin tức
        </div>
      )}
    </div>
  )
}