'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  GraduationCap,
  Award
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface RecruitmentItem {
  id: string
  title: string
  position: string
  location: string
  salary: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  status: 'active' | 'inactive' | 'draft'
  description: string
  requirements: string[]
  benefits: string[]
  createdAt: string
  updatedAt: string
  deadline?: string
  experience: string
  education: string
}

export default function EditRecruitmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    position: '',
    location: '',
    salary: '',
    type: 'full-time' as const,
    status: 'draft' as const,
    description: '',
    requirements: [''],
    benefits: [''],
    experience: '',
    education: '',
    deadline: '',
    hasDeadline: false
  })

  useEffect(() => {
    loadRecruitment()
  }, [params.id])

  const loadRecruitment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/recruitment/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const recruitment = data.recruitment
        
        setFormData({
          title: recruitment.title || '',
          position: recruitment.position || '',
          location: recruitment.location || '',
          salary: recruitment.salary || '',
          type: recruitment.type || 'full-time',
          status: recruitment.status || 'draft',
          description: recruitment.description || '',
          requirements: recruitment.requirements && recruitment.requirements.length > 0 ? recruitment.requirements : [''],
          benefits: recruitment.benefits && recruitment.benefits.length > 0 ? recruitment.benefits : [''],
          experience: recruitment.experience || '',
          education: recruitment.education || '',
          deadline: recruitment.deadline ? new Date(recruitment.deadline).toISOString().slice(0, 16) : '',
          hasDeadline: !!recruitment.deadline
        })
      } else {
        toast({ title: '❌ Lỗi', description: 'Không thể tải thông tin tuyển dụng', variant: 'destructive' })
        router.push('/admin/recruitment')
      }
    } catch (error) {
      console.error('Error loading recruitment:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi tải thông tin tuyển dụng', variant: 'destructive' })
      router.push('/admin/recruitment')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: 'requirements' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'requirements' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.position.trim() || !formData.location.trim()) {
      toast({ title: '❌ Lỗi', description: 'Vui lòng điền đầy đủ thông tin bắt buộc', variant: 'destructive' })
      return
    }

    try {
      setSaving(true)
      
      const submitData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        deadline: formData.hasDeadline ? formData.deadline : null
      }

      const response = await fetch(`/api/recruitment/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        const result = await response.json()
        let description = 'Đã cập nhật tin tuyển dụng'
        
        if (result.wordpressSync?.success) {
          description += ' và đồng bộ thành công lên WordPress'
        } else if (result.wordpressSync) {
          description += ` (WordPress: ${result.wordpressSync.message})`
        }
        
        toast({ title: '✅ Thành công', description })
        router.push('/admin/recruitment')
      } else {
        const error = await response.json()
        toast({ title: '❌ Lỗi', description: error.message || 'Không thể cập nhật tin tuyển dụng', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error updating recruitment:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi cập nhật tin tuyển dụng', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/recruitment">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chỉnh sửa tin tuyển dụng</h1>
            <p className="text-gray-600 dark:text-gray-400">Cập nhật thông tin tin tuyển dụng</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề tin tuyển dụng *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề tin tuyển dụng"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Vị trí công việc *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Ví dụ: Nhân viên Marketing"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm làm việc *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ví dụ: Hà Nội, TP.HCM"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Mức lương</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="Ví dụ: 15-20 triệu VNĐ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Loại công việc</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Toàn thời gian</SelectItem>
                    <SelectItem value="part-time">Bán thời gian</SelectItem>
                    <SelectItem value="contract">Hợp đồng</SelectItem>
                    <SelectItem value="internship">Thực tập</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Kinh nghiệm</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Ví dụ: 2-3 năm kinh nghiệm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Trình độ học vấn</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Ví dụ: Đại học trở lên"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasDeadline"
                checked={formData.hasDeadline}
                onCheckedChange={(checked) => handleInputChange('hasDeadline', checked)}
              />
              <Label htmlFor="hasDeadline">Có hạn nộp hồ sơ</Label>
            </div>

            {formData.hasDeadline && (
              <div className="space-y-2">
                <Label htmlFor="deadline">Hạn nộp hồ sơ</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Mô tả công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết công việc</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về công việc, trách nhiệm, môi trường làm việc..."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Yêu cầu công việc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    placeholder={`Yêu cầu ${index + 1}`}
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('requirements', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('requirements')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm yêu cầu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Quyền lợi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                    placeholder={`Quyền lợi ${index + 1}`}
                  />
                  {formData.benefits.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('benefits', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('benefits')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm quyền lợi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái tin tuyển dụng</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="active">Đang tuyển</SelectItem>
                  <SelectItem value="inactive">Tạm ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/recruitment">
            <Button variant="outline" type="button">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
