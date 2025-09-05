'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from './button'
import { Textarea } from './textarea'
import { 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  RotateCcw,
  Type,
  Heading1,
  Heading2
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const insertText = (text: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + text + value.substring(end)
      onChange(newValue)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + text.length, start + text.length)
      }, 0)
    }
  }

  const wrapText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)
      onChange(newValue)
      
      setTimeout(() => {
        textarea.focus()
        if (selectedText) {
          textarea.setSelectionRange(start, start + before.length + selectedText.length + after.length)
        } else {
          textarea.setSelectionRange(start + before.length, start + before.length)
        }
      }, 0)
    }
  }

  const clearFormat = () => {
    const cleanText = value
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
    onChange(cleanText)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return
      
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        switch (e.key.toLowerCase()) {
          case 'b':
            wrapText('<strong>', '</strong>')
            break
          case 'i':
            wrapText('<em>', '</em>')
            break
          case 'u':
            wrapText('<u>', '</u>')
            break
          case 'k':
            clearFormat()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, value])

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    title, 
    children,
    variant = "ghost",
    shortcut 
  }: {
    onClick: () => void
    icon?: any
    title: string
    children?: React.ReactNode
    variant?: "ghost" | "outline"
    shortcut?: string
  }) => (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105"
      title={shortcut ? `${title} (${shortcut})` : title}
    >
      {Icon ? <Icon className="h-4 w-4" /> : children}
    </Button>
  )

  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-300' : 'border-gray-200'} ${className}`}>
      {/* Modern Toolbar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => wrapText('<strong>', '</strong>')}
              icon={Bold}
              title="Bold"
              shortcut="Ctrl+B"
            />
            <ToolbarButton
              onClick={() => wrapText('<em>', '</em>')}
              icon={Italic}
              title="Italic"
              shortcut="Ctrl+I"
            />
            <ToolbarButton
              onClick={() => wrapText('<u>', '</u>')}
              icon={Underline}
              title="Underline"
              shortcut="Ctrl+U"
            />
            <ToolbarButton
              onClick={() => wrapText('<s>', '</s>')}
              icon={Strikethrough}
              title="Strikethrough"
            />
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => wrapText('<h1>', '</h1>')}
              icon={Heading1}
              title="Heading 1"
            />
            <ToolbarButton
              onClick={() => wrapText('<h2>', '</h2>')}
              icon={Heading2}
              title="Heading 2"
            />
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => insertText('<ul>\n<li>Item</li>\n</ul>')}
              icon={List}
              title="Bullet List"
            />
            <ToolbarButton
              onClick={() => insertText('<ol>\n<li>Item</li>\n</ol>')}
              icon={ListOrdered}
              title="Numbered List"
            />
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Special Elements */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => wrapText('<blockquote>', '</blockquote>')}
              icon={Quote}
              title="Quote"
            />
            <ToolbarButton
              onClick={() => wrapText('<code>', '</code>')}
              icon={Code}
              title="Code"
            />
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Clear Format */}
          <ToolbarButton
            onClick={clearFormat}
            icon={RotateCcw}
            title="Clear Format"
            shortcut="Ctrl+K"
          />
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || 'Nhập nội dung... (Sử dụng Ctrl+B, Ctrl+I, Ctrl+U để format nhanh)'}
          className="min-h-[200px] resize-none border-0 focus:ring-0 focus:outline-none p-4 font-roboto text-gray-700 leading-relaxed"
          style={{ 
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        />
      </div>

      {/* Character Count */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
        <span>{value.length} ký tự</span>
        <span className="text-blue-600 font-medium">Rich Text Editor</span>
      </div>
    </div>
  )
}
