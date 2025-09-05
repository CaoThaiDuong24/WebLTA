'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, X, Send, Phone, Mail, Clock, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import contactInfo from '@/data/contact-info.json'

interface ZaloChatBoxProps {
  zaloId?: string
  phoneNumber?: string
  className?: string
}

export function ZaloChatBox({ 
  zaloId = contactInfo.zaloId, 
  phoneNumber = contactInfo.phoneNumber,
  className 
}: ZaloChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Hiển thị chat box sau 2 giây
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Thêm hiệu ứng pulse cho floating button
  const [isPulsing, setIsPulsing] = useState(false)
  
  useEffect(() => {
    if (isVisible && !isOpen) {
      const pulseTimer = setTimeout(() => {
        setIsPulsing(true)
      }, 3000)
      
      return () => clearTimeout(pulseTimer)
    }
  }, [isVisible, isOpen])

  const handleZaloChat = () => {
    // Mở Zalo chat với OA của LTA
    const zaloUrl = `https://zalo.me/${zaloId}`
    window.open(zaloUrl, '_blank')
  }

  const handlePhoneCall = () => {
    // Gọi điện thoại
    window.open(`tel:${phoneNumber}`, '_self')
  }

  const handleEmail = () => {
    // Gửi email
    window.open(`mailto:${contactInfo.email}`, '_self')
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  if (!isVisible) return null

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6", className)}>
      {/* Chat Box */}
      {isOpen && (
        <Card className={cn(
          "w-[320px] sm:w-80 md:w-96 shadow-2xl border-2 border-primary/20 transition-all duration-300 ease-in-out",
          isMinimized ? "h-12" : "h-96 md:h-[420px]",
          "animate-in slide-in-from-bottom-4 duration-300"
        )}>
          <CardContent className="p-0 h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                {!isMinimized && (
                  <div>
                    <h3 className="font-semibold text-sm">Hỗ trợ khách hàng</h3>
                    <p className="text-xs opacity-90">{contactInfo.companyName}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isMinimized ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20 transition-colors"
                    onClick={() => setIsMinimized(false)}
                    title="Mở rộng chat"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20 transition-colors"
                    onClick={minimizeChat}
                  >
                    <span className="text-xs">−</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20 transition-colors"
                  onClick={toggleChat}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="p-4 h-full flex flex-col">
                {/* Welcome Message */}
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-4 border border-primary/20">
                    <p className="text-sm text-gray-700 font-medium">
                      🚛 Xin chào! Chào mừng bạn đến với LTA
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Giải pháp logistics thông minh - Hỗ trợ 24/7
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 text-center font-medium">
                      Chọn cách liên hệ phù hợp với bạn:
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-auto">
                  <Button
                    onClick={handleZaloChat}
                    className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Zalo OA
                  </Button>
                  
                  <Button
                    onClick={handlePhoneCall}
                    variant="outline"
                    className="w-full border-secondary text-secondary hover:bg-secondary/5 transition-all duration-200 hover:scale-105"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi điện: {phoneNumber}
                  </Button>

                  <Button
                    onClick={handleEmail}
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Gửi email
                  </Button>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Thời gian phản hồi: {contactInfo.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <span>{contactInfo.workingHours}</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    {contactInfo.address}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-2 border-white transition-all duration-200 hover:scale-110",
          isOpen && "hidden",
          "animate-in slide-in-from-bottom-4 duration-300",
          isPulsing && "animate-pulse"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  )
}
