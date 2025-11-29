'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
    variant?: 'default' | 'success' | 'warning' | 'info'
    className?: string
}

const variantStyles = {
    default: {
        iconBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
        iconColor: 'text-gray-400',
        border: 'border-gray-200',
    },
    success: {
        iconBg: 'bg-gradient-to-br from-green-50 to-green-100',
        iconColor: 'text-green-500',
        border: 'border-green-100',
    },
    warning: {
        iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
        iconColor: 'text-amber-500',
        border: 'border-amber-100',
    },
    info: {
        iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        iconColor: 'text-blue-500',
        border: 'border-blue-100',
    },
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    variant = 'default',
    className,
}: EmptyStateProps) {
    const styles = variantStyles[variant]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                'flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center',
                styles.border,
                className
            )}
        >
            <div className={cn('mb-4 rounded-2xl p-6', styles.iconBg)}>
                <Icon className={cn('h-16 w-16', styles.iconColor)} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
            <p className="mb-6 max-w-md text-sm text-gray-500">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    )
}
