'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'default'

interface StatBadgeProps {
    label: string
    icon?: LucideIcon
    variant?: BadgeVariant
    pulse?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30',
    info: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',
    default: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
}

const sizeStyles = {
    sm: {
        container: 'px-2 py-0.5 gap-1',
        text: 'text-xs',
        icon: 'h-3 w-3',
    },
    md: {
        container: 'px-3 py-1 gap-1.5',
        text: 'text-sm',
        icon: 'h-4 w-4',
    },
    lg: {
        container: 'px-4 py-1.5 gap-2',
        text: 'text-base',
        icon: 'h-5 w-5',
    },
}

export function StatBadge({
    label,
    icon: Icon,
    variant = 'default',
    pulse = false,
    size = 'md',
    className,
}: StatBadgeProps) {
    const sizes = sizeStyles[size]

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                'inline-flex items-center rounded-full font-semibold',
                variantStyles[variant],
                sizes.container,
                sizes.text,
                pulse && 'animate-pulse-glow',
                className
            )}
        >
            {Icon && <Icon className={sizes.icon} />}
            <span>{label}</span>
        </motion.div>
    )
}
