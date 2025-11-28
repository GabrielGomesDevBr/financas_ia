'use client'

import { Download, X } from 'lucide-react'
import { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { IOSInstallPrompt } from './IOSInstallPrompt'
import { Button } from '@/components/ui/button'

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOSDevice, promptInstall } = usePWAInstall()
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || isDismissed) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  // Show iOS-specific instructions
  if (isIOSDevice) {
    return <IOSInstallPrompt onDismiss={handleDismiss} />
  }

  // Show Android/Chrome install prompt
  const handleInstall = async () => {
    const success = await promptInstall()
    if (!success) {
      // If user dismissed, hide the banner
      setIsDismissed(true)
    }
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 animate-slide-in-up">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Download className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1">
              Instalar Aplicativo
            </h3>
            <p className="text-sm text-white/90 leading-relaxed">
              Adicione à tela inicial para acesso rápido e experiência completa
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstall}
                variant="secondary"
                size="sm"
                className="flex-1 bg-white hover:bg-white/90 text-indigo-600 font-semibold shadow-lg"
              >
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                Agora não
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
