'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { personalities } from '@/lib/openai/personalities'

interface PersonalitySwitcherProps {
    currentPersonality: string
    onSwitch: (personalityKey: string) => void
}

export function PersonalitySwitcher({ currentPersonality, onSwitch }: PersonalitySwitcherProps) {
    const [isOpen, setIsOpen] = useState(false)
    const current = personalities[currentPersonality] || personalities.padrao

    return (
        <div className="relative">
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

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu - Mobile optimized */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 sm:left-auto right-0 sm:right-0 sm:top-full sm:mt-2 w-full sm:w-80 bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border-t-2 sm:border-2 border-gray-200 z-50 overflow-hidden max-h-[70vh] sm:max-h-[500px] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex-shrink-0 p-3 sm:p-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-gray-200">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-700 px-2">Escolha uma personalidade</p>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="sm:hidden p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                                        aria-label="Fechar"
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable list */}
                            <div className="flex-1 overflow-y-auto p-2 sm:p-2 overscroll-contain">
                                {Object.entries(personalities).map(([key, personality]) => {
                                    const isActive = key === currentPersonality

                                    return (
                                        <motion.button
                                            key={key}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                onSwitch(key)
                                                setIsOpen(false)
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 sm:p-3 rounded-lg transition-all mb-1.5 min-h-[64px] ${isActive
                                                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300'
                                                    : 'active:bg-gray-100 sm:hover:bg-gray-50 border-2 border-transparent'
                                                }`}
                                        >
                                            <span className="text-2xl flex-shrink-0">{personality.avatar}</span>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-gray-900">{personality.name}</p>
                                                    {isActive && (
                                                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                                            Ativo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{personality.description}</p>
                                                <p className="text-xs text-gray-500 mt-1 italic line-clamp-2 sm:line-clamp-1">{personality.displaySubtitle}</p>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
