"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Zap, BarChart3, TrendingUp } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
    <section id="hero" className="relative overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 z-0">
        <Image src="/hero-logistics.jpg" alt="Logistics ship with containers" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      </div>

      {/* Animated tech overlay */}
      <div className="absolute inset-0 z-10 opacity-30">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1920 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white/20"
        >
          <motion.circle
            cx="960"
            cy="540"
            r="400"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10 5"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M200,200 L1720,200 L1720,880 L200,880 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isVisible ? 1 : 0 }}
            transition={{ duration: 2, delay: 0.2 }}
          />
          <motion.path
            d="M300,300 L1620,300 L1620,780 L300,780 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isVisible ? 1 : 0 }}
            transition={{ duration: 2, delay: 0.4 }}
          />
        </svg>
      </div>

      {/* Content - Adjusted to be higher on the page */}
      <div className="container relative z-20 pt-20 pb-32 md:pt-24 md:pb-40 lg:pt-28 lg:pb-48 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">{t('heroTitle')}</h1>
            <p className="mt-4 text-2xl font-semibold text-white md:text-3xl lg:text-4xl leading-tight">
              {t('heroSubtitle')}
            </p>
            <p className="mt-6 max-w-xl text-lg text-gray-300">
              {t('heroDescription')}
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="rounded-full bg-[#4CAF50] text-white hover:bg-[#45a049] group"
              onClick={() =>
                window.open("https://cloud.ltacv.com/s/kkggMFSfKZtoTi6/download/i-SuperApp@LTA.apk", "_blank")
              }
            >
              {t('downloadApp')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full bg-white border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50]/10"
              onClick={() => window.open("https://zalo.me/ltacompany", "_blank")}
            >
              {t('contactZalo')}
            </Button>
          </motion.div>

          {/* Stats - Adjusted to be closer to the buttons */}
          <motion.div
            className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4CAF50]/20">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-300">{t('optimizeCost')}</div>
                <div className="text-xl font-bold text-white">{t('costReduction')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4CAF50]/20">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-300">{t('customers')}</div>
                <div className="text-xl font-bold text-white">{t('customerCount')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4CAF50]/20">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-300">{t('performance')}</div>
                <div className="text-xl font-bold text-white">{t('performanceIncrease')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  )
}
