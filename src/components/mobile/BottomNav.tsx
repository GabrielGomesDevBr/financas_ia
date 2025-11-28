'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Receipt, MessageSquare, PiggyBank, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollDirection } from '@/hooks/useScrollDirection'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Início',
  },
  {
    href: '/transactions',
    icon: Receipt,
    label: 'Transações',
  },
  {
    href: '/chat',
    icon: MessageSquare,
    label: 'Chat',
  },
  {
    href: '/budgets',
    icon: PiggyBank,
    label: 'Orçamentos',
  },
  {
    href: '/more',
    icon: MoreHorizontal,
    label: 'Mais',
  },
]

/**
 * Trigger haptic feedback on supported devices
 */
const triggerHaptic = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

export function BottomNav() {
  const pathname = usePathname()
  const isVisible = useScrollDirection(50)

  // Don't show bottom nav on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white/95 backdrop-blur-sm border-t border-gray-200",
        "transition-transform duration-300 ease-in-out",
        "safe-area-inset-bottom md:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center justify-around px-1.5 py-1.5 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={triggerHaptic}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 min-w-[60px] touch-target relative group active:scale-95 transition-transform"
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary-600 rounded-full" />
              )}

              {/* Icon */}
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-500 group-active:bg-gray-100"
              )}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-colors leading-tight",
                isActive ? "text-primary-600" : "text-gray-600"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
