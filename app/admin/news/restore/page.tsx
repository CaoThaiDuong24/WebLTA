'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Download, 
  RefreshCw, 
  FileText, 
  Calendar, 
  User,
  Image,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface WordPressPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  status: string
  date: string
  modified: string
  author: string
  featuredImage: string | null
  categories: string[]
  tags: string[]
  sticky: boolean
}

interface SearchResult {
  success: boolean
  data: WordPressPost[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPosts: number
    perPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  searchQuery: string
}

export default function RestoreNewsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Check for wordpressId in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const wordpressId = urlParams.get('wordpressId')
    if (wordpressId) {
      // Auto search for this specific post
      searchPosts(`ID:${wordpressId}`, 1)
    }
  }, [])

  // Tìm kiếm posts từ WordPress
  const searchPosts = async (query: string = '', page: number = 1) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (query) {
        // Check if query is a WordPress ID
        if (query.startsWith('ID:')) {
          const wordpressId = query.substring(3)
          // Use restore API to get specific post
          const restoreResponse = await fetch('/api/wordpress/restore-deleted', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wordpressId: parseInt(wordpressId),
              forceRestore: false,
              includeImages: true,
              includeContent: true
            }),
          })

          if (restoreResponse.ok) {
            const result = await restoreResponse.json()
            toast({
              title: "✅ Thành công",
              description: result.message,
            })
            // Redirect back to news list
            window.location.href = '/admin/news'
            return
          } else {
            const error = await restoreResponse.json()
            toast({
              title: "❌ Lỗi",
              description: error.error || "Không thể khôi phục tin tức",
              variant: "destructive",
            })
            return
          }
        }
        params.append('q', query)
      }
      params.append('page', page.toString())
      params.append('per_page', '10')

      const response = await fetch(`/api/wordpress/search-posts?${params}`)
      
      if (response.ok) {
        const result = await response.json()
        setSearchResults(result)
      } else {
        const error = await response.json()
        toast({
          title: "❌ Lỗi",
          description: error.error || "Không thể tìm kiếm posts từ WordPress",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error searching posts:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi tìm kiếm posts từ WordPress",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Khôi phục tin tức từ WordPress
  const restoreNews = async (post: WordPressPost) => {
    try {
      setRestoring(post.id.toString())
      
      const response = await fetch('/api/wordpress/restore-deleted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressId: post.id,
          title: post.title,
          slug: post.slug,
          forceRestore: false,
          includeImages: true,
          includeContent: true
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Thành công",
          description: result.message,
        })
        // Refresh search results
        searchPosts(searchQuery, currentPage)
      } else {
        if (result.error === 'Tin tức đã tồn tại trong hệ thống') {
          // Hỏi người dùng có muốn force restore không
          if (confirm('Tin tức đã tồn tại. Bạn có muốn cập nhật lại từ WordPress không?')) {
            await forceRestore(post)
          }
        } else {
          toast({
            title: "❌ Lỗi",
            description: result.error || "Không thể khôi phục tin tức",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Error restoring news:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi khôi phục tin tức",
        variant: "destructive",
      })
    } finally {
      setRestoring(null)
    }
  }

  // Force restore (cập nhật tin tức hiện có)
  const forceRestore = async (post: WordPressPost) => {
    try {
      setRestoring(post.id.toString())
      
      const response = await fetch('/api/wordpress/restore-deleted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressId: post.id,
          title: post.title,
          slug: post.slug,
          forceRestore: true,
          includeImages: true,
          includeContent: true
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Thành công",
          description: result.message,
        })
        // Refresh search results
        searchPosts(searchQuery, currentPage)
      } else {
        toast({
          title: "❌ Lỗi",
          description: result.error || "Không thể cập nhật tin tức",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error force restoring news:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi cập nhật tin tức",
        variant: "destructive",
      })
    } finally {
      setRestoring(null)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    searchPosts(searchQuery, 1)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    searchPosts(searchQuery, page)
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Khôi phục tin tức từ WordPress</h1>
          <p className="text-gray-600 mt-2">
            Tìm kiếm và khôi phục tin tức đã bị xóa từ WordPress
          </p>
        </div>
        <Link href="/admin/news">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm tin tức trong WordPress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="Nhập tiêu đề hoặc từ khóa tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Tìm kiếm
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Kết quả tìm kiếm ({searchResults.pagination.totalPosts} tin tức)
            </h2>
            {searchResults.searchQuery && (
              <Badge variant="secondary">
                Tìm kiếm: "{searchResults.searchQuery}"
              </Badge>
            )}
          </div>

          {/* Posts List */}
          <div className="grid gap-6">
            {searchResults.data.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Featured Image */}
                    {post.featuredImage && (
                      <div className="flex-shrink-0">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={post.status === 'publish' ? 'default' : 'secondary'}>
                            {post.status === 'publish' ? 'Đã xuất bản' : 'Bản nháp'}
                          </Badge>
                          {post.sticky && (
                            <Badge variant="destructive">Ghim</Badge>
                          )}
                        </div>
                      </div>

                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.excerpt.replace(/<[^>]*>/g, '')}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{post.author}</span>
                        </div>
                        {post.featuredImage && (
                          <div className="flex items-center gap-1">
                            <Image className="h-3 w-3" />
                            <span>Có hình ảnh</span>
                          </div>
                        )}
                      </div>

                      {/* Categories and Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => restoreNews(post)}
                          disabled={restoring === post.id.toString()}
                          className="flex items-center gap-2"
                        >
                          {restoring === post.id.toString() ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Khôi phục
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => forceRestore(post)}
                          disabled={restoring === post.id.toString()}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Cập nhật
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {searchResults.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!searchResults.pagination.hasPrevPage}
              >
                Trước
              </Button>
              
              <span className="text-sm text-gray-600">
                Trang {currentPage} / {searchResults.pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!searchResults.pagination.hasNextPage}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {searchResults && searchResults.data.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy tin tức
            </h3>
            <p className="text-gray-600">
              Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại cấu hình WordPress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
