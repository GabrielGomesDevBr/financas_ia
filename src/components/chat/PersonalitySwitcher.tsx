'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { personalities } from '@/lib/openai/personalities'

interface PersonalitySwitcherProps {
    currentPersonality: string
    onSwitch: (personalityKey: string) => void
}

export function PersonalitySwitcher({ currentPersonality, onSwitch }: PersonalitySwitcherProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const current = personalities[currentPersonality] || personalities.padrao

    // Ensure component is mounted (for portal)
    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Prevent body scroll when modal is open on mobile
    useEffect(() => {
        if (isOpen && mounted) {
            // Save current overflow state
            const originalOverflow = document.body.style.overflow

            // Prevent scroll
            document.body.style.overflow = 'hidden'

            // Restore on cleanup
            return () => {
                document.body.style.overflow = originalOverflow
            }
        }
    }, [isOpen, mounted])

    return (
        <div className="relative z-0">
            {/* Trigger Button - Mobile optimized */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-all min-w-[44px] min-h-[44px]"
                aria-label="Trocar personalidade"
            >
                <span className="text-base sm:text-lg">{current.avatar}</span>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs text-gray-500">Personalidade</span>
                    <span className="text-sm font-semibold text-gray-900">{current.name}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Dropdown Menu - Desktop (absolute position) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="hidden sm:block absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden max-h-[500px]"
                        style={{ zIndex: 50 }}
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-gray-200">
                            <p className="text-sm font-bold text-gray-800 px-2">Escolha uma personalidade</p>
                        </div>

                        {/* Scrollable list */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {Object.entries(personalities).map(([key, personality]) => {
                                const isActive = key === currentPersonality

                                return (
                                    <motion.button
                                        key={key}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onSwitch(key)
                                            setIsOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${isActive
                                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400'
                                            : 'hover:bg-gray-50 border-2 border-transparent'
                                            }`}
                                    >
                                        <span className="text-2xl flex-shrink-0">{personality.avatar}</span>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900">{personality.name}</p>
                                                {isActive && (
                                                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                                                        ✓ Ativo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{personality.description}</p>
                                            <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">{personality.displaySubtitle}</p>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Modal - Rendered via Portal */}
            {mounted && isOpen && createPortal(
                <AnimatePresence>
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="sm:hidden fixed inset-0 bg-black/30"
                            style={{ zIndex: 9998 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Mobile Modal (fullscreen from bottom) */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300
                            }}
                            className="sm:hidden fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl border-t-4 border-purple-300 flex flex-col max-h-[90vh]"
                            style={{ zIndex: 9999 }}
                        >
                            {/* Header */}
                            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-base font-bold text-gray-800">Escolha uma personalidade</p>
                                        <p className="text-xs text-gray-600 mt-0.5">Troque a qualquer momento</p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-xl hover:bg-white/70 active:bg-white transition-colors"
                                        aria-label="Fechar"
                                    >
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable list */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {Object.entries(personalities).map(([key, personality]) => {
                                    const isActive = key === currentPersonality

                                    return (
                                        <motion.button
                                            key={key}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                onSwitch(key)
                                                setIsOpen(false)
                                            }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all min-h-[80px] ${isActive
                                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 shadow-md'
                                                : 'bg-gray-50 active:bg-gray-100 border-2 border-gray-200'
                                                }`}
                                        >
                                            <span className="text-3xl flex-shrink-0">{personality.avatar}</span>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <p className="text-base font-bold text-gray-900">{personality.name}</p>
                                                    {isActive && (
                                                        <span className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded-full flex-shrink-0 font-semibold">
                                                            ✓ Ativo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 font-medium mb-0.5">{personality.description}</p>
                                                <p className="text-xs text-gray-500 italic line-clamp-2">{personality.displaySubtitle}</p>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>

                            {/* Footer hint */}
                            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-gray-200">
                                <p className="text-xs text-center text-gray-600">
                                    Toque em uma personalidade para selecionar
                                </p>
                            </div>
                        </motion.div>
                    </>
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
