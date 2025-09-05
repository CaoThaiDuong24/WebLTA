"use client"

import React from 'react'

interface NewsTitleProps {
  children: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function NewsTitle({ children, className = "", size = 'md' }: NewsTitleProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl'
  }

  return (
    <div 
      className={`font-bold text-gray-900 hover:text-[#4CAF50] cursor-pointer news-title-component ${sizeClasses[size]} ${className}`}
      style={{
        lineHeight: '1.4',
        maxHeight: '2.8em'
      }}
    >
      {children}
    </div>
  )
} 