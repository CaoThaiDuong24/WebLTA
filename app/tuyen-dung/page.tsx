'use client'

import { useRef, useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useInView } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"
import RecruitmentModal from "@/components/recruitment-modal"
import QuickApplyModal from "@/components/quick-apply-modal"
import { 
  Building2, 
  Users, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  GraduationCap,
  Heart,
  User,
  Zap,
  Target,
  Globe,
  Award,
  Mail,
  Phone,
  Calendar,
  Send,
  ArrowRight,
  Star,
  CheckCircle,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Layers,
  Bookmark,
  Share2,
  Link as LinkIcon,
  Brain,
  Home,
  Newspaper,
  FileText,
  MessageCircle,
  Play,
  ArrowUpRight,
  Shield,
  TrendingUp,
  Lightbulb
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// New footer component for recruitment page
function RecruitmentFooter() {
  const { t } = useTranslation()
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <footer className="relative bg-gradient-to-br from-slate-800 via-emerald-900 to-teal-700 text-white overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/8 to-cyan-600/10 animate-pulse"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-500/6 to-teal-500/6 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-teal-500/6 to-cyan-500/6 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-emerald-500/6 to-cyan-500/6 rounded-full blur-xl animate-spin"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
      </div>

      <div className="relative z-10">
        {/* Hero section of footer */}
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent font-semibold">
                Kết nối với LTA
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                Tương lai
              </span>
              <span className="text-white"> của </span>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Logistics
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Tham gia cùng chúng tôi xây dựng nền tảng công nghệ logistics thông minh, 
              mang đến trải nghiệm tuyệt vời cho khách hàng và đối tác.
            </p>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Company Info - Premium Card */}
            <div className="lg:col-span-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-cyan-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <Image 
                        src="/logo.png" 
                        alt="LTA Logo" 
                        width={140} 
                        height={56} 
                        className="h-14 w-auto drop-shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                    Chúng tôi là công ty tiên phong trong lĩnh vực ứng dụng công nghệ logistics thông minh, 
                    mang đến giải pháp tối ưu cho chuỗi cung ứng hiện đại với công nghệ AI và IoT tiên tiến.
                  </p>
                  
                  {/* Premium social media buttons */}
                  <div className="flex space-x-4">
                    {[
                      { icon: "twitter", href: "https://twitter.com/ltacompany", color: "from-teal-500 to-emerald-600" },
                      { icon: "facebook", href: "https://www.facebook.com/logisticstechnologyapplication/?locale=vi_VN", color: "from-emerald-500 to-teal-600" },
                      { icon: "linkedin", href: "https://linkedin.com/company/ltacompany", color: "from-teal-400 to-emerald-600" },
                      { icon: "youtube", href: "https://youtube.com/@ltacompany", color: "from-red-400 to-red-600" }
                    ].map((social, index) => (
                      <a 
                        key={index}
                        href={social.href} 
                        className={`group relative w-12 h-12 bg-gradient-to-br ${social.color} rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg className="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                          {social.icon === "twitter" && (
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                          )}
                          {social.icon === "facebook" && (
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          )}
                          {social.icon === "linkedin" && (
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          )}
                          {social.icon === "youtube" && (
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          )}
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links - Premium Cards */}
            <div className="lg:col-span-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-cyan-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
                  <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                    Liên kết nhanh
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { href: "#positions", label: "Vị trí tuyển dụng", icon: Briefcase },
                      { href: "/", label: "Trang chủ", icon: Home },
                      { href: "/tin-tuc", label: "Tin tức", icon: Newspaper },
                      { href: "/chinh-sach-faq", label: "Chính sách & FAQ", icon: FileText }
                    ].map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link.href}
                          onClick={link.href === "#positions" ? (e) => {
                            e.preventDefault()
                            scrollToSection("positions")
                          } : undefined}
                          className="group flex items-center p-3 rounded-2xl hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            <link.icon className="w-5 h-5 text-emerald-300" />
                          </div>
                          <span className="text-gray-300 group-hover:text-white transition-colors duration-300 font-medium">
                            {link.label}
                          </span>
                          <ArrowRight className="w-4 h-4 ml-auto text-gray-500 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all duration-300" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Info - Premium Card */}
            <div className="lg:col-span-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-cyan-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
                  <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                    Liên hệ
                  </h3>
                  <div className="space-y-6">
                    {[
                      { icon: Building2, label: "Địa chỉ", content: ["2A Đường Số 5, An Khánh", "TP. Hồ Chí Minh"], color: "from-emerald-500/20 to-teal-500/20" },
                      { icon: Mail, label: "Email", content: ["hr@ltacv.com"], color: "from-emerald-500/20 to-teal-500/20", href: "mailto:hr@ltacv.com" },
                      { icon: Phone, label: "Điện thoại", content: ["0886 116 668"], color: "from-teal-500/20 to-cyan-500/20", href: "tel:0886116668" }
                    ].map((contact, index) => (
                      <div key={index} className="group">
                        <div className="flex items-start p-4 rounded-2xl hover:bg-white/10 transition-all duration-300">
                          <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                            <contact.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-400 mb-1">{contact.label}</div>
                            {contact.href ? (
                              <a 
                                href={contact.href}
                                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                              >
                                {contact.content[0]}
                              </a>
                            ) : (
                              contact.content.map((line, i) => (
                                <div key={i} className="text-gray-300 font-medium">{line}</div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Newsletter Section */}
        <div className="border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="mb-8 lg:mb-0 lg:mr-8">
                    <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                      Đăng ký nhận thông tin
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Nhận thông báo về vị trí tuyển dụng mới và tin tức công ty qua email
                    </p>
                  </div>
                  <div className="flex w-full lg:w-auto max-w-md">
                    <div className="relative flex-1">
                      <Input 
                        type="email" 
                        placeholder="Email của bạn" 
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400 h-14 text-lg rounded-2xl pr-20"
                      />
                      <Button className="absolute right-2 top-2 h-10 w-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl">
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Bottom Bar */}
        <div className="border-t border-white/10 bg-gradient-to-r from-emerald-900/60 to-teal-900/40 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent font-semibold">LTA</span> - Logistics Technology Application. Tất cả quyền được bảo lưu.
              </div>
              <div className="flex space-x-8 text-sm">
                {["Chính sách bảo mật", "Điều khoản sử dụng", "Sitemap"].map((link, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-105 transform"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function RecruitmentPage() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { t } = useTranslation()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string | undefined>(undefined)
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({})
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({})
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailJobId, setDetailJobId] = useState<string | undefined>(undefined)

  // Quick apply form state
  const [quickName, setQuickName] = useState<string>('')
  const [quickEmail, setQuickEmail] = useState<string>('')
  const [quickPosition, setQuickPosition] = useState<string>('')
  const [quickPhone, setQuickPhone] = useState<string>('')
  const [quickBirthYear, setQuickBirthYear] = useState<string>('')
  const [quickPortfolio, setQuickPortfolio] = useState<string>('')
  const [quickAiUseCase, setQuickAiUseCase] = useState<string>('')
  const [quickExperience, setQuickExperience] = useState<string>('')
  const [quickNotes, setQuickNotes] = useState<string>('')
  const [quickCvFile, setQuickCvFile] = useState<File | null>(null)
  const [isQuickSubmitting, setIsQuickSubmitting] = useState<boolean>(false)
  const [quickFormMessage, setQuickFormMessage] = useState<{type: 'success' | 'error' | 'loading', text: string} | null>(null)
  const cvInputRef = useRef<HTMLInputElement | null>(null)

  // Admin recruitment data
  interface RecruitmentItem {
    id: string
    title: string
    position: string
    location: string
    salary: string
    type: 'full-time' | 'part-time' | 'contract' | 'internship' | string
    status: 'active' | 'inactive' | 'draft' | string
    description: string
    requirements: string[]
    benefits?: string[]
    createdAt?: string
    updatedAt?: string
    deadline?: string | null
    experience?: string
    education?: string
  }

  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([])
  const [loadingRecruitments, setLoadingRecruitments] = useState<boolean>(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingRecruitments(true)
        const res = await fetch('/api/recruitment')
        if (!res.ok) throw new Error('Failed to load recruitments')
        const data = await res.json()
        const items: RecruitmentItem[] = Array.isArray(data?.recruitments) ? data.recruitments : []
        setRecruitments(items)
      } catch {
        toast({ title: '❌ Lỗi', description: 'Không thể tải danh sách tuyển dụng', variant: 'destructive' as any })
      } finally {
        setLoadingRecruitments(false)
      }
    }
    load()
  }, [toast])

  const getAccentByType = (type: string) => {
    const t = (type || '').toLowerCase()
    if (t.includes('full')) return { bar: 'from-green-500 to-green-600', badge: 'bg-green-100 text-green-800', button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' }
    if (t.includes('part')) return { bar: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 text-purple-800', button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' }
    if (t.includes('intern')) return { bar: 'from-teal-500 to-teal-600', badge: 'bg-teal-100 text-teal-800', button: 'from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800' }
    if (t.includes('contract')) return { bar: 'from-orange-500 to-orange-600', badge: 'bg-orange-100 text-orange-800', button: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' }
    return { bar: 'from-blue-500 to-blue-600', badge: 'bg-blue-100 text-blue-800', button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' }
  }

  // Map admin recruitments to UI positions
  const positions = useMemo(() => {
    const active = recruitments.filter(r => (r.status || '').toLowerCase() === 'active' || (r.status || '').toLowerCase() === 'published' || (r.status || '').toLowerCase() === 'publish' || (r.status || '').toLowerCase() === 'draft')
    return active.map(r => ({
      id: r.id,
      title: r.title || r.position || 'Vị trí tuyển dụng',
      position: r.position || r.title || 'Vị trí tuyển dụng',
      description: r.description || '',
      experience: r.experience || '',
      level: r.education || r.experience || '',
      type: (r.type || 'full-time').replace(/\b(\w)/g, (m) => m.toUpperCase()),
      location: r.location || 'Đang cập nhật',
      salary: r.salary || 'Thoả thuận',
      requirements: Array.isArray(r.requirements) && r.requirements.length ? r.requirements : [],
      benefits: Array.isArray(r.benefits) ? r.benefits : [],
      deadline: r.deadline || null,
      createdAt: r.createdAt || undefined,
      updatedAt: r.updatedAt || undefined,
      accent: getAccentByType(r.type || 'full-time')
    }))
  }, [recruitments])

  // Filters state
  const [keyword, setKeyword] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [filtersOpen, setFiltersOpen] = useState<boolean>(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(4)

  const filteredPositions = positions.filter(p => {
    const matchesKeyword = keyword.trim().length === 0
      || p.title.toLowerCase().includes(keyword.toLowerCase())
      || p.description.toLowerCase().includes(keyword.toLowerCase())
      || p.requirements.some(r => r.toLowerCase().includes(keyword.toLowerCase()))
    const matchesPosition = !positionFilter || p.id === positionFilter
    const matchesLevel = !levelFilter || p.level === levelFilter
    const matchesType = !typeFilter || p.type === typeFilter
    return matchesKeyword && matchesPosition && matchesLevel && matchesType
  })

  // Deduplicate by composite key and sort newest first
  let uniquePositions = Array.from(
    new Map(
      filteredPositions.map(p => [
        `${p.title}|${p.level}|${p.type}|${p.location}`,
        p
      ])
    ).values()
  )
  uniquePositions = uniquePositions.sort((a, b) => {
    const ta = Date.parse(a.createdAt || a.updatedAt || '') || 0
    const tb = Date.parse(b.createdAt || b.updatedAt || '') || 0
    return tb - ta
  })

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [keyword, positionFilter, levelFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(uniquePositions.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPositions = uniquePositions.slice(startIndex, startIndex + itemsPerPage)

  const clearAllFilters = () => {
    setKeyword('')
    setPositionFilter('')
    setLevelFilter('')
    setTypeFilter('')
  }

  const activeFilterChips: Array<{label: string, onClear: () => void}> = []
  if (positionFilter) activeFilterChips.push({ label: positions.find(p => p.id === positionFilter)?.title || positionFilter, onClear: () => setPositionFilter('') })
  if (levelFilter) activeFilterChips.push({ label: levelFilter, onClear: () => setLevelFilter('') })
  if (typeFilter) activeFilterChips.push({ label: typeFilter, onClear: () => setTypeFilter('') })
  if (keyword.trim()) activeFilterChips.push({ label: `Từ khóa: "${keyword}"`, onClear: () => setKeyword('') })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleApplyNow = (position?: string) => {
    setSelectedPosition(position)
    setShowApplyModal(true)
  }

  const handleQuickApply = () => {
    setSelectedPosition(undefined)
    setShowForm(true)
  }

  const handleCloseModal = () => {
    setShowForm(false)
    setSelectedPosition(undefined)
  }

  const handleCloseApplyModal = () => {
    setShowApplyModal(false)
    setSelectedPosition(undefined)
  }

  const getJobAnchor = (id: string) => `job-${id}`

  const getJobLink = (id: string) => {
    if (typeof window === 'undefined') return `#${getJobAnchor(id)}`
    const url = new URL(window.location.href)
    url.hash = getJobAnchor(id)
    return url.toString()
  }

  const handleCopyLink = (id: string) => {
    const link = getJobLink(id)
    navigator.clipboard?.writeText(link)
    toast({ title: 'Đã sao chép liên kết', description: 'Bạn có thể dán để chia sẻ vị trí này.' })
  }

  const handleShare = async (id: string, title: string) => {
    const link = getJobLink(id)
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({ title, text: title, url: link })
      } else {
        await navigator.clipboard?.writeText(link)
        toast({ title: 'Đã sao chép để chia sẻ', description: 'Thiết bị không hỗ trợ chia sẻ trực tiếp.' })
      }
    } catch {
      toast({ title: 'Không thể chia sẻ', description: 'Vui lòng thử lại sau.', variant: 'destructive' as any })
    }
  }

  // Quick apply handlers
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast({ title: 'Chỉ chấp nhận PDF', description: 'Vui lòng tải lên tệp .pdf', variant: 'destructive' as any })
      e.currentTarget.value = ''
      return
    }
    setQuickCvFile(file)
  }

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quickName.trim() || !quickEmail.trim() || !quickPhone.trim() || !quickPosition || !quickCvFile) {
      setQuickFormMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các trường bắt buộc.' })
      return
    }

    setIsQuickSubmitting(true)
    setQuickFormMessage({ type: 'loading', text: 'Đang gửi thông tin... Vui lòng chờ trong giây lát.' })

    try {
      const formData = new FormData()
      formData.append('fullName', quickName.trim())
      formData.append('email', quickEmail.trim())
      formData.append('phone', quickPhone.trim())
      formData.append('position', quickPosition)
      formData.append('linkedinGithub', quickPortfolio || '')
      formData.append('aiUseCase', quickAiUseCase || '')
      formData.append('experience', quickExperience || '')
      formData.append('additionalRoles', '')
      formData.append('notes', quickNotes || '')
      formData.append('cvFile', quickCvFile)

      const response = await fetch('/api/recruitment-applicants', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Gửi thông tin thất bại')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Gửi thông tin thất bại')
      }

      setQuickFormMessage({ type: 'success', text: 'Đã gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.' })
      
      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setQuickFormMessage(null)
      }, 5000)
      
      // Reset form
      setQuickName('')
      setQuickEmail('')
      setQuickPhone('')
      setQuickPosition('')
      setQuickBirthYear('')
      setQuickPortfolio('')
      setQuickAiUseCase('')
      setQuickExperience('')
      setQuickNotes('')
      setQuickCvFile(null)
      if (cvInputRef.current) cvInputRef.current.value = ''
      
    } catch (error) {
      console.error('Quick apply error:', error)
      setQuickFormMessage({ type: 'error', text: 'Gửi thông tin thất bại. Vui lòng thử lại sau hoặc liên hệ trực tiếp.' })
    } finally {
      setIsQuickSubmitting(false)
    }
  }

  const toggleSaveJob = (id: string, title: string) => {
    setSavedJobs(prev => {
      const next = { ...prev, [id]: !prev[id] }
      toast({ title: next[id] ? 'Đã lưu vị trí' : 'Đã bỏ lưu', description: title })
      return next
    })
  }

  const openDetail = (id: string) => {
    setDetailJobId(id)
    setDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-25 to-teal-25">
      {/* Enhanced Hero Section */}
      <section
        ref={ref}
        className="relative bg-gradient-to-br from-slate-800 via-emerald-900 to-teal-700 text-white py-32 overflow-hidden"
        style={{
          transform: isInView ? "none" : "translateY(20px)",
          opacity: isInView ? 1 : 0,
          transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
        }}
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/8 to-cyan-500/10 animate-pulse"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/8 to-teal-400/8 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-teal-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-emerald-400/8 to-cyan-400/8 rounded-full blur-xl animate-spin"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent font-semibold">
                Cơ hội nghề nghiệp tại LTA
              </span>
            </div>

            {/* Enhanced Logo */}
            <div className="flex justify-center mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 group-hover:bg-white/15 transition-all duration-500">
                  <Image 
                    src="/logo.png" 
                    alt="LTA Logo" 
                    width={280} 
                    height={112} 
                    className="h-24 w-auto drop-shadow-2xl"
                  />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="h-4 w-4 text-yellow-900" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Title */}
            <h1 className="text-6xl md:text-8xl font-bold mb-10">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                Tuyển Dụng
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-2xl md:text-3xl mb-12 text-emerald-100 max-w-5xl mx-auto leading-relaxed font-light">
              Tham gia cùng chúng tôi xây dựng 
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent font-semibold"> tương lai của ngành Logistics 4.0</span>
            </p>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-emerald-300" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-emerald-200 text-sm">Thành viên tài năng</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-emerald-300" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{recruitments.length}</div>
                <div className="text-emerald-200 text-sm">Vị trí đang tuyển</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-teal-300" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-emerald-200 text-sm">Tăng trưởng mỗi năm</div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-6">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-white to-emerald-50 text-teal-900 hover:from-emerald-50 hover:to-white px-10 py-4 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl overflow-hidden"
                onClick={() => scrollToSection("positions")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Briefcase className="mr-4 h-7 w-7" />
                  Xem vị trí tuyển dụng
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="group relative bg-transparent border-2 border-white/30 text-white hover:bg-white hover:text-teal-900 px-10 py-4 text-xl font-semibold backdrop-blur-sm transition-all duration-300 rounded-2xl overflow-hidden"
                onClick={() => scrollToSection("contact")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Mail className="mr-4 h-7 w-7" />
                  Liên hệ ứng tuyển
                  <ArrowUpRight className="ml-3 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </div>
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-16 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
              </div>
              <p className="text-white/60 text-sm mt-2">Cuộn xuống để khám phá</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why LTA Section */}
      <section id="why-lta" className="py-24 bg-gradient-to-br from-white via-emerald-25 to-teal-25 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-teal-100/40 to-cyan-100/40 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-sm border border-emerald-200/40 text-emerald-900 px-6 py-3 rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-semibold">Tại sao chọn LTA</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Môi trường làm việc <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">lý tưởng</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Không chỉ là công ty công nghệ — chúng tôi là cộng đồng sáng tạo nơi mỗi thành viên được tôn vinh, phát triển và tạo tác động thực sự.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Công nghệ tiên tiến */}
            <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(2,6,23,0.06)] hover:shadow-[0_12px_40px_rgba(2,6,23,0.10)] transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-4 ring-emerald-100/40">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Công nghệ tiên tiến</h3>
              <p className="text-sm text-gray-600 mb-5">Làm việc với các công nghệ mới nhất trong lĩnh vực AI, IoT và Logistics 4.0</p>
              <button type="button" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center hover:underline underline-offset-4">
                Khám phá thêm
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>

            {/* Phát triển sự nghiệp */}
            <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(2,6,23,0.06)] hover:shadow-[0_12px_40px_rgba(2,6,23,0.10)] transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-4 ring-pink-100/40">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Phát triển sự nghiệp</h3>
              <p className="text-sm text-gray-600 mb-5">Lộ trình thăng tiến rõ ràng, mentoring 1-1, ngân sách học tập hằng năm</p>
              <button type="button" className="text-sm font-semibold text-purple-700 hover:text-purple-800 inline-flex items-center hover:underline underline-offset-4">
                Khám phá thêm
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>

            {/* Môi trường tốt */}
            <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(2,6,23,0.06)] hover:shadow-[0_12px_40px_rgba(2,6,23,0.10)] transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-4 ring-emerald-100/40">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Môi trường tốt</h3>
              <p className="text-sm text-gray-600 mb-5">Văn hóa tôn trọng, feedback minh bạch, cân bằng công việc & cuộc sống</p>
              <button type="button" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center hover:underline underline-offset-4">
                Khám phá thêm
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>

            {/* Đãi ngộ hấp dẫn */}
            <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(2,6,23,0.06)] hover:shadow-[0_12px_40px_rgba(2,6,23,0.10)] transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/0 to-orange-500/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-4 ring-amber-100/40">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Đãi ngộ hấp dẫn</h3>
              <p className="text-sm text-gray-600 mb-5">Lương thưởng cạnh tranh, bảo hiểm sức khỏe, chế độ hybrid linh hoạt</p>
              <button type="button" className="text-sm font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center hover:underline underline-offset-4">
                Khám phá thêm
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>

            {/* Tầm nhìn toàn cầu */}
            <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(2,6,23,0.06)] hover:shadow-[0_12px_40px_rgba(2,6,23,0.10)] transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/0 to-blue-600/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-4 ring-indigo-100/40">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tầm nhìn toàn cầu</h3>
              <p className="text-sm text-gray-600 mb-5">Tham gia dự án quốc tế, mở rộng network với đối tác toàn cầu</p>
              <button type="button" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 inline-flex items-center hover:underline underline-offset-4">
                Khám phá thêm
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>

            {/* Đội ngũ chuyên nghiệp */}
            <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(2,6,23,0.06)] hover:shadow-[0_12px_40px_rgba(2,6,23,0.10)] transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-500/0 to-pink-600/0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-4 ring-rose-100/40">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Đội ngũ chuyên nghiệp</h3>
              <p className="text-sm text-gray-600 mb-5">Đồng đội nhiều kinh nghiệm, tập trung hiệu quả và chất lượng</p>
              <button type="button" className="text-sm font-semibold text-rose-700 hover:text-rose-800 inline-flex items-center hover:underline underline-offset-4">
                Khám phá thêm
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Enhanced Job Positions Section */}
      <section id="positions" className="py-24 bg-gradient-to-br from-gray-50 via-emerald-25 to-teal-25 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100/30 to-emerald-100/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-100/20 to-cyan-100/20 rounded-full blur-2xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 backdrop-blur-sm border border-blue-200/40 text-blue-900 px-6 py-3 rounded-full text-sm font-medium mb-8">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent font-semibold">Cơ hội nghề nghiệp</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Vị trí đang 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> tuyển dụng</span>
            </h2>
            <p className="text-xl text-gray-600 mx-auto leading-relaxed whitespace-nowrap overflow-x-auto">
              Khám phá các cơ hội nghề nghiệp thú vị tại LTA và trở thành một phần của cuộc cách mạng Logistics 4.0
            </p>
          </div>

		  {/* Filters & List in two-column layout */}
		  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
			{/* Enhanced Sidebar Filters */}
			<aside className="lg:col-span-3">
			  <div className="mb-4 lg:hidden">
				<Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-white" onClick={() => setFiltersOpen(v => !v)}>
				  <SlidersHorizontal className="h-4 w-4 mr-2" />
				  {filtersOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
				</Button>
			  </div>
			  <div className="relative bg-white/80 backdrop-blur-xl border border-blue-100/50 rounded-3xl shadow-xl overflow-hidden">
 				<div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 pointer-events-none"></div>
 				<div className="relative">
 				  <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100/70 bg-white/60 backdrop-blur-sm">
 					<div className="inline-flex items-center gap-3 text-sm text-gray-800 font-semibold">
 					  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
 						 <SlidersHorizontal className="h-4 w-4 text-white" />
 					  </div>
 					  Bộ lọc tuyển dụng
 					</div>
                   </div>
 				  <div className="px-6 pt-3 text-xs text-gray-500 font-medium">Chọn tiêu chí để tìm nhanh vị trí phù hợp.</div>
 				  
 				  {/* Active chips */}
 				  {activeFilterChips.length > 0 && (
 					<div className="px-6 py-4 flex flex-wrap gap-2 border-b border-blue-100/70 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
 					  {activeFilterChips.map((chip, idx) => (
 						<span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50 shadow-sm font-medium">
 						  {chip.label}
 						  <button type="button" onClick={chip.onClear} className="ml-1 rounded-full p-0.5 hover:bg-blue-200/50 text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 transition-colors" aria-label={`Xóa ${chip.label}`}>
 							<X className="h-3 w-3" />
 						  </button>
 						</span>
 					  ))}
 					  <button type="button" onClick={clearAllFilters} className="ml-auto text-xs text-gray-500 hover:text-gray-700 underline decoration-dotted font-medium transition-colors">
 						Xóa tất cả
 					  </button>
                 </div>
 				  )}
 
 				  {/* Enhanced Filters form */}
 				  <div className={`${filtersOpen ? '' : 'hidden'} lg:block p-6 space-y-5`}>
 					<div>
 					  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Từ khóa</label>
 					  <div className="relative">
 						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
 						<Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, yêu cầu, mô tả..." className="bg-white/90 shadow-sm hover:shadow focus:shadow-md backdrop-blur-sm pl-10 h-11 rounded-2xl border border-blue-200/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
                     </div>
                     </div>
 					<div>
 					  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Vị trí</label>
 					  <div className="relative">
 						<Briefcase className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
 						<Select value={positionFilter || 'all'} onValueChange={(v) => setPositionFilter(v === 'all' ? '' : v)}>
 						  <SelectTrigger className="h-11 pl-10 pr-8 rounded-2xl border border-blue-200/60 bg-white/90 shadow-sm hover:shadow focus:shadow-md backdrop-blur-sm focus:ring-2 focus:ring-blue-500 justify-between text-left [&>span]:text-left">
 							<SelectValue placeholder="Tất cả vị trí" />
 						  </SelectTrigger>
 						  <SelectContent>
 							<SelectItem value="all">Tất cả vị trí</SelectItem>
 							{positions.map(pos => (<SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>))}
 						  </SelectContent>
 						</Select>
 					  </div>
                   </div>
 					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
 					  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Cấp bậc</label>
 					  <div className="relative">
 						<Star className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
 						<Select value={levelFilter || 'all'} onValueChange={(v) => setLevelFilter(v === 'all' ? '' : v)}>
 						  <SelectTrigger className="h-11 pl-10 pr-8 rounded-2xl border border-blue-200/60 bg-white/90 shadow-sm hover:shadow focus:shadow-md backdrop-blur-sm focus:ring-2 focus:ring-blue-500 justify-between text-left [&>span]:text-left">
 							<SelectValue placeholder="Tất cả cấp bậc" />
 						  </SelectTrigger>
 						  <SelectContent>
 							<SelectItem value="all">Tất cả cấp bậc</SelectItem>
 							{Array.from(new Set(positions.map(p => p.level))).map(level => (<SelectItem key={level} value={level}>{level}</SelectItem>))}
 						  </SelectContent>
 						</Select>
                   </div>
                 </div>
                   <div>
 					  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Hình thức</label>
 					  <div className="relative">
 						<Clock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
 						<Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
 						  <SelectTrigger className="h-11 pl-10 pr-8 rounded-2xl border border-blue-200/60 bg-white/90 shadow-sm hover:shadow focus:shadow-md backdrop-blur-sm focus:ring-2 focus:ring-blue-500 justify-between text-left [&>span]:text-left">
 							<SelectValue placeholder="Tất cả hình thức" />
 						  </SelectTrigger>
 						  <SelectContent>
 							<SelectItem value="all">Tất cả hình thức</SelectItem>
 							{Array.from(new Set(positions.map(p => p.type))).map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
 						  </SelectContent>
 						</Select>
 					  </div>
                   </div>
                 </div>
 					<div>
 					  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Mỗi trang</label>
 					  <div className="relative">
 						<Layers className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
 						<Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(parseInt(v, 10))}>
 						  <SelectTrigger className="h-11 pl-10 pr-8 rounded-2xl border border-blue-200/60 bg-white/90 shadow-sm hover:shadow focus:shadow-md backdrop-blur-sm focus:ring-2 focus:ring-blue-500 justify-between text-left [&>span]:text-left">
 							<SelectValue />
 						  </SelectTrigger>
 						  <SelectContent>
 							{[4,6,8,10].map(n => (<SelectItem key={n} value={String(n)}>{n} mục</SelectItem>))}
 						  </SelectContent>
 						</Select>
 					  </div>
 					  </div>
 					<div className="pt-2">
 						<Button onClick={clearAllFilters} variant="outline" className="w-full h-11 rounded-2xl border-blue-200/60 bg-white/90 shadow-sm hover:shadow focus:shadow-md backdrop-blur-sm hover:bg-white transition-all duration-300 font-medium text-gray-700">
 						  <X className="h-4 w-4 mr-2" />
 						  Xóa bộ lọc
 						</Button>
                     </div>
                   </div>
                 </div>
               </div>
			</aside>

			{/* Enhanced Job list + pagination */}
			<div className="lg:col-span-9">
			  <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
				<div className="flex items-center gap-2">
				  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
				  Kết quả: <span className="font-semibold text-gray-900">{uniquePositions.length}</span> vị trí
				</div>
				<div className="hidden sm:flex items-center gap-3">
				  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => handleQuickApply()}>
					<Send className="h-4 w-4 mr-1" />
					Nộp CV nhanh
				  </Button>
				</div>
				</div>
			  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{paginatedPositions.map((p) => (
				  <Card id={getJobAnchor(p.id)} key={p.id} className="group relative transition-all duration-300 border border-blue-100/60 hover:border-blue-200 shadow-sm hover:shadow-md overflow-hidden rounded-xl bg-white hover:-translate-y-0.5 h-full flex flex-col">
					{/* Enhanced accent bar */}
					<div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${p.accent.bar}`}></div>
					
					{/* Hover overlay effect */}
					<div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/30 transition-all duration-500 pointer-events-none"></div>
					
					<CardHeader className="px-4 pt-4 pb-3 relative">
					  <div className="flex justify-between items-start gap-4">
						<div className="min-w-0 flex-1">
						  <CardTitle className="text-[20px] md:text-[22px] font-semibold tracking-tight leading-snug mb-2 text-gray-900 group-hover:text-blue-900 transition-colors duration-300" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</CardTitle>
						  <div className="flex flex-wrap items-center gap-2 mb-2.5">
							<Badge variant="secondary" className={`${p.accent.badge} px-2.5 py-0.5 text-[11px] font-semibold shadow-sm`}>{p.type}</Badge>
							<Badge variant="outline" className="border-blue-200 text-blue-700 text-[11px] font-medium bg-blue-50/50 px-2.5 py-0.5">{p.level}</Badge>
						  </div>
						  <CardDescription className="text-[15px] text-gray-700 leading-6" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description || 'Mô tả đang cập nhật'}</CardDescription>
						</div>
						<div className="flex items-center gap-1 -mt-1 md:hidden">
						  <Button aria-label="Ứng tuyển vị trí" variant="ghost" size="sm" className="h-10 rounded-2xl text-blue-600 md:hidden hover:bg-blue-50 transition-all duration-300" onClick={() => handleApplyNow(p.id)}>
							<Send className="h-4 w-4 mr-1" />
							Ứng tuyển
						  </Button>
						  <Button aria-label={savedJobs[p.id] ? 'Bỏ lưu' : 'Lưu'} variant="ghost" size="icon" className={`h-10 w-10 rounded-2xl ${savedJobs[p.id] ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-500 hover:bg-gray-50'} transition-all duration-300`} onClick={() => toggleSaveJob(p.id, p.title)}>
							<Bookmark className="h-4 w-4" fill={savedJobs[p.id] ? 'currentColor' : 'none'} />
						  </Button>
						</div>
					  </div>
					</CardHeader>
					<CardContent className="flex flex-col px-4 pb-4 flex-1">
					  <div className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
						  <div className="flex items-center text-sm text-gray-600 group/item">
							<div className="w-7 h-7 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg flex items-center justify-center mr-2 group-hover/item:scale-110 transition-transform duration-300">
							  <MapPin className="h-4 w-4 text-blue-500" />
							</div>
							<span className="font-medium">{p.location}</span>
						  </div>
						  <div className="flex items-center text-sm text-gray-600 group/item">
							<div className="w-7 h-7 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg flex items-center justify-center mr-2 group-hover/item:scale-110 transition-transform duration-300">
							  <Clock className="h-4 w-4 text-green-500" />
							</div>
							<span className="font-medium">8:00 - 17:30</span>
						  </div>
						  <div className="flex items-center text-sm text-gray-600 group/item">
							<div className="w-7 h-7 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg flex items-center justify-center mr-2 group-hover/item:scale-110 transition-transform duration-300">
							  <DollarSign className="h-4 w-4 text-orange-500" />
							</div>
							<span className="font-medium">{p.salary}</span>
						  </div>
						</div>
						<Separator className="bg-gradient-to-r from-blue-50 to-indigo-50" />
						<div>
						  <h4 className="font-semibold mb-2.5 text-gray-900 flex items-center">
							<div className="w-6 h-6 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg flex items-center justify-center mr-2">
							  <CheckCircle className="h-4 w-4 text-green-500" />
							</div>
							Yêu cầu:
						  </h4>
						  <ul className="text-sm text-gray-600 space-y-1.5">
							{(expandedJobs[p.id] ? p.requirements : p.requirements.slice(0, 3)).map((req, idx) => (
							  <li key={idx} className="flex items-start">
								<div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
								<span>{req}</span>
							  </li>
							))}
						  </ul>
						  {p.requirements.length > 3 && (
							<button
							  type="button"
							  onClick={() => setExpandedJobs(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
							  className="mt-2.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
							>
							  {expandedJobs[p.id] ? 'Thu gọn yêu cầu' : `... và ${p.requirements.length - 3} yêu cầu nữa`}
							</button>
						  )}
						</div>
					  </div>
					  <div className="mt-auto pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
						<div className="sm:col-span-1">
						  <Button onClick={() => openDetail(p.id)} variant="outline" className="w-full h-10 rounded-lg border-blue-200/60 bg-white/80 backdrop-blur-sm hover:bg-white text-blue-700 font-semibold">
							Xem chi tiết
						  </Button>
						</div>
						<div className="sm:col-span-2">
						  <Button onClick={() => handleApplyNow(p.id)} className={`w-full h-10 bg-gradient-to-r ${p.accent.button} text-white font-semibold group-hover:scale-105 transition-all duration-500 rounded-lg shadow-md hover:shadow-lg`}>
							<Send className="mr-2 h-5 w-5" />
							Ứng tuyển ngay
						  </Button>
						</div>
					  </div>
					</CardContent>
				  </Card>
				))}
                  </div>
                  
			  {filteredPositions.length === 0 && (
				<div className="text-center text-gray-600 mt-12">
				  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<Search className="h-8 w-8 text-gray-400" />
				  </div>
				  <div className="text-lg font-medium mb-2">Không có vị trí phù hợp bộ lọc.</div>
				  <div className="text-sm text-gray-500 mb-6">Thử điều chỉnh bộ lọc hoặc xem tất cả vị trí.</div>
				  <div className="flex items-center justify-center gap-3">
					<Button variant="outline" onClick={() => clearAllFilters()} className="bg-white/80 backdrop-blur-sm border-blue-200/50 hover:bg-white">
					  <X className="h-4 w-4 mr-1" />
					  Xóa bộ lọc
					</Button>
					<Button onClick={() => handleQuickApply()} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
					  <Send className="h-4 w-4 mr-1" />
					  Nộp CV nhanh
					</Button>
				  </div>
				</div>
			  )}

			  {filteredPositions.length > 0 && (
				<div className="flex items-center justify-center gap-4 mt-12">
				  <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-white/80 backdrop-blur-sm border-blue-200/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
					<ChevronDown className="h-4 w-4 mr-1 rotate-90" />
					Trước
				  </Button>
				  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50">
					<span className="text-sm font-medium text-gray-700">Trang</span>
					<span className="text-sm font-bold text-blue-600">{currentPage}</span>
					<span className="text-sm font-medium text-gray-700">/ {totalPages}</span>
				  </div>
				  <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="bg-white/80 backdrop-blur-sm border-blue-200/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
					Sau
					<ChevronDown className="h-4 w-4 ml-1 -rotate-90" />
				  </Button>
                </div>
			  )}
                </div>
          </div>
        </div>
      </section>

      {/* Enhanced Benefits Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-100/30 to-emerald-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-sm border border-emerald-200/40 text-emerald-900 px-6 py-3 rounded-full text-sm font-medium mb-8">
              <Award className="h-4 w-4 text-emerald-600" />
              <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-semibold">Đãi ngộ & môi trường tăng trưởng</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Chúng tôi <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">cam kết</span> mang đến
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nền tảng, công cụ và đãi ngộ giúp bạn phát triển bền vững và tạo tác động thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bộ công cụ AI cao cấp */}
            <div className="group relative flex items-start gap-6 p-7 md:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100/70 shadow-[0_8px_24px_rgba(2,6,23,0.06)] hover:shadow-[0_18px_40px_rgba(2,6,23,0.10)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-600/5 blur-2xl"></div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg ring-4 ring-indigo-100/50 flex items-center justify-center">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">Bộ công cụ AI cao cấp</h3>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed">Copilot Enterprise, Cursor Pro, ChatGPT Plus, Claude và template prompt nội bộ.</p>
              </div>
            </div>

            {/* Ngân sách học tập */}
            <div className="group relative flex items-start gap-6 p-7 md:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100/70 shadow-[0_8px_24px_rgba(2,6,23,0.06)] hover:shadow-[0_18px_40px_rgba(2,6,23,0.10)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/5 to-purple-600/5 blur-2xl"></div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg ring-4 ring-pink-100/50 flex items-center justify-center">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">Ngân sách học tập</h3>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed">15-25 triệu/năm, chứng chỉ chuyên môn, mentor 1-1 và growth review định kỳ.</p>
              </div>
            </div>

            {/* Ownership Thực */}
            <div className="group relative flex items-start gap-6 p-7 md:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100/70 shadow-[0_8px_24px_rgba(2,6,23,0.06)] hover:shadow-[0_18px_40px_rgba(2,6,23,0.10)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/5 to-red-600/5 blur-2xl"></div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg ring-4 ring-amber-100/50 flex items-center justify-center">
                <Target className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">Ownership thực</h3>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed">Làm việc end-to-end: từ ý tưởng đến production, đo lường tác động bằng số liệu.</p>
              </div>
            </div>

            {/* Tinh gọn & Tác động */}
            <div className="group relative flex items-start gap-6 p-7 md:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100/70 shadow-[0_8px_24px_rgba(2,6,23,0.06)] hover:shadow-[0_18px_40px_rgba(2,6,23,0.10)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-teal-600/5 to-emerald-500/5 blur-2xl"></div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg ring-4 ring-emerald-100/50 flex items-center justify-center">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">Tinh gọn & Tác động</h3>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed">Quy trình gọn nhẹ, quyết định nhanh, minh bạch và tập trung hiệu quả.</p>
              </div>
            </div>

            {/* Phúc lợi & Hạ tầng */}
            <div className="group relative flex items-start gap-6 p-7 md:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100/70 shadow-[0_8px_24px_rgba(2,6,23,0.06)] hover:shadow-[0_18px_40px_rgba(2,6,23,0.10)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-600/5 to-orange-500/5 blur-2xl"></div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-600 shadow-lg ring-4 ring-amber-100/50 flex items-center justify-center">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">Phúc lợi & Hạ tầng</h3>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed">MacBook Pro, 4K monitor, bảo hiểm sức khỏe, hybrid linh hoạt, tool chuẩn hóa.</p>
              </div>
            </div>

            {/* Lĩnh vực Logistics */}
            <div className="group relative flex items-start gap-6 p-7 md:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100/70 shadow-[0_8px_24px_rgba(2,6,23,0.06)] hover:shadow-[0_18px_40px_rgba(2,6,23,0.10)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600/5 to-blue-600/5 blur-2xl"></div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg ring-4 ring-indigo-100/50 flex items-center justify-center">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">Lĩnh vực Logistics</h3>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed">Bài toán vận đơn, tối ưu chuỗi cung ứng, tích hợp hệ thống thực tế.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Modal Nộp CV nhanh */}
      <QuickApplyModal 
        isOpen={showForm} 
        onClose={handleCloseModal} 
      />

      {/* Modal Ứng tuyển ngay */}
      <RecruitmentModal 
        isOpen={showApplyModal} 
        onClose={handleCloseApplyModal} 
        position={selectedPosition}
        showInfoPanel={true} // Ứng tuyển ngay - hiển thị 2 panel
        details={(() => {
          const job = positions.find(j => j.id === selectedPosition)
          if (!job) return undefined
          return {
            title: job.title,
            level: job.level,
            type: job.type,
            location: job.location,
            salary: job.salary,
            experience: job.experience as any,
            description: job.description
          }
        })()}
      />

      {/* Apply Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 [&>button]:hidden">
          {(() => {
            const job = positions.find(j => j.id === detailJobId)
            if (!job) return (
              <div className="py-6">Không tìm thấy thông tin vị trí.</div>
            )
            return (
              <div className="h-full flex flex-col">
                {/* Fixed Header */}
                <div className="flex-shrink-0 bg-white px-6 py-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900 pr-4">{job.title}</DialogTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailOpen(false)}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">{job.type}</span>
                    {job.level && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">{job.level}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Chúng tôi đang tìm kiếm một {job.title.toLowerCase()} có kinh nghiệm để tham gia vào đội ngũ của công ty.
                  </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                  <div className="px-6 py-6 space-y-6">
                    {/* Thông tin chung */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-base">Thông tin chung</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                          <MapPin className="h-4 w-4 mr-3 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">{job.location}</span>
                        </div>
                        <div className="flex items-center p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                          <Clock className="h-4 w-4 mr-3 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">8:00 - 17:30</span>
                        </div>
                        <div className="flex items-center p-3 bg-white rounded-lg border border-orange-100 shadow-sm">
                          <DollarSign className="h-4 w-4 mr-3 text-orange-500" />
                          <span className="text-sm font-medium text-gray-700">{job.salary}</span>
                        </div>
                        <div className="flex items-center p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                          <GraduationCap className="h-4 w-4 mr-3 text-indigo-500" />
                          <span className="text-sm font-medium text-gray-700">{job.experience || 'Không yêu cầu'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mô tả công việc */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-base">Mô tả công việc</h3>
                      </div>
                      <div className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{job.description}</div>
                    </div>

                    {/* Yêu cầu */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-base">Yêu cầu chi tiết</h3>
                      </div>
                      <ul className="space-y-3">
                        {job.requirements.map((r, i) => (
                          <li key={i} className="flex items-start p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700 leading-relaxed">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quyền lợi */}
                    {job.benefits && job.benefits.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800 text-base">Quyền lợi</h3>
                        </div>
                        <ul className="space-y-3">
                          {job.benefits.map((b, i) => (
                            <li key={i} className="flex items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
                      <Button variant="outline" onClick={() => setDetailOpen(false)} className="px-8 py-3 rounded-lg font-medium">
                        Đóng
                      </Button>
                      <Button onClick={() => { setDetailOpen(false); handleApplyNow(job.id) }} className={`bg-gradient-to-r ${job.accent.button} text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300`}>
                        Ứng tuyển ngay
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Contact Info Section */}
      {/* Quick Apply Section (moved near footer) */}
      <section id="quick-apply" className="py-24 bg-gradient-to-br from-white via-emerald-25 to-teal-25 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-200/40 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-sm border border-emerald-200/60 text-emerald-900 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-semibold">Ứng tuyển nhanh</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Bắt đầu chỉ trong vài bước</h2>
            <p className="mt-4 text-gray-600 text-lg max-w-3xl mx-auto">Để lại thông tin cơ bản và đính kèm CV. Chúng tôi sẽ liên hệ ngay khi có vị trí phù hợp.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left intro */}
            <div className="lg:col-span-5 flex">
              <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-teal-400/15 to-cyan-400/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative h-full bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 shadow-[0_18px_40px_rgba(2,6,23,0.08)] flex flex-col">
                                                        <div className="mb-6">
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">Gia nhập đội ngũ LTA</h3>
                     <p className="text-gray-600 leading-relaxed">Điền nhanh thông tin và đính kèm CV. Team tuyển dụng sẽ phản hồi trong thời gian sớm nhất.</p>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 border border-emerald-100 px-4 py-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                         <CheckCircle className="h-4 w-4 text-emerald-600" />
                       </div>
                       <span className="text-sm font-medium text-gray-800">Xử lý nhanh chóng</span>
                     </div>
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 border border-emerald-100 px-4 py-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                         <CheckCircle className="h-4 w-4 text-emerald-600" />
                       </div>
                       <span className="text-sm font-medium text-gray-800">Bảo mật thông tin</span>
                     </div>
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 border border-emerald-100 px-4 py-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                         <CheckCircle className="h-4 w-4 text-emerald-600" />
                       </div>
                       <span className="text-sm font-medium text-gray-800">Nhiều vị trí phù hợp</span>
                     </div>
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 border border-emerald-100 px-4 py-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                         <CheckCircle className="h-4 w-4 text-emerald-600" />
                       </div>
                       <span className="text-sm font-medium text-gray-800">Hỗ trợ throughout</span>
                     </div>
                   </div>
                   <div className="mb-6">
                     <h4 className="text-xl font-bold text-gray-900 mb-4">LTA luôn chào đón bạn!!</h4>
                     <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                       <div className="flex items-center gap-3 mb-3">
                         <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                           <Sparkles className="h-4 w-4 text-emerald-600" />
                         </div>
                         <span className="font-semibold text-gray-800">Tại sao chọn LTA?</span>
                       </div>
                       <ul className="space-y-2 text-sm text-gray-600">
                         <li className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                           Môi trường làm việc năng động, sáng tạo
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                           Cơ hội phát triển kỹ năng AI/ML
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                           Lương thưởng cạnh tranh, phúc lợi tốt
                         </li>
                         <li className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                           Tham gia các dự án logistics thú vị
                         </li>
                       </ul>
                     </div>
                   </div>
                   <div className="flex-1 flex flex-col justify-end">
                     <div className="space-y-4">
                       {/* Zalo Button */}
                       <button 
                         onClick={() => window.open("https://zalo.me/ltacompany", "_blank")}
                         className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-lg hover:shadow-xl"
                       >
                         <div className="text-left">
                           <div className="text-sm opacity-90">Nhắn tin qua</div>
                           <div className="text-lg font-bold">Zalo Official của LTA</div>
                         </div>
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                           <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                             <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                               <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                             </svg>
                           </div>
                         </div>
                       </button>

                       {/* Hotline Button */}
                       <button 
                         onClick={() => window.open("tel:0886116668", "_self")}
                         className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-lg hover:shadow-xl"
                       >
                         <div className="text-left">
                           <div className="text-sm opacity-90">Gọi ngay Hotline</div>
                           <div className="text-lg font-bold">0886 116 668</div>
                         </div>
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                           <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                             <Phone className="h-5 w-5 text-white" />
                           </div>
                         </div>
                       </button>

                       {/* Email Button */}
                       <button 
                         onClick={() => window.open("mailto:hr@ltacv.com", "_self")}
                         className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-lg hover:shadow-xl"
                       >
                         <div className="text-left">
                           <div className="text-sm opacity-90">Gửi email</div>
                           <div className="text-lg font-bold">hr@ltacv.com</div>
                         </div>
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                           <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                             <Mail className="h-5 w-5 text-white" />
                           </div>
                         </div>
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleQuickSubmit} className="relative bg-white/90 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_18px_40px_rgba(2,6,23,0.08)] space-y-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <Sparkles className="h-3.5 w-3.5" />
                      Thông tin ứng tuyển
                    </div>
                  </div>
                </div>
                
                {/* Form Message */}
                {quickFormMessage && (
                  <div className={`p-4 rounded-2xl border ${
                    quickFormMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : quickFormMessage.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {quickFormMessage.type === 'loading' && (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {quickFormMessage.type === 'success' && (
                          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {quickFormMessage.type === 'error' && (
                          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span className="font-medium">{quickFormMessage.text}</span>
                      </div>
                      {quickFormMessage.type !== 'loading' && (
                        <button
                          type="button"
                          onClick={() => setQuickFormMessage(null)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Họ và Tên<span className="text-red-500"> *</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="Nguyễn Văn A" className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Email<span className="text-red-500"> *</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input type="email" value={quickEmail} onChange={(e) => setQuickEmail(e.target.value)} placeholder="you@domain.com" className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Số điện thoại<span className="text-red-500"> *</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input type="tel" value={quickPhone} onChange={(e) => setQuickPhone(e.target.value)} placeholder="+84..." className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Bạn muốn ứng tuyển vị trí nào tại LTA?<span className="text-red-500"> *</span></Label>
                    <div className="relative">
                      <Briefcase className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      <Select value={quickPosition} onValueChange={setQuickPosition}>
                        <SelectTrigger className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20">
                          <SelectValue placeholder="-- Chọn vị trí --" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Năm sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input type="number" min="1950" max="${new Date().getFullYear()}" value={quickBirthYear} onChange={(e) => setQuickBirthYear(e.target.value)} placeholder="1998" className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Link Portfolio (Nếu có)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input type="url" value={quickPortfolio} onChange={(e) => setQuickPortfolio(e.target.value)} placeholder="https://..." className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">AI Use Case Nổi Bật</Label>
                    <div className="relative">
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={quickAiUseCase} onChange={(e) => setQuickAiUseCase(e.target.value)} placeholder="Ví dụ: Chatbot, Computer Vision, NLP..." className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Kinh Nghiệm (Năm)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input type="number" min="0" max="50" value={quickExperience} onChange={(e) => setQuickExperience(e.target.value)} placeholder="2" className="h-12 pl-9 rounded-2xl border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm text-gray-700">Ghi Chú Thêm</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea 
                        value={quickNotes} 
                        onChange={(e) => setQuickNotes(e.target.value)} 
                        placeholder="Mô tả thêm về bản thân, kỹ năng, mục tiêu nghề nghiệp..."
                        rows={3}
                        className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/80 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm text-gray-700">Tải lên CV (.PDF)<span className="text-red-500"> *</span></Label>
                    <input ref={cvInputRef as any} type="file" accept="application/pdf" onChange={handleCvChange} className="hidden" />
                    <div className="flex items-center justify-between rounded-2xl border border-dashed border-emerald-200 bg-white/70 px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{quickCvFile ? quickCvFile.name : 'Chưa chọn tệp'}</span>
                          <span className="text-xs text-gray-500">Chỉ nhận .PDF (≤ 10MB)</span>
                        </div>
                      </div>
                      <Button type="button" variant="outline" className="rounded-xl border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700" onClick={() => cvInputRef.current?.click()}>
                        Chọn tệp
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <Button 
                    type="submit" 
                    disabled={isQuickSubmitting}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isQuickSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi...
                      </div>
                    ) : (
                      'Gửi thông tin'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <RecruitmentFooter />
    </div>
  )
}

