'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, TrendingUp, MessageSquare, Target, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { motion } from 'framer-motion'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  gradient: string
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Início',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    href: '/transactions',
    icon: TrendingUp,
    label: 'Transações',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    href: '/chat',
    icon: MessageSquare,
    label: 'Chat IA',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    href: '/goals',
    icon: Target,
    label: 'Metas',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    href: '/more',
    icon: User,
    label: 'Perfil',
    gradient: 'from-gray-500 to-gray-700',
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
        "bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        "safe-area-inset-bottom md:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <motion.div
              key={item.href}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={triggerHaptic}
                className="relative flex flex-col items-center justify-center gap-1 py-1 px-2 min-w-[64px] touch-target group active:scale-95 transition-transform"
              >
                {/* Icon with gradient background when active */}
                <div className={cn(
                  "relative p-2.5 rounded-2xl transition-all duration-300",
                  isActive
                    ? "shadow-lg"
                    : "group-active:scale-95"
                )}>
                  {/* Gradient background for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={cn(
                        "absolute inset-0 rounded-2xl bg-gradient-to-br",
                        item.gradient
                      )}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon className={cn(
                    "w-5 h-5 relative z-10 transition-colors duration-300",
                    isActive
                      ? "text-white"
                      : "text-gray-600 group-active:text-gray-900"
                  )} />

                  {/* Glow effect for active icon */}
                  {isActive && (
                    <div className={cn(
                      "absolute inset-0 rounded-2xl blur-md opacity-50 bg-gradient-to-br -z-10",
                      item.gradient
                    )} />
                  )}
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[10px] font-semibold transition-all duration-300 leading-tight",
                  isActive
                    ? "text-transparent bg-clip-text bg-gradient-to-br " + item.gradient
                    : "text-gray-600"
                )}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
