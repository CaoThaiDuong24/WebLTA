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
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

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

export default function RecruitmentManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadRecruitments()
  }, [])

  const loadRecruitments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recruitment')
      if (response.ok) {
        const data = await response.json()
        setRecruitments(data.recruitments || [])
      } else {
        toast({ title: '❌ Lỗi', description: 'Không thể tải danh sách tuyển dụng', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error loading recruitments:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi tải danh sách tuyển dụng', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) return

    try {
      setDeletingId(id)
      const response = await fetch(`/api/recruitment/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: '✅ Thành công', description: 'Đã xóa tin tuyển dụng' })
        loadRecruitments()
      } else {
        const error = await response.json()
        toast({ title: '❌ Lỗi', description: error.message || 'Không thể xóa tin tuyển dụng', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting recruitment:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi xóa tin tuyển dụng', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setTogglingId(id)
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(`/api/recruitment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({ title: '✅ Thành công', description: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'tạm ẩn'} tin tuyển dụng` })
        loadRecruitments()
      } else {
        const error = await response.json()
        toast({ title: '❌ Lỗi', description: error.message || 'Không thể cập nhật trạng thái', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast({ title: '❌ Lỗi', description: 'Lỗi khi cập nhật trạng thái', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  const handleSyncToWordPress = async () => {
    if (!confirm('Bạn có chắc chắn muốn đồng bộ tất cả tin tuyển dụng lên WordPress?')) return

    try {
      setSyncing(true)
      const response = await fetch('/api/recruitment/sync-wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-all' })
      })

      if (response.ok) {
        const result = await response.json()
        toast({ 
          title: '✅ Đồng bộ thành công', 
          description: result.message 
        })
        console.log('Sync results:', result)
      } else {
        const error = await response.json()
        toast({ 
          title: '❌ Lỗi đồng bộ', 
          description: error.message || 'Không thể đồng bộ lên WordPress', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      console.error('Error syncing to WordPress:', error)
      toast({ 
        title: '❌ Lỗi', 
        description: 'Lỗi khi đồng bộ lên WordPress', 
        variant: 'destructive' 
      })
    } finally {
      setSyncing(false)
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

  // Pagination
  const totalPages = Math.ceil(recruitments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecruitments = recruitments.slice(startIndex, endIndex)

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý tuyển dụng</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý và đăng tin tuyển dụng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadRecruitments} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Link href="/admin/recruitment/applicants">
            <Button variant="outline" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              Ứng viên
            </Button>
          </Link>
          <Button 
            onClick={handleSyncToWordPress} 
            variant="outline" 
            size="sm" 
            disabled={syncing}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {syncing ? 'Đang đồng bộ...' : 'Đồng bộ WordPress'}
          </Button>
          <Link href="/admin/recruitment/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tin tuyển dụng
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng số tin</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{recruitments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang tuyển</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recruitments.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tạm ẩn</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recruitments.filter(r => r.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bản nháp</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recruitments.filter(r => r.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruitment List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tin tuyển dụng</CardTitle>
        </CardHeader>
        <CardContent>
          {currentRecruitments.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có tin tuyển dụng</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Bắt đầu tạo tin tuyển dụng đầu tiên</p>
              <Link href="/admin/recruitment/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm tin tuyển dụng
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {currentRecruitments.map((recruitment) => (
                <div key={recruitment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {recruitment.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">{recruitment.position}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(recruitment.status)}
                          {getTypeBadge(recruitment.type)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{recruitment.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{recruitment.salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {recruitment.deadline ? `Hạn: ${formatDate(recruitment.deadline)}` : 'Không có hạn'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>Tạo: {formatDate(recruitment.createdAt)}</span>
                        {recruitment.updatedAt !== recruitment.createdAt && (
                          <span className="ml-4">Cập nhật: {formatDate(recruitment.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={recruitment.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(recruitment.id, recruitment.status)}
                        disabled={togglingId === recruitment.id}
                      />
                      
                      <Link href={`/admin/recruitment/${recruitment.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/admin/recruitment/edit/${recruitment.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(recruitment.id)}
                        disabled={deletingId === recruitment.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        {deletingId === recruitment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, recruitments.length)} trong {recruitments.length} tin tuyển dụng
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
