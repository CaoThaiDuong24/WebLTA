"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin, X, ZoomIn } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { getMainImageUrl, getImageAlt, hasImage, NewsItem, getAllImages } from '@/lib/image-utils'
import { SimpleHtmlContent } from '@/components/ui/simple-html-content'

// Using NewsItem from lib/image-utils instead of local interface

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{url: string, alt: string, index: number} | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { t } = useTranslation()

  const slug = params.slug as string

  // Load tin tức từ API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/news/${slug}?status=published`)
        const result = await response.json()
        
        if (result.success) {
          setNews(result.data)
        } else {
          setError('Không tìm thấy tin tức')
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        setError('Không thể tải tin tức')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchNews()
    }
  }, [slug])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Remove HTML tags from text
  const stripHtmlTags = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '')
  }

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

  // Handle arrow keys for image navigation
  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (!selectedImage || !news) return
      
      const allImages = getAllImages(news)
      if (allImages.length <= 1) return
      
      if (event.key === 'ArrowLeft') {
        const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1
        setCurrentImageIndex(prevIndex)
        setSelectedImage({
          url: allImages[prevIndex],
          alt: `${news.title} - Hình ảnh ${prevIndex + 1}`,
          index: prevIndex
        })
      } else if (event.key === 'ArrowRight') {
        const nextIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0
        setCurrentImageIndex(nextIndex)
        setSelectedImage({
          url: allImages[nextIndex],
          alt: `${news.title} - Hình ảnh ${nextIndex + 1}`,
          index: nextIndex
        })
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleArrowKeys)
      return () => document.removeEventListener('keydown', handleArrowKeys)
    }
  }, [selectedImage, currentImageIndex, news])

  // Share functions
  const shareOnFacebook = () => {
    const url = window.location.href
    const title = news?.title || ''
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`, '_blank')
  }

  const shareOnTwitter = () => {
    const url = window.location.href
    const title = news?.title || ''
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = window.location.href
    const title = news?.title || ''
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col public-page">
        <Header />
              <main className="flex-1">
        <div className="container py-12 mx-auto" style={{ maxWidth: '1200px' }}>
          <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="h-96 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="flex min-h-screen flex-col public-page">
        <Header />
        <main className="flex-1">
          <div className="container py-12 mx-auto" style={{ maxWidth: '1200px' }}>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy tin tức</h1>
              <p className="text-gray-600 mb-8">{error || 'Tin tức không tồn tại hoặc đã bị xóa'}</p>
              <Link href="/tin-tuc">
                <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại trang tin tức
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col public-page">
      <Header />

      <main className="flex-1">
        <div className="container py-12 mx-auto" style={{ maxWidth: '1200px' }}>
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-[#4CAF50] transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/tin-tuc" className="hover:text-[#4CAF50] transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900">{news.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <article className="mb-12">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {news.title}
              </h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(news.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{news.author}</span>
                </div>
                {news.category && (
                  <div className="bg-[#4CAF50]/10 text-[#4CAF50] px-3 py-1 rounded-full text-xs font-medium">
                    {news.category}
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {hasImage(news) && (
                <div 
                  className="relative w-full overflow-hidden rounded-lg mb-8 cursor-pointer group"
                  style={{ height: 'calc(24rem * 1.3 * 1.2 * 1.1)' }}
                  onClick={() => {
                    const allImages = getAllImages(news)
                    const mainImageIndex = allImages.findIndex(img => img === getMainImageUrl(news))
                    setCurrentImageIndex(mainImageIndex >= 0 ? mainImageIndex : 0)
                    setSelectedImage({
                      url: getMainImageUrl(news),
                      alt: getImageAlt(news),
                      index: mainImageIndex >= 0 ? mainImageIndex : 0
                    })
                  }}
                >
                  <Image
                    src={getMainImageUrl(news)}
                    alt={getImageAlt(news)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                  {/* Zoom overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              )}



              {/* Excerpt */}
              {news.excerpt && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <SimpleHtmlContent 
                    content={news.excerpt}
                    className="text-lg text-gray-700 italic"
                  />
                </div>
              )}
            </header>

            {/* Article Content */}
            <div className="html-content">
              <SimpleHtmlContent 
                content={news.content}
                className="text-gray-700 leading-relaxed"
              />
            </div>

            {/* Tags */}
            {news.tags && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {news.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chia sẻ:</h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareOnTwitter}
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareOnLinkedIn}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </article>

          {/* Additional Images Gallery */}
          {(news.additionalImages && news.additionalImages.length > 0) && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Hình ảnh bổ sung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.additionalImages.map((imageUrl, index) => {
                  // Chỉ sử dụng additionalImages để tính toán index, không bao gồm các trường khác
                  const additionalImagesIndex = index
                  const allImages = getAllImages(news)
                  const globalImageIndex = allImages.findIndex(img => img === imageUrl)
                  
                  return (
                    <div 
                      key={index} 
                      className="relative overflow-hidden rounded-lg group cursor-pointer"
                      style={{ height: 'calc(12rem * 1.3 * 1.2)' }}
                      onClick={() => {
                        // Sử dụng global index để navigation trong modal hoạt động đúng
                        setCurrentImageIndex(globalImageIndex >= 0 ? globalImageIndex : 0)
                        setSelectedImage({
                          url: imageUrl,
                          alt: `${news.title} - Hình ảnh bổ sung ${additionalImagesIndex + 1}`,
                          index: globalImageIndex >= 0 ? globalImageIndex : 0
                        })
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${news.title} - Hình ảnh bổ sung ${additionalImagesIndex + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}



          {/* Back to News */}
          <div className="text-center">
            <Link href="/tin-tuc">
              <Button variant="outline" className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại trang tin tức
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      {/* Image Modal */}
      {selectedImage && news && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full w-full">
            <div 
              className="bg-white rounded-lg p-4 max-w-full max-h-full overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
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

              {/* Image */}
              <div className="flex justify-center mb-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* Navigation */}
              {(() => {
                const allImages = getAllImages(news)
                if (allImages.length > 1) {
                  return (
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1
                          setCurrentImageIndex(prevIndex)
                          setSelectedImage({
                            url: allImages[prevIndex],
                            alt: `${news.title} - Hình ảnh ${prevIndex + 1}`,
                            index: prevIndex
                          })
                        }}
                        className="flex items-center gap-2"
                      >
                        ← Trước
                      </Button>
                      
                      <span className="text-sm text-gray-600">
                        {currentImageIndex + 1} / {allImages.length}
                      </span>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          const nextIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0
                          setCurrentImageIndex(nextIndex)
                          setSelectedImage({
                            url: allImages[nextIndex],
                            alt: `${news.title} - Hình ảnh ${nextIndex + 1}`,
                            index: nextIndex
                          })
                        }}
                        className="flex items-center gap-2"
                      >
                        Sau →
                      </Button>
                    </div>
                  )
                }
                return null
              })()}

              {/* Instructions */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Sử dụng phím mũi tên ← → để điều hướng, ESC để đóng
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 