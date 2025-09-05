'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, RotateCcw, Loader2, ArrowLeft, FileText, Calendar, User, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getMainImageUrl, getImageAlt, NewsItem } from '@/lib/image-utils'

interface TrashedNews extends NewsItem {
  originalId?: string
  deletedAt?: string
}

export default function NewsTrashPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<TrashedNews[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadTrash = async () => {
    try {
      setLoading(true)
      const resp = await fetch('/api/news?trashed=true')
      if (!resp.ok) throw new Error('Không thể tải thùng rác')
      const json = await resp.json()
      setItems(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      setItems([])
      toast({ title: '❌ Lỗi', description: 'Không thể tải thùng rác', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrash()
  }, [])

  const restoreItem = async (item: TrashedNews) => {
    try {
      setRestoringId(item.id)
      // Khôi phục: thêm lại vào news.json với id cũ nếu còn trùng thì giữ nguyên id
      const payload = { ...item }
      // Xóa các trường thùng rác phụ
      delete (payload as any).originalId
      delete (payload as any).deletedAt
      
      const resp = await fetch(`/api/news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!resp.ok) {
        // Nếu không có trong file chính, thêm mới bằng POST lưu local (API hiện publish via plugin; nên chỉ khôi phục client-side)
        // Tạm thời báo lỗi và hướng dẫn sync từ WordPress
        toast({ title: '⚠️ Khôi phục thủ công', description: 'Không thể khôi phục trực tiếp. Vui lòng dùng trang "Đồng bộ từ WordPress" hoặc tạo lại bài.' })
      } else {
        toast({ title: '✅ Đã khôi phục', description: 'Tin tức đã được khôi phục' })
      }
    } catch (e) {
      toast({ title: '❌ Lỗi', description: 'Không thể khôi phục tin tức', variant: 'destructive' })
    } finally {
      setRestoringId(null)
      loadTrash()
    }
  }

  const deletePermanently = async (item: TrashedNews) => {
    if (!confirm('Xóa vĩnh viễn mục này? Hành động không thể hoàn tác.')) return
    try {
      setDeletingId(item.id)
      const resp = await fetch('/api/news/trash', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      })
      const json = await resp.json()
      if (resp.ok) {
        toast({ title: '✅ Đã xóa', description: 'Đã xóa vĩnh viễn khỏi thùng rác' })
        loadTrash()
      } else {
        toast({ title: '❌ Lỗi', description: json.error || 'Không thể xóa vĩnh viễn', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: '❌ Lỗi', description: 'Không thể xóa vĩnh viễn', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push('/admin/news')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-bold">Thùng rác tin tức</h1>
        </div>
        <Alert>
          <AlertDescription>
            Các bài trong thùng rác có thể khôi phục thủ công hoặc xóa vĩnh viễn.
          </AlertDescription>
        </Alert>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải...
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Không có mục nào trong thùng rác
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {item.featuredImage ? (
                      <img src={getMainImageUrl(item)} alt={getImageAlt(item)} className="w-20 h-20 object-cover rounded" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{item.title}</h3>
                      <div className="text-xs text-gray-500">Xóa lúc: {item.deletedAt ? new Date(item.deletedAt).toLocaleString('vi-VN') : '-'}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">{item.excerpt || ''}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => restoreItem(item)} disabled={restoringId === item.id}>
                        {restoringId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        <span className="ml-1">Khôi phục</span>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deletePermanently(item)} disabled={deletingId === item.id}>
                        {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span className="ml-1">Xóa vĩnh viễn</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


