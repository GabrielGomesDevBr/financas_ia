'use client'

import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Digite sua mensagem..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  const charCount = value.length
  const maxChars = 2000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky bottom-0 left-0 right-0 pb-20 md:pb-0"
    >
      <div className="mx-auto max-w-3xl px-4 py-4 md:px-6">
        {/* Floating container */}
        <div className="relative rounded-3xl border-2 border-gray-200 bg-white shadow-2xl transition-all duration-300 focus-within:border-purple-300 focus-within:shadow-purple-500/20">
          {/* Gradient glow on focus */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-20 -z-10" />

          <div className="relative flex items-end gap-2 p-3 md:p-4">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
              style={{
                minHeight: '24px',
                maxHeight: '120px',
                fontSize: '16px', // Prevent iOS zoom
              }}
            />

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSubmit}
              disabled={!value.trim() || isLoading}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Character count */}
          {charCount > 0 && (
            <div className="px-4 pb-2">
              <p className={`text-xs text-right ${charCount > maxChars ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount}/{maxChars}
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-3 text-center text-xs text-gray-500">
          A IA pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </motion.div>
  )
}
