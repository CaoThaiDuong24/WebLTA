'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Shield, Lock, Users, Database, Settings, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  captcha: z.string().min(1, 'Kết quả phép toán là bắt buộc'),
})

type LoginForm = z.infer<typeof loginSchema>

// Hàm tạo captcha phép toán
const generateCaptcha = () => {
  const operators = ['+', '×']
  const operator = operators[Math.floor(Math.random() * operators.length)]
  
  let result
  let question
  let num1, num2
  
  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * 10) + 1 // 1-10
      num2 = Math.floor(Math.random() * 10) + 1 // 1-10
      result = num1 + num2
      question = `${num1} + ${num2}`
      break
    case '×':
      num1 = Math.floor(Math.random() * 9) + 1 // 1-9 (tránh số quá lớn)
      num2 = Math.floor(Math.random() * 9) + 1 // 1-9
      result = num1 * num2
      question = `${num1} × ${num2}`
      break
    default:
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      result = num1 + num2
      question = `${num1} + ${num2}`
  }
  
  return { question, result: result.toString() }
}

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [captcha, setCaptcha] = useState({ question: '', result: '' })
  const router = useRouter()

  // Tạo captcha mới khi component mount
  useEffect(() => {
    setCaptcha(generateCaptcha())
  }, [])

  // Hàm tạo captcha mới
  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha())
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    // Kiểm tra captcha
    if (data.captcha !== captcha.result) {
      setError('Kết quả phép toán không đúng, vui lòng thử lại')
      setIsLoading(false)
      refreshCaptcha()
      return
    }

    try {
      // Lấy callbackUrl nếu có
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') || '/admin'

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng')
        refreshCaptcha()
      } else {
        setSuccess(true)
        // Redirect after showing success message
        setTimeout(() => {
          router.push(callbackUrl)
        }, 800)
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại')
      refreshCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Left Section - Green Background */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-2xl animate-pulse animation-delay-4000"></div>
            
            {/* Additional decorative elements */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/2 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-white/4 rounded-full blur-lg animate-pulse animation-delay-3000"></div>
          </div>
          
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Floating icons */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 text-white/10 animate-bounce">
              <Shield className="w-8 h-8 drop-shadow-lg" />
            </div>
            <div className="absolute top-40 right-32 text-white/10 animate-bounce animation-delay-1000">
              <Lock className="w-6 h-6 drop-shadow-lg" />
            </div>
            <div className="absolute bottom-40 left-32 text-white/10 animate-bounce animation-delay-2000">
              <Users className="w-7 h-7 drop-shadow-lg" />
            </div>
            <div className="absolute bottom-20 right-20 text-white/10 animate-bounce animation-delay-3000">
              <Database className="w-6 h-6 drop-shadow-lg" />
            </div>
            <div className="absolute top-1/3 right-16 text-white/10 animate-bounce animation-delay-1500">
              <Settings className="w-5 h-5 drop-shadow-lg" />
            </div>
            
            {/* Additional floating elements */}
            <div className="absolute top-1/2 left-10 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 right-10 w-3 h-3 bg-white/15 rounded-full animate-ping animation-delay-1000"></div>
            <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-white/30 rounded-full animate-ping animation-delay-2000"></div>
          </div>
          
          {/* Curved white shape with enhanced shadow */}
          <div className="absolute top-0 right-0 w-96 h-full bg-white transform translate-x-1/2 rounded-l-full shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10 rounded-l-full"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-16 text-white">
            {/* Logo Section - Top */}
            <div className="flex justify-center pt-8">
              <div className="animate-float relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-150 animate-pulse"></div>
                <Image
                  src="/logo.png"
                  alt="LTA Logo"
                  width={360}
                  height={360}
                  className="object-contain drop-shadow-2xl relative z-10"
                />
              </div>
            </div>

            {/* Welcome Message - Center */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="animate-fade-in-up relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative z-10">
                  <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent leading-tight drop-shadow-lg">
                    Chào mừng<br />
                    <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">trở lại!</span>
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-white/50 to-transparent mx-auto mb-8 rounded-full"></div>
                  <p className="text-xl leading-relaxed text-white/90 max-w-lg animate-fade-in-up animation-delay-500 drop-shadow-md">
                    Để kết nối với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced bottom section */}
            <div className="flex items-center justify-center space-x-6 text-white/40">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Hệ thống bảo mật</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse animation-delay-1000"></div>
                <span className="text-sm font-medium">Quản lý thông minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - White Background */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 relative">
          {/* Success Message - Top Right */}
          {success && (
            <div className="absolute top-8 right-8 z-50 animate-fade-in-up">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-800">
                      Đăng nhập thành công!
                    </h4>
                    <p className="text-xs text-green-700">
                      Đang chuyển hướng đến trang quản lý...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message - Top Right */}
          {error && (
            <div className="absolute top-8 right-8 z-50 animate-fade-in-up">
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">
                      Đăng nhập thất bại
                    </h4>
                    <p className="text-xs text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full max-w-md">
            {/* Welcome Heading */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Chào mừng</h2>
              <p className="text-gray-600 text-lg">
                Đăng nhập vào tài khoản để tiếp tục
              </p>
            </div>

            {/* Login Form */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">@</span>
                      </div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                    </div>
                    <Input
                      type="email"
                      placeholder="Nhập email của bạn..."
                      className="h-14 px-4 text-lg border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl placeholder:text-gray-400 transition-all duration-200"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        <span>{errors.email.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <Lock className="w-3 h-3 text-green-600" />
                      </div>
                      <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu của bạn..."
                        className="h-14 px-4 pr-12 text-lg border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl placeholder:text-gray-400 transition-all duration-200"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        <span>{errors.password.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Captcha Input */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <label className="text-sm font-medium text-gray-700">Xác thực</label>
                    </div>
                    
                    {/* Captcha Layout */}
                    <div className="flex items-center space-x-3">
                      {/* Input Field - Left */}
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          placeholder="Nhập kết quả"
                          className="h-12 pl-10 pr-3 text-base border border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl placeholder:text-gray-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                          {...register('captcha')}
                          maxLength={3}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Math Problem - Center */}
                      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-3 text-center min-w-[80px] shadow-sm">
                        <div className="text-xl font-bold text-gray-800 select-none">
                          {captcha.question.split('').map((char, index) => (
                            <span
                              key={index}
                              className="inline-block"
                              style={{
                                color: char === '×' ? '#059669' : char === '+' ? '#3b82f6' : '#1f2937',
                                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Refresh Button - Right */}
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="w-12 h-12 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105"
                        title="Làm mới"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {errors.captcha && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        <span>{errors.captcha.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Đăng nhập thành công!
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        ĐĂNG NHẬP
                      </>
                    )}
                  </Button>
                </form>

                {/* Security notice */}
                <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-800 mb-1">
                        Bảo mật cao cấp
                      </h4>
                      <p className="text-xs text-green-700">
                        Hệ thống được bảo vệ bằng công nghệ mã hóa tiên tiến và xác thực captcha
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 