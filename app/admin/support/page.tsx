'use client'

import { useState } from 'react'
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, FileText, Video, BookOpen, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

export default function SupportPage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Gửi thông tin liên hệ đến API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          company: contactForm.subject, // Sử dụng subject làm company
          message: `[Hỗ trợ - ${contactForm.priority.toUpperCase()}] ${contactForm.message}`
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Tin nhắn hỗ trợ đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.')
        setContactForm({ name: '', email: '', subject: '', priority: 'medium', message: '' })
      } else {
        alert(`Lỗi: ${result.error || 'Có lỗi xảy ra khi gửi tin nhắn hỗ trợ'}`)
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi tin nhắn hỗ trợ. Vui lòng thử lại sau.')
      console.error('Support form error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const supportChannels = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Điện thoại',
      description: 'Gọi trực tiếp cho chúng tôi',
      contact: '+84 123 456 789',
      available: '8:00 - 18:00 (T2-T6)',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      description: 'Gửi email hỗ trợ',
      contact: 'support@lta.com',
      available: 'Phản hồi trong 24h',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Chat trực tuyến',
      description: 'Chat với nhân viên hỗ trợ',
      contact: 'Mở chat',
      available: '8:00 - 18:00 (T2-T6)',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    }
  ]

  const resources = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Hướng dẫn sử dụng',
      description: 'Tài liệu hướng dẫn chi tiết',
      link: '#'
    },
    {
      icon: <Video className="h-5 w-5" />,
      title: 'Video hướng dẫn',
      description: 'Video demo các tính năng',
      link: '#'
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: 'FAQ',
      description: 'Câu hỏi thường gặp',
      link: '#'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hỗ trợ</h1>
          <p className="text-gray-600 dark:text-gray-400">Liên hệ hỗ trợ kỹ thuật</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Channels */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <span>Kênh liên hệ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportChannels.map((channel, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`p-3 rounded-full ${channel.color}`}>
                      {channel.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{channel.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{channel.description}</p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{channel.contact}</p>
                      <p className="text-xs text-gray-500">{channel.available}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tài liệu hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <Link key={index} href={resource.link} className="block">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {resource.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Gửi tin nhắn hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Nhập tiêu đề vấn đề"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mức độ ưu tiên</label>
                  <Select value={contactForm.priority} onValueChange={(value) => setContactForm({ ...contactForm, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 