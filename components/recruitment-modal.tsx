'use client'

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Sparkles, CheckCircle, Mail, MapPin, Calendar, Target } from "lucide-react"
import RecruitmentForm from "./recruitment-form"

interface RecruitmentModalProps {
  isOpen: boolean
  onClose: () => void
  position?: string
  details?: {
    title?: string
    level?: string
    type?: string
    location?: string
    salary?: string
    experience?: string
    description?: string
  }
  showInfoPanel?: boolean // Thêm prop để điều khiển hiển thị panel thông tin
}

const POSITION_DETAILS: Record<string, {
  title: string
  level: string
  type: string
  location: string
  salary: string
  highlights: string[]
}> = {
  frontend: {
    title: 'Frontend Developer',
    level: 'Mid–Senior',
    type: 'Full-time',
    location: 'Hà Nội / Hybrid',
    salary: 'Thỏa thuận theo năng lực',
    highlights: [
      'React/Next.js, TypeScript, Tailwind CSS',
      'Tối ưu hiệu năng, Lighthouse, Core Web Vitals',
      'Thiết kế component theo Design System',
      'UI/UX tinh gọn, Accessibility chuẩn WCAG'
    ]
  },
  backend: {
    title: 'Backend Developer',
    level: 'Mid–Senior',
    type: 'Full-time',
    location: 'Hà Nội / Hybrid',
    salary: 'Thỏa thuận theo năng lực',
    highlights: [
      'Node.js/TypeScript, NestJS/Express',
      'CSDL: PostgreSQL/MySQL, Redis, Message Queue',
      'Thiết kế API chuẩn REST/GraphQL, bảo mật',
      'CI/CD, Docker, Cloud (AWS/GCP)'
    ]
  },
  mobile: {
    title: 'Mobile Developer',
    level: 'Mid',
    type: 'Full-time',
    location: 'Hà Nội / Hybrid',
    salary: 'Thỏa thuận theo năng lực',
    highlights: [
      'React Native/Flutter',
      'Phát hành App Store/Google Play',
      'Tối ưu hiệu năng, bundle size',
      'Push notification, deep link, analytics'
    ]
  },
  analyst: {
    title: 'Business Analyst',
    level: 'Mid–Senior',
    type: 'Full-time',
    location: 'Hà Nội / Hybrid',
    salary: 'Thỏa thuận theo năng lực',
    highlights: [
      'Phân tích nghiệp vụ Logistics',
      'Viết BRD/SRS, user story, flow diagram',
      'Giao tiếp tốt với dev & khách hàng',
      'Kiểm thử chấp nhận, nghiệm thu'
    ]
  },
  'ai-ml': {
    title: 'AI/ML Engineer',
    level: 'Mid–Senior',
    type: 'Full-time',
    location: 'Hà Nội / Hybrid',
    salary: 'Thỏa thuận theo năng lực',
    highlights: [
      'LLM apps, RAG, Embeddings, Vector DB',
      'Fine-tuning/Prompt engineering',
      'Pipelines: data -> training -> serving',
      'Đo lường/giám sát chất lượng mô hình'
    ]
  },
  devops: {
    title: 'DevOps Engineer',
    level: 'Mid–Senior',
    type: 'Full-time',
    location: 'Hà Nội / Hybrid',
    salary: 'Thỏa thuận theo năng lực',
    highlights: [
      'Kubernetes/Docker, IaC (Terraform)',
      'Observability: Prometheus, Grafana',
      'CI/CD GitHub Actions/GitLab CI',
      'Bảo mật, backup/restore, HA/Scaling'
    ]
  }
}


export default function RecruitmentModal({ isOpen, onClose, position, details, showInfoPanel = true }: RecruitmentModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  const pos = position && POSITION_DETAILS[position] ? POSITION_DETAILS[position] : undefined
  const merged = {
    title: details?.title || pos?.title || 'Đăng ký ứng tuyển',
    level: details?.level || pos?.level || '',
    type: details?.type || pos?.type || '',
    location: details?.location || pos?.location || '',
    salary: details?.salary || pos?.salary || '',
    experience: details?.experience || '',
    description: details?.description || '',
    highlights: pos?.highlights || []
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[1200px] 2xl:max-w-[1400px] max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-300" style={{ boxShadow: '0 28px 56px -16px rgba(0, 0, 0, 0.25)' }}>
        {/* Header chung */}
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b border-white/20 shadow-sm">
          <div className="flex items-center justify-between px-5 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{merged.title}</h2>
                <p className="text-white/80 text-xs sm:text-sm truncate">Thông tin vị trí ứng tuyển</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl hover:bg-white/15">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content - có thể hiển thị 2 panel hoặc chỉ form */}
        <div className="flex-1 overflow-y-auto">
          {showInfoPanel ? (
            // Layout 2 panel (ứng tuyển ngay)
            <div className="flex flex-col lg:flex-row">
              {/* Panel trái */}
              <div className="w-full lg:w-[44%] bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-emerald-100">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  {/* Nội dung */}
                  <div className="px-5 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
                    {/* Thông tin vị trí */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        Thông tin vị trí ứng tuyển
                      </h3>
                      {merged ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoItem label="Cấp độ" value={merged.level} />
                            <InfoItem label="Hình thức" value={merged.type} />
                            <InfoItem label="Địa điểm" value={merged.location} />
                            <InfoItem label="Mức lương" value={merged.salary} />
                            <InfoItem label="Kinh nghiệm" value={merged.experience || 'Không yêu cầu'} />
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Điểm nổi bật</h4>
                            <ul className="space-y-2">
                              {(merged.highlights || []).map((h, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="mt-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-700 flex-shrink-0">
                                    <CheckCircle className="h-3 w-3" />
                                  </span>
                                  <span className="text-sm text-gray-700">{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Vui lòng chọn vị trí để xem chi tiết.</div>
                      )}
                    </div>

                    {/* Mô tả công việc */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-emerald-600" />
                        </div>
                        Mô tả công việc
                      </h3>
                      <div className="text-sm text-gray-700 leading-relaxed bg-white/70 rounded-xl border border-emerald-100 p-3">
                        {merged.description || 'Mô tả đang cập nhật.'}
                      </div>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <Mail className="h-4 w-4 text-emerald-600" />
                        </div>
                        Thông tin liên hệ
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-emerald-100">
                          <Mail className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">careers@lta.com.vn</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-emerald-100">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">Tiêu đề: [LTA][Vị trí][Họ Tên]</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-emerald-100">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">Địa chỉ: (Cập nhật)</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-emerald-100">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">Deadline: Rolling 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA dưới */}
                  <div className="px-5 sm:px-6 lg:px-8 pb-5 lg:pb-8">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 lg:p-6 text-white shadow-md">
                      <h4 className="text-lg font-bold mb-1.5">Xây logistics thông minh cùng AI</h4>
                      <p className="text-green-100 text-sm mb-4">Bạn sẵn sàng tạo tác động thật?</p>
                      <div className="flex gap-3">
                        <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl">Gửi hồ sơ</Button>
                        <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 rounded-xl">Xem quy trình</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel phải */}
              <div className="w-full lg:w-[56%] bg-white flex flex-col">
                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="max-w-3xl mx-auto rounded-2xl border border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm p-5 sm:p-6 lg:p-8">
                    <RecruitmentForm onSuccess={onClose} initialPosition={position} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Layout chỉ form (nộp CV nhanh)
            <div className="w-full bg-white flex flex-col">
              <div className="p-5 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto rounded-2xl border border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm p-5 sm:p-6 lg:p-8">
                  <RecruitmentForm onSuccess={onClose} initialPosition={position} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="rounded-xl bg-white/70 border border-emerald-100 px-3 py-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  )
}


