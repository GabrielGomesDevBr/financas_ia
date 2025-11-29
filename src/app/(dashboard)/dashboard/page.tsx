'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react'
import { usePeriodFilter } from '@/hooks/usePeriodFilter'
import { PeriodSelector } from '@/components/filters/PeriodSelector'
import { MetricCard } from '@/components/ui/MetricCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { BalanceHistoryChart } from '@/components/dashboard/BalanceHistoryChart'
import { IncomeVsExpenseChart } from '@/components/dashboard/IncomeVsExpenseChart'
import { ExpenseChart } from '@/components/transactions/ExpenseChart'
import { GoalProgressCard } from '@/components/dashboard/GoalProgressCard'
import { RecentTransactionsTable } from '@/components/dashboard/RecentTransactionsTable'
import { MetricCardSkeleton, ChartSkeleton } from '@/components/ui/LoadingSkeleton'
import { motion } from 'framer-motion'

interface Transaction {
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string
  category: { name: string } | null
}

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string
  status: 'active' | 'completed' | 'paused'
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    goalsCount: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balanceHistory, setBalanceHistory] = useState<any[]>([])
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { period, setPeriod, customRange, setCustomRange, dateRange } = usePeriodFilter('all')
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: userData } = await supabase
          .from('users')
          .select('family_id')
          .eq('id', user.id)
          .single()

        if (!userData?.family_id) return

        // Fetch transactions
        let query = supabase
          .from('transactions')
          .select('type, amount, date, description, category:categories!transactions_category_id_fkey(name)')
          .eq('family_id', userData.family_id)
          .order('date', { ascending: false })

        if (dateRange) {
          query = query
            .gte('date', dateRange.startDate.split('T')[0])
            .lte('date', dateRange.endDate.split('T')[0])
        }

        const { data: transactionsData } = await query

        const transformedTransactions: Transaction[] = (transactionsData || []).map((t: any) => ({
          type: t.type,
          amount: t.amount,
          date: t.date,
          description: t.description,
          category: Array.isArray(t.category) ? t.category[0] : t.category,
        }))

        setTransactions(transformedTransactions)

        // Calculate stats
        const income = transformedTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const expenses = transformedTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        // Fetch goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('family_id', userData.family_id)
          .eq('status', 'active')
          .limit(3)

        setGoals(goalsData || [])

        // Generate balance history (last 7 days)
        const history = generateBalanceHistory(transformedTransactions)
        setBalanceHistory(history)

        // Generate monthly comparison (last 6 months)
        const comparison = generateMonthlyComparison(transformedTransactions)
        setMonthlyComparison(comparison)

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          balance: income - expenses,
          goalsCount: goalsData?.length || 0,
        })
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [period, customRange, supabase])

  const generateBalanceHistory = (transactions: Transaction[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date.startsWith(date))
      const dayIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const dayExpense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        date,
        income: dayIncome,
        expense: dayExpense,
        balance: dayIncome - dayExpense,
      }
    })
  }

  const generateMonthlyComparison = (transactions: Transaction[]) => {
    // Generate last 6 months from current date
    const months = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
      const monthIndex = date.getMonth()
      const yearIndex = date.getFullYear()

      // Filter transactions for this specific month and year
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === monthIndex && tDate.getFullYear() === yearIndex
      })

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      months.push({
        period: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        income,
        expense,
      })
    }

    return months
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-8 text-white shadow-2xl"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl -z-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="rounded-xl md:rounded-2xl bg-white/20 p-2.5 md:p-3 backdrop-blur-xl">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Bem-vindo ao seu Dashboard</h1>
              <p className="text-white/80 text-sm md:text-base mt-0.5 md:mt-1">
                Visão completa das suas finanças pessoais
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="mt-4 md:mt-6 max-w-full md:max-w-2xl">
            <div className="rounded-xl md:rounded-2xl bg-white/10 p-3 md:p-4 backdrop-blur-xl">
              <PeriodSelector
                period={period}
                onPeriodChange={setPeriod}
                onCustomRangeChange={(start, end) => setCustomRange({ start, end })}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="Receitas"
          value={stats.totalIncome}
          prefix="R$ "
          decimals={2}
          trend={{ value: 12.5, isPositive: true, label: 'vs mês anterior' }}
          variant="success"
          delay={0.1}
        />
        <MetricCard
          icon={TrendingDown}
          label="Despesas"
          value={stats.totalExpenses}
          prefix="R$ "
          decimals={2}
          trend={{ value: 8.3, isPositive: false, label: 'vs mês anterior' }}
          variant="danger"
          delay={0.2}
        />
        <MetricCard
          icon={Wallet}
          label="Saldo"
          value={stats.balance}
          prefix="R$ "
          decimals={2}
          trend={{ value: 15.7, isPositive: stats.balance >= 0, label: 'este período' }}
          variant={stats.balance >= 0 ? 'default' : 'danger'}
          delay={0.3}
        />
        <MetricCard
          icon={Target}
          label="Metas Ativas"
          value={stats.goalsCount}
          variant="purple"
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Balance History Chart */}
      <BalanceHistoryChart data={balanceHistory} />

      {/* Financial Analysis Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Expense Breakdown */}
        <ExpenseChart transactions={transactions} />

        {/* Income vs Expense */}
        <IncomeVsExpenseChart data={monthlyComparison} />
      </div>

      {/* Goals Section */}
      {goals.length > 0 && (
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mb-3 md:mb-4 text-xl md:text-2xl font-bold text-gray-900"
          >
            Suas Metas
          </motion.h2>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => (
              <GoalProgressCard key={goal.id} goal={goal} delay={0.1 * index} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <RecentTransactionsTable
        transactions={transactions.slice(0, 5).map((t, index) => ({
          id: index.toString(),
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category?.name || 'Sem categoria',
          date: t.date,
        }))}
      />
    </div>
  )
}
