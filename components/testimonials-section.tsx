"use client"

import { useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"
import { useInView } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"

export function TestimonialsSection() {
  const { t } = useTranslation()
  
  const testimonials = [
    {
      quote: t('testimonial1'),
      author: t('testimonial1Author'),
      role: t('testimonial1Role'),
      avatar: "/avatar-1.jpg",
    },
    {
      quote: t('testimonial2'),
      author: t('testimonial2Author'),
      role: t('testimonial2Role'),
      avatar: "/avatar-2.jpg",
    },
    {
      quote: t('testimonial3'),
      author: t('testimonial3Author'),
      role: t('testimonial3Role'),
      avatar: "/avatar-3.jpg",
    },
  ]

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="testimonials" className="bg-white py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('customerFeedback')}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('customerFeedbackDesc')}
          </p>
        </div>

        <div
          ref={ref}
          className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          style={{
            transform: isInView ? "none" : "translateY(50px)",
            opacity: isInView ? 1 : 0,
            transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-lg">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-[#4CAF50] opacity-50" />
                <p className="mt-4 text-lg text-gray-700">{testimonial.quote}</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.author}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
