'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Receipt,
  Target,
  PieChart,
  Users,
  Settings,
  MessageSquare,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { motion } from 'framer-motion'

const navigation = [
  {
    group: 'PRINCIPAL',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Chat IA', href: '/chat', icon: MessageSquare },
    ],
  },
  {
    group: 'FINANCEIRO',
    items: [
      { name: 'Transações', href: '/transactions', icon: Receipt },
      { name: 'Orçamentos', href: '/budgets', icon: PieChart },
      { name: 'Metas', href: '/goals', icon: Target },
      { name: 'Relatórios', href: '/reports', icon: FileText },
    ],
  },
  {
    group: 'CONFIGURAÇÕES',
    items: [
      { name: 'Família', href: '/family', icon: Users },
      { name: 'Configurações', href: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
  })
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user name
      const { data: userData } = await supabase
        .from('users')
        .select('name, family_id')
        .eq('id', user.id)
        .single()

      if (userData) {
        setUserName(userData.name || user.email?.split('@')[0] || 'Usuário')

        // Get monthly transactions
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

        const { data: transactions } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('family_id', userData.family_id)
          .gte('date', firstDay)
          .lte('date', lastDay)

        if (transactions) {
          const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)
          const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          setMonthlyStats({ income, expense })
        }
      }
    }

    fetchData()
  }, [supabase])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="flex h-full w-64 flex-col overflow-hidden border-r-2 border-neutral-200 bg-gradient-to-b from-gray-50 to-white shadow-2xl dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-900">
      {/* Logo/Header */}
      <div className="relative border-b-2 border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 shadow-xl shadow-indigo-500/30">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent">
              Finanças IA
            </h2>
            <p className="text-xs text-gray-500">Inteligência Financeira</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="border-b-2 border-neutral-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:border-neutral-800 dark:from-indigo-950/50 dark:to-purple-950/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 ring-2 ring-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {userName}
            </p>
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
              Premium
            </span>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4 custom-scrollbar">
        {navigation.map((section, sectionIndex) => (
          <motion.div
            key={section.group}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + sectionIndex * 0.1 }}
          >
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {section.group}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/30'
                        : 'text-neutral-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md dark:text-neutral-300 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -left-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-pink-500" />
                    )}

                    <Icon
                      className={cn(
                        'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                        isActive
                          ? 'text-white'
                          : 'text-neutral-600 group-hover:text-indigo-600 dark:text-neutral-400'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* Monthly Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="border-t-2 border-neutral-200 p-4 dark:border-neutral-800"
      >
        <div className="overflow-hidden rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 shadow-lg dark:border-indigo-900 dark:from-indigo-950/50 dark:to-purple-950/50">
          <p className="mb-3 text-xs font-bold text-indigo-900 dark:text-indigo-100">
            Resumo do Mês
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Receitas</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(monthlyStats.income)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Despesas</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {formatCurrency(monthlyStats.expense)}
              </span>
            </div>

            {/* Mini bar comparison */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-green-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{
                      width: `${monthlyStats.income > 0 ? Math.min((monthlyStats.income / (monthlyStats.income + monthlyStats.expense)) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-red-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                    style={{
                      width: `${monthlyStats.expense > 0 ? Math.min((monthlyStats.expense / (monthlyStats.income + monthlyStats.expense)) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-3 border-t border-indigo-200 pt-2 dark:border-indigo-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Saldo</span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    monthlyStats.income - monthlyStats.expense >= 0
                      ? 'text-blue-600'
                      : 'text-red-600'
                  )}
                >
                  {formatCurrency(monthlyStats.income - monthlyStats.expense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Version */}
        <p className="mt-4 text-center text-[10px] text-neutral-500 dark:text-neutral-400">
          Versão 2.0.0
        </p>
      </motion.div>
    </div>
  )
}
