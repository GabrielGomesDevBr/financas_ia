'use client'

import { Plus, Target, FileText, MessageSquare, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface QuickAction {
    icon: React.ComponentType<{ className?: string }>
    label: string
    href: string
    gradient: string
    shadow: string
}

const actions: QuickAction[] = [
    {
        icon: Plus,
        label: 'Nova Transação',
        href: '/transactions',
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/30',
    },
    {
        icon: Target,
        label: 'Nova Meta',
        href: '/goals',
        gradient: 'from-purple-500 to-purple-600',
        shadow: 'shadow-purple-500/30',
    },
    {
        icon: FileText,
        label: 'Relatórios',
        href: '/dashboard',
        gradient: 'from-green-500 to-green-600',
        shadow: 'shadow-green-500/30',
    },
    {
        icon: MessageSquare,
        label: 'Chat IA',
        href: '/chat',
        gradient: 'from-pink-500 to-pink-600',
        shadow: 'shadow-pink-500/30',
    },
]

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
            {actions.map((action, index) => {
                const Icon = action.icon
                return (
                    <motion.div
                        key={action.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.3,
                            delay: index * 0.1,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        <Link
                            href={action.href}
                            className={cn(
                                'group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                                action.shadow
                            )}
                        >
                            {/* Background glow effect */}
                            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10">
                                <div className={cn('h-full w-full bg-gradient-to-br', action.gradient)} />
                            </div>

                            {/* Icon */}
                            <div
                                className={cn(
                                    'relative rounded-xl bg-gradient-to-br p-4 shadow-lg transition-transform duration-300 group-hover:scale-110',
                                    action.gradient,
                                    action.shadow
                                )}
                            >
                                <Icon className="h-6 w-6 text-white" />
                            </div>

                            {/* Label */}
                            <span className="relative text-center text-sm font-semibold text-gray-700 transition-colors group-hover:text-gray-900">
                                {action.label}
                            </span>
                        </Link>
                    </motion.div>
                )
            })}
        </div>
    )
}
