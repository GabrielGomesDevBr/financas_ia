'use client'

import { Plus, History, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ChatHeaderProps {
    onNewConversation: () => void
    onToggleSidebar?: () => void
    onHistoryClick?: () => void
    currentTitle?: string
    children?: React.ReactNode
}

export function ChatHeader({ onNewConversation, onToggleSidebar, onHistoryClick, currentTitle, children }: ChatHeaderProps) {
    return (
        <header className="sticky top-0 z-40 border-b-2 border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
                {/* Left: Logo/Title */}
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    {onToggleSidebar && (
                        <button
                            onClick={onToggleSidebar}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    {/* Logo/Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-lg font-bold text-white">IA</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-gray-900">
                                {currentTitle || 'Chat Financeiro'}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Personality Switcher */}
                    {children}

                    {/* History button */}
                    {onHistoryClick && (
                        <button
                            onClick={onHistoryClick}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            <History className="w-4 h-4" />
                            <span className="text-sm font-semibold hidden md:inline">Histórico</span>
                        </button>
                    )}

                    {/* New conversation button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onNewConversation}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-semibold hidden xs:inline">Nova</span>
                    </motion.button>
                </div>
            </div>
        </header>
    )
}
