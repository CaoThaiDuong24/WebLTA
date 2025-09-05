"use client"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Youtube, MessageCircle, Linkedin, Send } from "lucide-react"
import { useInView } from "framer-motion"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
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
    <footer
      ref={ref}
      className="bg-[#171c26] text-white py-12"
      style={{
        transform: isInView ? "none" : "translateY(20px)",
        opacity: isInView ? 1 : 0,
        transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
      }}
    >
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <a
              href="#hero"
              className="flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection("hero")
              }}
            >
              <Image src="/logo.png" alt="LTA Logo" width={180} height={60} className="h-12 w-auto" />
            </a>
            <p className="mt-4 text-gray-400">
              {t('footerDescription')}
            </p>
            <div className="mt-6 flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10 hover:text-white"
                onClick={() => window.open("https://www.facebook.com/logisticstechnologyapplication/?ref=embed_page#", "_blank")}
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-white/10 hover:text-white"
                onClick={() => window.open("https://www.youtube.com/@ltacompany", "_blank")}
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-white/10 hover:text-white"
                onClick={() => window.open("https://zalo.me/ltacompany", "_blank")}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Chat</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-white/10 hover:text-white"
                onClick={() => window.open("https://www.linkedin.com/company/lta-company", "_blank")}
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('solutions')}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#solutions"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("solutions")
                  }}
                >
                  {t('iSuperApp')}
                </a>
              </li>
              <li>
                <a
                  href="#solutions"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("solutions")
                  }}
                >
                  {t('depotManagement')}
                </a>
              </li>
              <li>
                <a
                  href="#solutions"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("solutions")
                  }}
                >
                  {t('transportManagement')}
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("features")
                  }}
                >
                  {t('otherApps')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('links')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 transition-colors hover:text-white">
                  {t('home')}
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("features")
                  }}
                >
                  {t('about')}
                </a>
              </li>
              <li>
                <Link href="/tin-tuc" className="text-gray-400 transition-colors hover:text-white">
                  {t('news')}
                </Link>
              </li>
              <li>
                <a 
                  href="/tuyen-dung" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {t('recruitment')}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("contact")
                  }}
                >
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('newsletter')}</h3>
            <p className="text-gray-400 mb-4">
              {t('newsletterDescription')}
            </p>
            <form className="flex">
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="rounded-r-none bg-[#1e2430] border-[#2a3040] focus:border-[#4CAF50] text-white"
              />
              <Button type="submit" className="rounded-l-none group bg-[#4CAF50] hover:bg-[#45a049]">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-[#2a3040] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} LTA. {t('copyright')}</p>
            <div className="flex space-x-6">
              <Link href="/chinh-sach-faq" className="text-sm text-gray-400 hover:text-white">
                {t('privacyFaq')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
