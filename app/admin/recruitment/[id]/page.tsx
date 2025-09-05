'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  User,
  Award,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertTriangle
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

export default function RecruitmentDetailPage() {
  const router = useRouter()
  const routeParams = useParams() as { id?: string | string[] }
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id || ''
  const { toast } = useToast()
  const [recruitment, setRecruitment] = useState<RecruitmentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadRecruitment()
  }, [id])

  const loadRecruitment = async () => {
    try {
      setLoading(true)
      if (!id) return
      const response = await fetch(`/api/recruitment/${id}`)
      if (response.ok) {
        const data = await response.json()
        setRecruitment(data.recruitment)
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

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/recruitment/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: '✅ Thành công', description: 'Đã xóa tin tuyển dụng' })
        router.push('/admin/recruitment')
      } else {
        const error = await response.json()
        toast({ title: '❌ Lỗi', description: error.message || 'Không thể xóa tin tuyển dụng', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting recruitment:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi xóa tin tuyển dụng', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Đang tuyển</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Tạm ẩn</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Bản nháp</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'full-time':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Toàn thời gian</Badge>
      case 'part-time':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Bán thời gian</Badge>
      case 'contract':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Hợp đồng</Badge>
      case 'internship':
        return <Badge variant="outline" className="text-green-600 border-green-600">Thực tập</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!recruitment) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không tìm thấy tin tuyển dụng</h3>
        <Link href="/admin/recruitment">
          <Button>Quay lại danh sách</Button>
        </Link>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết tin tuyển dụng</h1>
            <p className="text-gray-600 dark:text-gray-400">Xem thông tin chi tiết tin tuyển dụng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/recruitment/edit/${recruitment.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{recruitment.title}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">{recruitment.position}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(recruitment.status)}
              {getTypeBadge(recruitment.type)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{recruitment.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{recruitment.salary || 'Thỏa thuận'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {recruitment.deadline ? `Hạn: ${formatDate(recruitment.deadline)}` : 'Không có hạn'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Kinh nghiệm: {recruitment.experience || 'Không yêu cầu'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Học vấn: {recruitment.education || 'Không yêu cầu'}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>Tạo: {formatDate(recruitment.createdAt)}</span>
            {recruitment.updatedAt !== recruitment.createdAt && (
              <span className="ml-4">Cập nhật: {formatDate(recruitment.updatedAt)}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {recruitment.description && (
        <Card>
          <CardHeader>
            <CardTitle>Mô tả công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{recruitment.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {recruitment.requirements && recruitment.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Yêu cầu công việc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recruitment.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {recruitment.benefits && recruitment.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Quyền lợi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recruitment.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Link href="/admin/recruitment">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </Link>
        <Link href={`/admin/recruitment/edit/${recruitment.id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </Link>
      </div>
    </div>
  )
}
