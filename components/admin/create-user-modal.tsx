'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  UserPlus, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Shield,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface CreateUserModalProps {
  onUserCreated: () => void
}

export function CreateUserModal({ onUserCreated }: CreateUserModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'subscriber'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast({
        title: "Lỗi",
        description: "Email là bắt buộc",
        variant: "destructive"
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive"
      })
      return false
    }

    if (!formData.password) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu là bắt buộc",
        variant: "destructive"
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive"
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Lấy email làm username
      const username = formData.email.trim()
      
      const response = await fetch('/api/wordpress/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          role: formData.role
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
          variant: "default"
        })
        setOpen(false)
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'subscriber'
        })
        setShowPassword(false)
        setShowConfirmPassword(false)
        onUserCreated()
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tạo người dùng",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <UserPlus className="w-4 h-4" />
          Thêm người dùng mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-lg">
              <UserPlus className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Tạo người dùng mới
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Email sẽ được sử dụng làm tên đăng nhập
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Thông tin đăng nhập */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Thông tin đăng nhập</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block text-gray-700">
                  Email (Tên đăng nhập) *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium mb-2 block text-gray-700">
                  Mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium mb-2 block text-gray-700">
                  Xác nhận mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200"
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Thông tin cá nhân</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium mb-2 block text-gray-700">
                  Tên
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200"
                  placeholder="Tên"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium mb-2 block text-gray-700">
                  Họ
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200"
                  placeholder="Họ"
                />
              </div>
            </div>
          </div>

          {/* Vai trò */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Phân quyền</h3>
            </div>
            
            <div>
              <Label htmlFor="role" className="text-sm font-medium mb-2 block text-gray-700">
                Vai trò người dùng
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg transition-all duration-200">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscriber">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Người đăng ký
                    </div>
                  </SelectItem>
                  <SelectItem value="contributor">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Cộng tác viên
                    </div>
                  </SelectItem>
                  <SelectItem value="author">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Tác giả
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Biên tập viên
                    </div>
                  </SelectItem>
                  <SelectItem value="administrator">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Quản trị viên
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Thông báo */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                <ul className="space-y-2 text-xs">
                  <li>• Email sẽ được sử dụng làm tên đăng nhập</li>
                  <li>• Mật khẩu phải có ít nhất 6 ký tự</li>
                  <li>• Vai trò sẽ quyết định quyền truy cập của người dùng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={isLoading}
            className="border-gray-300 hover:bg-gray-50 h-11 px-6 rounded-lg transition-all duration-200"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6 rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Tạo người dùng
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 