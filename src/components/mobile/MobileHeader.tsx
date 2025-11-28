'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface MobileHeaderProps {
    title: string
    showBack?: boolean
    action?: React.ReactNode
}

export function MobileHeader({ title, showBack = false, action }: MobileHeaderProps) {
    const router = useRouter()

    return (
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b-2 border-neutral-200 dark:border-neutral-800 shadow-sm md:hidden">
            <div className="flex items-center h-14 px-4">
                {showBack && (
                    <button
                        onClick={() => router.back()}
                        className="mr-3 p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                    </button>
                )}

                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex-1 truncate">
                    {title}
                </h1>

                {action && <div className="ml-2">{action}</div>}
            </div>
        </header>
    )
}
