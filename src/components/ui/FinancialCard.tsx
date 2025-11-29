'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type FinancialCardVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'default'

interface FinancialCardProps {
    variant?: FinancialCardVariant
    icon?: LucideIcon
    title: string
    subtitle?: string
    value: string | ReactNode
    trend?: {
        value: string
        isPositive: boolean
        label?: string
    }
    badge?: string
    progress?: number
    className?: string
    delay?: number
}

const variantStyles: Record<FinancialCardVariant, {
    borderColor: string
    gradientBar: string
    iconBg: string
    iconShadow: string
    valueBg: string
    trendColor: string
}> = {
    success: {
        borderColor: 'border-green-100',
        gradientBar: 'gradient-success',
        iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
        iconShadow: 'shadow-green-500/30',
        valueBg: 'text-green-600',
        trendColor: 'text-green-600',
    },
    danger: {
        borderColor: 'border-red-100',
        gradientBar: 'gradient-danger',
        iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
        iconShadow: 'shadow-red-500/30',
        valueBg: 'text-red-600',
        trendColor: 'text-red-600',
    },
    warning: {
        borderColor: 'border-amber-100',
        gradientBar: 'gradient-warning',
        iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
        iconShadow: 'shadow-amber-500/30',
        valueBg: 'text-amber-600',
        trendColor: 'text-amber-600',
    },
    info: {
        borderColor: 'border-cyan-100',
        gradientBar: 'gradient-cyan-blue',
        iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        iconShadow: 'shadow-cyan-500/30',
        valueBg: 'text-cyan-600',
        trendColor: 'text-cyan-600',
    },
    purple: {
        borderColor: 'border-purple-100',
        gradientBar: 'gradient-accent',
        iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
        iconShadow: 'shadow-purple-500/30',
        valueBg: 'text-purple-600',
        trendColor: 'text-purple-600',
    },
    default: {
        borderColor: 'border-blue-100',
        gradientBar: 'gradient-primary-soft',
        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        iconShadow: 'shadow-blue-500/30',
        valueBg: 'text-blue-600',
        trendColor: 'text-blue-600',
    },
}

export function FinancialCard({
    variant = 'default',
    icon: Icon,
    title,
    subtitle,
    value,
    trend,
    badge,
    progress,
    className,
    delay = 0,
}: FinancialCardProps) {
    const styles = variantStyles[variant]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                'group relative overflow-hidden rounded-2xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                styles.borderColor,
                className
            )}
        >
            {/* Gradient accent bar */}
            <div className={cn('h-1', styles.gradientBar)} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div
                                className={cn(
                                    'rounded-xl p-3 shadow-lg transition-transform duration-300 group-hover:scale-110',
                                    styles.iconBg,
                                    styles.iconShadow
                                )}
                            >
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-500">{title}</p>
                            {subtitle && (
                                <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {badge && (
                        <span className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            styles.valueBg,
                            'bg-opacity-10'
                        )}>
                            {badge}
                        </span>
                    )}
                </div>

                {/* Value */}
                <div className="space-y-1">
                    <div className={cn('text-3xl font-bold', styles.valueBg)}>
                        {value}
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1">
                            <span className={cn(
                                'text-xs font-semibold',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}
                            </span>
                            {trend.label && (
                                <span className="text-xs text-gray-500">{trend.label}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                {progress !== undefined && (
                    <div className="mt-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
                                className={cn('h-full rounded-full', styles.gradientBar)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
