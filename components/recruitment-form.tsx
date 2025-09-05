'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Linkedin, Github, Brain, Calendar, Target, MessageSquare } from "lucide-react"

interface FormData {
  fullName: string
  email: string
  phone: string
  position: string
  linkedinGithub: string
  aiUseCase: string
  experience: string
  additionalRoles: string[]
  notes: string
  cvFile: File | null
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  position?: string
  linkedinGithub?: string
  aiUseCase?: string
  experience?: string
  additionalRoles?: string
  notes?: string
  cvFile?: string
}

interface RecruitmentFormProps {
  onSuccess?: () => void
  initialPosition?: string
}


export default function RecruitmentForm({ onSuccess, initialPosition }: RecruitmentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    position: initialPosition || '',
    linkedinGithub: '',
    aiUseCase: '',
    experience: '',
    additionalRoles: [],
    notes: '',
    cvFile: null
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const roleOptions = [
    { value: 'architecture', label: 'ARCHITECTURE' },
    { value: 'devops', label: 'DEVOPS' },
    { value: 'data', label: 'DATA' },
    { value: 'product', label: 'PRODUCT' },
    { value: 'mentoring', label: 'MENTORING' }
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên'
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email'
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại'
    // position no longer required on UI; keep hidden default
    
    // Only update errors if they changed to prevent unnecessary re-renders
    const hasErrorsChanged = JSON.stringify(newErrors) !== JSON.stringify(errors)
    if (hasErrorsChanged) {
      setErrors(newErrors)
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size immediately
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, cvFile: 'Chỉ chấp nhận file PDF' }))
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cvFile: 'Dung lượng tối đa 20MB' }))
        return
      }
      
      setFormData(prev => ({ ...prev, cvFile: file }))
      if (errors.cvFile) {
        setErrors(prev => ({ ...prev, cvFile: undefined }))
      }
    }
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      additionalRoles: prev.additionalRoles.includes(role)
        ? prev.additionalRoles.filter(r => r !== role)
        : [...prev.additionalRoles, role]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const submitForm = new FormData()
      submitForm.append('fullName', formData.fullName)
      submitForm.append('email', formData.email)
      submitForm.append('phone', formData.phone)
      submitForm.append('position', formData.position)
      submitForm.append('linkedinGithub', formData.linkedinGithub)
      submitForm.append('aiUseCase', formData.aiUseCase)
      submitForm.append('experience', formData.experience)
      submitForm.append('additionalRoles', formData.additionalRoles.join(','))
      submitForm.append('notes', formData.notes)
      if (formData.cvFile) {
        submitForm.append('cvFile', formData.cvFile)
      }

      const res = await fetch('/api/recruitment-simple', {
        method: 'POST',
        body: submitForm
      })

      if (!res.ok) {
        throw new Error('Gửi thông tin thất bại')
      }

      const json = await res.json().catch(() => ({ success: false }))
      if (!json?.success) {
        throw new Error('Gửi thông tin thất bại')
      }

      console.log('✅ Form submitted successfully:', json)
      setIsSuccess(true)
    } catch (err) {
      // basic fallback alert; public form has no toast
      alert('Không thể gửi thông tin, vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return <InterviewScheduling onClose={onSuccess} />
  }

  // Derive human-readable recruitment title if initialPosition is provided
  const initialTitle = initialPosition || ''

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium mb-3 lg:mb-4 shadow-sm">
          <Sparkles className="h-4 w-4" />
          Form nhanh
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Đăng ký ứng tuyển</h2>
        <p className="text-gray-600 text-sm">
          Điền thông tin cơ bản. Chúng tôi sẽ liên hệ hướng dẫn gửi hồ sơ chi tiết.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Họ & Tên */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            HỌ & TÊN <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, fullName: e.target.value }))
              // Clear error immediately when user starts typing
              if (errors.fullName) {
                setErrors(prev => ({ ...prev, fullName: undefined }))
              }
            }}
            className={`rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150 ${
              errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
            }`}
            placeholder="Ví dụ: Nguyễn Văn A"
          />
          {errors.fullName && (
            <div className="flex items-center gap-2 text-red-500 text-xs animate-in fade-in-0 slide-in-from-top-1">
              <AlertCircle className="h-3 w-3" />
              {errors.fullName}
            </div>
          )}
        </div>

        {/* Email & Phone - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              EMAIL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }))
                // Clear error immediately when user starts typing
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }))
                }
              }}
              className={`rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150 ${
                errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
              }`}
              placeholder="you@domain.com"
            />
            {errors.email && (
              <div className="flex items-center gap-2 text-red-500 text-xs animate-in fade-in-0 slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              SỐ ĐIỆN THOẠI <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }))
                // Clear error immediately when user starts typing
                if (errors.phone) {
                  setErrors(prev => ({ ...prev, phone: undefined }))
                }
              }}
              className={`rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150 ${
                errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
              }`}
              placeholder="+84..."
            />
            {errors.phone && (
              <div className="flex items-center gap-2 text-red-500 text-xs animate-in fade-in-0 slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phone}
              </div>
            )}
          </div>
        </div>

        {/* Hidden position field to keep backend contract */}
        <input type="hidden" name="position" value={formData.position} />
        {/* Hidden recruitment title for better display in admin */}
        <input type="hidden" name="recruitmentTitle" value={initialTitle} />

        {/* LinkedIn / GitHub */}
        <div className="space-y-2">
          <Label htmlFor="linkedinGithub" className="text-sm font-medium text-gray-700">
            LINKEDIN / GITHUB
          </Label>
          <Input
            id="linkedinGithub"
            type="url"
            value={formData.linkedinGithub}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, linkedinGithub: e.target.value }))
            }}
            className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150"
            placeholder="https://github.com/..."
          />
        </div>

        {/* CV (PDF) */}
        <div className="space-y-2">
          <Label htmlFor="cvFile" className="text-sm font-medium text-gray-700">
            CV (PDF)
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="cvFile"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150"
            />
            {formData.cvFile && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="truncate max-w-[200px]">{formData.cvFile.name}</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cvFile: null }))}
                  className="text-gray-500 hover:text-red-600 text-xs"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
          {errors.cvFile && (
            <div className="flex items-center gap-2 text-red-500 text-xs animate-in fade-in-0 slide-in-from-top-1">
              <AlertCircle className="h-3 w-3" />
              {errors.cvFile}
            </div>
          )}
          <p className="text-xs text-gray-500">Chấp nhận PDF, tối đa 20MB.</p>
        </div>

        {/* AI Use Case */}
        <div className="space-y-2">
          <Label htmlFor="aiUseCase" className="text-sm font-medium text-gray-700">
            AI USE CASE NỔI BẬT
          </Label>
          <Textarea
            id="aiUseCase"
            value={formData.aiUseCase}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, aiUseCase: e.target.value }))
            }}
            placeholder="Mô tả ngắn gọn: Công cụ, vấn đề, giải pháp, tác động..."
            className="min-h-[80px] rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150"
          />
          <p className="text-xs text-gray-500">
            Ví dụ: Dùng Cursor refactor service X, giảm thời gian build 40%.
          </p>
        </div>

        {/* Kinh nghiệm */}
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
            KINH NGHIỆM (NĂM)
          </Label>
          <Input
            id="experience"
            type="text"
            value={formData.experience}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, experience: e.target.value }))
            }}
            className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150"
            placeholder="Số năm"
          />
        </div>

        {/* Vai trò quan tâm thêm */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            VAI TRÒ QUAN TÂM THÊM
          </Label>
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => (
              <Badge
                key={role.value}
                variant={formData.additionalRoles.includes(role.value) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-150 ${
                  formData.additionalRoles.includes(role.value)
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "border-gray-300 text-gray-700 hover:bg-green-50"
                }`}
                onClick={() => handleRoleToggle(role.value)}
              >
                {role.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ghi chú thêm */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
            GHI CHÚ THÊM
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, notes: e.target.value }))
            }}
            placeholder="Kỳ vọng, thời gian có thể bắt đầu, câu hỏi..."
            className="min-h-[80px] rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang gửi...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Gửi thông tin
            </div>
          )}
        </Button>
      </form>
    </div>
  )
}

interface InterviewSchedulingProps {
  onClose?: () => void
}

function InterviewScheduling({ onClose }: InterviewSchedulingProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const handleStartInterview = () => {
    // Placeholder for interview link
    window.open('https://meet.google.com/abc-defg-hij', '_blank')
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      {/* Success Message */}
      <div className="mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-500">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-in fade-in-0 slide-in-from-top-2 duration-500">
          Ứng tuyển thành công!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-200">
          Chúng tôi sẽ liên hệ trong thời gian sớm nhất.
        </p>
      </div>

      {/* Interview Scheduling */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Phỏng vấn Online</h2>
        <p className="text-lg text-gray-600 mb-8">
          Vui lòng chọn thời gian phù hợp để tham gia phỏng vấn
        </p>
        
        <div className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Chọn ngày phỏng vấn
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-center text-lg py-3 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Chọn giờ phỏng vấn
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="text-center text-lg py-3 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-150">
                <SelectValue placeholder="Chọn giờ phỏng vấn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">09:00 - 10:00</SelectItem>
                <SelectItem value="10:00">10:00 - 11:00</SelectItem>
                <SelectItem value="14:00">14:00 - 15:00</SelectItem>
                <SelectItem value="15:00">15:00 - 16:00</SelectItem>
                <SelectItem value="16:00">16:00 - 17:00</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Interview Button */}
          <Button
            onClick={handleStartInterview}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            Bắt đầu phỏng vấn ngay
          </Button>

          <div className="text-sm text-gray-500">
            * Link phỏng vấn sẽ được gửi qua email sau khi xác nhận
          </div>
        </div>
      </div>
    </div>
  )
}
