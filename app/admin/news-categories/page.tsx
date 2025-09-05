'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, Edit2, Trash2, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface CategoryItem {
  id: number | string
  name: string
  slug?: string
  description?: string
  count?: number
}

export default function NewsCategoriesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ id: '', name: '', slug: '', description: '' })
  const [editingId, setEditingId] = useState<string | number | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(c => (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q))
  }, [categories, search])

  const load = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/categories', { method: 'GET' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Failed to load')
      const list: CategoryItem[] = Array.isArray(data?.categories) ? data.categories : []
      setCategories(list.map((c: any) => ({
        id: c.id || c.term_id || c.termId || c.termId,
        name: c.name,
        slug: c.slug,
        description: c.description,
        count: c.count,
      })))
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể tải danh mục', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ id: '', name: '', slug: '', description: '' })
    setEditingId(null)
  }

  const onSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Tên danh mục là bắt buộc', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const payload: any = { name: form.name.trim(), slug: form.slug?.trim() || undefined, description: form.description?.trim() || '' }
      if (editingId) payload.id = editingId
      const resp = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Lỗi lưu danh mục')
      toast({ title: 'Thành công', description: editingId ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục mới' })
      resetForm()
      load()
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể lưu danh mục', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (cat: CategoryItem) => {
    setEditingId(cat.id)
    setForm({ id: String(cat.id), name: cat.name || '', slug: cat.slug || '', description: cat.description || '' })
  }

  const onDelete = async (id: string | number) => {
    if (!confirm('Xoá danh mục này?')) return
    try {
      const resp = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error || 'Không thể xoá danh mục')
      toast({ title: 'Đã xoá', description: 'Danh mục đã được xoá' })
      if (editingId === id) resetForm()
      load()
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể xoá danh mục', variant: 'destructive' })
    }
  }

  const quickAddDefaults = async () => {
    const defaults = [
      { name: 'Thông báo', slug: 'thong-bao' },
      { name: 'Hướng dẫn', slug: 'huong-dan' },
      { name: 'Khuyến mãi', slug: 'khuyen-mai' },
      { name: 'Cập nhật ứng dụng', slug: 'cap-nhat-ung-dung' },
      { name: 'Tin tức ngành', slug: 'tin-tuc-nganh' },
    ]
    setSaving(true)
    try {
      const tasks = defaults.map(item => fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }))
      const results = await Promise.allSettled(tasks)
      const failed = results.filter(r => r.status === 'rejected').length
      toast({ title: 'Hoàn tất', description: failed ? `Tạo thành công, ${failed} mục lỗi` : 'Đã tạo các danh mục cơ bản' })
      load()
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể tạo nhanh', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const syncAllFromWordPress = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/categories/sync', { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Sync thất bại')
      toast({ title: 'Đồng bộ xong', description: `Thêm mới ${data?.result?.inserted || 0}, cập nhật ${data?.result?.updated || 0}` })
      load()
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể đồng bộ', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const pruneDefaults = async () => {
    const items = ['test', 'uncategorized']
    try {
      const resp = await fetch('/api/categories/prune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Không thể xoá')
      toast({ title: 'Đã xoá', description: `Xoá: ${(data?.result?.deleted || []).join(', ')}` })
      load()
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e?.message || 'Không thể xoá danh mục mặc định', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Quản lý danh mục tin tức</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={quickAddDefaults} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhanh danh mục cơ bản
          </Button>
          <Button variant="outline" onClick={syncAllFromWordPress} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Đồng bộ tất cả từ WordPress
          </Button>
          <Button variant="outline" onClick={pruneDefaults}>
            Xoá Test/Uncategorized
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{editingId ? 'Sửa danh mục' : 'Thêm danh mục'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input id="name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ví dụ: Thông báo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (tùy chọn)</Label>
              <Input id="slug" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="thong-bao" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả (tùy chọn)</Label>
              <Input id="description" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Mô tả ngắn" />
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={saving}>
                {editingId ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>Huỷ</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Danh sách danh mục</CardTitle>
            <Input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {filtered.map(cat => (
                <div key={String(cat.id)} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-sm text-muted-foreground">{cat.slug} {typeof cat.count !== 'undefined' ? `• ${cat.count} bài` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(cat)}>
                      <Edit2 className="h-4 w-4 mr-1" /> Sửa
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(cat.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Xoá
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground py-6">Không có danh mục</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


