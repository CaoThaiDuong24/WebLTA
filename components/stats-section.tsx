"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"

export function StatsSection() {
  const { t } = useTranslation()
  
  const stats = [
    { value: "98%", label: t('customerSatisfaction') },
    { value: "24/7", label: t('technicalSupport') },
    { value: "500+", label: t('enterpriseCustomers') },
    { value: "30%", label: t('operationalCostSaving') },
  ]

  return (
    <section id="stats" className="bg-[#4CAF50] py-24 text-white">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('impressiveNumbers')}</h2>
          <p className="mt-6 text-lg leading-8 opacity-90">
            {t('impressiveNumbersDesc')}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, index }: { stat: any; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div
      ref={ref}
      className="text-center"
      style={{
        transform: isInView ? "none" : "translateY(20px)",
        opacity: isInView ? 1 : 0,
        transition: `all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) ${0.1 * index}s`,
      }}
    >
      <div className="text-4xl font-bold sm:text-5xl">{stat.value}</div>
      <div className="mt-2 text-lg opacity-90">{stat.label}</div>
    </div>
  )
}
