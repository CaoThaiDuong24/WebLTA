'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

export default function CreateUserPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('subscriber')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!username || !email || !password) {
      setError('Vui lòng nhập đầy đủ Username, Email và Mật khẩu')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/wordpress/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, name, role })
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result?.error || 'Tạo người dùng thất bại')
        if (result?.details) {
          console.error('API Error details:', result.details)
        }
      } else {
        setSuccessMessage('Tạo người dùng thành công')
        setUsername('')
        setEmail('')
        setPassword('')
        setName('')
        setRole('subscriber')
        setTimeout(() => router.push('/admin/users'), 1000)
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo người dùng')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Thêm người dùng mới</h1>
          <p className="text-muted-foreground mt-1">Tạo tài khoản người dùng để đăng nhập</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/users" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>Điền thông tin bên dưới để tạo người dùng mới</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="mb-4">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="vd: johndoe" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="vd: user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên hiển thị (tuỳ chọn)</Label>
                <Input id="name" placeholder="vd: John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Quản trị viên (administrator)</SelectItem>
                  <SelectItem value="editor">Biên tập viên (editor)</SelectItem>
                  <SelectItem value="author">Tác giả (author)</SelectItem>
                  <SelectItem value="contributor">Cộng tác viên (contributor)</SelectItem>
                  <SelectItem value="subscriber">Thành viên (subscriber)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Đang tạo...' : 'Tạo người dùng'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/users')}>Huỷ</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


