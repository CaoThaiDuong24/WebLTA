"use client"

import React, { useRef, useEffect, useState } from 'react'

interface TextTruncateProps {
  children: string
  maxLines?: number
  className?: string
  style?: React.CSSProperties
  showEllipsis?: boolean
}

export function TextTruncate({ 
  children, 
  maxLines = 2, 
  className = "", 
  style = {},
  showEllipsis = true
}: TextTruncateProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current
        const computedStyle = window.getComputedStyle(element)
        const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2
        const maxHeight = lineHeight * maxLines
        
        if (element.scrollHeight > maxHeight) {
          setIsTruncated(true)
        } else {
          setIsTruncated(false)
        }
      }
    }

    // Delay để đảm bảo DOM đã render
    const timer = setTimeout(checkTruncation, 100)
    window.addEventListener('resize', checkTruncation)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkTruncation)
    }
  }, [children, maxLines])

  return (
    <div 
      ref={textRef}
      className={`text-truncate-component ${className}`}
      style={{
        ...style,
        lineHeight: '1.4',
        maxHeight: `${1.4 * maxLines}em`,
        overflow: 'hidden',
        position: 'relative',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: maxLines,
        textOverflow: 'ellipsis'
      }}
    >
      {children}
      {isTruncated && showEllipsis && (
        <span 
          className="text-truncate-ellipsis"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: 'inherit',
            paddingLeft: '6px',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
            opacity: 0.8,
            transition: 'opacity 0.2s ease'
          }}
        >
          ...
        </span>
      )}
    </div>
  )
} 