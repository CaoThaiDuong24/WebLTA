"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/hooks/use-translation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()

  // Set active menu based on current page and scroll position
  useEffect(() => {
    if (pathname === "/tin-tuc") {
      setActiveMenu("tin-tuc")
    } else if (pathname === "/") {
      setActiveMenu("hero") // Default to hero on homepage
    }
  }, [pathname])

  // Scroll listener to detect active section
  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== "/") return // Only track scroll on homepage

      const scrollPosition = window.scrollY + 150 // Offset for header

      // Check individual solution sections first (they are nested within solutions section)
      const solutionSections = ["i-superapp", "depot-management", "transport-management"]
      for (let i = solutionSections.length - 1; i >= 0; i--) {
        const section = document.getElementById(solutionSections[i])
        if (section) {
          const sectionTop = section.offsetTop
          const sectionBottom = sectionTop + section.offsetHeight
          if (scrollPosition >= sectionTop - 200 && scrollPosition < sectionBottom + 200) {
            setActiveMenu(solutionSections[i])
            return
          }
        }
      }

      // Check main sections
      const mainSections = ["hero", "features", "stats", "testimonials", "contact"]
      for (let i = mainSections.length - 1; i >= 0; i--) {
        const section = document.getElementById(mainSections[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveMenu(mainSections[i])
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call once to set initial state
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleDownload = () => {
    window.open("https://cloud.ltacv.com/s/kkggMFSfKZtoTi6/download/i-SuperApp@LTA.apk", "_blank")
  }

  const scrollToSection = (sectionId: string) => {
    // Set the active menu immediately
    setActiveMenu(sectionId)

    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }

    // If we're not on the homepage, navigate to homepage first
    if (pathname !== "/") {
      router.push("/")

      // Need to wait for navigation to complete before scrolling
      setTimeout(() => {
        const section = document.getElementById(sectionId)
        if (section) {
          const headerOffset = 100
          const elementPosition = section.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          })
          
          // Ensure active menu stays set after scroll
          setTimeout(() => setActiveMenu(sectionId), 100)
        }
      }, 300) // Delay to allow for page navigation
    } else {
      // If already on homepage, just scroll
      const section = document.getElementById(sectionId)
      if (section) {
        const headerOffset = 100
        const elementPosition = section.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
        
        // Ensure active menu stays set after scroll
        setTimeout(() => setActiveMenu(sectionId), 100)
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="LTA Logo" width={180} height={60} className="h-12 w-auto" />
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              activeMenu === "hero" ? "text-[#4CAF50] font-bold text-base scale-110 transform" : ""
            }`}
            onClick={(e) => {
              e.preventDefault()
              setActiveMenu("hero")
              scrollToSection("hero")
            }}
          >
            {t('home')}
          </Link>
          <Link
            href="#"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              activeMenu === "i-superapp" ? "text-[#4CAF50] font-bold text-base scale-110 transform" : ""
            }`}
            onClick={(e) => {
              e.preventDefault()
              setActiveMenu("i-superapp")
              scrollToSection("i-superapp")
            }}
          >
            {t('iSuperApp')}
          </Link>
          <Link
            href="#"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              activeMenu === "depot-management" ? "text-[#4CAF50] font-bold text-base scale-110 transform" : ""
            }`}
            onClick={(e) => {
              e.preventDefault()
              setActiveMenu("depot-management")
              scrollToSection("depot-management")
            }}
          >
            {t('depotManagement')}
          </Link>
          <Link
            href="#"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              activeMenu === "transport-management" ? "text-[#4CAF50] font-bold text-base scale-110 transform" : ""
            }`}
            onClick={(e) => {
              e.preventDefault()
              setActiveMenu("transport-management")
              scrollToSection("transport-management")
            }}
          >
            {t('transportManagement')}
          </Link>
          <Link
            href="/"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              activeMenu === "features" ? "text-[#4CAF50] font-bold text-base scale-110 transform" : ""
            }`}
            onClick={(e) => {
              e.preventDefault()
              setActiveMenu("features")
              scrollToSection("features")
            }}
          >
            {t('otherApps')}
          </Link>
          <Link
            href="/tin-tuc"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              activeMenu === "tin-tuc" ? "text-[#4CAF50] font-bold text-base scale-110 transform" : ""
            }`}
            onClick={() => setActiveMenu("tin-tuc")}
          >
            {t('news')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button className="hidden md:inline-flex bg-[#4CAF50] hover:bg-[#45a049]" onClick={handleDownload}>
            {t('download')}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <div className="container space-y-4 pb-6 bg-white">
              <Link
                href="#"
                className={`block py-2 text-base font-medium transition-all duration-200 hover:text-primary ${
                  activeMenu === "hero" ? "text-[#4CAF50] font-bold text-lg scale-105 transform" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveMenu("hero")
                  scrollToSection("hero")
                }}
              >
                {t('home')}
              </Link>
              <Link
                href="#"
                className={`block py-2 text-base font-medium transition-all duration-200 hover:text-primary ${
                  activeMenu === "i-superapp" ? "text-[#4CAF50] font-bold text-lg scale-105 transform" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveMenu("i-superapp")
                  scrollToSection("i-superapp")
                }}
              >
                {t('iSuperApp')}
              </Link>
              <Link
                href="#"
                className={`block py-2 text-base font-medium transition-all duration-200 hover:text-primary ${
                  activeMenu === "depot-management" ? "text-[#4CAF50] font-bold text-lg scale-105 transform" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveMenu("depot-management")
                  scrollToSection("depot-management")
                }}
              >
                {t('depotManagement')}
              </Link>
              <Link
                href="#"
                className={`block py-2 text-base font-medium transition-all duration-200 hover:text-primary ${
                  activeMenu === "transport-management" ? "text-[#4CAF50] font-bold text-lg scale-105 transform" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveMenu("transport-management")
                  scrollToSection("transport-management")
                }}
              >
                {t('transportManagement')}
              </Link>
              <Link
                href="/"
                className={`block py-2 text-base font-medium transition-all duration-200 hover:text-primary ${
                  activeMenu === "features" ? "text-[#4CAF50] font-bold text-lg scale-105 transform" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveMenu("features")
                  scrollToSection("features")
                }}
              >
                {t('otherApps')}
              </Link>
              <Link
                href="/tin-tuc"
                className={`block py-2 text-base font-medium transition-all duration-200 hover:text-primary ${
                  activeMenu === "tin-tuc" ? "text-[#4CAF50] font-bold text-lg scale-105 transform" : ""
                }`}
                onClick={() => setActiveMenu("tin-tuc")}
              >
                {t('news')}
              </Link>
              <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049]" onClick={handleDownload}>
                {t('download')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
