"use client"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useInView } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export function SolutionsSection() {
  const { t } = useTranslation()
  
  const solutions = [
    {
      id: "i-superapp",
      title: t('iSuperApp'),
      description: t('modernDepotDesc'),
      image: "/solution-1.jpg",
      features: [t('containerManagement'), t('realTimeTracking'), t('automaticReporting'), t('aiIntegration')],
    },
    {
      id: "depot-management",
      title: t('depotManagement'),
      description: t('modernDepotDesc'),
      image: "/solution-2.jpg",
      features: [t('spaceOptimization'), t('automaticPlanning'), t('personnelManagement'), t('detailedReporting')],
    },
    {
      id: "transport-management",
      title: t('transportManagement'),
      description: t('smartTransportDesc'),
      image: "/solution-3.jpg",
      features: [t('routeOptimization'), t('vehicleMonitoring'), t('fuelManagement'), t('performanceAnalysis')],
    },
  ]

  return (
    <section id="solutions" className="bg-gray-50 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('specializedSolutions')}</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('specializedSolutionsDesc')}
          </p>
        </div>

        <div className="mt-16 space-y-24">
          {solutions.map((solution, index) => (
            <SolutionItem key={index} solution={solution} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionItem({ solution, index }: { solution: any; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { t } = useTranslation()

  return (
    <div
      id={solution.id}
      ref={ref}
      className={`flex flex-col items-center gap-8 lg:flex-row ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
      style={{
        transform: isInView ? "none" : "translateY(50px)",
        opacity: isInView ? 1 : 0,
        transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
      }}
    >
      <div className="w-full lg:w-1/2">
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={solution.image || "/placeholder.svg"}
            alt={solution.title}
            width={800}
            height={600}
            className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
      <div className="w-full lg:w-1/2">
        <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">{solution.title}</h3>
        <p className="mt-4 text-lg text-gray-600">{solution.description}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {solution.features.map((feature: string, featureIndex: number) => (
            <div key={featureIndex} className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF50]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 text-white"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button className="group bg-[#4CAF50] hover:bg-[#45a049]">
            {t('learnMore')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
