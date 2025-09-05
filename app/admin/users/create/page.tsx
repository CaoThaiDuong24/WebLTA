'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, ArrowLeft, Upload, X, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

export default function CreateUserPage() {
  const router = useRouter()
  const { session, isAuthenticated } = useAuth(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('subscriber')
  const [generatedUsername, setGeneratedUsername] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previousObjectUrlRef = useRef<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Chỉ cho phép administrator truy cập trang này
  useEffect(() => {
    if (!isAuthenticated) return
    if (session?.user?.role !== 'administrator') {
      router.replace('/admin/users')
    }
  }, [isAuthenticated, session, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Hình ảnh không được lớn hơn 5MB')
        return
      }

      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh')
        return
      }

      setAvatar(file)
      setError(null)

      // Tạo preview bằng Object URL (ổn định và nhanh hơn)
      if (previousObjectUrlRef.current) {
        try { URL.revokeObjectURL(previousObjectUrlRef.current) } catch {}
      }
      const objectUrl = URL.createObjectURL(file)
      previousObjectUrlRef.current = objectUrl
      setAvatarPreview(objectUrl)
    }
  }

  // Hàm tạo username hợp lệ từ tên
  const generateUsername = (inputName: string): string => {
    return inputName
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Tự động tạo username khi tên thay đổi
  useEffect(() => {
    if (name) {
      const username = generateUsername(name)
      setGeneratedUsername(username)
    } else {
      setGeneratedUsername('')
    }
  }, [name])

  const removeAvatar = () => {
    setAvatar(null)
    setAvatarPreview('')
    if (previousObjectUrlRef.current) {
      try { URL.revokeObjectURL(previousObjectUrlRef.current) } catch {}
      previousObjectUrlRef.current = null
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!name || !email || !password) {
      setError('Vui lòng nhập đầy đủ Tên, Email và Mật khẩu')
      return
    }

    if (!generatedUsername) {
      setError('Không thể tạo username từ tên đã nhập')
      return
    }

    setIsSubmitting(true)
    try {
      // Tạo FormData nếu có avatar
      let body: any = { username: generatedUsername, email, password, name, role }
      
      if (avatar) {
        const formData = new FormData()
        formData.append('username', generatedUsername)
        formData.append('email', email)
        formData.append('password', password)
        formData.append('name', name)
        formData.append('role', role)
        formData.append('avatar', avatar)
        
        const response = await fetch('/api/users/create', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        if (!response.ok) {
          const detailsText = Array.isArray(result?.details)
            ? result.details.map((d: any) => {
                const step = d?.step ? String(d.step) : ''
                const status = d?.status ? ` [${d.status}]` : ''
                const msg = d?.message ? `: ${String(d.message).slice(0, 300)}` : ''
                return `${step}${status}${msg}`
              }).join(' | ')
            : (typeof result?.details === 'string' ? result.details : '')
          setError(`${result?.error || 'Tạo người dùng thất bại'}${detailsText ? ' — ' + detailsText : ''}`)
          if (result?.details) {
            console.error('API Error details:', result.details)
          }
        } else {
          setSuccessMessage('Tạo người dùng thành công')
          setEmail('')
          setPassword('')
          setName('')
          setRole('subscriber')
          setGeneratedUsername('')
          removeAvatar()
          router.replace('/admin/users')
          router.refresh()
          return
        }
      } else {
        // Gửi JSON nếu không có avatar
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        const result = await response.json()
        if (!response.ok) {
          const detailsText = Array.isArray(result?.details)
            ? result.details.map((d: any) => {
                const step = d?.step ? String(d.step) : ''
                const status = d?.status ? ` [${d.status}]` : ''
                const msg = d?.message ? `: ${String(d.message).slice(0, 300)}` : ''
                return `${step}${status}${msg}`
              }).join(' | ')
            : (typeof result?.details === 'string' ? result.details : '')
          setError(`${result?.error || 'Tạo người dùng thất bại'}${detailsText ? ' — ' + detailsText : ''}`)
          if (result?.details) {
            console.error('API Error details:', result.details)
          }
                 } else {
           setSuccessMessage('Tạo người dùng thành công')
           setEmail('')
           setPassword('')
           setName('')
           setRole('subscriber')
           setGeneratedUsername('')
           router.replace('/admin/users')
           router.refresh()
           return
         }
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
            {/* Avatar Section */}
            <div className="space-y-4">
              <Label>Hình ảnh đại diện</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Chọn hình ảnh
                  </Button>
                  {avatar && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeAvatar}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Xóa hình ảnh
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB
                  </p>
                </div>
              </div>
            </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input id="email" type="email" placeholder="vd: user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="name">Tên hiển thị</Label>
                 <Input id="name" placeholder="vd: Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} />
               </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="password">Mật khẩu</Label>
                 <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="generatedUsername">Username (tự động tạo)</Label>
                 <Input 
                   id="generatedUsername" 
                   placeholder="Username sẽ được tạo tự động từ tên" 
                   value={generatedUsername} 
                   readOnly 
                   className="bg-gray-50"
                 />
                 {generatedUsername && (
                   <p className="text-xs text-muted-foreground">
                     Username: {generatedUsername}
                   </p>
                 )}
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


