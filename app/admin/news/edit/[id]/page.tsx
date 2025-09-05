'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Upload, 
  Settings, 
  List,
  AlertCircle,
  AlertTriangle,
  Copy
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QuillEditor } from '@/components/ui/quill-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { 
  processImages, 
  fileToDataUrl,
  processImageIfNeeded
} from '@/lib/image-utils'

// Schema validation
const newsSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  slug: z.string().optional().default(''),
  excerpt: z.string().optional().default(''),
  content: z.string().optional().default(''),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  category: z.string().optional().default(''),
  metaTitle: z.string().optional().default(''),
  metaDescription: z.string().optional().default(''),
  featuredImage: z.string().optional().default(''),
  additionalImages: z.array(z.string()).default([]),
})

type NewsForm = z.infer<typeof newsSchema>

interface WordPressConfig {
  siteUrl: string
  username: string
  applicationPassword: string
  isConnected: boolean
  autoPublish: boolean
}

export default function EditNewsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [wordpressStatus, setWordpressStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle')
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('')
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [categories, setCategories] = useState<{ name: string; slug?: string }[]>([])
  useEffect(() => {
    const loadCats = async () => {
      try {
        const resp = await fetch('/api/categories', { method: 'GET' })
        const data = await resp.json()
        const list = (data?.categories || []).map((c: any) => ({ name: c.name, slug: c.slug }))
        setCategories(list)
      } catch {}
    }
    loadCats()
  }, [])
  const [newsData, setNewsData] = useState<any>(null)

  const newsId = params.id as string

  // Danh sách danh mục sẽ được load từ API vào state `categories`

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<NewsForm>({
    resolver: zodResolver(newsSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'draft',
      featured: false,
      category: '',
      metaTitle: '',
      metaDescription: '',
      featuredImage: '',
      additionalImages: []
    }
  })

  // Load news data
  useEffect(() => {
    if (newsId) {
      loadNewsData()
    }
  }, [newsId])

  // Update form when newsData changes
  useEffect(() => {
    if (newsData) {

      
      // Set form values - giữ nguyên HTML cho Quill Editor
      setValue('title', newsData.title || '')
      setValue('slug', newsData.slug || '')
      setValue('excerpt', newsData.excerpt || '')
      setValue('content', newsData.content || '')
      setValue('status', newsData.status || 'draft')
      setValue('featured', newsData.featured || false)
      setValue('category', newsData.category || '')
      setValue('metaTitle', newsData.metaTitle || '')
      setValue('metaDescription', newsData.metaDescription || '')
      setValue('featuredImage', newsData.featuredImage || '')
      setValue('additionalImages', newsData.additionalImages || [])
      
      // Set image previews - chỉ lấy hình ảnh thực sự
      if (newsData.featuredImage) {
        setFeaturedImagePreview(newsData.featuredImage)
      }
      
      // Lọc additionalImages để chỉ lấy hình ảnh bổ sung thực sự (không phải featuredImage), đồng thời loại trùng theo "gốc" ảnh
      const normalizeForCompareSubmit = (url: string) => {
        try {
          const u = new URL(url)
          let p = u.pathname.toLowerCase()
          p = p.replace(/\.[a-z0-9]+$/i, '')
          p = p.replace(/-\d+x\d+$/i, '')
          p = p.replace(/-scaled$/i, '')
          return u.origin.toLowerCase() + p
        } catch {
          let s = String(url).toLowerCase().split('?')[0]
          s = s.replace(/\.[a-z0-9]+$/i, '')
          s = s.replace(/-\d+x\d+$/i, '')
          s = s.replace(/-scaled$/i, '')
          return s.replace(/\/$/, '')
        }
      }
      const baseFeatured = newsData.featuredImage ? normalizeForCompareSubmit(newsData.featuredImage) : ''
      if (newsData.additionalImages && newsData.additionalImages.length > 0) {
        const map = new Map<string, string>()
        for (const raw of newsData.additionalImages) {
          if (!raw || String(raw).trim() === '') continue
          const norm = normalizeForCompareSubmit(raw)
          if (baseFeatured && norm === baseFeatured) continue
          if (!map.has(norm)) map.set(norm, raw)
        }
        const cleaned = Array.from(map.values())
        setAdditionalImagesPreview(cleaned)
        setValue('additionalImages', cleaned)
      }
    }
  }, [newsData, setValue])

  const loadNewsData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/news/${newsId}`)
      if (response.ok) {
        const result = await response.json()
        const data = result.data // Lấy dữ liệu từ result.data
        setNewsData(data)
        
        
        
        // Set form values - giữ nguyên HTML cho Quill Editor
        setValue('title', data.title || '')
        setValue('slug', data.slug || '')
        setValue('excerpt', data.excerpt || '')
        setValue('content', data.content || '')
        setValue('status', data.status || 'draft')
        setValue('featured', data.featured || false)
        setValue('category', data.category || '')
        setValue('metaTitle', data.metaTitle || '')
        setValue('metaDescription', data.metaDescription || '')
        setValue('featuredImage', data.featuredImage || '')
        setValue('additionalImages', data.additionalImages || [])
        
        // Set image previews - chỉ lấy hình ảnh thực sự
        if (data.featuredImage) {
          setFeaturedImagePreview(data.featuredImage)
        }
        
        // Lọc additionalImages để chỉ lấy hình ảnh bổ sung thực sự (không phải featuredImage)
        if (data.additionalImages && data.additionalImages.length > 0) {
          const filteredAdditionalImages = data.additionalImages.filter((img: string) => 
            img !== data.featuredImage && img !== data.image
          )
          setAdditionalImagesPreview(filteredAdditionalImages)
          setValue('additionalImages', filteredAdditionalImages)
        }
        

      } else {
        throw new Error('Failed to load news data')
      }
    } catch (error) {
      console.error('Error loading news data:', error)
      toast({
        title: "❌ Lỗi",
        description: "Không thể tải dữ liệu tin tức",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }



  const generateSlug = (title: string) => {
    if (!title) return ''
    const withoutDiacritics = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
    return withoutDiacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    const slug = generateSlug(title)
    setValue('title', title)
    setValue('slug', slug)
  }

  const handleFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setUploadingImages(true)
        const dataUrl = await fileToDataUrl(file)
        setValue('featuredImage', dataUrl)
        setFeaturedImage(file)
        setFeaturedImagePreview(dataUrl)

      } catch (error) {
        console.error('Error processing featured image:', error)
        toast({
          title: "❌ Lỗi",
          description: "Không thể xử lý hình ảnh đại diện",
          variant: "destructive",
        })
      } finally {
        setUploadingImages(false)
      }
    }
  }

  const handleAdditionalImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      try {
        setUploadingImages(true)
        const dataUrls = await Promise.all(files.map(fileToDataUrl))
        setValue('additionalImages', dataUrls)
        setAdditionalImages(files)
        setAdditionalImagesPreview(dataUrls)

      } catch (error) {
        console.error('Error processing additional images:', error)
        toast({
          title: "❌ Lỗi",
          description: "Không thể xử lý hình ảnh bổ sung",
          variant: "destructive",
        })
      } finally {
        setUploadingImages(false)
      }
    }
  }

  const onSubmit = async (data: NewsForm) => {
    if (isLoading) {

      return
    }
    

    setIsLoading(true)
    setSaveStatus('saving')

    try {
      // Prepare image data - sử dụng dữ liệu từ form state thay vì preview
      let featuredImageUrl = data.featuredImage || ''
      let additionalImageUrls = data.additionalImages || []
      
      // Chỉ sử dụng preview nếu có thay đổi mới
      if (featuredImagePreview && featuredImagePreview !== newsData.featuredImage) {
        featuredImageUrl = featuredImagePreview
      }
      if (additionalImagesPreview.length > 0 && JSON.stringify(additionalImagesPreview) !== JSON.stringify(newsData.additionalImages)) {
        additionalImageUrls = additionalImagesPreview
      }

      // Làm sạch ảnh bổ sung: loại ảnh đại diện và trùng lặp theo "gốc" ảnh
      const normalizeForCompareSubmit = (url: string) => {
        try {
          const u = new URL(url)
          let p = u.pathname.toLowerCase()
          p = p.replace(/\.[a-z0-9]+$/i, '')
          p = p.replace(/-\d+x\d+$/i, '')
          p = p.replace(/-scaled$/i, '')
          return u.origin.toLowerCase() + p
        } catch {
          let s = String(url).toLowerCase().split('?')[0]
          s = s.replace(/\.[a-z0-9]+$/i, '')
          s = s.replace(/-\d+x\d+$/i, '')
          s = s.replace(/-scaled$/i, '')
          return s.replace(/\/$/, '')
        }
      }
      const baseFeatured = featuredImageUrl ? normalizeForCompareSubmit(featuredImageUrl) : ''
      const normalizedToOriginal = new Map<string, string>()
      for (const raw of additionalImageUrls) {
        if (!raw || String(raw).trim() === '') continue
        const norm = normalizeForCompareSubmit(raw)
        if (baseFeatured && norm === baseFeatured) continue
        if (!normalizedToOriginal.has(norm)) normalizedToOriginal.set(norm, raw)
      }
      additionalImageUrls = Array.from(normalizedToOriginal.values())

      // So sánh thay đổi ảnh để tránh gửi lặp
      const normalizeForCompare = (url: string) => {
        try {
          const u = new URL(url)
          let p = u.pathname.toLowerCase()
          p = p.replace(/\.[a-z0-9]+$/i, '')
          p = p.replace(/-\d+x\d+$/i, '')
          p = p.replace(/-scaled$/i, '')
          return u.origin.toLowerCase() + p
        } catch {
          let s = String(url || '').toLowerCase().split('?')[0]
          s = s.replace(/\.[a-z0-9]+$/i, '')
          s = s.replace(/-\d+x\d+$/i, '')
          s = s.replace(/-scaled$/i, '')
          return s.replace(/\/$/, '')
        }
      }
      const arraysEqualNormalized = (a: string[] = [], b: string[] = []) => {
        const na = Array.from(new Set(a.map(normalizeForCompare))).sort()
        const nb = Array.from(new Set(b.map(normalizeForCompare))).sort()
        return JSON.stringify(na) === JSON.stringify(nb)
      }
      const hasAdditionalChanged = !arraysEqualNormalized(additionalImageUrls, newsData?.additionalImages || [])
      const hasFeaturedChanged = normalizeForCompare(featuredImageUrl) !== normalizeForCompare(newsData?.featuredImage || '')

      // Update news data - giữ nguyên ID gốc
      const updateData: any = {
        id: newsId, // Giữ nguyên ID gốc
        title: data.title || 'Tin tức mới',
        slug: data.slug || generateSlug(data.title || 'tin-tuc-moi'),
        excerpt: data.excerpt || '',
        content: data.content || '',
        status: data.status || 'draft',
        featured: data.featured || false,
        category: data.category || '',
        metaTitle: data.metaTitle || data.title || '',
        metaDescription: data.metaDescription || '',
        // Chèn có điều kiện để tránh plugin thêm trùng
        featuredImage: hasFeaturedChanged ? featuredImageUrl : undefined,
        additionalImages: hasAdditionalChanged ? additionalImageUrls : undefined,
        __skipFeaturedImage: !hasFeaturedChanged,
        __skipAdditionalImages: !hasAdditionalChanged,
        image: featuredImageUrl,
        updatedAt: new Date().toISOString(),
        // Giữ nguyên các trường quan trọng khác
        wordpressId: newsData?.wordpressId,
        syncedToWordPress: newsData?.syncedToWordPress,
        author: newsData?.author || 'Admin',
        createdAt: newsData?.createdAt || new Date().toISOString(),
        publishedAt: newsData?.publishedAt || new Date().toISOString()
      }

      // Save to API
      const response = await fetch(`/api/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setSaveStatus('success')
        toast({
          title: "✅ Thành công",
          description: `Tin tức đã được cập nhật. ID gốc "${newsId}" được giữ nguyên.`,
        })
        
        // Redirect to news list after a short delay
        setTimeout(() => {
          router.push('/admin/news')
        }, 1500)
      } else {
        throw new Error('Failed to update news')
      }
    } catch (error) {
      console.error('Error updating news:', error)
      setSaveStatus('error')
      toast({
        title: "❌ Lỗi",
        description: "Không thể cập nhật tin tức",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !newsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải dữ liệu tin tức...</p>
          <p className="text-sm text-gray-600 mt-2">ID: {newsId}</p>
        </div>
      </div>
    )
  }

  if (!newsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p>Không tìm thấy dữ liệu tin tức</p>
          <p className="text-sm text-gray-600 mt-2">ID: {newsId}</p>
          <Button 
            onClick={() => router.push('/admin/news')} 
            className="mt-4"
          >
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
          <Link href="/admin/news">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa tin tức</h1>
            <p className="text-muted-foreground">Cập nhật thông tin tin tức</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/news')}
          >
            <List className="mr-2 h-4 w-4" />
            Danh sách
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Đang lưu...' : 'Cập nhật tin tức'}
          </Button>
        </div>
      </div>

             {/* ID Protection Alert */}
       <Alert className="border-blue-200 bg-blue-50">
         <AlertCircle className="h-4 w-4 text-blue-600" />
         <AlertDescription className="text-blue-800">
           <strong>Lưu ý:</strong> Khi cập nhật tin tức, ID gốc <code className="bg-blue-100 px-1 rounded">{newsId}</code> sẽ được giữ nguyên để đảm bảo tính nhất quán dữ liệu.
         </AlertDescription>
       </Alert>



      {/* Status Alerts */}
      {saveStatus === 'success' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Tin tức đã được cập nhật thành công! ID gốc được giữ nguyên.
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Có lỗi xảy ra khi cập nhật tin tức. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    onChange={handleTitleChange}
                    placeholder="Nhập tiêu đề tin tức"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="tin-tuc-moi"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">Tóm tắt *</Label>
                  <div className="mb-2 text-sm text-gray-600">
                    💡 <b>Gợi ý:</b> Viết tóm tắt ngắn gọn, hấp dẫn về tin tức
                  </div>
                  <QuillEditor
                    value={watch('excerpt') || ''}
                    onChange={(val) => setValue('excerpt', val, { shouldValidate: true })}
                    placeholder="Tóm tắt ngắn gọn về tin tức"
                    height={140}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-600 mt-1">{errors.excerpt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Nội dung *</Label>
                  <div className="mb-2 text-sm text-gray-600">
                    💡 <b>Gợi ý:</b> Viết nội dung chi tiết, có thể sử dụng tiêu đề, danh sách, nhúng hình ảnh
                  </div>
                  <QuillEditor
                    value={watch('content') || ''}
                    onChange={(val) => setValue('content', val, { shouldValidate: true })}
                    placeholder="Nội dung chi tiết của tin tức"
                    height={300}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thông tin ID */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Thông tin ID</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID gốc</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                      {newsId}
                    </div>
                  </div>
                  {newsData?.wordpressId && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">WordPress ID</Label>
                      <div className="mt-1 p-2 bg-blue-50 rounded border text-sm font-mono">
                        {newsData.wordpressId}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ngày tạo</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                      {newsData?.createdAt ? new Date(newsData.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Lần cập nhật cuối</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                      {newsData?.updatedAt ? new Date(newsData.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                  </div>
                </div>

                {newsData?.syncedToWordPress && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Tin tức này đã được đồng bộ với WordPress. Khi cập nhật, ID gốc sẽ được giữ nguyên.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div>
                   <Label htmlFor="status">Trạng thái</Label>
                   <Select 
                     value={watch('status')} 
                     onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Chọn trạng thái" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="draft">Bản nháp</SelectItem>
                       <SelectItem value="published">Đã xuất bản</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 <div>
                   <Label htmlFor="category">Danh mục</Label>
                   <Select 
                     value={watch('category')} 
                     onValueChange={(value) => setValue('category', value)}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Chọn danh mục" />
                     </SelectTrigger>
                     <SelectContent>
                       {categories.map((cat) => (
                        <SelectItem key={cat.slug || cat.name} value={cat.slug || cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    {...register('featured')}
                    onCheckedChange={(checked) => setValue('featured', checked)}
                  />
                  <Label htmlFor="featured">Tin tức nổi bật</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="featuredImage">Hình ảnh đại diện</Label>
                  <Input
                    id="featuredImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    disabled={uploadingImages}
                  />
                  {uploadingImages && (
                    <p className="text-sm text-blue-600 mt-1">Đang xử lý hình ảnh...</p>
                  )}
                  {featuredImagePreview && (
                    <div className="mt-3">
                      <div className="relative inline-block">
                        <img
                          src={featuredImagePreview}
                          alt="Featured image preview"
                          className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFeaturedImagePreview('')
                            setValue('featuredImage', '')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="additionalImages">Hình ảnh bổ sung</Label>
                  <Input
                    id="additionalImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    disabled={uploadingImages}
                  />
                  {additionalImagesPreview.length > 0 && (
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        {additionalImagesPreview.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Additional image ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newPreviews = additionalImagesPreview.filter((_, i) => i !== index)
                                const newDataUrls = watch('additionalImages').filter((_, i) => i !== index)
                                setAdditionalImagesPreview(newPreviews)
                                setValue('additionalImages', newDataUrls)
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    {...register('metaTitle')}
                    placeholder="Tiêu đề SEO"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    {...register('metaDescription')}
                    placeholder="Mô tả SEO"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
