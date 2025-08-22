"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, User, PhoneCall, Mail, MapPin, Send, Search, CheckCircle, AlertCircle } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { getMainImageUrl, getImageAlt, hasImage, NewsItem } from '@/lib/image-utils'
import { useSearchParams } from 'next/navigation'

// Using NewsItem from lib/image-utils instead of local interface

function NewsPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [news, setNews] = useState<NewsItem[]>([])
  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(4)
  const { t } = useTranslation()

  // Load tin tức từ API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/news?status=published&limit=10')
        const result = await response.json()
        
        if (result.success) {
          const publishedNews = result.data as NewsItem[]
          // API đã sắp xếp rồi, không cần sắp xếp lại ở client
          setNews(publishedNews)
          
          // Lấy tin nổi bật đầu tiên (nếu có); nếu không, dùng phần tử đầu tiên
          const featured = publishedNews.find((item: NewsItem) => item.featured)
          setFeaturedNews(featured || publishedNews[0] || null)
          
          // Lấy danh sách danh mục từ tin tức
          const uniqueCategories = [...new Set(publishedNews.map((item: NewsItem) => item.category).filter(Boolean))] as string[]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Xử lý URL parameters để lọc theo danh mục
  useEffect(() => {
    const category = searchParams.get('category')
    setSelectedCategory(category || '')
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would trigger a search API call
    console.log("Searching for:", searchQuery)
    // For demo purposes, we're just logging the search query
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

  // Helper: strip HTML to plain text
  const toPlainText = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  // Helper: format author name
  const formatAuthor = (author: string) => {
    if (!author) return 'Admin LTA'
    
    // Nếu author là email, chỉ lấy phần trước @
    if (author.includes('@')) {
      return author.split('@')[0]
    }
    
    // Xử lý các trường hợp đặc biệt
    if (author === 'lta2') return 'Admin LTA'
    if (author === 'admin') return 'Admin LTA'
    if (author === 'Admin') return 'Admin LTA'
    
    // Nếu author quá dài, cắt ngắn
    if (author.length > 20) {
      return author.substring(0, 20) + '...'
    }
    
    return author
  }

  // Get recent posts (3 most recent from already-sorted list)
  const recentPosts = news.slice(0, 3)

  // Filter news by category
  const filteredNews = selectedCategory 
    ? news.filter(item => item.category === selectedCategory)
    : news

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNews = filteredNews.slice(startIndex, endIndex)

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of news section
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="flex min-h-screen flex-col public-page">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#4CAF50] py-16 relative">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/slider-logista-4.jpg"
              alt="Logistics transportation with containers and cargo"
              fill
              className="object-cover opacity-30"
              priority
            />
          </div>
          <div className="container text-center text-white relative z-10">
            <h1 className="text-5xl font-bold mb-4">{t('newsTitle')}</h1>
            <p className="text-lg max-w-3xl mx-auto">
              {t('newsSubtitle')}
            </p>
          </div>
        </section>

        <div className="container py-12 mx-auto" style={{ maxWidth: '1200px' }}>
          {/* Featured News */}
          {featuredNews && news.length > 0 && (
            <div className="bg-gradient-to-br from-[#4CAF50]/3 to-[#4CAF50]/8 rounded-xl p-6 mb-12 border border-[#4CAF50]/10">
              <div className="inline-block bg-[#4CAF50] text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4 shadow-sm">
                {t('latestNews')}
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="flex flex-col justify-center">
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 hover:text-[#4CAF50] transition-colors duration-300 leading-tight mb-4 line-clamp-3">
                    {featuredNews.title}
                  </h2>

                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
                    {toPlainText(featuredNews.excerpt)}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-md">
                      <Calendar className="h-3 w-3 text-[#4CAF50]" />
                      <span>{formatDate(featuredNews.publishedAt || featuredNews.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-md">
                      <User className="h-3 w-3 text-[#4CAF50]" />
                      <span>{formatAuthor(featuredNews.author)}</span>
                    </div>
                  </div>
                  
                  <Link href={`/tin-tuc/${featuredNews.slug}`}>
                    <Button
                      className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                    >
                      {t('readMore')}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="relative w-full overflow-hidden rounded-xl shadow-lg" style={{ height: 'calc(16rem * 1.2)' }}>
                    <Image
                      src={getMainImageUrl(featuredNews)}
                      alt={getImageAlt(featuredNews)}
                      fill
                      className="object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    {featuredNews.category && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#4CAF50] text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                        {featuredNews.category}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Latest News */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">{t('latestNews')}</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tin tức</h3>
                  <p className="text-gray-500 max-w-md">
                    Hiện tại chưa có tin tức nào được đăng. Vui lòng quay lại sau hoặc liên hệ với chúng tôi để biết thêm thông tin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentNews.map((item) => (
                    <Link key={item.id} href={`/tin-tuc/${item.slug}`}>
                      <article className="bg-white rounded-lg overflow-hidden group cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={getMainImageUrl(item)}
                            alt={getImageAlt(item)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Category Badge */}
                          {item.category && (
                            <div className="absolute top-3 left-3 bg-[#4CAF50] text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                              {item.category}
                            </div>
                          )}
                          
                          {/* Read More Badge */}
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[#4CAF50] text-xs px-2 py-1 rounded-md font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                            {t('readMore')}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 text-base leading-tight group-hover:text-[#4CAF50] transition-colors duration-300 line-clamp-2">
                            {item.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-2">
                            {toPlainText(item.excerpt)}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 text-[#4CAF50]" />
                              <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <User className="h-3 w-3 text-[#4CAF50]" />
                              <span>{formatAuthor(item.author)}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredNews.length > 0 && (
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
                      <ArrowRight className="h-4 w-4 rotate-180 mr-1" />
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
                              ? 'bg-[#4CAF50] hover:bg-[#45a049] text-white' 
                              : 'hover:bg-gray-100'
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
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Page info */}
              {filteredNews.length > 0 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredNews.length)} trong tổng số {filteredNews.length} tin tức
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Search in Sidebar */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Search className="h-5 w-5 mr-2 text-[#4CAF50]" />
                  {t('search')}
                </h3>
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="focus-visible:ring-[#4CAF50] focus-visible:border-[#4CAF50]"
                    />
                    <Button type="submit" size="icon" className="ml-2 bg-[#4CAF50] hover:bg-[#45a049]">
                      <Search className="h-4 w-4" />
                      <span className="sr-only">{t('searchButton')}</span>
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">{t('popularKeywords')}</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-[#4CAF50]"
                      onClick={() => setSearchQuery(t('promotion'))}
                    >
                      {t('promotion')}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-[#4CAF50]"
                      onClick={() => setSearchQuery(t('deposit'))}
                    >
                      {t('deposit')}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-[#4CAF50]"
                      onClick={() => setSearchQuery(t('application'))}
                    >
                      {t('application')}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-[#4CAF50]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {t('categories')}
                </h3>
                <ul className="space-y-2">
                  {/* Tất cả */}
                  <li>
                    <Link 
                      href="/tin-tuc"
                      className="flex items-center justify-between text-gray-700 hover:text-[#4CAF50] transition-colors duration-200 font-medium"
                    >
                      <span>{t('all')}</span>
                      <span className="text-xs text-gray-400">
                        {news.length}
                      </span>
                    </Link>
                  </li>
                  
                  {/* Các danh mục khác */}
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <li key={category}>
                        <Link 
                          href={`/tin-tuc?category=${encodeURIComponent(category)}`}
                          className="flex items-center justify-between text-gray-700 hover:text-[#4CAF50] transition-colors duration-200"
                        >
                          <span>{category}</span>
                          <span className="text-xs text-gray-400">
                            {news.filter(item => item.category === category).length}
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">Chưa có danh mục</li>
                  )}
                </ul>
              </div>

              {/* Recent Posts */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-[#4CAF50]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t('recentPosts')}
                </h3>
                <ul className="space-y-4">
                  {recentPosts.length > 0 ? (
                    recentPosts.map((item) => (
                      <li key={item.id} className="flex gap-3 group">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                          <Image
                            src={getMainImageUrl(item)}
                            alt={getImageAlt(item)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/tin-tuc/${item.slug}`}>
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#4CAF50] transition-colors duration-200 line-clamp-2">
                              {item.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">
                             {formatDate(item.publishedAt || item.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm text-center py-4">
                      Chưa có tin tức gần đây
                    </li>
                  )}
                </ul>
              </div>


            </div>
          </div>
        </div>
      </main>

      {/* Contact Us Section */}
      <section id="contact" className="bg-white py-16">
        <div className="container mx-auto" style={{ maxWidth: '1200px' }}>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('contactUs')}</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t('contactDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('sendMessage')}</h3>
              <ContactForm />
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('contactInfo')}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                    <PhoneCall className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{t('phone')}</div>
                    <div className="mt-1 text-gray-600">0886 116 668</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                    <Mail className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{t('email')}</div>
                    <div className="mt-1 text-gray-600">info@ltacv.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                    <MapPin className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{t('address')}</div>
                    <div className="mt-1 text-gray-600">{t('addressText')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4648712934485!2d106.7497269!3d10.8070702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175266a1a196d79%3A0x3ce72ceea3523a9f!2s2A%20%C4%90%C6%B0%E1%BB%9Dng%20S%E1%BB%91%205%2C%20An%20Ph%C3%BA%2C%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vi%E1%BB%87t%20Nam!5e0!3m2!1sen!2s!4v1649299914899!5m2!1sen!2s"
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// ContactForm component for the news page
function ContactForm() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Auto-hide success message after 2 seconds
  useEffect(() => {
    if (submitStatus === 'success') {
      const timerId = setTimeout(() => {
        setSubmitStatus('idle')
        setSubmitMessage('')
      }, 2000)
      return () => clearTimeout(timerId)
    }
  }, [submitStatus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset status
    setSubmitStatus('idle')
    setSubmitMessage('')

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error')
      setSubmitMessage('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('error')
      setSubmitMessage('Email không hợp lệ')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(result.message)
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Có lỗi xảy ra khi gửi thông tin liên hệ')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Có lỗi xảy ra khi gửi thông tin liên hệ. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetStatus = () => {
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  return (
    <>
      {/* Status Message */}
      {submitStatus !== 'idle' && (
        <div 
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            submitStatus === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {submitStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{submitMessage}</span>
          <button
            onClick={resetStatus}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Đóng
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="news-name" className="block text-sm font-medium text-gray-700">
              {t('fullName')} <span className="text-red-500">*</span>
            </label>
            <Input 
              id="news-name" 
              name="name" 
              type="text" 
              className="mt-1" 
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="news-email" className="block text-sm font-medium text-gray-700">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <Input 
              id="news-email" 
              name="email" 
              type="email" 
              className="mt-1" 
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="news-company" className="block text-sm font-medium text-gray-700">
            {t('company')}
          </label>
          <Input 
            id="news-company" 
            name="company" 
            type="text" 
            className="mt-1" 
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="news-message" className="block text-sm font-medium text-gray-700">
            {t('message')} <span className="text-red-500">*</span>
          </label>
          <Textarea 
            id="news-message" 
            name="message" 
            rows={4} 
            className="mt-1" 
            value={formData.message}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full group bg-[#4CAF50] hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang gửi...
            </>
          ) : (
            <>
              {t('sendButton')}
              <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </>
  )
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col public-page">
        <Header />
        <main className="flex-1">
          <div className="container py-12 mx-auto" style={{ maxWidth: '1200px' }}>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="h-96 bg-gray-200 rounded mb-8"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <NewsPageContent />
    </Suspense>
  )
}
