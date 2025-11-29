'use client'

import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
    className?: string
}

export function MetricCardSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white p-6', className)}>
            <div className="mb-4 flex items-center gap-3">
                <div className="skeleton h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-24 rounded" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="skeleton h-9 w-32 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
            </div>
        </div>
    )
}

export function ChartSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white p-6', className)}>
            <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                    <div className="skeleton h-6 w-48 rounded" />
                    <div className="skeleton h-4 w-32 rounded" />
                </div>
                <div className="skeleton h-10 w-32 rounded-lg" />
            </div>
            <div className="skeleton h-64 w-full rounded-xl" />
        </div>
    )
}

export function TableSkeleton({ rows = 5, className }: LoadingSkeletonProps & { rows?: number }) {
    return (
        <div className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white p-6', className)}>
            <div className="mb-4 skeleton h-6 w-40 rounded" />
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="skeleton h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-full rounded" />
                            <div className="skeleton h-3 w-2/3 rounded" />
                        </div>
                        <div className="skeleton h-6 w-20 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function CardSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white p-6', className)}>
            <div className="space-y-4">
                <div className="skeleton h-6 w-32 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
                <div className="skeleton h-32 w-full rounded-xl" />
            </div>
        </div>
    )
}
