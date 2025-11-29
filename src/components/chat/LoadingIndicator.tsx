'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { personalities } from '@/lib/openai/personalities'

interface LoadingIndicatorProps {
    personalityKey?: string
}

export function LoadingIndicator({ personalityKey = 'padrao' }: LoadingIndicatorProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
    const personality = personalities[personalityKey] || personalities.padrao
    const messages = personality.loadingMessages

    useEffect(() => {
        // Rotate through loading messages every 2.5 seconds
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
        }, 2500)

        return () => clearInterval(interval)
    }, [messages.length])

    return (
        <div className="flex items-start gap-3 md:gap-4 py-4 animate-fade-in">
            {/* Avatar with pulse animation */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full text-lg md:text-xl shadow-lg bg-gradient-to-br ${getPersonalityGradient(personality.color)}`}
            >
                {personality.avatar}
            </motion.div>

            {/* Rotating loading messages */}
            <div className="flex flex-col gap-1 pt-1">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm md:text-base text-gray-600"
                    >
                        {messages[currentMessageIndex]}
                    </motion.span>
                </AnimatePresence>

                {/* Animated dots */}
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="h-2 w-2 rounded-full bg-gray-400"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function getPersonalityGradient(color: string): string {
    const gradients: Record<string, string> = {
        yellow: 'from-yellow-400 to-orange-500',
        pink: 'from-pink-400 to-pink-600',
        green: 'from-green-500 to-emerald-600',
        'green-light': 'from-green-400 to-teal-500',
        blue: 'from-blue-500 to-cyan-600',
        orange: 'from-orange-500 to-red-500'
    }
    return gradients[color] || 'from-purple-500 to-pink-600'
}
