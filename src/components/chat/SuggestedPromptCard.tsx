'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestedPromptCardProps {
    icon: LucideIcon
    title: string
    description: string
    prompt: string
    gradient: string
    onClick: () => void
    delay?: number
}

export function SuggestedPromptCard({
    icon: Icon,
    title,
    description,
    gradient,
    onClick,
    delay = 0,
}: SuggestedPromptCardProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 + delay, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group relative flex flex-col items-start gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4 md:p-5 text-left shadow-lg transition-all duration-300 hover:border-transparent hover:shadow-2xl"
        >
            {/* Gradient border on hover */}
            <div className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10",
                gradient
            )} style={{ padding: '2px' }}>
                <div className="h-full w-full rounded-2xl bg-white" />
            </div>

            {/* Icon with gradient */}
            <div className={cn(
                "flex items-center justify-center rounded-xl bg-gradient-to-br p-3 shadow-lg transition-transform duration-300 group-hover:scale-110",
                gradient
            )}>
                <Icon className="h-5 w-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
            </div>

            {/* Glow effect on hover */}
            <div className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20 -z-20",
                gradient
            )} />
        </motion.button>
    )
}
