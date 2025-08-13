'use client'

import { useEffect, useRef } from 'react'

interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: number | string
}

export function QuillEditor({ value, onChange, placeholder, className = '', height = 180 }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const Quill = (await import('quill')).default
      if (cancelled) return
      if (!containerRef.current) return

      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Nhập nội dung...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'align': [] }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      })

      const initial = value || ''
      if (initial) {
        quillRef.current.clipboard.dangerouslyPasteHTML(initial)
      }

      quillRef.current.on('text-change', () => {
        const html: string = quillRef.current.root.innerHTML
        onChange(html)
      })
    }

    init()

    return () => {
      cancelled = true
      if (quillRef.current) {
        quillRef.current.off('text-change')
        quillRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!quillRef.current) return
    const currentHtml: string = quillRef.current.root.innerHTML
    if (value !== currentHtml) {
      const selection = quillRef.current.getSelection()
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '')
      if (selection) quillRef.current.setSelection(selection)
    }
  }, [value])

  return (
    <div className={className}>
      <div
        ref={containerRef}
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
      />
    </div>
  )
}
