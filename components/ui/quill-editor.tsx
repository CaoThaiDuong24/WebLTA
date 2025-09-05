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

      // Add custom CSS for icon/emoji sizing
      const style = document.createElement('style')
      style.textContent = `
        .ql-editor {
          font-family: 'Roboto', Arial, sans-serif !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
        }
        .ql-editor * {
          font-family: inherit !important;
        }
        .ql-editor img, .ql-editor svg, .ql-editor i {
          max-width: 1.2em !important;
          height: auto !important;
          vertical-align: middle !important;
          display: inline-block !important;
        }
        .ql-editor .emoji, .ql-editor [data-emoji] {
          font-size: 1em !important;
          line-height: 1 !important;
          vertical-align: middle !important;
        }
        .ql-editor .icon, .ql-editor .fa, .ql-editor .fas, .ql-editor .far, .ql-editor .fab {
          font-size: 1em !important;
          line-height: 1 !important;
          vertical-align: middle !important;
        }
        /* Fix for clipboard paste */
        .ql-editor [style*="font-size"] {
          font-size: inherit !important;
        }
        .ql-editor [style*="width"], .ql-editor [style*="height"] {
          max-width: 1.2em !important;
          height: auto !important;
        }
      `
      document.head.appendChild(style)

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
          ],
          clipboard: {
            matchVisual: false,
            matchers: [
              ['img', (node: any, delta: any) => {
                // Ensure images maintain proper size
                if (node.style && node.style.width) {
                  delta.ops[0].attributes = { ...delta.ops[0].attributes, width: node.style.width }
                }
                if (node.style && node.style.height) {
                  delta.ops[0].attributes = { ...delta.ops[0].attributes, height: node.style.height }
                }
                return delta
              }],
              ['i', (node: any, delta: any) => {
                // Ensure icons maintain proper size
                if (node.className && (node.className.includes('icon') || node.className.includes('fa'))) {
                  delta.ops[0].attributes = { ...delta.ops[0].attributes, size: 'normal' }
                }
                return delta
              }],
              ['span', (node: any, delta: any) => {
                // Fix span elements with inline styles
                if (node.style && (node.style.fontSize || node.style.width || node.style.height)) {
                  // Remove problematic inline styles
                  delete node.style.fontSize
                  delete node.style.width
                  delete node.style.height
                }
                return delta
              }],
              ['div', (node: any, delta: any) => {
                // Fix div elements with inline styles
                if (node.style && (node.style.fontSize || node.style.width || node.style.height)) {
                  // Remove problematic inline styles
                  delete node.style.fontSize
                  delete node.style.width
                  delete node.style.height
                }
                return delta
              }]
            ]
          }
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

      // Handle paste events to fix icon sizing
      quillRef.current.root.addEventListener('paste', (e: any) => {
        setTimeout(() => {
          // Fix any oversized icons after paste
          const icons = quillRef.current.root.querySelectorAll('i, img, svg, .emoji, [data-emoji]')
          icons.forEach((icon: any) => {
            if (icon.style) {
              icon.style.fontSize = '1em'
              icon.style.width = 'auto'
              icon.style.height = 'auto'
              icon.style.maxWidth = '1.2em'
            }
          })
        }, 10)
      })

      // Clean up style when component unmounts
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style)
        }
      }
    }

    init()

    return () => {
      cancelled = true
      if (quillRef.current) {
        quillRef.current.off('text-change')
        if (quillRef.current.root) {
          quillRef.current.root.removeEventListener('paste', () => {})
        }
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
