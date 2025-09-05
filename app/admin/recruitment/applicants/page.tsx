'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Loader2, Search, User2, Mail, Phone, Briefcase, Calendar, ChevronLeft, Users, RefreshCw, Link as LinkIcon, NotebookText, FileText, ChevronRight } from 'lucide-react'

interface ApplicantItem {
  id: string
  fullName: string
  email: string
  phone: string
  position: string
  linkedinGithub?: string
  aiUseCase?: string
  experience?: string
  additionalRoles?: string[]
  notes?: string
  createdAt: string
  // fallback snake_case (for safety)
  full_name?: string
  linkedin_github?: string
  ai_use_case?: string
  additional_roles?: string[]
  created_at?: string
  // extended optional fields
  address?: string
  city?: string
  dob?: string
  gender?: string
  resumeUrl?: string
  portfolioUrl?: string
  source?: string
  expectedSalary?: string
  startDate?: string
}

export default function ApplicantsPage() {
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState<ApplicantItem[]>([])
  const [q, setQ] = useState('')
  const [titleCache, setTitleCache] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        console.log('Fetching applicants from admin...')
        const res = await fetch('/api/recruitment-applicants')
        console.log('Admin fetch response status:', res.status)
        if (res.ok) {
          const data = await res.json()
          console.log('Admin fetch response data:', data)
          console.log('Applicants array:', data.applicants)
          console.log('Applicants length:', data.applicants?.length || 0)
          setApplicants(data.applicants || [])
        } else {
          console.error('Admin fetch failed:', res.status, res.statusText)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Position label map to convert stored codes to readable labels like on the form
  const positionLabelMap: Record<string, string> = {
    'frontend': 'Frontend Developer',
    'backend': 'Backend Developer',
    'mobile': 'Mobile Developer',
    'analyst': 'Business Analyst',
    'ai-ml': 'AI/ML Engineer',
    'devops': 'DevOps Engineer',
  }

  const toPositionLabel = (value: string): string => {
    if (!value) return ''
    const lower = String(value).toLowerCase()
    return positionLabelMap[lower] || value
  }

  const mapNormalize = (a: ApplicantItem) => {
    const fullName = a.fullName || (a as any).full_name || ''
    const linkedinGithub = a.linkedinGithub || (a as any).linkedin_github || ''
    const aiUseCase = a.aiUseCase || (a as any).ai_use_case || ''

    // Position fields
    const rawPosition = (a as any).position || (a as any).applied_position || ''
    const recruitmentTitle = (a as any).recruitment_title || ''
    const recruitmentId = (a as any).recruitment_id || (a as any).job_id || (a as any).post_id || ''
    const isNumericId = typeof rawPosition === 'string' && /^\d+$/.test(rawPosition.trim())
    const displayPosition = recruitmentTitle || (isNumericId ? '' : rawPosition)

    // Normalize additional roles from array or comma string
    const rawRoles = (a.additionalRoles ?? (a as any).additional_roles) as any
    const additionalRoles = Array.isArray(rawRoles)
      ? rawRoles.filter(Boolean).map((s: any) => String(s).trim()).filter(Boolean)
      : typeof rawRoles === 'string'
        ? rawRoles.split(',').map(s => s.trim()).filter(Boolean)
        : []

    // Normalize createdAt
    const createdAt = a.createdAt || (a as any).created_at || ''

    // Normalize resume / portfolio
    const resumeUrl = (a as any).resumeUrl || (a as any).resume_url || (a as any).cv_url || ''
    const portfolioUrl = (a as any).portfolioUrl || (a as any).portfolio_url || ''

    // Other optional mappings
    const expectedSalary = (a as any).expectedSalary || (a as any).expected_salary || ''
    const startDate = (a as any).startDate || (a as any).preferred_start_date || ''

    return {
      ...a,
      fullName,
      position: rawPosition,
      recruitmentTitle,
      recruitmentId,
      displayPosition,
      linkedinGithub,
      aiUseCase,
      additionalRoles,
      createdAt,
      resumeUrl,
      portfolioUrl,
      expectedSalary,
      startDate,
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const normalized = applicants.map(mapNormalize)
    if (!term) return normalized
    return normalized.filter(a =>
      [a.fullName, a.email, a.phone, a.position, (a as any).recruitmentTitle, a.experience, a.notes, a.aiUseCase, a.linkedinGithub]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    )
  }, [q, applicants])

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedApplicants = filtered.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [q])

  // Resolve numeric position IDs to titles lazily
  useEffect(() => {
    const unresolvedIds = applicants
      .flatMap(a => {
        const pos = (a as any).position
        const rid = (a as any).recruitmentId
        const ids: string[] = []
        if (typeof pos === 'string' && /^\d+$/.test(pos) && !titleCache[pos]) ids.push(pos)
        if (typeof rid === 'string' && /^\d+$/.test(rid) && !titleCache[rid]) ids.push(rid)
        return ids
      }) as string[]
    const unique = Array.from(new Set(unresolvedIds))
    if (unique.length === 0) return
    unique.forEach(async (id) => {
      try {
        const res = await fetch(`/api/recruitment-title?id=${id}`)
        const json = await res.json().catch(() => null)
        if (json?.success && json?.title) {
          setTitleCache(prev => ({ ...prev, [id]: json.title }))
        }
      } catch {}
    })
  }, [applicants, titleCache])

  const formatDate = (s: string) => {
    const d = new Date(s)
    return isNaN(d.getTime()) ? '-' : d.toLocaleString('vi-VN')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/recruitment">
            <Button variant="outline" size="sm" className="hover:bg-green-50">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Tuyển dụng
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-6">Danh sách ứng viên</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span>Hiển thị tất cả ứng tuyển từ website</span>
                <Badge variant="secondary" className="ml-1">{filtered.length} ứng viên</Badge>
                {totalPages > 1 && (
                  <Badge variant="outline" className="ml-1">Trang {currentPage}/{totalPages}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, email, vị trí ứng tuyển..." className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={async () => {
            setLoading(true)
            try {
              const res = await fetch('/api/recruitment-applicants')
              if (res.ok) {
                const data = await res.json()
                setApplicants(data.applicants || [])
              }
            } finally { setLoading(false) }
          }}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Làm mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ứng viên mới nhất</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Chưa có ứng viên</div>
          ) : (
            <div className="space-y-3">
              {paginatedApplicants.map(a => {
                const initials = (a.fullName || '?')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(s => s[0]?.toUpperCase())
                  .join('') || '?'
                return (
                  <div key={a.id} className="border rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold truncate max-w-[240px]">{a.fullName}</span>
                              <span className="text-xs text-gray-500">Vị trí ứng tuyển:</span>
                              <Badge variant="outline" className="whitespace-nowrap">{(a as any).displayPosition || titleCache[(a as any).position] || titleCache[(a as any).recruitmentId] || '-'}</Badge>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Calendar className="h-3 w-3" /> {formatDate(a.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`mailto:${a.email}`}>
                            <Button variant="outline" size="sm"><Mail className="h-4 w-4 mr-1" /> Email</Button>
                          </a>
                          <a href={`tel:${a.phone}`}>
                            <Button variant="outline" size="sm"><Phone className="h-4 w-4 mr-1" /> Gọi</Button>
                          </a>
                          {a.resumeUrl ? (
                            <a href={a.resumeUrl} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> CV</Button>
                            </a>
                          ) : (
                            <Button variant="outline" size="sm" disabled title="Chưa có CV"><FileText className="h-4 w-4 mr-1" /> CV</Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 text-gray-400" /><span className="truncate">{a.email}</span></div>
                        <div className="flex items-center gap-2 truncate"><Phone className="h-4 w-4 text-gray-400" /><span>{a.phone}</span></div>
                        {a.linkedinGithub && (
                          <div className="flex items-center gap-2 truncate">
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                            <a href={a.linkedinGithub} target="_blank" className="text-blue-600 hover:underline truncate">{a.linkedinGithub}</a>
                          </div>
                        )}
                        {a.experience && (
                          <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-gray-400" /><span>Kinh nghiệm: {a.experience}</span></div>
                        )}
                        {a.expectedSalary && (
                          <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-gray-400" /><span>Mong muốn lương: {a.expectedSalary}</span></div>
                        )}
                        {a.startDate && (
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>Ngày bắt đầu mong muốn: {a.startDate}</span></div>
                        )}
                        {a.city && (
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>Thành phố: {a.city}</span></div>
                        )}
                        {a.source && (
                          <div className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-gray-400" /><span>Nguồn: {a.source}</span></div>
                        )}
                        {a.additionalRoles && a.additionalRoles.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {a.additionalRoles.map(r => (
                              <Badge key={r} variant="secondary" className="mr-1 mt-1">{r}</Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {(a.resumeUrl || a.portfolioUrl || a.address || a.aiUseCase || a.notes) && (
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 text-sm space-y-2">
                          {a.resumeUrl && (
                            <div className="flex items-start gap-2">
                              <LinkIcon className="h-4 w-4 mt-0.5 text-gray-400" />
                              <a href={a.resumeUrl} target="_blank" className="text-blue-600 hover:underline">CV / Resume</a>
                            </div>
                          )}
                          {a.portfolioUrl && (
                            <div className="flex items-start gap-2">
                              <LinkIcon className="h-4 w-4 mt-0.5 text-gray-400" />
                              <a href={a.portfolioUrl} target="_blank" className="text-blue-600 hover:underline">Portfolio</a>
                            </div>
                          )}
                          {a.address && (
                            <div className="flex items-start gap-2">
                              <NotebookText className="h-4 w-4 mt-0.5 text-gray-400" />
                              <div>
                                <span className="text-gray-500">Địa chỉ: </span>
                                <span className="text-gray-800 dark:text-gray-200">{a.address}</span>
                              </div>
                            </div>
                          )}
                          {a.aiUseCase && (
                            <div className="flex items-start gap-2">
                              <NotebookText className="h-4 w-4 mt-0.5 text-gray-400" />
                              <div>
                                <span className="text-gray-500">AI Use Case: </span>
                                <span className="text-gray-800 dark:text-gray-200">{a.aiUseCase}</span>
                              </div>
                            </div>
                          )}
                          {a.notes && (
                            <div className="flex items-start gap-2">
                              <NotebookText className="h-4 w-4 mt-0.5 text-gray-400" />
                              <div>
                                <span className="text-gray-500">Ghi chú: </span>
                                <span className="text-gray-800 dark:text-gray-200">{a.notes}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filtered.length)} trong {filtered.length} ứng viên
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


