'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
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
import { fileToDataUrlWithCompression, validateFile } from '@/lib/upload-utils'
import { QuillEditor } from '@/components/ui/quill-editor'

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
  restApiBlocked: boolean
}

export default function CreateNewsPage() {
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

  // Danh sách danh mục
  const categories = [
    'Thông báo',
    'Hướng dẫn', 
    'Khuyến mãi',
    'Cập nhật ứng dụng',
    'Tin tức ngành'
  ]

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

  // Debug form validation
  useEffect(() => {
    console.log('🔍 Form validation:', { isValid, errors })
  }, [isValid, errors])

  useEffect(() => {
    const loadWordPressConfig = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setWordpressConfig(data.wordpress)
        }
      } catch (error) {
        console.error('Error loading WordPress config:', error)
      }
    }

    const loadUploadConfig = async () => {
      try {
        const response = await fetch('/api/upload-config')
        if (response.ok) {
          const data = await response.json()
          // Handle upload config if needed
        }
      } catch (error) {
        console.error('Error loading upload config:', error)
      }
    }

    loadWordPressConfig()
    loadUploadConfig()
  }, [])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^ws-]/g, '')
      .replace(/[s_-]+/g, '-')
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
        
        // Kiểm tra file trước khi xử lý
        const validation = validateFile(file)
        if (!validation.isValid) {
          toast({
            title: "❌ Lỗi",
            description: validation.error || "File không hợp lệ",
            variant: "destructive",
          })
          return
        }
        
        // Hiển thị cảnh báo nếu file lớn
        if (validation.warning) {
          toast({
            title: "⚠️ Cảnh báo",
            description: validation.warning,
            variant: "default",
          })
        }
        
        // Sử dụng function mới với nén tự động
        const dataUrl = await fileToDataUrlWithCompression(file)
        setValue('featuredImage', dataUrl)
        setFeaturedImage(file)
        setFeaturedImagePreview(dataUrl)
        console.log('✅ Featured image processed with compression')
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
        
        // Kiểm tra từng file
        const validFiles: File[] = []
        const warnings: string[] = []
        
        for (const file of files) {
          const validation = validateFile(file)
          if (validation.isValid) {
            validFiles.push(file)
            if (validation.warning) {
              warnings.push(`${file.name}: ${validation.warning}`)
            }
          } else {
            toast({
              title: "❌ Lỗi",
              description: `${file.name}: ${validation.error}`,
              variant: "destructive",
            })
          }
        }
        
        if (validFiles.length === 0) {
          setUploadingImages(false)
          return
        }
        
        // Hiển thị cảnh báo nếu có
        if (warnings.length > 0) {
          toast({
            title: "⚠️ Cảnh báo",
            description: warnings.slice(0, 2).join(', ') + (warnings.length > 2 ? '...' : ''),
            variant: "default",
          })
        }
        
        // Xử lý các file hợp lệ với nén tự động
        const dataUrls = await Promise.all(
          validFiles.map(file => fileToDataUrlWithCompression(file))
        )
        setValue('additionalImages', dataUrls)
        setAdditionalImages(validFiles)
        setAdditionalImagesPreview(dataUrls)
        console.log(`✅ ${validFiles.length} additional images processed with compression`)
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
    // Ngăn chặn submit nhiều lần
    if (isLoading) {
      console.log('⚠️ Form đang submit, bỏ qua')
      return
    }
    
    console.log('🚀 Form submitted with data:', data)
    console.log('📋 Form errors:', errors)
    console.log('✅ Form is valid:', isValid)
    console.log('📝 Current form values:', watch())
    
    setIsLoading(true)
    setSaveStatus('saving')
    setWordpressStatus('publishing')

    try {
      // Step 1: Prepare image data
      console.log('🖼️ Preparing image data...')
      let featuredImageUrl = data.featuredImage || ''
      let additionalImageUrls = data.additionalImages || []
      
      // Nếu có preview images, sử dụng chúng
      if (featuredImagePreview) {
        featuredImageUrl = featuredImagePreview
      }
      if (additionalImagesPreview.length > 0) {
        additionalImageUrls = additionalImagesPreview
      }

      // Step 2: Save to local database
      console.log('💾 Saving to local database...')
      console.log('📊 Prepared data:', {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: featuredImageUrl,
        additionalImages: additionalImageUrls
      })
      
      const localNewsData = {
        title: data.title || 'Tin tức mới',
        slug: data.slug || generateSlug(data.title || 'tin-tuc-moi'),
        excerpt: data.excerpt || '',
        content: data.content || '',
        status: data.status || 'draft',
        featured: data.featured || false,
        category: data.category || '',
        metaTitle: data.metaTitle || data.title || '',
        metaDescription: data.metaDescription || '',
        featuredImage: featuredImageUrl,
        additionalImages: additionalImageUrls,
        image: featuredImageUrl,
        relatedImages: [] // Không tạo relatedImages tự động để tránh trùng lặp
      }
      
      const localResponse = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'admin-panel',
        },
        body: JSON.stringify(localNewsData),
      })

      if (!localResponse.ok) {
        const localError = await localResponse.text()
        throw new Error(`Lỗi khi lưu tin tức: ${localError}`)
      }

      const localResult = await localResponse.json()
      console.log('✅ Local save successful:', localResult)
      setSaveStatus('success')

      // Step 3: Check auto-sync result
      console.log('✅ News saved successfully')
      
      if (localResult.data.syncedToWordPress) {
        setWordpressStatus('success')
        toast({
          title: "✅ Thành công!",
          description: "Tin tức đã được lưu và tự động đồng bộ lên WordPress",
        })
      } else {
        setWordpressStatus('error')
        toast({
          title: "⚠️ Lưu thành công nhưng chưa sync WordPress",
          description: "Tin tức đã được lưu. Vui lòng sync thủ công hoặc liên hệ hosting provider để enable REST API.",
        })
      }
      
      // Redirect sau khi hoàn thành
      setTimeout(() => {
        router.push('/admin/news')
      }, 2000)
    } catch (error) {
      console.error('❌ Error:', error)
      setSaveStatus('error')
      setWordpressStatus('error')
      toast({
        title: "❌ Lỗi",
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadingImages(false)
    }
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
            <h1 className="text-2xl font-bold">Tạo tin tức mới</h1>
            <p className="text-muted-foreground">Thêm tin tức mới vào hệ thống</p>
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
            {isLoading ? 'Đang lưu...' : 'Lưu tin tức'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              console.log('🔍 Test button clicked')
              console.log('📝 Current form values:', watch())
              console.log('✅ Form is valid:', isValid)
              console.log('❌ Form errors:', errors)
            }}
          >
            Test Form
          </Button>
        </div>
      </div>

      {/* WordPress Status Alert */}
      {wordpressConfig && (
        <Alert className={`border-${wordpressConfig.restApiBlocked ? 'orange' : 'green'}-200 bg-${wordpressConfig.restApiBlocked ? 'orange' : 'green'}-50`}>
          <Globe className={`h-4 w-4 text-${wordpressConfig.restApiBlocked ? 'orange' : 'green'}-600`} />
          <AlertDescription>
            <strong>WordPress Status:</strong> {
              wordpressConfig.restApiBlocked 
                ? 'REST API bị chặn. Sử dụng đồng bộ thủ công.' 
                : 'REST API hoạt động. Auto sync sẵn sàng.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
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

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select onValueChange={(value) => setValue('status', value as 'draft' | 'published')}>
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
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                            setFeaturedImage(null)
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
                        {additionalImagesPreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Additional image ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = additionalImages.filter((_, i) => i !== index)
                                const newPreviews = additionalImagesPreview.filter((_, i) => i !== index)
                                const newDataUrls = watch('additionalImages').filter((_, i) => i !== index)
                                setAdditionalImages(newFiles)
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
                  <Input
                    id="metaDescription"
                    {...register('metaDescription')}
                    placeholder="Mô tả SEO"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${saveStatus === 'success' ? 'bg-green-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <span>Lưu tin tức: {saveStatus === 'success' ? 'Thành công' : saveStatus === 'error' ? 'Lỗi' : 'Đang xử lý...'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${wordpressStatus === 'success' ? 'bg-green-500' : wordpressStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <span>WordPress sync: {wordpressStatus === 'success' ? 'Thành công' : wordpressStatus === 'error' ? 'Lỗi' : 'Đang xử lý...'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}