'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { cn } from '@/lib/utils'

interface MetricCardProps {
    icon: LucideIcon
    label: string
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
    trend?: {
        value: number
        isPositive: boolean
        label?: string
    }
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'default'
    delay?: number
    className?: string
}

const variantColors = {
    success: {
        border: 'border-green-100',
        bg: 'from-green-500 to-green-600',
        shadow: 'shadow-green-500/30',
        text: 'text-green-600',
        glow: 'shadow-green-500/5 hover:shadow-green-500/10',
        accent: 'gradient-success',
    },
    danger: {
        border: 'border-red-100',
        bg: 'from-red-500 to-red-600',
        shadow: 'shadow-red-500/30',
        text: 'text-red-600',
        glow: 'shadow-red-500/5 hover:shadow-red-500/10',
        accent: 'gradient-danger',
    },
    warning: {
        border: 'border-amber-100',
        bg: 'from-amber-500 to-amber-600',
        shadow: 'shadow-amber-500/30',
        text: 'text-amber-600',
        glow: 'shadow-amber-500/5 hover:shadow-amber-500/10',
        accent: 'gradient-warning',
    },
    info: {
        border: 'border-cyan-100',
        bg: 'from-cyan-500 to-cyan-600',
        shadow: 'shadow-cyan-500/30',
        text: 'text-cyan-600',
        glow: 'shadow-cyan-500/5 hover:shadow-cyan-500/10',
        accent: 'gradient-cyan-blue',
    },
    purple: {
        border: 'border-purple-100',
        bg: 'from-purple-500 to-purple-600',
        shadow: 'shadow-purple-500/30',
        text: 'text-purple-600',
        glow: 'shadow-purple-500/5 hover:shadow-purple-500/10',
        accent: 'gradient-accent',
    },
    default: {
        border: 'border-blue-100',
        bg: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/30',
        text: 'text-blue-600',
        glow: 'shadow-blue-500/5 hover:shadow-blue-500/10',
        accent: 'gradient-primary-soft',
    },
}

export function MetricCard({
    icon: Icon,
    label,
    value,
    prefix = '',
    suffix = '',
    decimals = 0,
    trend,
    variant = 'default',
    delay = 0,
    className,
}: MetricCardProps) {
    const colors = variantColors[variant]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                'group relative overflow-hidden rounded-2xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                colors.border,
                colors.glow,
                className
            )}
        >
            {/* Gradient accent bar */}
            <div className={cn('h-1', colors.accent)} />

            <div className="p-6">
                {/* Icon and Label */}
                <div className="mb-4 flex items-center gap-3">
                    <div
                        className={cn(
                            'rounded-xl bg-gradient-to-br p-3 shadow-lg transition-transform duration-300 group-hover:scale-110',
                            colors.bg,
                            colors.shadow
                        )}
                    >
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">{label}</p>
                    </div>
                </div>

                {/* Animated Value */}
                <div className="space-y-2">
                    <div className={cn('text-3xl font-bold', colors.text)}>
                        <CountUp
                            start={0}
                            end={value}
                            duration={1.5}
                            delay={delay}
                            decimals={decimals}
                            prefix={prefix}
                            suffix={suffix}
                            separator="."
                            decimal=","
                        />
                    </div>

                    {/* Trend Indicator */}
                    {trend && (
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                                    trend.isPositive
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                )}
                            >
                                <span>{trend.isPositive ? '↑' : '↓'}</span>
                                <span>{Math.abs(trend.value)}%</span>
                            </div>
                            {trend.label && (
                                <span className="text-xs text-gray-500">{trend.label}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
