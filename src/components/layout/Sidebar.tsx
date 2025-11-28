'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  Target,
  PieChart,
  Users,
  Settings,
  MessageSquare,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat IA', href: '/chat', icon: MessageSquare },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Orçamentos', href: '/budgets', icon: PieChart },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Família', href: '/family', icon: Users },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-neutral-950 border-r-2 border-neutral-200 dark:border-neutral-800 shadow-lg relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 dark:from-indigo-950/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative flex h-16 items-center px-6 border-b-2 border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Finanças IA
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:shadow-sm border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800'
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-white" : "text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="relative border-t-2 border-neutral-200 dark:border-neutral-800 p-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-4 border-2 border-indigo-100 dark:border-indigo-900 shadow-sm">
          <p className="text-xs font-medium text-indigo-900 dark:text-indigo-100 mb-1">
            Plano Premium
          </p>
          <p className="text-[10px] text-indigo-700 dark:text-indigo-300 mb-3">
            Sua assinatura está ativa
          </p>
          <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
            <div className="h-full w-[80%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm" />
          </div>
        </div>
        <p className="text-[10px] text-center text-neutral-500 dark:text-neutral-400 mt-4">
          Versão 1.0.0
        </p>
      </div>
    </div>
  )
}
