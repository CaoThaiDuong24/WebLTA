"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PhoneCall, Mail, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react"
import { useInView } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"

interface ContactFormData {
  name: string
  email: string
  company: string
  message: string
}

export function ContactSection() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const isLeftInView = useInView(leftRef, { once: true, amount: 0.3 })
  const isRightInView = useInView(rightRef, { once: true, amount: 0.3 })
  const { t } = useTranslation()

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Auto-hide success message after 2 seconds
  useEffect(() => {
    if (submitStatus === 'success') {
      const timerId = setTimeout(() => {
        setSubmitStatus('idle')
        setSubmitMessage('')
      }, 2000)
      return () => clearTimeout(timerId)
    }
  }, [submitStatus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset status
    setSubmitStatus('idle')
    setSubmitMessage('')

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error')
      setSubmitMessage('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('error')
      setSubmitMessage('Email không hợp lệ')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(result.message)
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Có lỗi xảy ra khi gửi thông tin liên hệ')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Có lỗi xảy ra khi gửi thông tin liên hệ. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetStatus = () => {
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  return (
    <section id="contact" className="bg-gray-50 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('contactUs')}</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('contactDescription')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
          <div
            ref={leftRef}
            className="rounded-2xl bg-white p-8 shadow-sm"
            style={{
              transform: isLeftInView ? "none" : "translateX(-50px)",
              opacity: isLeftInView ? 1 : 0,
              transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
            }}
          >
            <h3 className="text-xl font-semibold text-gray-900">{t('sendMessage')}</h3>
            
            {/* Status Message */}
            {submitStatus !== 'idle' && (
              <div 
                className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                  submitStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm font-medium">{submitMessage}</span>
                <button
                  onClick={resetStatus}
                  className="ml-auto text-sm underline hover:no-underline"
                >
                  Đóng
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('fullName')} <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    id="name" 
                    name="name" 
                    type="text" 
                    className="mt-1" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('email')} <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    className="mt-1" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  {t('company')}
                </label>
                <Input 
                  id="company" 
                  name="company" 
                  type="text" 
                  className="mt-1" 
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t('message')} <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  id="message" 
                  name="message" 
                  rows={4} 
                  className="mt-1" 
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full group bg-[#4CAF50] hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    {t('sendButton')}
                    <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div
            ref={rightRef}
            className="rounded-2xl bg-white p-8 shadow-sm"
            style={{
              transform: isRightInView ? "none" : "translateX(50px)",
              opacity: isRightInView ? 1 : 0,
              transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
            }}
          >
            <h3 className="text-xl font-semibold text-gray-900">{t('contactInfo')}</h3>
            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <PhoneCall className="h-5 w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t('phone')}</div>
                  <div className="mt-1 text-gray-600">0886 116 668</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <Mail className="h-5 w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t('email')}</div>
                  <div className="mt-1 text-gray-600">info@ltacv.com</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <MapPin className="h-5 w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t('address')}</div>
                  <div className="mt-1 text-gray-600">{t('addressText')}</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="aspect-video overflow-hidden rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4648712934485!2d106.7497269!3d10.8070702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175266a1a196d79%3A0x3ce72ceea3523a9f!2s2A%20%C4%90%C6%B0%E1%BB%9Dng%20S%E1%BB%91%205%2C%20An%20Ph%C3%BA%2C%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vi%E1%BB%87t%20Nam!5e0!3m2!1sen!2s!4v1649299914899!5m2!1sen!2s"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
