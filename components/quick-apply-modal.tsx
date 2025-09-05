'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Sparkles, Upload, FileText, CheckCircle, AlertCircle, User, Mail, Phone, Linkedin, Github, Briefcase, Calendar, Target, MessageSquare } from "lucide-react"

interface QuickApplyModalProps {
  isOpen: boolean
  onClose: () => void
}

interface RecruitmentPosition {
  id: string
  title: string
  position: string
  location: string
  salary: string
  type: string
  status: string
}

interface FormData {
  fullName: string
  email: string
  phone: string
  linkedinGithub: string
  position: string
  cvFile: File | null
  aiUseCase: string
  experience: string
  additionalRoles: string[]
  notes: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  position?: string
  cvFile?: string
}

const roleOptions = [
  { value: 'architecture', label: 'ARCHITECTURE' },
  { value: 'devops', label: 'DEVOPS' },
  { value: 'data', label: 'DATA' },
  { value: 'product', label: 'PRODUCT' },
  { value: 'mentoring', label: 'MENTORING' }
]

export default function QuickApplyModal({ isOpen, onClose }: QuickApplyModalProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    linkedinGithub: '',
    position: '',
    cvFile: null,
    aiUseCase: '',
    experience: '',
    additionalRoles: [],
    notes: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [availablePositions, setAvailablePositions] = useState<RecruitmentPosition[]>([])
  const [loadingPositions, setLoadingPositions] = useState(true)

  // Ngăn chặn tương tác với màn hình phía sau modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fetch available positions from API (only once when component mounts)
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('/api/recruitment')
        const data = await response.json()
        
        if (data.success && data.recruitments) {
          // Filter only active positions
          const activePositions = data.recruitments.filter((pos: RecruitmentPosition) => 
            pos.status === 'active'
          )
          setAvailablePositions(activePositions)
        }
      } catch (error) {
        console.error('Error fetching positions:', error)
        setAvailablePositions([])
      } finally {
        setLoadingPositions(false)
      }
    }

    // Only fetch once when component mounts, not every time modal opens
    fetchPositions()
  }, []) // Remove isOpen dependency

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên'
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email'
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại'
    if (!formData.position.trim()) newErrors.position = 'Vui lòng chọn vị trí ứng tuyển'
    if (!formData.cvFile) newErrors.cvFile = 'Vui lòng tải lên CV'
    
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
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, cvFile: 'Chỉ chấp nhận file PDF' }))
        return
      }
      if (file.size > 20 * 1024 * 1024) { // 20MB
        setErrors(prev => ({ ...prev, cvFile: 'File không được vượt quá 20MB' }))
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
      submitForm.append('linkedinGithub', formData.linkedinGithub)
      submitForm.append('position', formData.position)
      submitForm.append('aiUseCase', formData.aiUseCase)
      submitForm.append('experience', formData.experience)
      submitForm.append('additionalRoles', formData.additionalRoles.join(','))
      submitForm.append('notes', formData.notes)
      if (formData.cvFile) {
        submitForm.append('cvFile', formData.cvFile)
      }

      const res = await fetch('/api/recruitment-applicants', {
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

      setIsSuccess(true)
    } catch (err) {
      alert('Không thể gửi thông tin, vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        linkedinGithub: '',
        position: '',
        cvFile: null,
        aiUseCase: '',
        experience: '',
        additionalRoles: [],
        notes: ''
      })
      setErrors({})
      setIsSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div 
          className="absolute inset-0 bg-black/45 backdrop-blur-sm" 
          onClick={handleClose}
          style={{ pointerEvents: 'auto' }}
        />
        <div 
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Gửi thông tin thành công!</h3>
          <p className="text-gray-600 mb-6">Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
          <Button onClick={handleClose} className="w-full">
            Đóng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-sm" 
        onClick={handleClose}
        style={{ pointerEvents: 'auto' }}
      />
      
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"></div>
          <div className="relative flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Nộp CV nhanh</h2>
                <p className="text-white/90 text-base font-medium">Điền thông tin để ứng tuyển vào LTA</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose} 
              className="h-12 w-12 rounded-2xl hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Họ & Tên */}
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                HỌ & TÊN <span className="text-red-500 font-bold">*</span>
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
                className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium placeholder:text-gray-400 ${
                  errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                }`}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
              {errors.fullName && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Email & Phone - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  EMAIL <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }))
                    }
                  }}
                  className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium placeholder:text-gray-400 ${
                    errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  placeholder="you@domain.com"
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-red-500 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  SỐ ĐIỆN THOẠI <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, phone: e.target.value }))
                    if (errors.phone) {
                      setErrors(prev => ({ ...prev, phone: undefined }))
                    }
                  }}
                  className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium placeholder:text-gray-400 ${
                    errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  placeholder="+84..."
                />
                {errors.phone && (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* LinkedIn / GitHub */}
            <div className="space-y-3">
              <Label htmlFor="linkedinGithub" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-green-600" />
                LINKEDIN / GITHUB
              </Label>
              <Input
                id="linkedinGithub"
                type="url"
                value={formData.linkedinGithub}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinGithub: e.target.value }))}
                className="h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium placeholder:text-gray-400"
                placeholder="https://github.com/..."
              />
            </div>

            {/* Vị trí ứng tuyển */}
            <div className="space-y-3">
              <Label htmlFor="position" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                VỊ TRÍ ỨNG TUYỂN <span className="text-red-500 font-bold">*</span>
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, position: value }))
                  if (errors.position) {
                    setErrors(prev => ({ ...prev, position: undefined }))
                  }
                }}
                disabled={loadingPositions}
              >
                <SelectTrigger className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium ${
                  errors.position ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                }`}>
                  <SelectValue placeholder={loadingPositions ? "Đang tải..." : "Chọn vị trí ứng tuyển"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePositions.length > 0 ? (
                    availablePositions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.title}>
                        <div className="flex flex-col">
                          <span className="font-medium">{pos.title}</span>
                          <span className="text-xs text-gray-500">{pos.position} • {pos.location} • {pos.salary}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-positions" disabled>
                      Không có vị trí nào đang tuyển dụng
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.position && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  {errors.position}
                </div>
              )}
            </div>

            {/* CV Upload */}
            <div className="space-y-3">
              <Label htmlFor="cvFile" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                CV (PDF) <span className="text-red-500 font-bold">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="cvFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium ${
                    errors.cvFile ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Chấp nhận PDF, tối đa 20MB</p>
              {errors.cvFile && (
                <div className="flex items-center gap-2 text-red-500 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cvFile}
                </div>
              )}
            </div>

            {/* AI Use Case */}
            <div className="space-y-3">
              <Label htmlFor="aiUseCase" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                AI USE CASE NỔI BẬT
              </Label>
              <Textarea
                id="aiUseCase"
                value={formData.aiUseCase}
                onChange={(e) => setFormData(prev => ({ ...prev, aiUseCase: e.target.value }))}
                className="rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium placeholder:text-gray-400"
                placeholder="Mô tả ngắn gọn: Công cụ, vấn đề, giải pháp, tác động..."
                rows={3}
              />
              <p className="text-xs text-gray-500">Ví dụ: Dùng Cursor refactor service X, giảm thời gian build 40%.</p>
            </div>

            {/* Kinh nghiệm */}
            <div className="space-y-3">
              <Label htmlFor="experience" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                KINH NGHIỆM (NĂM)
              </Label>
              <Input
                id="experience"
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium placeholder:text-gray-400"
                placeholder="Ví dụ: 3-5 năm"
              />
            </div>

            {/* Vai trò quan tâm thêm */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                VAI TRÒ QUAN TÂM THÊM
              </Label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => (
                  <Badge
                    key={role.value}
                    variant={formData.additionalRoles.includes(role.value) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.additionalRoles.includes(role.value)
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "hover:bg-green-50 hover:border-green-300"
                    }`}
                    onClick={() => handleRoleToggle(role.value)}
                  >
                    {role.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                GHI CHÚ THÊM
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-150 text-base font-medium placeholder:text-gray-400"
                placeholder="Thông tin bổ sung khác..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-8 border-t-2 border-gray-100 mt-12">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="px-12 rounded-2xl h-14 text-base font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-150"
                  disabled={isSubmitting}
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-2xl h-14 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-150"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi thông tin"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
