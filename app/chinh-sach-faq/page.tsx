"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Shield,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Clock,
  Award,
  PhoneCall,
  Mail,
} from "lucide-react"
import Image from "next/image"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"

export default function PoliciesAndFAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const contentRef = useRef(null)
  const isInView = useInView(contentRef, { once: true, amount: 0.2 })
  const { t } = useTranslation()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real application, this would filter the FAQs
    console.log("Searching for:", searchQuery)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Parallax Effect */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#1e293b] min-h-[85vh] flex items-center py-20 md:py-24 lg:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
              alt="Background Pattern"
              fill
              className="object-cover"
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-[10%] h-20 w-20 rounded-full bg-[#4CAF50]/20 blur-xl"></div>
            <div className="absolute bottom-10 right-[15%] h-32 w-32 rounded-full bg-blue-500/20 blur-xl"></div>
            <div className="absolute top-1/3 right-[20%] h-16 w-16 rounded-full bg-purple-500/20 blur-xl"></div>
          </div>

          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-[#4CAF50]/10 px-4 py-1 text-sm font-medium text-[#4CAF50] backdrop-blur-sm">
                {t('contactSupport')}
              </div>
              <h1 className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {t('policiesAndFAQ')}
              </h1>
              <p className="mt-8 text-base md:text-lg text-gray-300">
                {t('policiesAndFAQDesc')}
              </p>
            </div>

            {/* Search Bar with Glassmorphism */}
            <div className="mx-auto mt-12 md:mt-16 max-w-xl">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                  <Input
                    type="text"
                    placeholder={t('searchQuestions')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base"
                  />
                  <Button
                    type="submit"
                    className="rounded-l-none border-0 bg-[#4CAF50] px-4 md:px-6 hover:bg-[#45a049]"
                    size="lg"
                  >
                    <Search className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="ml-2 text-sm md:text-base">{t('searchButton')}</span>
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="text-xs text-gray-400">{t('popularKeywords')}</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-[#4CAF50]"
                    onClick={() => setSearchQuery("vận chuyển")}
                  >
                    vận chuyển
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-[#4CAF50]"
                    onClick={() => setSearchQuery("container")}
                  >
                    container
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-[#4CAF50]"
                    onClick={() => setSearchQuery("logistics")}
                  >
                    logistics
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
              <path
                fill="#f8fafc"
                fillOpacity="1"
                d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-slate-50 py-12">
          <div className="container">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <HelpCircle className="h-7 w-7 text-[#4CAF50]" />
                </div>
                <div className="mt-4 text-3xl font-bold">24/7</div>
                <div className="mt-2 text-sm text-gray-500">{t('customerSupport')}</div>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <Shield className="h-7 w-7 text-[#4CAF50]" />
                </div>
                <div className="mt-4 text-3xl font-bold">100%</div>
                <div className="mt-2 text-sm text-gray-500">{t('dataSecurity')}</div>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <CheckCircle className="h-7 w-7 text-[#4CAF50]" />
                </div>
                <div className="mt-4 text-3xl font-bold">500+</div>
                <div className="mt-2 text-sm text-gray-500">{t('trustedCustomers')}</div>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <FileText className="h-7 w-7 text-[#4CAF50]" />
                </div>
                <div className="mt-4 text-3xl font-bold">50+</div>
                <div className="mt-2 text-sm text-gray-500">{t('frequentlyAskedQuestions')}</div>
              </div>
            </div>
          </div>
        </section>

        <div
          ref={contentRef}
          className="container py-16"
          style={{
            transform: isInView ? "none" : "translateY(50px)",
            opacity: isInView ? 1 : 0,
            transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
          }}
        >
          {/* Main Content with Tabs */}
          <div className="mx-auto max-w-5xl">
            <Tabs defaultValue="faq" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 h-auto min-h-[70px] bg-gray-100 p-3 gap-2">
                <TabsTrigger value="faq" className="text-base py-5 px-6 h-auto min-h-[60px] flex items-center justify-center text-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white data-[state=active]:border-[#4CAF50] transition-all duration-200">
                  <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="whitespace-normal font-medium">{t('frequentlyAskedQuestions')}</span>
                </TabsTrigger>
                <TabsTrigger value="policies" className="text-base py-5 px-6 h-auto min-h-[60px] flex items-center justify-center text-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white data-[state=active]:border-[#4CAF50] transition-all duration-200">
                  <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="whitespace-normal font-medium">{t('policies')}</span>
                </TabsTrigger>
              </TabsList>

              {/* FAQs Content */}
              <TabsContent value="faq">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* Left Column - Image */}
                  <div className="hidden lg:block">
                    <div className="sticky top-24">
                      <div className="relative h-[500px] w-full overflow-hidden rounded-2xl">
                        <Image
                          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                          alt="FAQ Illustration"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-6 rounded-xl bg-[#4CAF50]/5 p-6">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900">
                          <AlertCircle className="mr-2 h-5 w-5 text-[#4CAF50]" />
                          {t('needMoreSupport')}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {t('ifYouCantFindAnswer')}
                        </p>
                        <Button
                          className="mt-4 w-full bg-[#4CAF50] hover:bg-[#45a049]"
                          onClick={() => (window.location.href = "/lien-he")}
                        >
                          {t('contactSupport')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - FAQs */}
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl bg-white p-8 shadow-sm">
                      <h2 className="text-2xl font-bold text-gray-900">{t('frequentlyAskedQuestions')}</h2>
                      <p className="mt-2 text-gray-600">
                        {t('findAnswersToMostCommonQuestions')}
                      </p>

                      <div className="mt-8 space-y-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              {t('howToDownloadApp')}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p>
                                    {t('downloadAppDescription')}
                                  </p>
                                  <div className="mt-4 flex flex-wrap gap-4">
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-2 border-[#4CAF50] text-[#4CAF50]"
                                      onClick={() => window.open("https://play.google.com/store/apps/details?id=com.lta.iedepotsuperapp&hl=vi", "_blank")}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-play"
                                      >
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                      </svg>
                                      Google Play
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-2 border-[#4CAF50] text-[#4CAF50]"
                                      onClick={() => window.open("https://apps.apple.com/vn/app/i-superapp-lta/id1578865513?l=vi", "_blank")}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-apple"
                                      >
                                        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                                        <path d="M10 2c1 .5 2 2 2 5"></path>
                                      </svg>
                                      App Store
                                    </Button>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Tải ứng dụng"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              {t('howToRegister')}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p>
                                    {t('registerAccountDescription')}
                                  </p>
                                  <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/10 text-xs font-bold text-[#4CAF50]">
                                        1
                                      </div>
                                      <span>{t('openApp')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/10 text-xs font-bold text-[#4CAF50]">
                                        2
                                      </div>
                                      <span>{t('enterPersonalInfo')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/10 text-xs font-bold text-[#4CAF50]">
                                        3
                                      </div>
                                      <span>{t('verifyEmailOrPhone')}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Đăng ký tài khoản"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              {t('howToDeposit')}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p>
                                    {t('depositDescription')}
                                  </p>
                                  <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="rounded-lg border border-gray-200 p-3 text-center">
                                      <CreditCard className="mx-auto h-6 w-6 text-[#4CAF50]" />
                                      <div className="mt-2 text-sm font-medium">{t('bankCard')}</div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-3 text-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mx-auto h-6 w-6 text-[#4CAF50]"
                                      >
                                        <rect width="20" height="14" x="2" y="5" rx="2" />
                                        <line x1="2" x2="22" y1="10" y2="10" />
                                      </svg>
                                      <div className="mt-2 text-sm font-medium">{t('bankTransfer')}</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Nạp tiền"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              {t('howToTrackContainer')}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p>
                                    {t('trackContainerDescription')}
                                  </p>
                                  <div className="mt-4 rounded-lg bg-[#4CAF50]/5 p-4">
                                    <div className="font-medium text-gray-900">{t('trackingFeatures')}</div>
                                    <ul className="mt-2 space-y-1 text-sm">
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                                        <span>{t('realTimeLocation')}</span>
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                                        <span>{t('containerStatus')}</span>
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                                        <span>{t('shippingHistory')}</span>
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                                        <span>{t('automaticNotification')}</span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Theo dõi container"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              {t('howToContactSupport')}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p>
                                    {t('contactSupportDescription')}
                                  </p>
                                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Button
                                      variant="outline"
                                      className="justify-start border-[#4CAF50] text-[#4CAF50]"
                                      onClick={() => (window.location.href = "tel:0886116668")}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-2"
                                      >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                      </svg>
                                      {t('call')}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="justify-start border-[#4CAF50] text-[#4CAF50]"
                                      onClick={() => (window.location.href = "mailto:info@ltacv.com")}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-2"
                                      >
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                      </svg>
                                      {t('email')}
                                    </Button>
                                    <Button variant="outline" className="justify-start border-[#4CAF50] text-[#4CAF50]">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-2"
                                      >
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        <path d="M12 7v.01" />
                                        <path d="M16 11v.01" />
                                        <path d="M8 11v.01" />
                                      </svg>
                                      {t('chat')}
                                    </Button>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Hỗ trợ kỹ thuật"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              {t('howToOptimizeRoute')}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p>
                                    {t('optimizeRouteDescription')}
                                  </p>
                                  <div className="mt-4 overflow-hidden rounded-lg bg-[#4CAF50]/5 p-4">
                                    <div className="font-medium text-gray-900">{t('benefitsOfOptimizingRoute')}</div>
                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M12 2v20" />
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                          </svg>
                                        </div>
                                        <span className="text-sm">{t('savingCost')}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <Clock className="h-4 w-4 text-[#4CAF50]" />
                                        </div>
                                        <span className="text-sm">{t('reducingTime')}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M3 3v18h18" />
                                            <path d="m19 9-5 5-4-4-3 3" />
                                          </svg>
                                        </div>
                                        <span className="text-sm">{t('increasingEfficiency')}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 0-1-1.73V4a2 2 0 0 0-2-2z" />
                                            <circle cx="12" cy="12" r="3" />
                                          </svg>
                                        </div>
                                        <span className="text-sm">{t('fineTuningProcess')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Tối ưu hóa lộ trình"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="item-7" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              {t('howToViewReports')}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p>
                                    {t('viewReportsDescription')}
                                  </p>
                                  <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                    <div className="font-medium text-gray-900">{t('availableReports')}</div>
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                      <div className="flex items-center gap-2 rounded-md bg-[#4CAF50]/5 p-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-[#4CAF50]"
                                        >
                                          <path d="M3 3v18h18" />
                                          <path d="m19 9-5 5-4-4-3 3" />
                                        </svg>
                                        <span className="text-sm">{t('transportEfficiency')}</span>
                                      </div>
                                      <div className="flex items-center gap-2 rounded-md bg-[#4CAF50]/5 p-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-[#4CAF50]"
                                        >
                                          <path d="M12 2v20" />
                                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                        </svg>
                                        <span className="text-sm">{t('operatingCost')}</span>
                                      </div>
                                      <div className="flex items-center gap-2 rounded-md bg-[#4CAF50]/5 p-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-[#4CAF50]"
                                        >
                                          <rect width="18" height="18" x="3" y="3" rx="2" />
                                          <path d="M3 9h18" />
                                          <path d="M9 21V9" />
                                        </svg>
                                        <span className="text-sm">{t('containerManagement')}</span>
                                      </div>
                                      <div className="flex items-center gap-2 rounded-md bg-[#4CAF50]/5 p-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-[#4CAF50]"
                                        >
                                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                          <circle cx="9" cy="7" r="4" />
                                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        <span className="text-sm">{t('employeeEfficiency')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Báo cáo hoạt động"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      {/* Mobile Support Box */}
                      <div className="mt-8 rounded-xl bg-[#4CAF50]/5 p-6 lg:hidden">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900">
                          <AlertCircle className="mr-2 h-5 w-5 text-[#4CAF50]" />
                          {t('needMoreSupport')}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {t('ifYouCantFindAnswer')}
                        </p>
                        <Button
                          className="mt-4 w-full bg-[#4CAF50] hover:bg-[#45a049]"
                          onClick={() => (window.location.href = "/lien-he")}
                        >
                          {t('contactSupport')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Policies Content */}
              <TabsContent value="policies">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* Left Column - Image */}
                  <div className="hidden lg:block">
                    <div className="sticky top-24">
                      <div className="relative h-[500px] w-full overflow-hidden rounded-2xl">
                        <Image
                          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                          alt="Policy Illustration"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-6 rounded-xl bg-[#4CAF50]/5 p-6">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900">
                          <Shield className="mr-2 h-5 w-5 text-[#4CAF50]" />
                          {t('ourCommitment')}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {t('weCommitToProtect')}
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                            <span className="text-sm text-gray-600">{t('privacyProtection')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                            <span className="text-sm text-gray-600">{t('priceTransparency')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                            <span className="text-sm text-gray-600">{t('247Support')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Policies */}
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl bg-white p-8 shadow-sm">
                      <h2 className="text-2xl font-bold text-gray-900">{t('policies')}</h2>
                      <p className="mt-2 text-gray-600">
                        {t('learnAboutOurPolicies')}
                      </p>

                      <div className="mt-8 space-y-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="policy-1" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              <div className="flex items-center">
                                <Shield className="mr-3 h-5 w-5 text-[#4CAF50]" />
                                {t('privacyPolicy')}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p className="mb-4">
                                    {t('ltaCommitmentToPrivacy')}
                                  </p>
                                  <div className="space-y-4">
                                    <div className="rounded-lg bg-[#4CAF50]/5 p-4">
                                      <h4 className="font-medium text-gray-900">{t('gatheringInformation')}</h4>
                                      <p className="mt-1 text-sm">
                                        {t('weOnlyCollectNecessaryInfo')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-[#4CAF50]/5 p-4">
                                      <h4 className="font-medium text-gray-900">{t('usingInformation')}</h4>
                                      <p className="mt-1 text-sm">
                                        {t('yourInfoIsUsedFor')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-[#4CAF50]/5 p-4">
                                      <h4 className="font-medium text-gray-900">{t('protectingInformation')}</h4>
                                      <p className="mt-1 text-sm">
                                        {t('weApplyAdvancedSecurity')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-[#4CAF50]/5 p-4">
                                      <h4 className="font-medium text-gray-900">{t('sharingInformation')}</h4>
                                      <p className="mt-1 text-sm">
                                        {t('weDoNotSharePersonalInfo')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Bảo mật thông tin"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="policy-2" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              <div className="flex items-center">
                                <CreditCard className="mr-3 h-5 w-5 text-[#4CAF50]" />
                                {t('paymentPolicy')}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p className="mb-4">
                                    {t('ltaProvidesMultiplePaymentMethods')}
                                  </p>
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <rect width="20" height="14" x="2" y="5" rx="2" />
                                            <line x1="2" x2="22" y1="10" y2="10" />
                                          </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900">{t('bankCard')}</h4>
                                      </div>
                                      <p className="mt-2 text-sm">
                                        {t('acceptVisaMastercardJCB')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                            <path d="M3 6h18" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                          </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900">{t('bankTransfer')}</h4>
                                      </div>
                                      <p className="mt-2 text-sm">
                                        {t('directTransferToLtaAccount')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <rect width="20" height="12" x="2" y="6" rx="2" />
                                            <circle cx="12" cy="12" r="2" />
                                            <path d="M6 12h.01M18 12h.01" />
                                          </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900">{t('electronicWallet')}</h4>
                                      </div>
                                      <p className="mt-2 text-sm">
                                        {t('supportPopularEWallets')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                                            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                                            <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                                          </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900">{t('oneStopFunds')}</h4>
                                      </div>
                                      <p className="mt-2 text-sm">
                                        {t('directPaymentFromOneStopFunds')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-4 rounded-lg bg-[#4CAF50]/5 p-4">
                                    <h4 className="font-medium text-gray-900">{t('importantNotes')}</h4>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                                      <li>{t('allTransactionsAreEncrypted')}</li>
                                      <li>{t('customersWillReceiveElectronicInvoices')}</li>
                                      <li>
                                        {t('transactionProcessingTimeMayDiffer')}
                                      </li>
                                      <li>{t('pleaseContactSupport')}</li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Phương thức thanh toán"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="policy-3" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-3 text-[#4CAF50]"
                                >
                                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                                </svg>
                                {t('minimumBalancePolicy')}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p className="mb-4">
                                    {t('toEnsureContinuousService')}
                                  </p>
                                  <div className="rounded-lg bg-[#4CAF50]/5 p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="text-xl font-bold text-gray-900">{t('minimumBalance')}</div>
                                      <div className="text-2xl font-bold text-[#4CAF50]">500.000 VNĐ</div>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/20 mt-0.5">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{t('automaticNotification')}</div>
                                          <p className="text-sm">
                                            {t('whenBalanceDropsBelowMinimum')}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/20 mt-0.5">
                                          <Award className="h-3.5 w-3.5 text-[#4CAF50]" />
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{t('specialBenefits')}</div>
                                          <p className="text-sm">
                                            {t('customersMaintainingBalanceAboveMinimum')}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/20 mt-0.5">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{t('automaticTopUp')}</div>
                                          <p className="text-sm">
                                            {t('youCanSetUpAutomaticTopUp')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900">{t('prepaymentProgram')}</h4>
                                    <p className="mt-2 text-sm">
                                      {t('customersPrepayingLargeAmounts')}
                                    </p>
                                    <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">
                                              {t('depositAmount')}
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">{t('benefits')}</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          <tr>
                                            <td className="px-4 py-2">5.000.000 VNĐ</td>
                                            <td className="px-4 py-2">{t('add2PercentValue')}</td>
                                          </tr>
                                          <tr>
                                            <td className="px-4 py-2">10.000.000 VNĐ</td>
                                            <td className="px-4 py-2">{t('add5PercentValue')}</td>
                                          </tr>
                                          <tr>
                                            <td className="px-4 py-2">20.000.000 VNĐ</td>
                                            <td className="px-4 py-2">{t('add8PercentValue')}</td>
                                          </tr>
                                          <tr>
                                            <td className="px-4 py-2">50.000.000 VNĐ</td>
                                            <td className="px-4 py-2">{t('add10PercentValue')}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Quản lý số dư"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="policy-4" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-3 text-[#4CAF50]"
                                >
                                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                  <path d="M3 3v5h5" />
                                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                  <path d="M16 16h5v5" />
                                </svg>
                                {t('refundAndCancellationPolicy')}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p className="mb-4">
                                    {t('ltaCommitmentToCustomerRights')}
                                  </p>
                                  <div className="space-y-4">
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{t('cancelBefore24Hours')}</h4>
                                          <p className="mt-1 text-sm">
                                            {t('refund100PercentIfCancelledBefore24Hours')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{t('cancelBetween12And24Hours')}</h4>
                                          <p className="mt-1 text-sm">
                                            {t('refund50PercentIfCancelledBetween12And24Hours')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{t('cancelWithin12Hours')}</h4>
                                          <p className="mt-1 text-sm">
                                            {t('noRefundIfCancelledWithin12Hours')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/10">
                                          <AlertCircle className="h-5 w-5 text-[#4CAF50]" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{t('ltAFault')}</h4>
                                          <p className="mt-1 text-sm">
                                            {t('refund100PercentIfServiceNotProvidedDueToLtaError')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-4 rounded-lg bg-[#4CAF50]/5 p-4">
                                    <h4 className="font-medium text-gray-900">{t('refundProcess')}</h4>
                                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                                      <li>{t('requestRefund')}</li>
                                      <li>{t('provideTransactionDetails')}</li>
                                      <li>{t('requestWillBeReviewed')}</li>
                                      <li>
                                        {t('ifApproved')}
                                      </li>
                                    </ol>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Chính sách hoàn tiền"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="policy-5" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-3 text-[#4CAF50]"
                                >
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                  <path d="M9.1 12a2.1 2.1 0 0 1 0-3 2.1 2.1 0 0 1 3 0 2.1 2.1 0 0 1 0 3" />
                                  <path d="M9.1 12h3" />
                                </svg>
                                {t('maintenanceAndSystemUpdatePolicy')}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p className="mb-4">
                                    {t('toEnsureSystemStabilityAndSafety')}
                                  </p>
                                  <div className="space-y-4">
                                    <div className="rounded-lg bg-[#4CAF50]/5 p-4">
                                      <h4 className="font-medium text-gray-900">{t('scheduledMaintenance')}</h4>
                                      <p className="mt-1 text-sm">
                                        {t('scheduledMaintenanceDescription')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-[#4CAF50]/5 p-4">
                                      <h4 className="font-medium text-gray-900">{t('systemUpdates')}</h4>
                                      <p className="mt-1 text-sm">
                                        {t('systemUpdatesDescription')}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-[#4CAF50]/5 p-4">
                                      <h4 className="font-medium text-gray-900">{t('emergencyMaintenance')}</h4>
                                      <p className="mt-1 text-sm">
                                        {t('emergencyMaintenanceDescription')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                    <h4 className="font-medium text-gray-900">{t('ourCommitment')}</h4>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                                      <li>{t('notificationAboutMaintenance')}</li>
                                      <li>{t('maintenanceWithinMinimalImpact')}</li>
                                      <li>{t('minimizingDowntime')}</li>
                                      <li>{t('technicalSupport247')}</li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Bảo trì hệ thống"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="policy-6" className="border border-gray-200 rounded-lg px-6 mb-4">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                              <div className="flex items-center">
                                <Award className="mr-3 h-5 w-5 text-[#4CAF50]" />
                                {t('pointsAndRewardsPolicy')}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pb-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <p className="mb-4">
                                    {t('ltaImplementsPointsProgram')}
                                  </p>
                                  <div className="rounded-lg bg-[#4CAF50]/5 p-6">
                                    <h4 className="font-medium text-gray-900">{t('earningPoints')}</h4>
                                    <div className="mt-4 space-y-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/20 mt-0.5">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M12 2v20" />
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{t('earningPointsBySpending')}</div>
                                          <p className="text-sm">
                                            {t('earn1PointForEvery10000VND')}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/20 mt-0.5">
                                          <Clock className="h-3.5 w-3.5 text-[#4CAF50]" />
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{t('pointExpiration')}</div>
                                          <p className="text-sm">
                                            {t('rewardPointsValidFor12Months')}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/20 mt-0.5">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#4CAF50]"
                                          >
                                            <path d="M20 16.2A8 8 0 0 1 4 16.2" />
                                            <path d="M23 19a4 4 0 0 1-8 0" />
                                            <path d="M4 19a4 4 0 0 1-1-7.8" />
                                            <path d="M12 12l9-3" />
                                            <path d="M9 7l1 9" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{t('pointRedemption')}</div>
                                          <p className="text-sm">
                                            {t('redeemPointsForBenefits')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900">{t('membershipLevels')}</h4>
                                    <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">{t('level')}</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">{t('conditions')}</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">{t('privileges')}</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          <tr>
                                            <td className="px-4 py-2">
                                              <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                                                <span>{t('silver')}</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-2">{t('zeroTo500Points')}</td>
                                            <td className="px-4 py-2">{t('basicPoints')}</td>
                                          </tr>
                                          <tr>
                                            <td className="px-4 py-2">
                                              <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-yellow-400"></div>
                                                <span>{t('gold')}</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-2">{t('fiveHundredOneToThousandPoints')}</td>
                                            <td className="px-4 py-2">
                                              {t('pointsMultiplier')}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td className="px-4 py-2">
                                              <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-blue-400"></div>
                                                <span>{t('platinum')}</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-2">{t('thousandOnePlusPoints')}</td>
                                            <td className="px-4 py-2">
                                              {t('prioritySupport')}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                  <div className="mt-4 rounded-lg bg-[#4CAF50]/5 p-4">
                                    <p className="text-sm">
                                      Chi tiết chương trình tích điểm và ưu đãi được cập nhật thường xuyên trong ứng
                                      dụng. Vui lòng kiểm tra phần "Ưu đãi" trong ứng dụng i-SuperApp@LTA để biết thêm
                                      thông tin.
                                    </p>
                                  </div>
                                </div>
                                <div className="md:w-1/3 flex justify-center">
                                  <div className="relative h-32 w-32">
                                    <Image
                                      src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80"
                                      alt="Chương trình tích điểm"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      {/* Mobile Support Box */}
                      <div className="mt-8 rounded-xl bg-[#4CAF50]/5 p-6 lg:hidden">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900">
                          <Shield className="mr-2 h-5 w-5 text-[#4CAF50]" />
                          Cam kết của chúng tôi
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          Chúng tôi cam kết bảo vệ quyền lợi của khách hàng và cung cấp dịch vụ chất lượng cao với sự
                          minh bạch tuyệt đối.
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                            <span className="text-sm text-gray-600">{t('privacyProtection')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                            <span className="text-sm text-gray-600">{t('priceTransparency')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#4CAF50]" />
                            <span className="text-sm text-gray-600">{t('247Support')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Contact Section */}
          <div className="mx-auto mt-16 max-w-5xl rounded-2xl bg-gradient-to-r from-[#4CAF50]/10 to-[#4CAF50]/5 p-8 shadow-sm">
                          <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('stillHaveQuestions')}</h2>
                <p className="mt-2 text-gray-600">
                  {t('ifYouCantFindAnswer')}
                </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <PhoneCall className="h-7 w-7 text-[#4CAF50]" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{t('call')}</h3>
                <p className="mt-2 text-sm text-gray-600">{t('contactOurSupportTeamDirectly')}</p>
                <Button
                  className="mt-4 bg-[#4CAF50] hover:bg-[#45a049]"
                                                      onClick={() => (window.location.href = "tel:0886116668")}
                >
                                      0886 116 668
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <Mail className="h-7 w-7 text-[#4CAF50]" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{t('email')}</h3>
                <p className="mt-2 text-sm text-gray-600">{t('sendEmailAndGetResponse')}</p>
                <Button
                  className="mt-4 bg-[#4CAF50] hover:bg-[#45a049]"
                  onClick={() => (window.location.href = "mailto:info@ltacv.com")}
                >
                  info@ltacv.com
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#4CAF50]"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M12 7v.01" />
                    <path d="M16 11v.01" />
                    <path d="M8 11v.01" />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{t('chat')}</h3>
                <p className="mt-2 text-sm text-gray-600">{t('chatWithOurSupportTeam')}</p>
                                    <Button 
                      className="mt-4 bg-[#4CAF50] hover:bg-[#45a049]"
                      onClick={() => window.open('https://zalo.me/ltacompany', '_blank')}
                    >
                      {t('startChat')}
                    </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
