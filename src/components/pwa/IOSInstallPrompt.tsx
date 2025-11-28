'use client'

import { Share, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface IOSInstallPromptProps {
  onDismiss: () => void
}

export function IOSInstallPrompt({ onDismiss }: IOSInstallPromptProps) {
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 animate-slide-in-up">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Share className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1">
              Instalar Aplicativo
            </h3>
            <p className="text-sm text-white/90 leading-relaxed mb-3">
              Para instalar este app no seu iPhone/iPad:
            </p>

            {/* Instructions */}
            <ol className="text-sm space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="flex-1">
                  Toque no botão <Share className="inline w-4 h-4 mx-1" /> (Compartilhar) abaixo
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="flex-1">
                  Role para baixo e toque em "Adicionar à Tela de Início"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span className="flex-1">
                  Toque em "Adicionar" no canto superior direito
                </span>
              </li>
            </ol>

            {/* Action */}
            <Button
              onClick={onDismiss}
              variant="secondary"
              size="sm"
              className="w-full bg-white hover:bg-white/90 text-blue-600 font-semibold shadow-lg"
            >
              Entendi
            </Button>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Guide */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-white/80 text-center">
            Procure pelo ícone <Share className="inline w-3 h-3 mx-1" /> na barra inferior do Safari
          </p>
        </div>
      </div>
    </div>
  )
}
