"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { languages } from "@/lib/i18n"
import { useState } from "react"

// Flag component using real flag images from Flagpedia CDN
function FlagIcon({ code, className = "" }: { code: string; className?: string }) {
  const flagUrls: Record<string, string> = {
    'vi': 'https://flagcdn.com/24x18/vn.png', // Vietnam
    'en': 'https://flagcdn.com/24x18/us.png', // United States
    'zh': 'https://flagcdn.com/24x18/cn.png', // China
    'ja': 'https://flagcdn.com/24x18/jp.png'  // Japan
  }

  const flagUrl = flagUrls[code]
  
  if (!flagUrl) {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-4 bg-gray-200 rounded text-xs font-bold text-gray-600 ${className}`}>
        {code.toUpperCase()}
      </span>
    )
  }

  return (
    <div className={`flex items-center justify-center flex-shrink-0 ${className}`}>
      <img 
        src={flagUrl}
        alt={`${code.toUpperCase()} flag`}
        className="w-6 h-4 rounded-sm object-cover shadow-sm border border-gray-200/30 block"
        loading="lazy"
        style={{ imageRendering: 'crisp-edges' }}
        onError={(e) => {
          // Fallback nếu ảnh không load được
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = document.createElement('span');
          fallback.className = 'inline-flex items-center justify-center w-6 h-4 bg-gray-200 rounded text-xs font-bold text-gray-600';
          fallback.textContent = code.toUpperCase();
          target.parentNode?.appendChild(fallback);
        }}
      />
    </div>
  )
}

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  
  const currentLangData = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-12 px-4 py-2 bg-white/90 backdrop-blur-md border border-white/30 hover:bg-white hover:border-[#4CAF50]/40 hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden min-w-[130px] flex items-center justify-between"
          aria-label={`Current language: ${currentLangData.name}. Click to change language`}
        >
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4CAF50]/5 via-emerald-400/5 to-[#4CAF50]/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Main content container */}
          <div className="flex items-center gap-2.5 relative z-10">
            {/* Flag container with consistent sizing */}
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
              <FlagIcon 
                code={currentLangData.code} 
                className="group-hover:scale-110 transition-all duration-300"
              />
            </div>

            {/* Language text with better alignment */}
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 hidden sm:inline-block leading-none">
              {currentLangData.name}
            </span>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 sm:hidden leading-none">
              {currentLangData.code.toUpperCase()}
            </span>
          </div>

          {/* Chevron with consistent positioning */}
          <div className="flex items-center justify-center w-4 h-4 flex-shrink-0 ml-auto relative z-10">
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-400 group-hover:text-[#4CAF50] transition-all duration-400 ${
                isOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
              }`} 
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="min-w-[220px] p-2 bg-white/95 backdrop-blur-2xl border border-gray-200/40 shadow-2xl rounded-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        sideOffset={16}
      >
        {/* Enhanced Header */}
        <div className="px-4 py-3 border-b border-gray-100/60">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Select Language</p>
        </div>

        {/* Language options with enhanced styling */}
        <div className="py-2 space-y-1">
          {languages.map((language, index) => (
          <DropdownMenuItem
            key={language.code}
              onClick={() => {
                setLanguage(language.code)
                setIsOpen(false)
              }}
              className={`
                group flex items-center justify-between px-4 py-3.5 mx-1 text-sm rounded-xl cursor-pointer transition-all duration-300 focus:outline-none border border-transparent
                ${language.code === currentLanguage 
                  ? 'bg-gradient-to-r from-[#4CAF50]/12 via-[#4CAF50]/8 to-emerald-400/12 text-[#4CAF50] font-semibold shadow-md border-[#4CAF50]/20 backdrop-blur-sm' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-25/80 hover:text-gray-900 hover:shadow-md hover:border-gray-200/40 hover:backdrop-blur-sm'
                }
              `}
              style={{
                animationDelay: `${index * 60}ms`,
                animationFillMode: 'both'
              }}
              role="menuitem"
              aria-selected={language.code === currentLanguage}
            >
              {/* Left side: Flag and text */}
              <div className="flex items-center gap-3">
                {/* Flag container with consistent sizing */}
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 relative">
                  <FlagIcon 
                    code={language.code}
                    className="group-hover:scale-110 transition-all duration-300"
                  />
                  {language.code === currentLanguage && (
                    <div className="absolute -inset-1 rounded-lg bg-[#4CAF50]/20 scale-125 animate-pulse" />
                  )}
                </div>
                
                {/* Language name with improved typography */}
                <span className="font-semibold transition-colors duration-300 text-base leading-none">
                  {language.name}
                </span>
              </div>

              {/* Right side: Check icon */}
              {language.code === currentLanguage && (
                <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <div className="relative">
                    <CheckIcon className="h-4 w-4 text-[#4CAF50] animate-in zoom-in-50 duration-300" />
                    <div className="absolute inset-0 rounded-full bg-[#4CAF50]/15 scale-150 animate-ping" />
                  </div>
                </div>
              )}
          </DropdownMenuItem>
        ))}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
