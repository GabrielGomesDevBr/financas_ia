'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
    value: number
    isPositive?: boolean
    label?: string
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
    className?: string
}

const sizes = {
    sm: {
        container: 'px-2 py-0.5 gap-1',
        icon: 'h-3 w-3',
        text: 'text-xs',
    },
    md: {
        container: 'px-2.5 py-1 gap-1.5',
        icon: 'h-4 w-4',
        text: 'text-sm',
    },
    lg: {
        container: 'px-3 py-1.5 gap-2',
        icon: 'h-5 w-5',
        text: 'text-base',
    },
}

export function TrendIndicator({
    value,
    isPositive = value >= 0,
    label,
    size = 'md',
    showIcon = true,
    className,
}: TrendIndicatorProps) {
    const sizeStyles = sizes[size]
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight

    return (
        <div className={cn('inline-flex items-center', className)}>
            <div
                className={cn(
                    'inline-flex items-center rounded-full font-semibold transition-all duration-200',
                    sizeStyles.container,
                    sizeStyles.text,
                    isPositive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                )}
            >
                {showIcon && <Icon className={sizeStyles.icon} />}
                <span>{Math.abs(value)}%</span>
            </div>
            {label && (
                <span className={cn('ml-2 text-gray-500', sizeStyles.text)}>
                    {label}
                </span>
            )}
        </div>
    )
}
