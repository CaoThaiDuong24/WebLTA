"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { Server, Truck, Link2, BarChart2, ShieldCheck, Headphones } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export function FeaturesSection() {
  const { t } = useTranslation()
  
  const features = [
    {
      title: t('modernDepot'),
      description: t('modernDepotDesc'),
      icon: Server,
      color: "#4CAF50",
    },
    {
      title: t('smartTransport'),
      description: t('smartTransportDesc'),
      icon: Truck,
      color: "#2196F3",
    },
    {
      title: t('comprehensiveIntegration'),
      description: t('comprehensiveIntegrationDesc'),
      icon: Link2,
      color: "#FF9800",
    },
    {
      title: t('dataAnalysis'),
      description: t('dataAnalysisDesc'),
      icon: BarChart2,
      color: "#9C27B0",
    },
    {
      title: t('advancedSecurity'),
      description: t('advancedSecurityDesc'),
      icon: ShieldCheck,
      color: "#F44336",
    },
    {
      title: t('support247'),
      description: t('support247Desc'),
      icon: Headphones,
      color: "#00BCD4",
    },
  ]

  const appFeatures = [
    {
      number: "1",
      title: t('friendlyInterface'),
      description: t('friendlyInterfaceDesc'),
    },
    {
      number: "2",
      title: t('comprehensiveDepotManagement'),
      description: t('comprehensiveDepotManagementDesc'),
    },
    {
      number: "3",
      title: t('pointSystem'),
      description: t('pointSystemDesc'),
    },
  ]

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const appRef = useRef(null)
  const isAppInView = useInView(appRef, { once: true, amount: 0.2 })

  return (
    <section id="features" className="bg-white py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('featuresTitle')}</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('featuresDescription')}
          </p>
        </div>
        <div
          ref={ref}
          className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            transform: isInView ? "none" : "translateY(50px)",
            opacity: isInView ? 1 : 0,
            transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-[#4CAF50] hover:shadow-md p-6"
            >
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <feature.icon className="h-8 w-8" style={{ color: feature.color }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-4 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Enhanced Mobile App Section */}
        <div className="relative mt-32 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 via-white to-[#f1f5f2] p-8 md:p-16 shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CAF50]/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4CAF50]/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>

          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-5 z-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234CAF50' fillOpacity='0.2' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>

          <div className="relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              {/* Decorative accent line */}
              <div className="inline-block mb-4">
                <div className="h-1 w-24 bg-gradient-to-r from-[#4CAF50]/30 to-[#4CAF50] rounded-full mx-auto"></div>
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                {t('mobileApp')}{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4CAF50] to-[#45a049]">LTA</span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {t('mobileAppDesc')}
              </p>
            </div>

            {/* Luxurious App Showcase */}
            <div
              ref={appRef}
              className="mx-auto mt-16 max-w-5xl"
              style={{
                transform: isAppInView ? "none" : "translateY(50px)",
                opacity: isAppInView ? 1 : 0,
                transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
              }}
            >
              {/* Premium container with subtle border gradient */}
              <div className="relative p-[1px] rounded-[2rem] bg-gradient-to-r from-[#4CAF50]/20 via-[#4CAF50]/30 to-[#4CAF50]/20 shadow-xl">
                {/* Inner white container */}
                <div className="bg-white rounded-[2rem] p-10 md:p-16">
                  <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    {/* App screenshots */}
                    <div className="md:w-1/2 relative">
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-[#4CAF50]/10 filter blur-3xl rounded-full opacity-30"></div>

                      {/* App screenshots mockup */}
                      <div className="relative">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BB%A9ng%20d%E1%BB%A5ng%20App-pbjvQnkwp47PVi3KG6wnyRLqBD5bs6.png"
                          alt="LTA App Features"
                          className="w-full h-auto object-contain rounded-xl shadow-lg"
                        />

                        {/* Reflection effect */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 h-8 bg-black/10 filter blur-md rounded-full"></div>
                      </div>
                    </div>

                    {/* Feature descriptions */}
                    <div className="md:w-1/2 space-y-8">
                      {appFeatures.map((feature, index) => (
                        <div key={index} className="flex gap-6 items-start group">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/20 shadow-sm transition-all duration-300 group-hover:bg-[#4CAF50]/20">
                            <span className="text-lg font-bold text-[#4CAF50]">{feature.number}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                            <p className="mt-2 text-gray-600 leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Updated App Store Buttons */}
            <div className="mt-16 flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-8">
                {t('downloadToday')}
              </h3>

              <div className="flex flex-wrap justify-center gap-6 max-w-3xl">
                {/* App Store Button */}
                <a
                  href="#"
                  className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl shadow-md w-[240px] hover:opacity-90 transition-opacity"
                  onClick={() => window.open("https://apps.apple.com/vn/app/i-superapp-lta/id1578865513?l=vi", "_blank")}
                >
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
                    className="lucide lucide-apple"
                  >
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                    <path d="M10 2c1 .5 2 2 2 5"></path>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-300">{t('downloadOn')}</span>
                    <span className="text-base font-semibold">{t('appStore')}</span>
                  </div>
                </a>

                {/* Google Play Button */}
                <a
                  href="#"
                  className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl shadow-md w-[240px] hover:opacity-90 transition-opacity"
                  onClick={() => window.open("https://play.google.com/store/apps/details?id=com.lta.iedepotsuperapp&hl=vi", "_blank")}
                >
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
                    className="lucide lucide-play"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-300">{t('downloadOn')}</span>
                    <span className="text-base font-semibold">{t('googlePlay')}</span>
                  </div>
                </a>

                {/* Direct Download Button */}
                <a
                  href="#"
                  className="flex items-center gap-3 px-6 py-3 bg-[#4CAF50] text-white rounded-2xl shadow-md w-[240px] hover:opacity-90 transition-opacity"
                  onClick={() =>
                    window.open("https://cloud.ltacv.com/s/kkggMFSfKZtoTi6/download/i-SuperApp@LTA.apk", "_blank")
                  }
                >
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
                    className="lucide lucide-download"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs">{t('directApk')}</span>
                    <span className="text-base font-semibold">{t('directDownload')}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
