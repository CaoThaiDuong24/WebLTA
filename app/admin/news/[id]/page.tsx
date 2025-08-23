'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Globe,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Tag,
  ExternalLink,
  X,
  ZoomIn,
  Download,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { stripHtmlTags } from '@/lib/utils'
import { ImageUrlDisplay, formatImageUrl } from '@/components/ui/image-url-display'
import { SimpleHtmlContent } from '@/components/ui/simple-html-content'


interface NewsItem {
  id: string
  title: string
  content: string
  excerpt?: string
  status?: string
  createdAt: string
  updatedAt?: string
  wordpressId?: number
  syncedToWordPress?: boolean
  lastSyncDate?: string
  slug?: string
  featured?: boolean
  author?: string
  metaTitle?: string
  metaDescription?: string
  category?: string
  tags?: string
  featuredImage?: string
  image?: string
  imageAlt?: string
  additionalImages?: string[]
  relatedImages?: Array<{
    id: string
    url: string
    alt: string
    order: number
  }>
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{url: string, alt: string} | null>(null)

  const newsId = params.id as string

  useEffect(() => {
    if (newsId) {
      loadNewsDetail()
    }
  }, [newsId])

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [selectedImage])

  const loadNewsDetail = async () => {
    try {
      setLoading(true)
      
      
      const response = await fetch(`/api/news/${newsId}`)
      
      
      if (response.ok) {
        const result = await response.json()
        
        setNews(result.data)
      } else {
        console.error('❌ Failed to load news detail')
        toast({
          title: "❌ Lỗi",
          description: "Không thể tải chi tiết tin tức",
          variant: "destructive",
        })
        router.push('/admin/news')
      }
    } catch (error) {
      console.error('Error loading news detail:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi tải chi tiết tin tức",
        variant: "destructive",
      })
      router.push('/admin/news')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!news) return

    if (!confirm(`Bạn có chắc chắn muốn xóa tin tức "${news.title}"?`)) {
      return
    }

    try {
      setDeleting(true)
      

      const response = await fetch(`/api/news/${news.id}`, {
        method: 'DELETE',
      })

      

      if (response.ok) {
        toast({
          title: "✅ Thành công",
          description: "Tin tức đã được xóa thành công",
        })
        router.push('/admin/news')
      } else {
        const result = await response.json()
        toast({
          title: "❌ Lỗi",
          description: result.error || "Không thể xóa tin tức",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi xóa tin tức",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const handleSyncFromWordPress = async () => {
    try {
      setRestoring(true)
      

      const response = await fetch('/api/wordpress/sync-missing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressId: news?.wordpressId,
          syncAll: !news?.wordpressId
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Thành công",
          description: result.message || "Đã đồng bộ tin tức từ WordPress",
        })
        // Reload news data
        loadNewsDetail()
      } else {
        toast({
          title: "❌ Lỗi",
          description: result.error || "Không thể đồng bộ tin tức từ WordPress",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error syncing from WordPress:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi đồng bộ tin tức từ WordPress",
        variant: "destructive",
      })
    } finally {
      setRestoring(false)
    }
  }





  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-500">Đã xuất bản</Badge>
      case 'draft':
        return <Badge variant="secondary">Bản nháp</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Đang tải chi tiết tin tức...</p>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Không tìm thấy tin tức</p>
          <Button onClick={() => router.push('/admin/news')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/news')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết tin tức</h1>
            <p className="text-muted-foreground">Xem thông tin chi tiết của tin tức</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/news/edit/${news.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button 
            variant="outline"
            onClick={handleSyncFromWordPress}
            disabled={restoring}
          >
            {restoring ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {restoring ? 'Đang đồng bộ...' : 'Đồng bộ từ WordPress'}
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>

      {/* News Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Tiêu đề</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold">{news.title}</h2>
            </CardContent>
          </Card>

          {/* Featured Image Card */}
          {(news.featuredImage || news.image) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Hình ảnh chính</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => setSelectedImage({
                      url: news.featuredImage || news.image || '',
                      alt: news.imageAlt || news.title
                    })}
                  >
                    <img 
                      src={news.featuredImage || news.image} 
                      alt={news.imageAlt || news.title}
                      className="w-40 h-40 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200"
                      style={{ imageRendering: 'auto' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Alt text:</strong> {news.imageAlt || 'Không có'}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <strong>URL:</strong>
                      <div className="mt-1">
                        <ImageUrlDisplay url={news.featuredImage || news.image} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

                     {/* Images Card */}
           {news.additionalImages && news.additionalImages.filter((imageUrl) => imageUrl !== news.featuredImage && imageUrl !== news.image).length > 0 && (
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center space-x-2">
                   <FileText className="h-5 w-5" />
                   <span>Hình ảnh bổ sung ({news.additionalImages?.filter((imageUrl) => imageUrl !== news.featuredImage && imageUrl !== news.image)?.length || 0})</span>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Hiển thị additionalImages - lọc trùng lặp với featuredImage */}
                   {news.additionalImages
                     ?.filter((imageUrl) => imageUrl !== news.featuredImage && imageUrl !== news.image)
                     ?.map((imageUrl, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start space-x-3">
                        <div 
                          className="relative cursor-pointer group"
                          onClick={() => setSelectedImage({
                            url: imageUrl,
                            alt: `${news.title} - Hình ảnh ${index + 1}`
                          })}
                        >
                          <img 
                            src={imageUrl} 
                            alt={`${news.title} - Hình ảnh ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200"
                            style={{ imageRendering: 'auto' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">
                            Hình {index + 1}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <ImageUrlDisplay url={imageUrl} maxLength={30} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Excerpt Card */}
          {news.excerpt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Tóm tắt</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleHtmlContent 
                  content={news.excerpt}
                  className="text-muted-foreground"
                />
              </CardContent>
            </Card>
          )}

          {/* Content Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Nội dung</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="html-content">
                <SimpleHtmlContent 
                  content={news.content}
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Trạng thái</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trạng thái:</span>
                {getStatusBadge(news.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WordPress:</span>
                {news.syncedToWordPress ? (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Đã đồng bộ</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Chưa đồng bộ</span>
                  </div>
                )}
              </div>
              {news.wordpressId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">WordPress ID:</span>
                  <span className="text-sm">{news.wordpressId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tác giả:</span>
                <span className="text-sm">{news.author || 'Không xác định'}</span>
              </div>
              {news.category && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Danh mục:</span>
                  <span className="text-sm">{news.category}</span>
                </div>
              )}
              {news.tags && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tags:</span>
                  <span className="text-sm">{news.tags}</span>
                </div>
              )}
              {news.slug && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Slug:</span>
                  <span className="text-sm font-mono">{news.slug}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Thời gian</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tạo lúc:</span>
                <span className="text-sm">{formatDate(news.createdAt)}</span>
              </div>
              {news.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cập nhật:</span>
                  <span className="text-sm">{formatDate(news.updatedAt)}</span>
                </div>
              )}
              {news.lastSyncDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Đồng bộ:</span>
                  <span className="text-sm">{formatDate(news.lastSyncDate)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Information */}
          {(news.metaTitle || news.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>SEO</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {news.metaTitle && (
                  <div>
                    <span className="text-sm font-medium">Meta Title:</span>
                    <p className="text-sm text-muted-foreground mt-1">{news.metaTitle}</p>
                  </div>
                )}
                {news.metaDescription && (
                  <div>
                    <span className="text-sm font-medium">Meta Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">{news.metaDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <div 
              className="bg-white rounded-lg p-4 max-w-full max-h-full overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedImage.alt}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Click bên ngoài hoặc nhấn ESC để đóng
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 