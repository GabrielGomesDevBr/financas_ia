'use client'

import { Target, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Goal {
    id: string
    name: string
    target_amount: number
    current_amount: number
    deadline: string
    status: 'active' | 'completed' | 'paused'
}

interface GoalProgressCardProps {
    goal: Goal
    delay?: number
}

export function GoalProgressCard({ goal, delay = 0 }: GoalProgressCardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
        }).format(value)
    }

    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    const remaining = goal.target_amount - goal.current_amount

    const daysUntilDeadline = () => {
        const deadline = new Date(goal.deadline)
        const today = new Date()
        const diffTime = deadline.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const days = daysUntilDeadline()
    const isOnTrack = progress >= 50 || days > 30
    const isBehind = progress < 50 && days <= 30 && days > 0
    const isCompleted = progress >= 100

    const getStatusBadge = () => {
        if (isCompleted) {
            return { label: 'Concluída', className: 'bg-green-100 text-green-700' }
        }
        if (isOnTrack) {
            return { label: 'No Prazo', className: 'bg-blue-100 text-blue-700' }
        }
        if (isBehind) {
            return { label: 'Atrasada', className: 'bg-amber-100 text-amber-700' }
        }
        return { label: 'Ativa', className: 'bg-gray-100 text-gray-700' }
    }

    const status = getStatusBadge()

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Gradient accent */}
            <div className="h-1 gradient-accent" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg shadow-purple-500/20">
                            <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                            <p className="text-xs text-gray-500">
                                {days > 0 ? `${days} dias restantes` : days === 0 ? 'Vence hoje' : 'Prazo expirado'}
                            </p>
                        </div>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', status.className)}>
                        {status.label}
                    </span>
                </div>

                {/* Circular Progress */}
                <div className="mb-4 flex items-center justify-center">
                    <div className="relative h-32 w-32">
                        {/* Background circle */}
                        <svg className="h-32 w-32 -rotate-90 transform">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#f3f4f6"
                                strokeWidth="12"
                                fill="none"
                            />
                            {/* Progress circle */}
                            <motion.circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="url(#goalGradient)"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 56}
                                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100) }}
                                transition={{ duration: 1.5, delay: delay + 0.2, ease: 'easeOut' }}
                            />
                            <defs>
                                <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</span>
                            <span className="text-xs text-gray-500">completo</span>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Economizado:</span>
                        <span className="text-sm font-bold text-purple-600">{formatCurrency(goal.current_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Meta:</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(goal.target_amount)}</span>
                    </div>
                    {remaining > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                            <span className="text-sm text-gray-600">Faltam:</span>
                            <span className="text-sm font-bold text-gray-700">{formatCurrency(remaining)}</span>
                        </div>
                    )}
                </div>

                {/* Action */}
                <Link
                    href={`/goals`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                    {isCompleted ? (
                        <>Ver Detalhes</>
                    ) : (
                        <>
                            <TrendingUp className="h-4 w-4" />
                            Contribuir
                        </>
                    )}
                </Link>
            </div>
        </motion.div>
    )
}
