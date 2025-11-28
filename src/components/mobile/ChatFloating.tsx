'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { cn } from '@/lib/utils'
import { useScrollDirection } from '@/hooks/useScrollDirection'

type ChatState = 'minimized' | 'expanded' | 'fullscreen'

interface ChatFloatingProps {
  /**
   * If true, the chat will not be shown (e.g., on the chat page itself)
   */
  hideOnPaths?: string[]
}

export function ChatFloating({ hideOnPaths = ['/chat'] }: ChatFloatingProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [chatState, setChatState] = useState<ChatState>('minimized')
  const [isVisible, setIsVisible] = useState(true)
  const isNavVisible = useScrollDirection(50)

  // Hide FAB on certain paths
  useEffect(() => {
    const shouldHide =
      hideOnPaths.some((path) => pathname?.startsWith(path)) ||
      pathname?.startsWith('/login') ||
      pathname?.startsWith('/signup')

    setIsVisible(!shouldHide)
  }, [pathname, hideOnPaths])

  const handleMinimizedClick = () => {
    // On minimized click, go to fullscreen
    router.push('/chat')
    setChatState('minimized')
  }

  const handleExpand = () => {
    setChatState('expanded')
  }

  const handleMinimize = () => {
    setChatState('minimized')
  }

  const handleFullscreen = () => {
    router.push('/chat')
    setChatState('minimized')
  }

  const handleClose = () => {
    setChatState('minimized')
  }

  if (!isVisible) return null

  return (
    <>
      {/* Minimized FAB */}
      {chatState === 'minimized' && (
        <button
          onClick={handleMinimizedClick}
          className={cn(
            'fixed z-30 flex items-center justify-center',
            'w-14 h-14 rounded-full shadow-lg',
            'bg-gradient-to-br from-blue-500 to-blue-600',
            'text-white hover:from-blue-600 hover:to-blue-700',
            'transition-all duration-300 hover:scale-105 active:scale-95',
            'md:hidden', // Hide on desktop
            // Dynamic position based on bottom nav visibility
            isNavVisible ? 'bottom-20' : 'bottom-4',
            'right-4'
          )}
          aria-label="Abrir chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Expanded Bottom Sheet */}
      {chatState === 'expanded' && (
        <BottomSheet
          isOpen={true}
          onClose={handleClose}
          title="Chat com IA"
          height="70vh"
          showHandle={true}
        >
          <div className="flex flex-col h-full">
            {/* Chat Header Actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-gray-200">
              <button
                onClick={handleFullscreen}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Tela cheia"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleMinimize}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Minimizar"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content Placeholder */}
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chat em Bottom Sheet
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Esta é a visualização expandida do chat (70% da tela).
                </p>
                <button
                  onClick={handleFullscreen}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Abrir em Tela Cheia
                </button>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  )
}
